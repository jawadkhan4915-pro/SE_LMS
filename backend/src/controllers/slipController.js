const User = require('../models/user');
const Enrollment = require('../models/enrollment');
const Result = require('../models/result');

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
    const total = Object.values(fees).reduce((s, v) => s + v, 0);

    // Generate voucher number (deterministic based on student + semester)
    const voucherNo = `FEE-${new Date().getFullYear()}-${String(student._id).slice(-6).toUpperCase()}-S${semester}`;

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15); // due in 15 days

    const feeSlip = {
      voucherNo,
      student: {
        name: student.name,
        email: student.email,
        phone: student.phone,
        rollNo: `SE-${new Date().getFullYear()}-${String(student._id).slice(-4).toUpperCase()}`,
        semester
      },
      fees: {
        ...fees,
        total
      },
      academicYear: `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
      dueDate: dueDate.toISOString(),
      bankDetails: {
        bankName: 'HBL – Habib Bank Limited',
        accountTitle: 'University of Technology – SE Dept',
        accountNo: '12345-678901-234',
        branchCode: '0123',
        iban: 'PK36 HABB 0000000123456789'
      },
      issuedOn: new Date().toISOString()
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
      .populate('course', 'name code creditHours semester');

    const rollNo = `SE-${new Date().getFullYear()}-${String(student._id).slice(-4).toUpperCase()}`;

    const examYear = new Date().getFullYear();
    const examDates = {
      midterm:   { start: `${examYear}-10-20`, end: `${examYear}-10-28` },
      finalterm: { start: `${examYear}-12-10`, end: `${examYear}-12-20` }
    };

    const slip = {
      rollNo,
      student: {
        name: student.name,
        email: student.email,
        phone: student.phone,
        semester: student.semester,
        program: 'BS Software Engineering',
        department: 'Software Engineering',
        university: 'University of Technology'
      },
      enrolledCourses: enrollments.map((e, i) => ({
        sNo: i + 1,
        code: e.course?.code,
        name: e.course?.name,
        creditHours: e.course?.creditHours,
        examDate: 'As Per Schedule'
      })),
      examSchedule: examDates,
      academicYear: `${examYear}-${examYear + 1}`,
      issuedOn: new Date().toISOString(),
      instructions: [
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
