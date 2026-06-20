const Sessional = require('../models/sessional');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');

// @desc    Save/update sessional marks for a student in a course
// @route   POST /api/sessional
// @access  Private/Teacher/Admin
exports.saveSessional = async (req, res) => {
  const { studentId, courseId, assignment1, assignment2, quiz1, quiz2, presentation, remarks } = req.body;
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to enter marks for this course' });
    }

    const total = Math.min(
      (assignment1 || 0) + (assignment2 || 0) + (quiz1 || 0) + (quiz2 || 0) + (presentation || 0),
      20
    );

    const sessional = await Sessional.findOneAndUpdate(
      { student: studentId, course: courseId },
      {
        student: studentId,
        course: courseId,
        teacher: req.user.id,
        assignment1: assignment1 || 0,
        assignment2: assignment2 || 0,
        quiz1: quiz1 || 0,
        quiz2: quiz2 || 0,
        presentation: presentation || 0,
        totalSessional: total,
        remarks: remarks || ''
      },
      { upsert: true, new: true, runValidators: true }
    );

    await sessional.populate([
      { path: 'student', select: 'name email semester' },
      { path: 'course', select: 'name code' }
    ]);

    res.json({ success: true, data: sessional });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk save sessional marks for entire class
// @route   POST /api/sessional/bulk
// @access  Private/Teacher/Admin
exports.bulkSaveSessional = async (req, res) => {
  const { courseId, students } = req.body;
  // students: [{ studentId, assignment1, assignment2, quiz1, quiz2, presentation, remarks }]
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const ops = students.map(s => {
      const total = Math.min(
        (s.assignment1 || 0) + (s.assignment2 || 0) + (s.quiz1 || 0) + (s.quiz2 || 0) + (s.presentation || 0),
        20
      );
      return Sessional.findOneAndUpdate(
        { student: s.studentId, course: courseId },
        {
          student: s.studentId, course: courseId, teacher: req.user.id,
          assignment1: s.assignment1 || 0, assignment2: s.assignment2 || 0,
          quiz1: s.quiz1 || 0, quiz2: s.quiz2 || 0, presentation: s.presentation || 0,
          totalSessional: total, remarks: s.remarks || ''
        },
        { upsert: true, new: true }
      );
    });

    const saved = await Promise.all(ops);
    res.json({ success: true, count: saved.length, data: saved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my sessional marks (Student)
// @route   GET /api/sessional/my
// @access  Private/Student
exports.getMySessional = async (req, res) => {
  try {
    const records = await Sessional.find({ student: req.user.id })
      .populate('course', 'name code creditHours semester')
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all sessional marks for a course (Teacher/Admin)
// @route   GET /api/sessional/course/:courseId
// @access  Private/Teacher/Admin
exports.getCourseSessional = async (req, res) => {
  try {
    const records = await Sessional.find({ course: req.params.courseId })
      .populate('student', 'name email semester')
      .populate('course', 'name code')
      .sort({ 'student.name': 1 });
    res.json({ success: true, count: records.length, data: records });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
