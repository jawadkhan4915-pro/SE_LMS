const Result = require('../models/result');
const Enrollment = require('../models/enrollment');
const Course = require('../models/course');
const User = require('../models/user');

// Helper to calculate grade from total marks (out of 100)
const calcGrade = (total) => {
  if (total >= 90) return { grade: 'A+', gp: 4.0 };
  if (total >= 85) return { grade: 'A',  gp: 4.0 };
  if (total >= 80) return { grade: 'A-', gp: 3.7 };
  if (total >= 75) return { grade: 'B+', gp: 3.3 };
  if (total >= 70) return { grade: 'B',  gp: 3.0 };
  if (total >= 65) return { grade: 'B-', gp: 2.7 };
  if (total >= 60) return { grade: 'C+', gp: 2.3 };
  if (total >= 55) return { grade: 'C',  gp: 2.0 };
  if (total >= 50) return { grade: 'C-', gp: 1.7 };
  if (total >= 45) return { grade: 'D',  gp: 1.3 };
  return { grade: 'F', gp: 0.0 };
};

// @desc    Upload / create result for a student in a course
// @route   POST /api/results
// @access  Private/Teacher/Admin
exports.uploadResult = async (req, res) => {
  const { studentId, courseId, semester, midterm, finalterm, sessional, academicYear } = req.body;
  try {
    // Validate teacher owns this course
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload results for this course' });
    }

    // Validate coordinator belongs to the same department
    if (req.user.role === 'coordinator' && req.user.department && course.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload results outside your department' });
    }

    const total = (midterm || 0) + (finalterm || 0) + (sessional || 0);
    const { grade, gp } = calcGrade(total);

    let result = await Result.findOne({ student: studentId, course: courseId });
    if (result) {
      result.midterm = midterm || 0;
      result.finalterm = finalterm || 0;
      result.sessional = sessional || 0;
      result.totalMarks = total;
      result.grade = grade;
      result.gradePoints = gp;
      result.semester = semester;
      result.academicYear = academicYear || result.academicYear;
      result.isPublished = true;
      result.uploadedBy = req.user.id;
      await result.save();
    } else {
      result = await Result.create({
        student: studentId,
        course: courseId,
        semester,
        academicYear,
        midterm: midterm || 0,
        finalterm: finalterm || 0,
        sessional: sessional || 0,
        totalMarks: total,
        grade,
        gradePoints: gp,
        isPublished: true,
        uploadedBy: req.user.id
      });
    }

    await result.populate([
      { path: 'student', select: 'name email semester' },
      { path: 'course', select: 'name code creditHours' }
    ]);

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk upload results for all students in a course
// @route   POST /api/results/bulk
// @access  Private/Teacher/Admin
exports.bulkUploadResults = async (req, res) => {
  const { courseId, semester, academicYear, results } = req.body;
  // results: [{ studentId, midterm, finalterm, sessional }]
  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found' });
    if (req.user.role === 'teacher' && course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Validate coordinator belongs to the same department
    if (req.user.role === 'coordinator' && req.user.department && course.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized to upload results outside your department' });
    }

    const ops = results.map(async (r) => {
      const total = (r.midterm || 0) + (r.finalterm || 0) + (r.sessional || 0);
      const { grade, gp } = calcGrade(total);
      return Result.findOneAndUpdate(
        { student: r.studentId, course: courseId },
        {
          student: r.studentId, course: courseId, semester,
          academicYear: academicYear || `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
          midterm: r.midterm || 0, finalterm: r.finalterm || 0, sessional: r.sessional || 0,
          totalMarks: total, grade, gradePoints: gp,
          isPublished: true, uploadedBy: req.user.id
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

// @desc    Get results for a student (all semesters/courses)
// @route   GET /api/results/my
// @access  Private/Student
exports.getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id, isPublished: true })
      .populate('course', 'name code creditHours semester category')
      .sort({ semester: 1, createdAt: -1 });

    // Group by semester
    const grouped = {};
    results.forEach(r => {
      const sem = r.semester || 'N/A';
      if (!grouped[sem]) grouped[sem] = [];
      grouped[sem].push(r);
    });

    res.json({ success: true, data: results, grouped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get results by student ID (HOD/Admin/Teacher)
// @route   GET /api/results/student/:studentId
// @access  Private/HOD/Admin/Teacher
exports.getStudentResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.params.studentId, isPublished: true })
      .populate('course', 'name code creditHours semester category')
      .sort({ semester: 1 });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all results for a course (Teacher/Admin)
// @route   GET /api/results/course/:courseId
// @access  Private/Teacher/Admin
exports.getCourseResults = async (req, res) => {
  try {
    const results = await Result.find({ course: req.params.courseId })
      .populate('student', 'name email semester')
      .populate('course', 'name code')
      .sort({ 'student.name': 1 });
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
