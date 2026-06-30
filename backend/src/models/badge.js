const mongoose = require('mongoose');

const BadgeSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  iconType: {
    type: String,
    enum: ['cup', 'star', 'fire', 'award', 'target', 'heart'],
    default: 'award'
  },
  unlockedAt: {
    type: Date,
    default: Date.now
  }
});

// Avoid duplicate badges for same student
BadgeSchema.index({ student: 1, title: 1 }, { unique: true });

module.exports = mongoose.model('Badge', BadgeSchema);
