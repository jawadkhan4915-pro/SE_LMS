const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
  assignment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assignment', 
    required: true, 
    index: true 
  },
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true, 
    index: true 
  },
  fileUrl: { 
    type: String, 
    required: [true, 'Submission file is required'] 
  },
  fileName: { 
    type: String, 
    required: true 
  },
  grade: { 
    type: Number, 
    default: null, // Out of 100
    min: 0,
    max: 100
  },
  feedback: { 
    type: String, 
    default: '' 
  },
  submittedAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

// A student can submit only one file/entry per assignment
SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
