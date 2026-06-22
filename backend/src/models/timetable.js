const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required'],
    index: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required'],
    index: true
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8'],
    index: true
  },
  section: {
    type: String,
    enum: ['A', 'B', 'C'],
    required: [true, 'Section is required'],
    default: 'A',
    index: true
  },
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    index: true
  },
  startTime: {
    type: String, // format "HH:MM", e.g., "09:00"
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String, // format "HH:MM", e.g., "10:30"
    required: [true, 'End time is required']
  },
  classroom: {
    type: String,
    required: [true, 'Classroom is required'],
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', TimetableSchema);
