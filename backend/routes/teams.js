const router = require('express').Router();
const Team = require('../models/Team');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { generateTeamCode } = require('../utils/teamCode');
const { tryAutoTeamSolos } = require('../utils/soloTeaming');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ─── helpers ───────────────────────────────────────────────
const BLOCKED_EMAIL_DOMAINS = [
  'test.com', 'fake.com', 'example.com', 'mailinator.com',
  'guerrillamail.com', 'trashmail.com', 'tempmail.com', 'yopmail.com',
  'sharklasers.com', 'disposablemail.com', '10minutemail.com'
];

function isTestEmail(email) {
  const lower = email.toLowerCase();
  const domain = lower.split('@')[1] || '';
  if (BLOCKED_EMAIL_DOMAINS.includes(domain)) return true;
  if (/^(test|fake|sample|dummy|abc|xyz|asdf|qwerty)\d*@/i.test(lower)) return true;
  return false;
}

async function sendEmail({ to, subject, html }) {
  // Plug in Resend API key here when deploying
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL - no key] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ByteBrainiacs <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) console.error('[EMAIL] Failed:', await res.text());
  } catch (err) {
    console.error('[EMAIL] Error:', err.message);
  }
}

async function sendTelegram(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.log(`[TELEGRAM - not configured] ${message}`);
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[TELEGRAM] Failed to send message:', errText);
    } else {
      console.log('[TELEGRAM] Message sent successfully');
    }
  } catch (err) {
    console.error('[TELEGRAM] Error:', err.message);
  }
}

// ─── PARTICIPANT/TEAM: Get participant's team registration ───────────────
router.get('/my-registration', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let team = null;
    if (decoded.role === 'team') {
      team = await Team.findById(decoded.teamId);
    } else if (decoded.role === 'participant') {
      const email = decoded.email.toLowerCase();
      team = await Team.findOne({
        $or: [
          { contactEmail: email },
          { 'members.email': email }
        ]
      });
    } else {
      return res.status(403).json({ error: 'Forbidden.' });
    }
    
    if (!team) return res.json({ registered: false });
    
    // If this is a solo participant who has been grouped into an auto-team, fetch the grouped team details instead
    if (team.registrationType === 'solo' && team.soloTeamFormed && team.formedTeamCode) {
      const formedTeam = await Team.findOne({ teamCode: team.formedTeamCode });
      if (formedTeam) {
        team = formedTeam;
      }
    }
    
    // If approved, generate team login token for auto-login
    let teamToken = null;
    const isApproved = team.status === 'approved' || team.status === 'verified';
    if (isApproved) {
      teamToken = jwt.sign(
        { teamId: team._id, teamCode: team.teamCode, role: 'team' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
    }
    
    res.json({ registered: true, team, token: teamToken || token });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

// ─── PUBLIC: Register a team ───────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Please sign up or log in first before registering.' });
    }
    let decoded;
    try {
      const token = authHeader.split(' ')[1];
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }

    if (!decoded || decoded.role !== 'participant') {
      return res.status(403).json({ error: 'Only participants can register a team or solo.' });
    }
    const participantEmail = decoded.email.toLowerCase().trim();

    // Check if this participant is already associated with any team/solo (active or pending or approved)
    const existingForUser = await Team.findOne({
      $or: [
        { contactEmail: participantEmail },
        { 'members.email': participantEmail }
      ]
    });

    if (existingForUser) {
      if (existingForUser.status === 'rejected' || existingForUser.status === 'flagged') {
        // If it was rejected, delete the old rejected team so the new one can be saved cleanly
        await Team.deleteOne({ _id: existingForUser._id });
      } else {
        return res.status(400).json({ error: 'You have already registered a team or solo operative under this account.' });
      }
    }

    const { teamName, members, department, contactEmail, contactPhone, referralCode } = req.body;

    if (!teamName || !members || !department || !contactEmail || !contactPhone)
      return res.status(400).json({ error: 'All fields are required.' });

    const registrationType = members.length === 1 ? 'solo' : 'team';

    if (registrationType === 'team' && members.length !== 4)
      return res.status(400).json({ error: 'A squad registration requires exactly 4 members.' });

    if (registrationType === 'solo' && members.length !== 1)
      return res.status(400).json({ error: 'A solo registration requires exactly 1 member.' });

    // Validate that each member has a non-empty name and email
    for (const [idx, m] of members.entries()) {
      if (!m.name || !m.name.trim() || !m.email || !m.email.trim()) {
        return res.status(400).json({ error: `Full name and email are required for member ${idx + 1}.` });
      }
    }

    // Ensure all member emails and names are unique from each other
    if (registrationType === 'team') {
      const memberEmails = members.map(m => m.email.toLowerCase().trim());
      const uniqueMemberEmails = new Set(memberEmails);
      if (uniqueMemberEmails.size !== memberEmails.length) {
        return res.status(400).json({ error: 'Each squad member must have a unique email address.' });
      }

      const memberNames = members.map(m => m.name.toLowerCase().trim());
      const uniqueMemberNames = new Set(memberNames);
      if (uniqueMemberNames.size !== memberNames.length) {
        return res.status(400).json({ error: 'Each squad member must have a unique name.' });
      }
    }

    // Validate contact email
    if (isTestEmail(contactEmail))
      return res.status(400).json({ error: 'Please use a real email address.' });

    // Validate phone (10 digits)
    const phoneClean = contactPhone.replace(/\D/g, '');
    if (phoneClean.length < 10)
      return res.status(400).json({ error: 'Enter a valid 10-digit phone number.' });

    // Validate each member email format
    for (const m of members) {
      if (isTestEmail(m.email))
        return res.status(400).json({ error: `Invalid email for member: ${m.name}` });
    }

    // Duplicate check
    const emailsToValidate = Array.from(new Set([
      contactEmail.toLowerCase(),
      ...members.map(m => m.email.toLowerCase())
    ]));

    const existing = await Team.findOne({
      $or: [
        { teamName: { $regex: new RegExp(`^${teamName}$`, 'i') } },
        { contactEmail: { $in: emailsToValidate } },
        { 'members.email': { $in: emailsToValidate } }
      ]
    });
    if (existing) {
      if (existing.teamName.toLowerCase() === teamName.toLowerCase()) {
        return res.status(409).json({ error: `Team name "${teamName}" is already registered.` });
      }
      return res.status(409).json({ error: 'One or more participants (contact or member emails) are already registered.' });
    }

    // registrationType is already defined above

    // Validate referral
    let referredBy = null;
    if (referralCode) {
      const referrer = await Team.findOne({ teamCode: referralCode.toUpperCase() });
      if (referrer) referredBy = referralCode.toUpperCase();
    }

    // Save team WITHOUT teamCode - generated only after approval
    const team = new Team({
      teamName,
      registrationType,
      members: members.map(m => ({ ...m, email: m.email.toLowerCase().trim() })),
      department,
      contactEmail: contactEmail.toLowerCase().trim(),
      contactPhone,
      referredBy,
      status: 'pending'
    });

    await team.save();

    // Notify admin via Telegram
    await sendTelegram(
      `🆕 *New Registration*\n` +
      `Team: *${teamName}*\n` +
      `Type: ${registrationType}\n` +
      `Members: ${members.length}\n` +
      `Department: ${department}\n` +
      `Email: ${contactEmail}\n` +
      `ID: \`${team._id}\``
    );

    // Email confirmation to participant (pending)
    await sendEmail({
      to: contactEmail,
      subject: 'ByteBrainiacs — Registration Received',
      html: `
        <h2>Registration Received!</h2>
        <p>Hi <strong>${members[0]?.name}</strong>,</p>
        <p>Your registration for <strong>ByteBrainiacs Hackathon 2024</strong> has been received.</p>
        <p><strong>Team:</strong> ${teamName}<br/>
        <strong>Type:</strong> ${registrationType}<br/>
        <strong>Status:</strong> ⏳ Pending Approval</p>
        <p>Our team will review your registration and notify you once approved.
        You will receive your team code via email after approval.</p>
        <p>— ByteBrainiacs Team</p>
      `
    });

    res.status(201).json({
      success: true,
      teamId: team._id,
      registrationType,
      status: 'pending',
      message: 'Registration submitted! Awaiting admin approval. You will receive your team code via email after approval.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// ─── ADMIN: Get all teams ───────────────────────────────────
router.get('/', auth, async (req, res) => {
  try {
    const { search, type, status, sort = '-createdAt', page = 1, limit = 20 } = req.query;

    const filter = {};
    if (search) {
      filter.$or = [
        { teamName: { $regex: search, $options: 'i' } },
        { teamCode: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } }
      ];
    }
    if (type && type !== 'all') {
      if (type === 'solo') {
        filter.registrationType = { $in: ['solo', 'individual'] };
      } else {
        filter.registrationType = type;
      }
    }
    if (status && status !== 'all') {
      if (status === 'approved') {
        filter.status = { $in: ['approved', 'verified'] };
      } else if (status === 'rejected') {
        filter.status = { $in: ['rejected', 'flagged'] };
      } else {
        filter.status = status;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [teams, total] = await Promise.all([
      Team.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Team.countDocuments(filter)
    ]);

    res.json({ teams, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUBLIC: Dashboard stats (used on home page leaderboard) ───────
router.get('/stats', async (req, res) => {
  try {
    const [totalTeams, totalSolo, totalParticipants, topTeams, recentRegs, pendingCount] = await Promise.all([
      Team.countDocuments({ registrationType: 'team', status: 'approved' }),
      Team.countDocuments({ registrationType: 'solo', status: 'approved' }),
      Team.aggregate([{ $match: { status: 'approved' } }, { $group: { _id: null, total: { $sum: { $size: '$members' } } } }]),
      Team.find({ status: 'approved' }).sort({ byteCoins: -1 }).limit(5).select('teamCode teamName byteCoins registrationType'),
      Team.find().sort({ createdAt: -1 }).limit(7).select('teamCode teamName registrationType createdAt status'),
      Team.countDocuments({ status: 'pending' })
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const trend = await Team.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({ totalTeams, totalSolo, totalParticipants: totalParticipants[0]?.total || 0, topTeams, recentRegs, trend, pendingCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: Analytics summary ───────────────────────────────
router.get('/analytics/summary', auth, async (req, res) => {
  try {
    const allTeams = await Team.find().select('registrationType status department byteCoins createdAt');
    
    // Status breakdown
    let pending = 0;
    let approved = 0;
    let rejected = 0;
    
    // Type breakdown
    let teamCount = 0;
    let soloCount = 0;
    
    // Department breakdown
    const deptMap = {};
    
    // Coins statistics
    let totalCoins = 0;
    let maxCoins = 0;
    let approvedCountForCoins = 0;
    
    // Trend breakdown
    const trendMap = {};

    allTeams.forEach(t => {
      // Status
      const statusClean = (t.status === 'verified' || t.status === 'approved') ? 'approved' 
                        : (t.status === 'flagged' || t.status === 'rejected') ? 'rejected' 
                        : 'pending';
      if (statusClean === 'approved') approved++;
      else if (statusClean === 'rejected') rejected++;
      else pending++;

      // Type
      const typeClean = (t.registrationType === 'individual' || t.registrationType === 'solo') ? 'solo' : 'team';
      if (typeClean === 'solo') soloCount++;
      else teamCount++;

      // Dept
      const dept = t.department || 'Other';
      deptMap[dept] = (deptMap[dept] || 0) + 1;

      // Coins
      if (statusClean === 'approved') {
        totalCoins += (t.byteCoins || 0);
        if ((t.byteCoins || 0) > maxCoins) {
          maxCoins = t.byteCoins;
        }
        approvedCountForCoins++;
      }

      // Trend (YYYY-MM-DD)
      const dateStr = t.createdAt ? t.createdAt.toISOString().slice(0, 10) : 'Unknown';
      trendMap[dateStr] = (trendMap[dateStr] || 0) + 1;
    });

    const averageCoins = approvedCountForCoins > 0 ? Math.round(totalCoins / approvedCountForCoins) : 0;

    const departmentData = Object.entries(deptMap).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    const trendData = Object.entries(trendMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      totalRegistrations: allTeams.length,
      statusBreakdown: { pending, approved, rejected },
      typeBreakdown: { team: teamCount, solo: soloCount },
      departmentData,
      coinsStats: { totalCoins, averageCoins, maxCoins },
      trendData
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── TEAM: Get team dashboard data (protected) ─────────────────────
router.get('/my-team', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'No token provided.' });
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'team') return res.status(403).json({ error: 'Forbidden.' });

    const team = await Team.findById(decoded.teamId).select('-teamPassword');
    if (!team) return res.status(404).json({ error: 'Team not found.' });

    const transactions = await Transaction.find({ teamId: team._id }).sort({ createdAt: -1 }).limit(10);

    res.json({ team, transactions });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
});

// ─── ADMIN: Get single team ─────────────────────────────────
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: Approve team ────────────────────────────────────
router.post('/:id/approve', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.status === 'approved') return res.status(400).json({ error: 'Already approved.' });

    const isSolo = team.registrationType === 'solo' || team.registrationType === 'individual';
    let teamCode = undefined;
    let plainPass = undefined;

    if (!isSolo) {
      // Generate unique team code
      let attempts = 0;
      do {
        teamCode = generateTeamCode();
        attempts++;
      } while ((await Team.findOne({ teamCode })) && attempts < 10);

      team.teamCode = teamCode;
      team.byteCoins = 50;

      // Generate a shared dashboard password
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      plainPass = Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const hashedPassword = await bcrypt.hash(plainPass, 10);

      team.teamPassword = hashedPassword;
      team.plainPassword = plainPass;
    } else {
      team.teamCode = undefined;
      team.teamPassword = null;
      team.plainPassword = null;
      team.byteCoins = 0;
    }

    team.status = 'approved';
    team.approvedAt = new Date();
    await team.save();

    // Log ByteCoins transaction for squads only
    if (!isSolo && teamCode) {
      await new Transaction({
        teamId: team._id,
        teamCode,
        teamName: team.teamName,
        amount: 50,
        type: 'credit',
        note: 'Registration approval bonus'
      }).save();

      // If referred — give referrer 50 coins too
      if (team.referredBy) {
        const referrer = await Team.findOneAndUpdate(
          { teamCode: team.referredBy },
          { $inc: { byteCoins: 50 } },
          { new: true }
        );
        if (referrer) {
          await new Transaction({
            teamId: referrer._id,
            teamCode: referrer.teamCode,
            teamName: referrer.teamName,
            amount: 50,
            type: 'credit',
            note: `Referral bonus — ${team.teamName} approved`
          }).save();
        }
      }
    }

    if (isSolo) {
      // Trigger solo auto-teaming in background
      tryAutoTeamSolos().catch(console.error);
    }

    // Email team with their team code and password (squads) or queue notice (solos)
    let emailHtml = '';
    if (isSolo) {
      emailHtml = `
        <h2>You're In! Registration Approved 🎉</h2>
        <p>Hi <strong>${team.members[0]?.name}</strong>,</p>
        <p>Your registration for <strong>ByteBrainiacs Hackathon 2024</strong> has been approved!</p>
        <hr/>
        <p>⏳ You are registered as a <strong>solo participant</strong>. Once enough solos are approved, you will be auto-assigned to a team of 4. You will receive another email with your team details and dashboard credentials.</p>
        <p>See you at the hackathon! 🚀<br/>— ByteBrainiacs Team</p>
      `;
    } else {
      emailHtml = `
        <h2>You're In! Registration Approved 🎉</h2>
        <p>Hi <strong>${team.members[0]?.name}</strong>,</p>
        <p>Your registration for <strong>ByteBrainiacs Hackathon 2024</strong> has been approved!</p>
        <hr/>
        <p><strong>Team Name:</strong> ${team.teamName}<br/>
        <strong>Team Code:</strong> <span style="font-size:24px;font-weight:bold;color:#c0392b">${teamCode}</span><br/>
        <strong>ByteCoins:</strong> ₿50 (registration bonus)</p>
        <hr/>
        <h3>Team Dashboard Login:</h3>
        <p><strong>URL:</strong> ${process.env.FRONTEND_URL}/team-dashboard<br/>
        <strong>Team Code:</strong> ${teamCode}<br/>
        <strong>Password:</strong> ${plainPass}</p>
        <p>All team members can use these credentials to log in to the dashboard.</p>
        <p>See you at the hackathon! 🚀<br/>— ByteBrainiacs Team</p>
      `;
    }

    await sendEmail({
      to: team.contactEmail,
      subject: 'ByteBrainiacs — Registration Approved! 🎉',
      html: emailHtml
    });

    res.json({ success: true, team });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: Reject team ─────────────────────────────────────
router.post('/:id/reject', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', rejectionReason: reason || 'No reason provided.' },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: 'Team not found' });

    await sendEmail({
      to: team.contactEmail,
      subject: 'ByteBrainiacs — Registration Update',
      html: `
        <h2>Registration Status Update</h2>
        <p>Hi <strong>${team.members[0]?.name}</strong>,</p>
        <p>Unfortunately, your registration for <strong>${team.teamName}</strong> was not approved.</p>
        <p><strong>Reason:</strong> ${reason || 'Please contact the organizers for more details.'}</p>
        <p>If you believe this is a mistake, please contact us.<br/>— ByteBrainiacs Team</p>
      `
    });

    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: Manually trigger solo teaming ────────────────────────────
router.post('/trigger-solo-team', auth, async (req, res) => {
  try {
    await tryAutoTeamSolos();
    res.json({ success: true, message: 'Solo teaming triggered.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── PUBLIC: Team Dashboard Login ────────────────────────────────
router.post('/team-login', async (req, res) => {
  try {
    const { teamCode, password } = req.body;
    if (!teamCode || !password)
      return res.status(400).json({ error: 'Team code and password are required.' });

    const team = await Team.findOne({ teamCode: teamCode.toUpperCase(), status: { $in: ['approved', 'verified'] } });
    if (!team)
      return res.status(401).json({ error: 'Invalid team code or team not approved yet.' });

    if (!team.teamPassword)
      return res.status(401).json({ error: 'Team dashboard not yet set up. Please wait for credentials email.' });

    const match = await bcrypt.compare(password, team.teamPassword);
    if (!match)
      return res.status(401).json({ error: 'Incorrect password.' });

    const token = jwt.sign(
      { teamId: team._id, teamCode: team.teamCode, role: 'team' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      teamCode: team.teamCode,
      teamName: team.teamName,
      byteCoins: team.byteCoins,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});


// ─── ADMIN: Award or Deduct ByteCoins ────────────────────────────────
router.post('/:id/bytecoins', auth, async (req, res) => {
  try {
    const { amount, type = 'credit', note, taskId, taskTitle } = req.body;
    if (!amount || Number(amount) <= 0)
      return res.status(400).json({ error: 'Amount must be a positive number.' });

    const change = type === 'deduct' ? -Number(amount) : Number(amount);

    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });

    // Prevent balance going below 0
    if (type === 'deduct' && team.byteCoins + change < 0)
      return res.status(400).json({ error: `Cannot deduct ₿${amount}. Team only has ₿${team.byteCoins}.` });

    team.byteCoins += change;
    await team.save();

    const tx = new Transaction({
      teamId: team._id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      taskId,
      taskTitle,
      amount: Number(amount),
      type: type === 'deduct' ? 'debit' : 'credit',
      note
    });
    await tx.save();

    res.json({ team, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: Revoke approval (reset team to pending) ──────────────────
router.post('/:id/revoke', auth, async (req, res) => {
  try {
    const { reason } = req.body;
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    if (team.status !== 'approved' && team.status !== 'verified')
      return res.status(400).json({ error: 'Only approved or verified teams can be revoked.' });

    team.status = 'pending';
    team.teamCode = undefined;
    team.teamPassword = undefined;
    team.plainPassword = undefined;
    team.byteCoins = 0;
    team.approvedAt = undefined;
    team.rejectionReason = reason || '';
    await team.save();

    await sendEmail({
      to: team.contactEmail,
      subject: 'ByteBrainiacs — Registration Status Update',
      html: `
        <h2>Registration Status Changed</h2>
        <p>Hi <strong>${team.members[0]?.name}</strong>,</p>
        <p>Your team <strong>${team.teamName}</strong>'s approval has been revoked by the admin.</p>
        ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
        <p>Your registration is now back to <strong>Pending</strong> review.
        If you have questions, please contact the organizers.</p>
        <p>— ByteBrainiacs Team</p>
      `
    });

    res.json({ success: true, team });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── ADMIN: Export all teams ────────────────────────────────
router.get('/export/all', auth, async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;