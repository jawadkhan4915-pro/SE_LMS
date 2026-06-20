const Assignment = require('../models/assignment');
const Submission = require('../models/submission');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private/Teacher
exports.createAssignment = async (req, res) => {
  const { courseId, title, description, deadline, attachmentUrl } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Auth check: Is this teacher assigned to this course?
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to post assignments here' });
    }

    const assignment = await Assignment.create({
      course: courseId,
      title,
      description,
      deadline,
      attachmentUrl: attachmentUrl || ''
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get assignments for a course
// @route   GET /api/assignments/course/:courseId
// @access  Private
exports.getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId }).sort({ deadline: 1 });
    res.json({ success: true, count: assignments.length, data: assignments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single assignment details
// @route   GET /api/assignments/:id
// @access  Private
exports.getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate('course', 'name code');
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }
    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit an assignment (File upload)
// @route   POST /api/assignments/:id/submit
// @access  Private/Student
exports.submitAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    // Verify enrollment
    const enrolled = await Enrollment.findOne({ student: req.user.id, course: assignment.course });
    if (!enrolled) {
      return res.status(403).json({ success: false, message: 'You are not enrolled in this course' });
    }

    // Verify file exists
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF/DOCX file' });
    }

    // Check if already submitted
    let submission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user.id
    });

    if (submission) {
      // Overwrite/update existing submission (optional re-submit support)
      submission.fileUrl = `/uploads/${req.file.filename}`;
      submission.fileName = req.file.originalname;
      submission.submittedAt = Date.now();
      await submission.save();
      return res.json({ success: true, message: 'Submission updated successfully', data: submission });
    }

    submission = await Submission.create({
      assignment: req.params.id,
      student: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname
    });

    res.status(201).json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all submissions for an assignment
// @route   GET /api/assignments/:id/submissions
// @access  Private/Teacher/Admin
exports.getSubmissionsByAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found' });
    }

    const submissions = await Submission.find({ assignment: req.params.id })
      .populate('student', 'name email semester');

    res.json({ success: true, count: submissions.length, data: submissions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student's own submission for an assignment
// @route   GET /api/assignments/:id/my-submission
// @access  Private/Student
exports.getMySubmission = async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.id,
      student: req.user.id
    });

    if (!submission) {
      return res.status(404).json({ success: false, message: 'No submission found' });
    }

    res.json({ success: true, data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Grade & feedback submission
// @route   PUT /api/submissions/:submissionId/grade
// @access  Private/Teacher
exports.gradeSubmission = async (req, res) => {
  const { grade, feedback } = req.body;

  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('assignment');
      
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const course = await Course.findById(submission.assignment.course);
    // Auth check: Is this teacher assigned to this course?
    if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to grade this assignment' });
    }

    submission.grade = grade;
    submission.feedback = feedback || '';
    await submission.save();

    res.json({ success: true, message: 'Grading updated successfully', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
