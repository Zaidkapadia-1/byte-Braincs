const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  byteCoinsReward: { type: Number, required: true, min: 1 },
  priority: {
    type: String,
    enum: ['critical', 'standard', 'optional'],
    default: 'standard'
  },
  deadline: { type: Date },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdBy: { type: String, default: 'admin' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);