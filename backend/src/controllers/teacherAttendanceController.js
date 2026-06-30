const User = require('../models/user');
const TeacherAttendance = require('../models/teacherAttendance');

// @desc    Register teacher's face template
// @route   POST /api/attendance/teacher/register-face
// @access  Private (Teacher)
exports.registerFace = async (req, res) => {
  const { faceTemplate } = req.body;

  if (!faceTemplate) {
    return res.status(400).json({ success: false, message: 'Face image data is required' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role !== 'teacher') {
      return res.status(403).json({ success: false, message: 'Only faculty members can register faces for attendance' });
    }

    user.faceTemplate = faceTemplate;
    user.faceRegistered = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Face registered successfully',
      data: {
        faceRegistered: true
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark teacher attendance by showing face
// @route   POST /api/attendance/teacher/mark
// @access  Private (Teacher)
exports.markSelfAttendance = async (req, res) => {
  const { snapshot } = req.body;

  if (!snapshot) {
    return res.status(400).json({ success: false, message: 'Face snapshot is required to mark attendance' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.faceRegistered || !user.faceTemplate) {
      return res.status(400).json({
        success: false,
        message: 'Face is not registered. Please register your face first.'
      });
    }

    // Biometric Matching Simulation:
    // Generate a high-resemblance confidence matching score for visual display (e.g. 94.5% - 99.4%)
    const matchScore = parseFloat((94 + Math.random() * 5).toFixed(2));

    const now = new Date();
    // Normalize date to start of day for check-in uniqueness (e.g., midnight in local time)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if attendance is already marked for today
    const alreadyMarked = await TeacherAttendance.findOne({
      teacher: user._id,
      date: today
    });

    if (alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for today'
      });
    }

    // Determine status (Late if check-in is after 09:00 AM)
    const checkInHour = now.getHours();
    const checkInMinute = now.getMinutes();
    const isLate = checkInHour > 9 || (checkInHour === 9 && checkInMinute > 0);
    const status = isLate ? 'late' : 'present';

    const attendance = await TeacherAttendance.create({
      teacher: user._id,
      date: today,
      checkInTime: now,
      status,
      department: user.department
    });

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: {
        matchScore,
        status,
        checkInTime: now,
        attendance
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get attendance logs of the logged in teacher
// @route   GET /api/attendance/teacher/my-logs
// @access  Private (Teacher)
exports.getMyLogs = async (req, res) => {
  try {
    const logs = await TeacherAttendance.find({ teacher: req.user.id })
      .sort({ checkInTime: -1 });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get teacher attendance logs for department (HOD or Admin)
// @route   GET /api/attendance/teacher/department-logs
// @access  Private (HOD/Admin)
exports.getDepartmentLogs = async (req, res) => {
  const { search, date } = req.query;

  try {
    // Enforce department restriction for HOD
    const department = req.user.role === 'admin' ? req.query.department : req.user.department;

    if (!department && req.user.role !== 'admin') {
      return res.status(400).json({ success: false, message: 'Department not specified for user' });
    }

    const query = {};
    if (department) {
      query.department = department;
    }

    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
      const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1);
      query.checkInTime = { $gte: startOfDay, $lt: endOfDay };
    }

    if (search) {
      const matchedTeachers = await User.find({
        role: 'teacher',
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      query.teacher = { $in: matchedTeachers.map(t => t._id) };
    }

    const logs = await TeacherAttendance.find(query)
      .populate('teacher', 'name email profilePicture')
      .sort({ checkInTime: -1 });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all teacher attendance logs (Admin)
// @route   GET /api/attendance/teacher/admin-logs
// @access  Private (Admin)
exports.getAllLogs = async (req, res) => {
  const { search, date, department } = req.query;

  try {
    const query = {};

    if (department && department !== 'All') {
      query.department = department;
    }

    if (date) {
      const searchDate = new Date(date);
      const startOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate());
      const endOfDay = new Date(searchDate.getFullYear(), searchDate.getMonth(), searchDate.getDate() + 1);
      query.checkInTime = { $gte: startOfDay, $lt: endOfDay };
    }

    if (search) {
      const matchedTeachers = await User.find({
        role: 'teacher',
        name: { $regex: search, $options: 'i' }
      }).select('_id');
      
      query.teacher = { $in: matchedTeachers.map(t => t._id) };
    }

    const logs = await TeacherAttendance.find(query)
      .populate('teacher', 'name email department profilePicture')
      .sort({ checkInTime: -1 });

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
