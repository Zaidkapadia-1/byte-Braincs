const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("No MONGODB_URI found in .env!");
  process.exit(1);
}

console.log("Connecting to:", uri);

mongoose.connect(uri)
  .then(async () => {
    console.log("Connected to MongoDB successfully.");
    
    try {
      const collections = await mongoose.connection.db.listCollections().toArray();
      const names = collections.map(c => c.name);
      
      if (names.includes('teams')) {
        const res = await mongoose.connection.db.collection('teams').deleteMany({});
        console.log(`Cleared 'teams' collection (${res.deletedCount} documents deleted).`);
      }
      
      if (names.includes('transactions')) {
        const res = await mongoose.connection.db.collection('transactions').deleteMany({});
        console.log(`Cleared 'transactions' collection (${res.deletedCount} documents deleted).`);
      }
      
      if (names.includes('participants')) {
        const res = await mongoose.connection.db.collection('participants').deleteMany({});
        console.log(`Cleared 'participants' collection (${res.deletedCount} documents deleted).`);
      }
      
      console.log("Database reset complete! All data has been cleared.");
      process.exit(0);
    } catch (err) {
      console.error("Error during clearance:", err);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  });
