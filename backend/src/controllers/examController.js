const User = require('../models/user');
const Course = require('../models/course');
const ExamSchedule = require('../models/examSchedule');
const FeeVoucher = require('../models/feeVoucher');
const Settings = require('../models/settings');

// Helper to check if a student's slip is locked (internal check for status listing)
const checkIsSlipLocked = async (student) => {
  if (student.examSlipOverride) return false;

  const semester = student.semester || 1;
  let midtermSetting = await Settings.findOne({ key: 'midterm_exam_date' });
  let midtermDate = midtermSetting ? new Date(midtermSetting.value) : new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  
  const now = new Date();
  const midtermTime = new Date(midtermDate).getTime();
  const oneWeekBeforeMidtermTime = midtermTime - 7 * 24 * 60 * 60 * 1000;
  
  if (now.getTime() >= oneWeekBeforeMidtermTime) {
    const vouchers = await FeeVoucher.find({ student: student._id, semester, status: { $ne: 'Cancelled' } });
    if (vouchers.length === 0) return true;
    
    const hasPaidFull = vouchers.some(v => v.type === 'full' && v.status === 'Paid');
    const hasPaidInstallment = vouchers.some(v => v.type === 'installment' && v.status === 'Paid');
    
    if (!hasPaidFull && !hasPaidInstallment) {
      return true;
    }
  }
  return false;
};

// @desc    Get all exam schedules
// @route   GET /api/exams/schedules
// @access  Private
exports.getExamSchedules = async (req, res) => {
  try {
    let query = {};
    
    // If student/teacher/hod/coordinator has a department, filter schedules by department
    // University-wide coordinator or admin can see all
    if (req.user.department) {
      query.department = req.user.department;
    }

    const schedules = await ExamSchedule.find(query)
      .populate('course', 'name code creditHours')
      .sort({ date: 1, time: 1 });

    res.json({ success: true, count: schedules.length, data: schedules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create exam schedule entry
// @route   POST /api/exams/schedules
// @access  Private/Coordinator/Admin
exports.createExamSchedule = async (req, res) => {
  const { courseId, type, date, time, room, department } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });

    // Restrict department coordinator
    const targetDept = department || course.department;
    if (req.user.role === 'coordinator' && req.user.department) {
      if (targetDept !== req.user.department) {
        return res.status(403).json({ success: false, message: 'You can only schedule exams for your own department' });
      }
    }

    const schedule = await ExamSchedule.create({
      course: courseId,
      type,
      date,
      time,
      room,
      department: targetDept
    });

    await schedule.populate('course', 'name code');

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update exam schedule entry
// @route   PUT /api/exams/schedules/:id
// @access  Private/Coordinator/Admin
exports.updateExamSchedule = async (req, res) => {
  try {
    let schedule = await ExamSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Exam schedule not found' });

    // Restrict department coordinator
    if (req.user.role === 'coordinator' && req.user.department && schedule.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit exam schedules outside your department' });
    }

    schedule = await ExamSchedule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('course', 'name code');

    res.json({ success: true, data: schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete exam schedule entry
// @route   DELETE /api/exams/schedules/:id
// @access  Private/Coordinator/Admin
exports.deleteExamSchedule = async (req, res) => {
  try {
    const schedule = await ExamSchedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ success: false, message: 'Exam schedule not found' });

    // Restrict department coordinator
    if (req.user.role === 'coordinator' && req.user.department && schedule.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete exam schedules outside your department' });
    }

    await ExamSchedule.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Exam schedule deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all students in coordinator's department with roll number slip download lock status
// @route   GET /api/exams/students
// @access  Private/Coordinator/Admin
exports.getStudentsWithLockStatus = async (req, res) => {
  try {
    let query = { role: 'student' };
    
    // Restrict department coordinator
    if (req.user.role === 'coordinator' && req.user.department) {
      query.department = req.user.department;
    } else if (req.query.department) {
      query.department = req.query.department;
    }

    const students = await User.find(query).select('name email department semester phone examSlipOverride').sort({ name: 1 });
    
    const formattedStudents = [];
    for (const student of students) {
      // Find vouchers for this student
      const vouchers = await FeeVoucher.find({ student: student._id, semester: student.semester || 1, status: { $ne: 'Cancelled' } });
      const totalVouchers = vouchers.length;
      const paidVouchers = vouchers.filter(v => v.status === 'Paid').length;
      const isInstallment = vouchers.some(v => v.type === 'installment');
      
      const locked = await checkIsSlipLocked(student);

      let feeSummary = 'No Voucher';
      if (totalVouchers > 0) {
        if (isInstallment) {
          feeSummary = `Installment (${paidVouchers}/3 Paid)`;
        } else {
          feeSummary = vouchers[0].status === 'Paid' ? 'Paid (Full)' : 'Unpaid (Full)';
        }
      }

      formattedStudents.push({
        _id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        semester: student.semester,
        phone: student.phone,
        examSlipOverride: student.examSlipOverride,
        feeSummary,
        isLocked: locked
      });
    }

    res.json({ success: true, count: formattedStudents.length, data: formattedStudents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle Roll Number Slip Lock Override for a student
// @route   POST /api/exams/override-slip
// @access  Private/Coordinator/Admin
exports.overrideStudentSlip = async (req, res) => {
  const { studentId, override } = req.body;
  try {
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Restrict department coordinator
    if (req.user.role === 'coordinator' && req.user.department && student.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized to override slips outside your department' });
    }

    student.examSlipOverride = override !== undefined ? override : !student.examSlipOverride;
    await student.save();

    res.json({ 
      success: true, 
      message: `Roll number slip download status has been manually ${student.examSlipOverride ? 'unlocked (overridden)' : 'reset to normal status'} for student ${student.name}.`,
      data: student 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
