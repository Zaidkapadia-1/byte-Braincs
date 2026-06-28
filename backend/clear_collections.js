const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(async () => {
    console.log("Connected.");
    const collections = await mongoose.connection.db.listCollections().toArray();
    const names = collections.map(c => c.name);
    
    if (names.includes('teams')) {
      const res = await mongoose.connection.db.collection('teams').deleteMany({});
      console.log(`Cleared teams: ${res.deletedCount}`);
    }
    if (names.includes('transactions')) {
      const res = await mongoose.connection.db.collection('transactions').deleteMany({});
      console.log(`Cleared transactions: ${res.deletedCount}`);
    }
    if (names.includes('participants')) {
      const res = await mongoose.connection.db.collection('participants').deleteMany({});
      console.log(`Cleared participants: ${res.deletedCount}`);
    }
    console.log("Done.");
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
