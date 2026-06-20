const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Notice title is required'],
    trim: true
  },
  content: { 
    type: String, 
    required: [true, 'Notice content is required'] 
  },
  targetRoles: [{ 
    type: String, 
    enum: ['student', 'teacher', 'admin', 'hod'] 
  }],
  postedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Notice', NoticeSchema);
