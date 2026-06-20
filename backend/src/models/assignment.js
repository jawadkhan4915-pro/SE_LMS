const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema({
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: [true, 'Course reference is required'], 
    index: true 
  },
  title: { 
    type: String, 
    required: [true, 'Assignment title is required'],
    trim: true
  },
  description: { 
    type: String, 
    required: [true, 'Description is required'] 
  },
  deadline: { 
    type: Date, 
    required: [true, 'Submission deadline is required'] 
  },
  attachmentUrl: { 
    type: String, 
    default: '' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
