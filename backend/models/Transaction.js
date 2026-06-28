const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  teamId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  teamCode: { type: String, required: true },
  teamName: { type: String, required: true },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  taskTitle: { type: String },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ['credit', 'debit'],
    default: 'credit'
  },
  note: { type: String, trim: true },
  approvedBy: { type: String, default: 'admin' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Transaction', transactionSchema);