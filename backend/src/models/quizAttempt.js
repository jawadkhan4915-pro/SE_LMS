const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema({
  quiz: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Quiz', 
    required: true, 
    index: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  answers: [{
    question: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Question', 
      required: true 
    },
    selectedAnswerIndex: { 
      type: Number, 
      required: true 
    }
  }],
  score: { 
    type: Number, 
    required: true 
  },
  passed: { 
    type: Boolean, 
    required: true 
  },
  attemptedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// A student can attempt a quiz only once
QuizAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
