const mongoose = require('mongoose');

const FeeVoucherSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true
  },
  semester: { 
    type: Number, 
    required: true 
  },
  voucherNo: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  type: { 
    type: String, 
    enum: ['full', 'installment'], 
    default: 'full' 
  },
  installmentNo: { 
    type: Number, 
    default: 0 
  },
  amount: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Unpaid', 'Paid', 'Cancelled'], 
    default: 'Unpaid' 
  },
  dueDate: { 
    type: Date, 
    required: true 
  },
  paidAt: { 
    type: Date 
  }
}, { timestamps: true });

module.exports = mongoose.model('FeeVoucher', FeeVoucherSchema);
