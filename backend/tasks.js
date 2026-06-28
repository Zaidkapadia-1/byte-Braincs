const router = require('express').Router();
const Task = require('../models/Task');
const Transaction = require('../models/Transaction');
const Team = require('../models/Team');
const auth = require('../middleware/auth');

// PUBLIC: Get active tasks
router.get('/active', async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'active' }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Get all tasks
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Create task
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, byteCoinsReward, priority, deadline } = req.body;
    if (!title || !description || !byteCoinsReward)
      return res.status(400).json({ error: 'Title, description, and reward are required.' });

    const task = new Task({ title, description, byteCoinsReward, priority, deadline });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Approve task completion - award coins
router.post('/:taskId/approve/:teamId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    const team = await Team.findByIdAndUpdate(
      req.params.teamId,
      { $inc: { byteCoins: task.byteCoinsReward } },
      { new: true }
    );
    if (!team) return res.status(404).json({ error: 'Team not found' });

    const tx = new Transaction({
      teamId: team._id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      taskId: task._id,
      taskTitle: task.title,
      amount: task.byteCoinsReward,
      type: 'credit',
      note: `Completed: ${task.title}`
    });
    await tx.save();

    res.json({ success: true, team, transaction: tx, coinsAwarded: task.byteCoinsReward });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: Get transaction history
router.get('/transactions/all', auth, async (req, res) => {
  try {
    const txs = await Transaction.find().sort({ createdAt: -1 }).limit(100);
    res.json(txs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;