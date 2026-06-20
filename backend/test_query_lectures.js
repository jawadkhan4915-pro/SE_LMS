const mongoose = require('mongoose');
const User = require('./src/models/user');
const Course = require('./src/models/course');
const OnlineLecture = require('./src/models/onlineLecture');

const uri = 'mongodb+srv://digistore24officials_db_user:pEfiD3fFmvk5gklt@jawaddb.eh3qx19.mongodb.net/SE_LMS?retryWrites=true&w=majority&appName=JawadDB';

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const lectures = await OnlineLecture.find({});
    console.log('Total lectures in DB:', lectures.length);
    lectures.forEach(l => {
      console.log(`Lecture ID: ${l._id}`);
      console.log(`- Course: ${l.course}`);
      console.log(`- Teacher: ${l.teacher}`);
      console.log(`- Title: ${l.title}`);
      console.log(`- MeetingId: ${l.meetingId}`);
      console.log(`- Date/Time: ${l.date} (${l.startTime} - ${l.endTime})`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
