const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Match = require('./models/Match');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await Match.deleteMany();
    await User.deleteMany();

    // Create Admin user
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('admin123', salt);
    
    // We bypass pre-save hook by inserting or creating without modifying password again
    const adminUser = new User({
      username: 'admin',
      password: 'admin123', // hook will hash it
      isAdmin: true,
      coins: 999999
    });
    // For normal user
    const testUser = new User({
        username: 'testuser',
        password: 'password123', // hook will hash it
        isAdmin: false,
        coins: 500
    });

    await adminUser.save();
    await testUser.save();

    // Create Match
    const match = new Match({
      teamA: 'RCB',
      teamB: 'SRH',
      multiplierA: 1.5,
      multiplierB: 2.0,
      isActive: true,
      result: 'pending'
    });

    await match.save();

    console.log('Data Imported successfully');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
