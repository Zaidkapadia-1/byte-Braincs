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
    sparse: true,   // allows null until approved
    uppercase: true
  },
  teamName: {
    type: String,
    required: true,
    trim: true
  },
  registrationType: {
    type: String,
    enum: ['team', 'solo', 'individual'],
    required: true
  },
  members: {
    type: [memberSchema],
    validate: {
      validator: function (v) {
        return v.length >= 1 && v.length <= 4;
      },
      message: 'A team must have 1 to 4 members.'
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
    enum: ['pending', 'approved', 'rejected', 'verified', 'flagged'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  approvedAt: {
    type: Date
  },
  referredBy: {
    type: String,
    default: null
  },
  // Solo teaming fields
  soloTeamFormed: {
    type: Boolean,
    default: false
  },
  formedTeamCode: {
    type: String,
    default: null
  },
  // Team dashboard shared password (hashed)
  teamPassword: {
    type: String,
    default: null
  },
  plainPassword: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

teamSchema.index({ contactEmail: 1 });
teamSchema.index({ registrationType: 1 });
teamSchema.index({ status: 1 });

module.exports = mongoose.model('Team', teamSchema);