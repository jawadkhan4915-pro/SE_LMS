const mongoose = require('mongoose');

const TeacherAttendanceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date, // normalized to start of day YYYY-MM-DD
    required: true,
    index: true
  },
  checkInTime: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['present', 'late'],
    default: 'present'
  },
  department: {
    type: String,
    enum: ['SE', 'CS', 'IT', 'EE'],
    required: true
  }
}, { timestamps: true });

// Compound unique index to enforce one check-in per day per teacher
TeacherAttendanceSchema.index({ teacher: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('TeacherAttendance', TeacherAttendanceSchema);
