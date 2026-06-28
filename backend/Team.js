const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true }
});

const teamSchema = new mongoose.Schema({
  teamCode: {
    type: String,
    unique: true,
    required: true,
    uppercase: true
  },
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  registrationType: {
    type: String,
    enum: ['team', 'individual'],
    required: true
  },
  members: {
    type: [memberSchema],
    validate: {
      validator: function (v) {
        return v.length === 1 || v.length === 3;
      },
      message: 'A registration must have exactly 1 or 3 members.'
    }
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  contactEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    required: true,
    trim: true
  },
  byteCoins: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['verified', 'pending', 'flagged'],
    default: 'pending'
  },
  adminNotified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

teamSchema.index({ teamCode: 1 });
teamSchema.index({ contactEmail: 1 });
teamSchema.index({ registrationType: 1 });

module.exports = mongoose.model('Team', teamSchema);