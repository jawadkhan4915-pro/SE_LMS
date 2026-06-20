const express = require('express');
const router = express.Router();
const {
  createQuiz,
  addQuestions,
  getQuizzesByCourse,
  toggleQuizStatus,
  getQuizQuestionsForStudent,
  attemptQuiz,
  getMyAttempt,
  getQuizAttempts
} = require('../controllers/quizController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // Require auth

router.route('/')
  .post(authorizeRoles('teacher', 'admin'), createQuiz);

router.post('/:id/questions', authorizeRoles('teacher', 'admin'), addQuestions);
router.put('/:id/toggle', authorizeRoles('teacher', 'admin'), toggleQuizStatus);
router.get('/course/:courseId', getQuizzesByCourse);

// Student attempt routes
router.get('/:id/questions', getQuizQuestionsForStudent);
router.post('/:id/attempt', authorizeRoles('student'), attemptQuiz);
router.get('/:id/my-attempt', authorizeRoles('student'), getMyAttempt);

// Score reports
router.get('/:id/attempts', authorizeRoles('teacher', 'admin'), getQuizAttempts);

module.exports = router;
