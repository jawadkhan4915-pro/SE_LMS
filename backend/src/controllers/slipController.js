const User = require('../models/user');
const Enrollment = require('../models/enrollment');
const Result = require('../models/result');
const { getDepartmentFullName } = require('../utils/departmentHelper');
const Settings = require('../models/settings');
const FeeVoucher = require('../models/feeVoucher');

// Helper to check if slip is locked
const isSlipLocked = async (studentId) => {
  const student = await User.findById(studentId);
  if (!student) return true;
  
  // If the coordinator has manually overridden the slip lock, unlock it instantly
  if (student.examSlipOverride) return false;
  
  const semester = student.semester || 1;

  let midtermSetting = await Settings.findOne({ key: 'midterm_exam_date' });
  let midtermDate = midtermSetting ? new Date(midtermSetting.value) : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  
  const now = new Date();
  const midtermTime = new Date(midtermDate).getTime();
  const oneWeekBeforeMidtermTime = midtermTime - 7 * 24 * 60 * 60 * 1000;
  
  if (now.getTime() >= oneWeekBeforeMidtermTime) {
    // Find all active vouchers for this student in the current semester
    const vouchers = await FeeVoucher.find({ student: studentId, semester, status: { $ne: 'Cancelled' } });
    if (vouchers.length === 0) {
      return true;
    }
    
    // Check if any voucher is paid
    const hasPaidFull = vouchers.some(v => v.type === 'full' && v.status === 'Paid');
    const hasPaidInstallment = vouchers.some(v => v.type === 'installment' && v.status === 'Paid');
    
    if (!hasPaidFull && !hasPaidInstallment) {
      return true;
    }
  }
  
  return false;
};

// @desc    Get fee slip info for student
// @route   GET /api/slips/fee
// @access  Private/Student
exports.getFeeSlip = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access fee slips' });
    }

    const semester = student.semester || 1;
    
    // Find vouchers for this student and current semester
    let vouchers = await FeeVoucher.find({ student: req.user.id, semester, status: { $ne: 'Cancelled' } });
    
    // If no vouchers exist, generate the default full voucher
    if (vouchers.length === 0) {
      const feeStructure = {
        1: { tuitionFee: 35000, admissionFee: 15000, examFee: 3000, libraryFee: 1500, labFee: 5000 },
        2: { tuitionFee: 35000, admissionFee: 0,     examFee: 3000, libraryFee: 1500, labFee: 5000 },
        3: { tuitionFee: 38000, admissionFee: 0,     examFee: 3500, libraryFee: 1500, labFee: 6000 },
        4: { tuitionFee: 38000, admissionFee: 0,     examFee: 3500, libraryFee: 1500, labFee: 6000 },
        5: { tuitionFee: 40000, admissionFee: 0,     examFee: 4000, libraryFee: 2000, labFee: 6000 },
        6: { tuitionFee: 40000, admissionFee: 0,     examFee: 4000, libraryFee: 2000, labFee: 6000 },
        7: { tuitionFee: 42000, admissionFee: 0,     examFee: 4500, libraryFee: 2000, labFee: 7000 },
        8: { tuitionFee: 42000, admissionFee: 0,     examFee: 4500, libraryFee: 2000, labFee: 7000 },
      };

      const fees = feeStructure[semester] || feeStructure[1];
      const totalAmount = Object.values(fees).reduce((s, v) => s + v, 0);

      const voucherNo = `FEE-${new Date().getFullYear()}-${String(student._id).slice(-6).toUpperCase()}-S${semester}`;
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 15);

      const newVoucher = await FeeVoucher.create({
        student: req.user.id,
        semester,
        voucherNo,
        type: 'full',
        amount: totalAmount,
        status: 'Unpaid',
        dueDate
      });
      vouchers = [newVoucher];
    }

    let midtermSetting = await Settings.findOne({ key: 'midterm_exam_date' });
    if (!midtermSetting) {
      midtermSetting = await Settings.create({
        key: 'midterm_exam_date',
        value: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }

    const hasAppliedInstallments = vouchers.some(v => v.type === 'installment');
    const isLocked = await isSlipLocked(req.user.id);
    const rollNumber = `${student.department || 'SE'}-${new Date().getFullYear()}-${String(student._id).slice(-4).toUpperCase()}`;

    res.json({
      success: true,
      data: {
        student: {
          name: student.name,
          rollNumber,
          email: student.email,
          phone: student.phone,
          department: student.department
        },
        semester,
        hasAppliedInstallments,
        isLocked,
        vouchers: vouchers.map(v => {
          const breakdown = v.type === 'full' ? [
            { category: 'Tuition Fee', amount: Math.round(v.amount * 0.7) },
            { category: 'Exam Fee', amount: Math.round(v.amount * 0.1) },
            { category: 'Library & Lab Fee', amount: Math.round(v.amount * 0.2) }
          ] : [
            { category: `Semester Fee Installment #${v.installmentNo} of 3`, amount: v.amount }
          ];

          return {
            _id: v._id,
            voucherNo: v.voucherNo,
            type: v.type,
            installmentNo: v.installmentNo,
            amount: v.amount,
            status: v.status,
            dueDate: new Date(v.dueDate).toLocaleDateString('en-US', { dateStyle: 'medium' }),
            paidAt: v.paidAt,
            feesBreakdown: breakdown
          };
        }),
        midtermExamDate: midtermSetting.value,
        bankDetails: {
          bankName: 'HBL – Habib Bank Limited',
          title: `University of Technology – ${student.department || 'SE'} Dept`,
          accountNo: '12345-678901-234'
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get roll number slip info
// @route   GET /api/slips/rollnumber
// @access  Private/Student
exports.getRollNumberSlip = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access this' });
    }

    // Check if slip is locked
    const locked = await isSlipLocked(req.user.id);
    if (locked) {
      return res.status(403).json({
        success: false,
        locked: true,
        message: 'Your roll number slip is locked due to outstanding semester fee. Please pay at least one installment or full fee 1 week before the midterm exam to unlock it.'
      });
    }

    const enrollments = await Enrollment.find({ student: req.user.id, approvalStatus: 'approved' })
      .populate({
        path: 'course',
        select: 'name code creditHours semester teacher',
        populate: {
          path: 'teacher',
          select: 'name'
        }
      });

    const rollNumber = `${student.department || 'SE'}-${new Date().getFullYear()}-${String(student._id).slice(-4).toUpperCase()}`;
    const examYear = new Date().getFullYear();

    const slip = {
      examSession: `Fall ${examYear}`,
      rollNumber,
      student: {
        name: student.name,
        program: `BS ${getDepartmentFullName(student.department)}`,
        email: student.email,
        contact: student.phone || 'N/A',
        department: student.department
      },
      semester: student.semester || 1,
      courses: enrollments.map(e => ({
        code: e.course?.code,
        name: e.course?.name,
        teacher: e.course?.teacher?.name || 'TBA'
      })),
      instructionNotes: [
        'Bring this slip to the examination center.',
        'Present your original CNIC/Student ID along with this slip.',
        'No electronic device is allowed inside the exam hall.',
        'Report 15 minutes before the examination begins.'
      ]
    };

    res.json({ success: true, data: slip });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate payment of a voucher
// @route   POST /api/slips/fee/pay
// @access  Private
exports.payVoucher = async (req, res) => {
  try {
    const { voucherId } = req.body;
    if (!voucherId) {
      return res.status(400).json({ success: false, message: 'Voucher ID is required' });
    }

    const voucher = await FeeVoucher.findById(voucherId);
    if (!voucher) {
      return res.status(404).json({ success: false, message: 'Voucher not found' });
    }

    voucher.status = 'Paid';
    voucher.paidAt = new Date();
    await voucher.save();

    res.json({ success: true, message: 'Voucher paid successfully', data: voucher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit application to HOD for fee installment
// @route   POST /api/slips/fee/installment
// @access  Private/Student
exports.applyInstallments = async (req, res) => {
  try {
    const { reason } = req.body;
    const student = await User.findById(req.user.id);
    if (!student || student.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can apply for installments' });
    }

    const semester = student.semester || 1;

    // Find the unpaid full voucher for this student and current semester
    const fullVoucher = await FeeVoucher.findOne({ 
      student: req.user.id, 
      semester, 
      type: 'full', 
      status: 'Unpaid' 
    });

    if (!fullVoucher) {
      return res.status(400).json({ 
        success: false, 
        message: 'No unpaid full voucher found for this semester. You may have already applied for installments or paid the fee.' 
      });
    }

    // Cancel the full voucher
    fullVoucher.status = 'Cancelled';
    await fullVoucher.save();

    // Create 3 installments
    const totalAmount = fullVoucher.amount;
    const installAmount = Math.round(totalAmount / 3);

    const dueDates = [
      new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 35 * 24 * 60 * 60 * 1000)
    ];

    const installments = [];
    for (let i = 1; i <= 3; i++) {
      const amt = i === 3 ? (totalAmount - installAmount * 2) : installAmount;
      const voucherNo = `FEE-${new Date().getFullYear()}-${String(student._id).slice(-6).toUpperCase()}-S${semester}-INST${i}`;
      
      const voucher = await FeeVoucher.create({
        student: req.user.id,
        semester,
        voucherNo,
        type: 'installment',
        installmentNo: i,
        amount: amt,
        status: 'Unpaid',
        dueDate: dueDates[i - 1]
      });
      installments.push(voucher);
    }

    console.log(`Installment application approved dynamically for student: ${student.email}, reason: ${reason}`);

    res.status(201).json({ 
      success: true, 
      message: 'Installment application submitted. Three installment fee vouchers have been generated automatically.', 
      data: installments 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get midterm settings & lock status
// @route   GET /api/slips/midterm
// @access  Private
exports.getMidtermSettings = async (req, res) => {
  try {
    let midtermSetting = await Settings.findOne({ key: 'midterm_exam_date' });
    if (!midtermSetting) {
      midtermSetting = await Settings.create({
        key: 'midterm_exam_date',
        value: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }
    
    let isLocked = false;
    if (req.user && req.user.role === 'student') {
      isLocked = await isSlipLocked(req.user.id);
    }

    res.json({ 
      success: true, 
      data: {
        midtermExamDate: midtermSetting.value,
        isLocked
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update midterm settings
// @route   POST /api/slips/midterm
// @access  Private
exports.updateMidtermSettings = async (req, res) => {
  try {
    const { date } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    let midtermSetting = await Settings.findOne({ key: 'midterm_exam_date' });
    if (!midtermSetting) {
      midtermSetting = await Settings.create({ key: 'midterm_exam_date', value: date });
    } else {
      midtermSetting.value = date;
      await midtermSetting.save();
    }

    res.json({ success: true, message: 'Midterm exam date updated successfully', data: midtermSetting });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
