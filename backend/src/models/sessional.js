const mongoose = require('mongoose');

const SessionalSchema = new mongoose.Schema({
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
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Individual sessional components
  assignment1: { type: Number, default: 0, min: 0, max: 10 },
  assignment2: { type: Number, default: 0, min: 0, max: 10 },
  quiz1:       { type: Number, default: 0, min: 0, max: 5 },
  quiz2:       { type: Number, default: 0, min: 0, max: 5 },
  presentation:{ type: Number, default: 0, min: 0, max: 10 },
  // Total out of 20 (calculated)
  totalSessional: { type: Number, default: 0, min: 0, max: 20 },
  remarks: { type: String, default: '' }
}, { timestamps: true });

SessionalSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Sessional', SessionalSchema);
