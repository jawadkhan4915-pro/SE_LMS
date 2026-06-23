const User = require('../models/user');
const Enrollment = require('../models/enrollment');
const Result = require('../models/result');
const { getDepartmentFullName } = require('../utils/departmentHelper');

// @desc    Get fee slip info for student (generated dynamically)
// @route   GET /api/slips/fee
// @access  Private/Student
exports.getFeeSlip = async (req, res) => {
  try {
    const student = await User.findById(req.user.id).select('-password');
    if (!student || student.role !== 'student') {
      return res.status(403).json({ success: false, message: 'Only students can access fee slips' });
    }

    const semester = student.semester || 1;
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

    const feesBreakdown = [
      { category: 'Tuition Fee', amount: fees.tuitionFee },
      { category: 'Exam Fee', amount: fees.examFee },
      { category: 'Library Fee', amount: fees.libraryFee },
      { category: 'Lab & Equipment Fee', amount: fees.labFee }
    ];
    if (fees.admissionFee > 0) {
      feesBreakdown.push({ category: 'Admission & Registration Fee', amount: fees.admissionFee });
    }

    const voucherNo = `FEE-${new Date().getFullYear()}-${String(student._id).slice(-6).toUpperCase()}-S${semester}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    const rollNumber = `${student.department || 'SE'}-${new Date().getFullYear()}-${String(student._id).slice(-4).toUpperCase()}`;

    const feeSlip = {
      voucherNo,
      status: 'Unpaid',
      student: {
        name: student.name,
        rollNumber,
        email: student.email,
        phone: student.phone
      },
      semester,
      feesBreakdown,
      totalAmount,
      dueDate: dueDate.toLocaleDateString('en-US', { dateStyle: 'medium' }),
      bankDetails: {
        bankName: 'HBL – Habib Bank Limited',
        title: `University of Technology – ${student.department || 'SE'} Dept`,
        accountNo: '12345-678901-234'
      }
    };

    res.json({ success: true, data: feeSlip });
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
        contact: student.phone || 'N/A'
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
