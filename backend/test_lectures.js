const mongoose = require('mongoose');
const User = require('./src/models/user');
const Enrollment = require('./src/models/enrollment');
const OnlineLecture = require('./src/models/onlineLecture');

const uri = 'mongodb+srv://digistore24officials_db_user:pEfiD3fFmvk5gklt@jawaddb.eh3qx19.mongodb.net/SE_LMS?retryWrites=true&w=majority&appName=JawadDB';

async function run() {
  try {
    await mongoose.connect(uri);
    console.log('Connected to DB');

    const studentId = '6a339be9ec1282693e3d5e96'; // student@lms.edu
    
    // Test 1: Mismatched Enrollment Query
    const enrollments = await Enrollment.find({ student: studentId });
    console.log('Enrollments found:', enrollments.length);
    enrollments.forEach(e => {
      console.log(`- Course: ${e.course}, Approval: ${e.approvalStatus}`);
    });

    const courseIds = enrollments.map(e => e.course);
    console.log('Course IDs:', courseIds);

    // Test 2: Find Lectures
    const lectures = await OnlineLecture.find({ course: { $in: courseIds } })
      .populate('course', 'name code')
      .populate('teacher', 'name email');
    console.log('Lectures found:', lectures.length);
    lectures.forEach(l => {
      console.log(`- Title: ${l.title}, Course: ${l.course?.code}, Teacher: ${l.teacher?.name}`);
    });

  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}
run();
