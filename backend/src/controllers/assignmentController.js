const Assignment = require('../models/assignment');
const Submission = require('../models/submission');
const Course = require('../models/course');
const Enrollment = require('../models/enrollment');
const { calculateCosineSimilarity } = require('../utils/plagiarism');
const { extractTextFromFile } = require('../utils/fileExtractor');
const { awardXP } = require('../utils/gamification');

// Helper to calculate plagiarism matching across course submissions
const runPlagiarismCheck = async (submissionId) => {
  try {
    const currentSubmission = await Submission.findById(submissionId).populate('student', 'name');
    if (!currentSubmission) return;

    const otherSubmissions = await Submission.find({
      assignment: currentSubmission.assignment,
      _id: { $ne: currentSubmission._id }
    }).populate('student', 'name');

    if (otherSubmissions.length === 0) {
      currentSubmission.plagiarismScore = 0;
      currentSubmission.similarityDetails = [];
      await currentSubmission.save();
      return;
    }

    // Extract current text
    let currentText = '';
    try {
      currentText = await extractTextFromFile(currentSubmission.fileUrl);
    } catch (e) {
      console.error('Plagiarism check: failed to extract text from current submission', e);
      return;
    }

    let highestScore = 0;
    const similarityDetails = [];

    for (const other of otherSubmissions) {
      try {
        const otherText = await extractTextFromFile(other.fileUrl);
        const score = calculateCosineSimilarity(currentText, otherText);

        if (score > 10) { // Only log if similarity is significant
          similarityDetails.push({
            studentId: other.student?._id,
            studentName: other.student?.name || 'Unknown Student',
            fileName: other.fileName,
            score
          });
        }

        if (score > highestScore) {
          highestScore = score;
        }

        // Sync other student's submission if new score is higher
        if (score > other.plagiarismScore) {
          other.plagiarismScore = score;
          const filteredDetails = (other.similarityDetails || []).filter(
            d => d.studentId && d.studentId.toString() !== currentSubmission.student._id.toString()
          );
          filteredDetails.push({
            studentId: currentSubmission.student._id,
            studentName: currentSubmission.student.name,
            fileName: currentSubmission.fileName,
            score
          });
          other.similarityDetails = filteredDetails;
          await other.save();
        }
      } catch (err) {
        console.error(`Plagiarism check error for submission ${other._id}:`, err);
      }
    }

    similarityDetails.sort((a, b) => b.score - a.score);

    currentSubmission.plagiarismScore = highestScore;
    currentSubmission.similarityDetails = similarityDetails;
    await currentSubmission.save();
  } catch (error) {
    console.error('Error running plagiarism checker:', error);
  }
};

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

      // Trigger similarity checks
      await runPlagiarismCheck(submission._id);

      // Notify teacher via Socket.io
      if (req.io) {
        const courseDetails = await Course.findById(assignment.course);
        if (courseDetails && courseDetails.teacher) {
          req.io.to(courseDetails.teacher.toString()).emit('notification', {
            message: `${req.user.name} updated assignment submission for: "${assignment.title}"`,
            type: 'info'
          });
        }
      }

      const updatedSub = await Submission.findById(submission._id);
      return res.json({ success: true, message: 'Submission updated successfully', data: updatedSub });
    }

    submission = await Submission.create({
      assignment: req.params.id,
      student: req.user.id,
      fileUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.originalname
    });

    // Trigger similarity checks
    await runPlagiarismCheck(submission._id);

    // Notify teacher via Socket.io
    if (req.io) {
      const courseDetails = await Course.findById(assignment.course);
      if (courseDetails && courseDetails.teacher) {
        req.io.to(courseDetails.teacher.toString()).emit('notification', {
          message: `${req.user.name} submitted assignment: "${assignment.title}"`,
          type: 'info'
        });
      }
    }

    // Award 50 XP to student for submitting assignment and check for submission badge
    await awardXP(req.user.id, 50, 'first_submission', req.io);

    const createdSub = await Submission.findById(submission._id);
    res.status(201).json({ success: true, data: createdSub });
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

    // Trigger real-time grade notification to student
    if (req.io) {
      req.io.to(submission.student.toString()).emit('submission-graded', {
        title: submission.assignment.title,
        grade: grade
      });
    }

    res.json({ success: true, message: 'Grading updated successfully', data: submission });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
