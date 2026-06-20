const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
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
  semester: {
    type: Number,
    required: true
  },
  academicYear: {
    type: String,
    default: () => {
      const y = new Date().getFullYear();
      return `${y}-${y + 1}`;
    }
  },
  // Marks breakdown
  midterm: {
    type: Number,
    default: 0,
    min: 0,
    max: 30
  },
  finalterm: {
    type: Number,
    default: 0,
    min: 0,
    max: 50
  },
  sessional: {
    type: Number,
    default: 0,
    min: 0,
    max: 20  // includes assignments + quizzes
  },
  totalMarks: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  grade: {
    type: String,
    default: ''  // A, B+, B, C+, C, D, F
  },
  gradePoints: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 4.0
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// One result per student per course
ResultSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Result', ResultSchema);
