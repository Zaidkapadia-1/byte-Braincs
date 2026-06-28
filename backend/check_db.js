const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to database.");
    
    const participants = await mongoose.connection.db.collection('participants').find({}).toArray();
    console.log("PARTICIPANTS in DB:");
    console.log(JSON.stringify(participants, null, 2));
    
    const teams = await mongoose.connection.db.collection('teams').find({}).toArray();
    console.log("\nTEAMS in DB:");
    console.log(JSON.stringify(teams, null, 2));
    
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
