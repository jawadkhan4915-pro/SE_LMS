const mongoose = require('mongoose');
const seedDemoAccounts = require('../utils/seeder');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Seed default demo accounts
    await seedDemoAccounts();
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
