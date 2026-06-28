const router = require('express').Router();
const Team = require('../models/Team');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');
const { generateTeamCode } = require('../utils/teamCode');

// --- PUBLIC: Register a team ---
router.post('/register', async (req, res) => {
  try {
    const { teamName, members, department, contactEmail, contactPhone } = req.body;

    if (!teamName || !members || !department || !contactEmail || !contactPhone) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (members.length !== 1 && members.length !== 3) {
      return res.status(400).json({ error: 'Team must have exactly 1 or 3 members.' });
    }

    // Duplicate check
    const existing = await Team.findOne({
      $or: [
        { teamName: { $regex: new RegExp(`^${teamName}$`, 'i') } },
        { contactEmail: contactEmail.toLowerCase() }
      ]
    });
    if (existing) {
      return res.status(409).json({ error: 'Team name or contact email already registered.' });
    }

    const registrationType = members.length === 1 ? 'individual' : 'team';

    // Generate unique team code
    let teamCode;
    let attempts = 0;
    do {
      teamCode = generateTeamCode();
      attempts++;
    } while ((await Team.findOne({ teamCode })) && attempts < 10);

    const team = new Team({
      teamCode,
      teamName,
      registrationType,
      members,
      department,
      contactEmail,
      contactPhone,
      adminNotified: registrationType === 'individual' ? false : true
    });

    await team.save();

    res.status(201).json({
      success: true,
      teamCode: team.teamCode,
      teamId: team._id,
      registrationType,
      message: `Registration successful! Your team code is ${team.teamCode}`
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// --- ADMIN: Get all teams ---
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
    if (type && type !== 'all') filter.registrationType = type;
    if (status && status !== 'all') filter.status = status;

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

// --- ADMIN: Get dashboard stats ---
router.get('/stats', auth, async (req, res) => {
  try {
    const [totalTeams, totalIndividuals, totalParticipants, topTeams, recentRegs] = await Promise.all([
      Team.countDocuments({ registrationType: 'team' }),
      Team.countDocuments({ registrationType: 'individual' }),
      Team.aggregate([{ $group: { _id: null, total: { $sum: { $size: '$members' } } } }]),
      Team.find().sort({ byteCoins: -1 }).limit(5).select('teamCode teamName byteCoins registrationType'),
      Team.find().sort({ createdAt: -1 }).limit(7).select('teamCode teamName registrationType createdAt')
    ]);

    // Registration trend last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    const trend = await Team.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalTeams,
      totalIndividuals,
      totalParticipants: totalParticipants[0]?.total || 0,
      topTeams,
      recentRegs,
      trend
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN: Get single team ---
router.get('/:id', auth, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ error: 'Team not found' });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN: Update team status ---
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['verified', 'pending', 'flagged'].includes(status))
      return res.status(400).json({ error: 'Invalid status' });
    const team = await Team.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(team);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN: Award ByteCoins manually ---
router.post('/:id/bytecoins', auth, async (req, res) => {
  try {
    const { amount, note, taskId, taskTitle } = req.body;
    if (!amount || amount <= 0)
      return res.status(400).json({ error: 'Amount must be positive' });

    const team = await Team.findByIdAndUpdate(
      req.params.id,
      { $inc: { byteCoins: amount } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const tx = new Transaction({
      teamId: team._id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      taskId,
      taskTitle,
      amount,
      type: 'credit',
      note
    });
    await tx.save();

    res.json({ team, transaction: tx });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ADMIN: Export all teams as JSON for Excel ---
router.get('/export/all', auth, async (req, res) => {
  try {
    const teams = await Team.find().sort({ createdAt: -1 });
    res.json(teams);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;