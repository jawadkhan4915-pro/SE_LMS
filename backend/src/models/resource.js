const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Resource title is required'],
    trim: true
  },
  type: { 
    type: String, 
    enum: ['pdf', 'research_paper', 'lecture_notes', 'dataset', 'youtube_link', 'github_repo'], 
    required: [true, 'Resource type is required'] 
  },
  url: { 
    type: String, 
    required: [true, 'Resource URL is required'],
    trim: true 
  },
  uploadedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    index: true,
    default: null // null if department-wide general resource
  }
}, { timestamps: true });

module.exports = mongoose.model('Resource', ResourceSchema);
