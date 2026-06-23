const mongoose = require('mongoose');

const OnlineLectureSchema = new mongoose.Schema({
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
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: String,
    required: [true, 'End time is required']
  },
  meetingId: {
    type: String,
    required: [true, 'Meeting ID is required'],
    unique: true,
    index: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  participants: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    gmail: {
      type: String
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  whiteboardData: {
    type: String,
    default: '[]'
  },
  currentSlide: {
    type: Number,
    default: 0
  },
  activeMode: {
    type: String,
    enum: ['slides', 'whiteboard', 'screenshare'],
    default: 'slides'
  },
  screenShareFrame: {
    type: String,
    default: ''
  },
  chatMessages: [{
    senderName: {
      type: String,
      required: true
    },
    senderEmail: {
      type: String,
      required: true
    },
    senderRole: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

module.exports = mongoose.model('OnlineLecture', OnlineLectureSchema);
