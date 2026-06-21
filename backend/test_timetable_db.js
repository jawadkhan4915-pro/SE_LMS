const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config();

const Timetable = require('./src/models/timetable');
const Course = require('./src/models/course');
const User = require('./src/models/user');

const uri = process.env.MONGO_URI || 'mongodb+srv://digistore24officials_db_user:pEfiD3fFmvk5gklt@jawaddb.eh3qx19.mongodb.net/SE_LMS?retryWrites=true&w=majority&appName=JawadDB';

async function verify() {
  console.log('Using Mongo URI:', uri.replace(/:([^@]+)@/, ':****@'));
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(uri);
    console.log('SUCCESS: Connected to database');

    console.log('Checking Timetable model schema registration...');
    const count = await Timetable.countDocuments();
    console.log(`SUCCESS: Timetable model verified. Active entries count: ${count}`);

    if (count > 0) {
      const sample = await Timetable.findOne()
        .populate('course', 'name code')
        .populate('teacher', 'name email');
      console.log('Sample timetable slot retrieved:', {
        course: sample.course?.name,
        teacher: sample.teacher?.name,
        classroom: sample.classroom,
        day: sample.day,
        time: `${sample.startTime} - ${sample.endTime}`
      });
    } else {
      console.log('No timetable entries exist yet. The collection is empty.');
    }

  } catch (err) {
    console.error('ERROR during verification:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from database');
  }
}

verify();
