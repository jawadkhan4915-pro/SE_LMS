const mongoose = require('mongoose');

const VirtualCardDocumentSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  uploadedByRole: {
    type: String,
    enum: ['university', 'self'],
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('VirtualCardDocument', VirtualCardDocumentSchema);
