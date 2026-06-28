// Solo Auto-Teaming utility
// Called after a solo participant is approved
// Checks the pool of approved solos and forms teams of 4

const Team = require('../models/Team');
const Transaction = require('../models/Transaction');
const { generateTeamCode } = require('./teamCode');

async function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function sendEmail({ to, subject, html }) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.log(`[EMAIL - no key] To: ${to} | Subject: ${subject}`);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({ from: 'ByteBrainiacs <onboarding@resend.dev>', to, subject, html }),
    });
    if (!res.ok) console.error('[EMAIL] Failed:', await res.text());
  } catch (err) {
    console.error('[EMAIL] Error:', err.message);
  }
}

async function tryAutoTeamSolos() {
  try {
    // Get all approved solos that are not yet in a full team
    // "solo" teams are single-member registrations waiting to be grouped
    const approvedSolos = await Team.find({
      registrationType: 'solo',
      status: 'approved',
      soloTeamFormed: { $ne: true }
    }).sort({ approvedAt: 1 }); // oldest first (FIFO)

    if (approvedSolos.length < 2) return; // need at least 2 to do anything

    // Also check if there are incomplete group teams (teams with <4 members that need solos)
    // These are teams where admins may have manually set needsSoloFill = true
    // For now, we pool solos together in groups of 4

    const pooled = [...approvedSolos];

    while (pooled.length >= 4) {
      const group = pooled.splice(0, 4); // take 4 solos
      await formSoloTeam(group);
    }

    // If remaining solos < 4 but >= 2, check if admin wants partial teams to proceed
    // (Admin can manually trigger via /api/teams/trigger-solo-team endpoint)

  } catch (err) {
    console.error('[SOLO-TEAM] Error:', err.message);
  }
}

async function formSoloTeam(soloTeams) {
  // Generate team name from first member
  const lead = soloTeams[0].members[0];
  const generatedTeamName = `Auto-Team ${lead.name.split(' ')[0]}-${Math.floor(Math.random() * 900 + 100)}`;

  // Combine all members
  const allMembers = soloTeams.flatMap(t => t.members);

  // Generate unique team code
  let teamCode;
  let attempts = 0;
  do {
    teamCode = `BB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    attempts++;
  } while ((await Team.findOne({ teamCode })) && attempts < 10);

  // Generate shared team password
  const teamPassword = await generatePassword();

  // Create a new combined team
  const combinedTeam = new Team({
    teamCode,
    teamName: generatedTeamName,
    registrationType: 'team',
    members: allMembers,
    department: soloTeams[0].department,
    contactEmail: soloTeams[0].contactEmail,
    contactPhone: soloTeams[0].contactPhone,
    byteCoins: soloTeams.length * 50, // each solo already has 50, combine
    status: 'approved',
    approvedAt: new Date(),
    teamPassword, // plain stored temporarily for email; hash after
    soloTeamFormed: true,
  });
  await combinedTeam.save();

  // Mark all solo registrations as teamed
  await Team.updateMany(
    { _id: { $in: soloTeams.map(t => t._id) } },
    { soloTeamFormed: true, formedTeamCode: teamCode }
  );

  // Log ByteCoins transaction
  await new Transaction({
    teamId: combinedTeam._id,
    teamCode,
    teamName: generatedTeamName,
    amount: combinedTeam.byteCoins,
    type: 'credit',
    note: 'Solo auto-team formation - combined registration bonuses',
  }).save();

  // Email every member their team code and dashboard credentials
  for (const member of allMembers) {
    await sendEmail({
      to: member.email,
      subject: 'ByteBrainiacs — Your Team Has Been Formed! 🎉',
      html: `
        <h2>You've Been Assigned to a Team! 🎉</h2>
        <p>Hi <strong>${member.name}</strong>,</p>
        <p>Your solo registration has been matched with other participants and your team is now ready!</p>
        <hr/>
        <p><strong>Team Name:</strong> ${generatedTeamName}<br/>
        <strong>Team Code:</strong> <span style="font-size:20px;font-weight:bold;color:#c0392b">${teamCode}</span><br/>
        <strong>ByteCoins:</strong> ₿${combinedTeam.byteCoins}</p>
        <hr/>
        <h3>Your Team Members:</h3>
        <ul>
          ${allMembers.map(m => `<li>${m.name} — ${m.email}</li>`).join('')}
        </ul>
        <hr/>
        <h3>Team Dashboard Login:</h3>
        <p><strong>URL:</strong> <a href="${process.env.FRONTEND_URL}/team-dashboard">Team Dashboard</a><br/>
        <strong>Team Code:</strong> ${teamCode}<br/>
        <strong>Password:</strong> ${teamPassword}</p>
        <p><em>Please change your password after first login.</em></p>
        <p>Good luck! 🚀<br/>— ByteBrainiacs Team</p>
      `,
    });
  }

  console.log(`[SOLO-TEAM] Formed team ${teamCode} with ${allMembers.length} members`);
  return combinedTeam;
}

module.exports = { tryAutoTeamSolos, formSoloTeam };
