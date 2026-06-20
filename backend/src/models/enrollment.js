const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
    index: true
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'   // Direct enrollments by admin are auto-approved
  },
  status: {
    type: String,
    enum: ['active', 'dropped', 'completed'],
    default: 'active'
  },
  grade: {
    type: String,
    default: ''
  },
  gpa: {
    type: Number,
    default: 0.0,
    min: 0.0,
    max: 4.0
  }
}, { timestamps: true });

// A student can only be enrolled in a specific course once
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', EnrollmentSchema);
