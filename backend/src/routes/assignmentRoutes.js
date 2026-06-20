const express = require('express');
const router = express.Router();
const {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  submitAssignment,
  getSubmissionsByAssignment,
  getMySubmission,
  gradeSubmission
} = require('../controllers/assignmentController');
const { protect, authorizeRoles } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router.use(protect); // Require auth

router.route('/')
  .post(authorizeRoles('teacher', 'admin'), createAssignment);

router.get('/course/:courseId', getAssignmentsByCourse);
router.get('/:id', getAssignmentById);

// Submit route with file uploader
router.post('/:id/submit', authorizeRoles('student'), upload.single('file'), submitAssignment);
router.get('/:id/my-submission', authorizeRoles('student'), getMySubmission);

// Grading routes
router.get('/:id/submissions', authorizeRoles('teacher', 'admin'), getSubmissionsByAssignment);
router.put('/submission/:submissionId/grade', authorizeRoles('teacher', 'admin'), gradeSubmission);

module.exports = router;
