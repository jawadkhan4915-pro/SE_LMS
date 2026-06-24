const mongoose = require('mongoose');

const ExamScheduleSchema = new mongoose.Schema({
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: [true, 'Course is required'],
    index: true 
  },
  type: { 
    type: String, 
    enum: ['midterm', 'finalterm'], 
    required: [true, 'Exam type is required'] 
  },
  date: { 
    type: Date, 
    required: [true, 'Date is required'] 
  },
  time: { 
    type: String, 
    required: [true, 'Time slot is required'] // e.g. "09:00 AM - 12:00 PM"
  },
  room: { 
    type: String, 
    required: [true, 'Room is required'] 
  },
  department: { 
    type: String, 
    enum: ['SE', 'CS', 'IT', 'EE'], 
    required: [true, 'Department is required'],
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ExamSchedule', ExamScheduleSchema);
