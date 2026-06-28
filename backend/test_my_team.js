const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB.");
    
    // Find cyber team
    const team = await mongoose.connection.db.collection('teams').findOne({ teamName: 'cyber' });
    if (!team) {
      console.error("Team 'cyber' not found.");
      process.exit(1);
    }
    console.log("Found team:", team.teamName, "ID:", team._id);

    // Sign token
    const token = jwt.sign(
      { teamId: team._id, teamCode: team.teamCode, role: 'team' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    console.log("Generated token:", token);

    // Verify token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token successfully:", decoded);
      
      // Perform lookup using Mongoose model
      const TeamModel = require('./models/Team');
      const foundTeam = await TeamModel.findById(decoded.teamId).select('-teamPassword');
      if (!foundTeam) {
        console.error("Mongoose lookup failed: team not found.");
      } else {
        console.log("Mongoose lookup succeeded:", foundTeam.teamName);
      }
    } catch (e) {
      console.error("Error during verification/lookup:", e);
    }

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
