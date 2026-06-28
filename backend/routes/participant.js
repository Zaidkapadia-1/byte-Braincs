const router = require('express').Router();
const jwt = require('jsonwebtoken');
const Participant = require('../models/Participant');

// POST /api/participant/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await Participant.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists.' });

    const participant = new Participant({ name, email, password });
    await participant.save();

    const token = jwt.sign(
      { id: participant._id, email: participant.email, role: 'participant' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ token, name: participant.name, email: participant.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Signup failed. Please try again.' });
  }
});

// POST /api/participant/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const participant = await Participant.findOne({ email: email.toLowerCase() });
    if (!participant)
      return res.status(401).json({ error: 'No account found with this email.' });

    const match = await participant.comparePassword(password);
    if (!match)
      return res.status(401).json({ error: 'Incorrect password.' });

    const token = jwt.sign(
      { id: participant._id, email: participant.email, role: 'participant' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ token, name: participant.name, email: participant.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

module.exports = router;
