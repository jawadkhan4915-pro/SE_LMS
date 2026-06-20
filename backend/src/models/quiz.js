const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema({
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true, 
    index: true 
  },
  title: { 
    type: String, 
    required: [true, 'Quiz title is required'],
    trim: true
  },
  durationMinutes: { 
    type: Number, 
    required: [true, 'Quiz duration is required'],
    min: [1, 'Duration must be at least 1 minute']
  },
  passingMarks: { 
    type: Number, 
    required: [true, 'Passing marks are required'],
    min: 0
  },
  isActive: { 
    type: Boolean, 
    default: false 
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', QuizSchema);
