const mongoose = require('mongoose');
const seedDemoAccounts = require('../utils/seeder');
const User = require('../models/user');

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not set in environment variables! Please configure MONGODB_URI in your Render environment variables.');
    }
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default demo accounts only if DB is empty
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('No users found in database. Seeding demo data...');
      await seedDemoAccounts();
    } else {
      console.log(`Database ready (${count} existing users). Skipping auto-reseed.`);
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
  }
};

module.exports = connectDB;
