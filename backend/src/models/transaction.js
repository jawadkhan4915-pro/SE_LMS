const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Transaction title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: [true, 'Transaction type (income/expense) is required']
  },
  category: {
    type: String,
    enum: ['fee', 'salary', 'utility', 'maintenance', 'event', 'other'],
    required: [true, 'Transaction category is required']
  },
  amount: {
    type: Number,
    required: [true, 'Transaction amount is required']
  },
  date: {
    type: Date,
    default: Date.now
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  refModel: {
    type: String
  },
  description: {
    type: String,
    default: ''
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
