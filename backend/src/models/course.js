const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Course name is required'],
    trim: true
  },
  code: { 
    type: String, 
    required: [true, 'Course code is required'], 
    unique: true, 
    index: true,
    trim: true,
    uppercase: true
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'] 
  },
  creditHours: { 
    type: Number, 
    required: [true, 'Credit hours are required'],
    min: [1, 'Credit hours must be at least 1'],
    max: [6, 'Credit hours cannot exceed 6']
  },
  semester: { 
    type: Number, 
    required: [true, 'Semester is required'],
    min: [1, 'Semester must be between 1 and 8'],
    max: [8, 'Semester must be between 1 and 8']
  },
  teacher: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'Teacher is required'],
    index: true 
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'],
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
