const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const User = require('../models/user');

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private/Admin
exports.createCourse = async (req, res) => {
  const { name, code, description, creditHours, semester, teacher, category, department } = req.body;

  try {
    const teacherUser = await User.findById(teacher);
    if (!teacherUser || teacherUser.role !== 'teacher') {
      return res.status(400).json({ success: false, message: 'Invalid teacher ID assigned' });
    }

    const courseExists = await Course.findOne({ code: code.toUpperCase() });
    if (courseExists) {
      return res.status(400).json({ success: false, message: 'Course with this code already exists' });
    }

    // Restrict department admins
    let targetDepartment = department || 'SE';
    if (req.user.role === 'admin' && req.user.department) {
      if (department && department !== req.user.department) {
        return res.status(403).json({ success: false, message: 'You can only create courses in your own department' });
      }
      targetDepartment = req.user.department;
    }

    const course = await Course.create({
      name,
      code: code.toUpperCase(),
      description,
      creditHours,
      semester,
      teacher,
      category,
      department: targetDepartment
    });

    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all courses (filters by role)
// @route   GET /api/courses
// @access  Private
exports.getCourses = async (req, res) => {
  try {
    let query = {};

    // Filter course query based on roles
    if (req.user.role === 'teacher') {
      query = { teacher: req.user.id };
    } else if (req.user.role === 'student') {
      // Find courses this student is enrolled in
      const enrollments = await Enrollment.find({ student: req.user.id }).select('course');
      const courseIds = enrollments.map(e => e.course);
      query = { _id: { $in: courseIds } };
    }

    const courses = await Course.find(query).populate('teacher', 'name email');
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all courses for Admin (unfiltered list)
// @route   GET /api/courses/all
// @access  Private/Admin/HOD
exports.getAllCourses = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'hod') {
      query = { department: req.user.department };
    } else if (req.user.role === 'admin' && req.user.department) {
      query = { department: req.user.department };
    } else if (req.query.department) {
      query = { department: req.query.department };
    }

    const courses = await Course.find(query).populate('teacher', 'name email');
    res.json({ success: true, count: courses.length, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single course by ID
// @route   GET /api/courses/:id
// @access  Private
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('teacher', 'name email');
    
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update course details
// @route   PUT /api/courses/:id
// @access  Private/Admin/Teacher
exports.updateCourse = async (req, res) => {
  try {
    let course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Safeguard to prevent unauthorized teachers editing other courses
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit this course' });
    }

    // Safeguard to prevent unauthorized department admins editing other departments' courses
    if (req.user.role === 'admin' && req.user.department && course.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized to edit courses outside your department' });
    }

    // Verify assigned teacher exists
    if (req.body.teacher) {
      const teacherUser = await User.findById(req.body.teacher);
      if (!teacherUser || teacherUser.role !== 'teacher') {
        return res.status(400).json({ success: false, message: 'Invalid teacher ID assigned' });
      }
    }

    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a course
// @route   DELETE /api/courses/:id
// @access  Private/Admin
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Safeguard to prevent unauthorized department admins deleting other departments' courses
    if (req.user.role === 'admin' && req.user.department && course.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete courses outside your department' });
    }

    // Remove course
    await Course.findByIdAndDelete(req.params.id);

    // Cascade delete enrollments associated with course
    await Enrollment.deleteMany({ course: req.params.id });

    res.json({ success: true, message: 'Course and related enrollments deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll in a course
// @route   POST /api/courses/:id/enroll
// @access  Private/Student
exports.enrollInCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Check if already enrolled
    const alreadyEnrolled = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.id
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.id
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Enroll a student (Admin only)
// @route   POST /api/courses/:id/enroll-student
// @access  Private/Admin
exports.adminEnrollStudent = async (req, res) => {
  const { studentId } = req.body;
  try {
    const studentUser = await User.findById(studentId);
    if (!studentUser || studentUser.role !== 'student') {
      return res.status(400).json({ success: false, message: 'Invalid Student ID provided' });
    }

    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const alreadyEnrolled = await Enrollment.findOne({
      student: studentId,
      course: req.params.id
    });

    if (alreadyEnrolled) {
      return res.status(400).json({ success: false, message: 'Student already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: req.params.id
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get enrolled students in a course
// @route   GET /api/courses/:id/students
// @access  Private/Admin/Teacher/HOD
exports.getEnrolledStudents = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollments = await Enrollment.find({ course: req.params.id })
      .populate('student', 'name email semester phone');

    const students = enrollments.map(e => ({
      enrollmentId: e._id,
      student: e.student,
      status: e.status,
      grade: e.grade,
      gpa: e.gpa
    }));

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
