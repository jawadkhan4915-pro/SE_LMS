const Transaction = require('../models/transaction');
const FeeVoucher = require('../models/feeVoucher');
const User = require('../models/user');

// @desc    Record a generic operating expense
// @route   POST /api/transactions/expense
// @access  Private (Accountant/Admin)
exports.createExpense = async (req, res) => {
  const { title, category, amount, description, date } = req.body;

  if (!title || !category || !amount) {
    return res.status(400).json({ success: false, message: 'Please provide title, category and amount' });
  }

  const validCategories = ['utility', 'maintenance', 'event', 'other'];
  if (!validCategories.includes(category)) {
    return res.status(400).json({ success: false, message: 'Invalid expense category' });
  }

  try {
    const transaction = await Transaction.create({
      title,
      type: 'expense',
      category,
      amount: Number(amount),
      date: date || new Date(),
      description: description || '',
      processedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Process a salary payout to a faculty/staff member
// @route   POST /api/transactions/pay-salary
// @access  Private (Accountant/Admin)
exports.paySalary = async (req, res) => {
  const { staffId, amount, month, year, description } = req.body;

  if (!staffId || !amount || !month || !year) {
    return res.status(400).json({ success: false, message: 'Please provide staffId, amount, month, and year' });
  }

  try {
    const staffMember = await User.findById(staffId);
    if (!staffMember) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const title = `Salary Payout - ${staffMember.name} (${month}/${year})`;

    // Check if salary already paid to this user for the same month and year
    const alreadyPaid = await Transaction.findOne({
      refId: staffMember._id,
      category: 'salary',
      title: new RegExp(`\\(${month}/${year}\\)$`)
    });

    if (alreadyPaid) {
      return res.status(400).json({
        success: false,
        message: `Salary for ${month}/${year} has already been paid to this staff member.`
      });
    }

    const transaction = await Transaction.create({
      title,
      type: 'expense',
      category: 'salary',
      amount: Number(amount),
      date: new Date(),
      refId: staffMember._id,
      refModel: 'User',
      description: description || `Processed salary payout for the month of ${month} ${year}`,
      processedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Salary payment recorded successfully',
      data: transaction
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark a student fee voucher as paid
// @route   PUT /api/transactions/fees/:voucherId/pay
// @access  Private (Accountant/Admin)
exports.markFeePaid = async (req, res) => {
  const { voucherId } = req.params;

  try {
    const voucher = await FeeVoucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Fee voucher not found' });
    }

    if (voucher.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Voucher is already marked as paid' });
    }

    voucher.status = 'Paid';
    voucher.paidAt = new Date();
    await voucher.save();

    // Populate student details to formulate transaction title
    await voucher.populate('student', 'name email');

    const title = `Student Fee Payment - ${voucher.student.name} (Voucher #${voucher.voucherNo})`;

    const transaction = await Transaction.create({
      title,
      type: 'income',
      category: 'fee',
      amount: voucher.amount,
      date: new Date(),
      refId: voucher._id,
      refModel: 'FeeVoucher',
      description: `Semester fee payment. Student ID ref: ${voucher.student._id}`,
      processedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      message: 'Fee voucher marked as paid and ledger updated',
      data: {
        voucher,
        transaction
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get financial ledger logs and analytics
// @route   GET /api/transactions/ledger
// @access  Private (Accountant/Admin)
exports.getTransactions = async (req, res) => {
  const { type, category, startDate, endDate, search } = req.query;

  try {
    const query = {};

    if (type) {
      query.type = type;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        // Set end date to final hour of day
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Retrieve ledger entries
    const transactions = await Transaction.find(query)
      .populate('processedBy', 'name email')
      .sort({ date: -1 });

    // Aggregate statistics across matching filter/all transactions
    const statsQuery = {};
    if (startDate || endDate) {
      statsQuery.date = query.date;
    }

    const allTransactions = await Transaction.find(statsQuery);
    
    let totalIncome = 0;
    let totalExpense = 0;

    allTransactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpense += t.amount;
      }
    });

    res.status(200).json({
      success: true,
      summary: {
        totalIncome,
        totalExpense,
        netCashFlow: totalIncome - totalExpense
      },
      data: transactions
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all student fee vouchers
// @route   GET /api/transactions/vouchers
// @access  Private (Accountant/Admin)
exports.getUnpaidVouchers = async (req, res) => {
  const { search, status } = req.query;

  try {
    const query = {};

    if (status) {
      query.status = status;
    }

    let studentIds = [];
    if (search) {
      const students = await User.find({
        role: 'student',
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      studentIds = students.map(s => s._id);
    }

    if (search) {
      query.$or = [
        { student: { $in: studentIds } },
        { voucherNo: { $regex: search, $options: 'i' } }
      ];
    }

    const vouchers = await FeeVoucher.find(query)
      .populate('student', 'name email department semester section')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: vouchers
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get faculty & staff members list
// @route   GET /api/transactions/faculty
// @access  Private (Accountant/Admin)
exports.getFacultyList = async (req, res) => {
  const { search, department } = req.query;

  try {
    const query = {
      role: { $in: ['teacher', 'admin', 'hod', 'coordinator', 'accountant'] }
    };

    if (department && department !== 'All') {
      query.department = department;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const faculty = await User.find(query).select('name email role department phone');

    res.status(200).json({
      success: true,
      data: faculty
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
