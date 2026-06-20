const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: [true, 'Attendance date is required']
  },
  lectureTime: {
    type: String,
    default: '08:00 AM'   // e.g. "08:00 AM - 09:30 AM"
  },
  topic: {
    type: String,
    default: ''           // Lecture topic for this session
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  records: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      required: true
    }
  }]
}, { timestamps: true });

// Avoid duplicate attendance register for same course on same date
AttendanceSchema.index({ course: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
