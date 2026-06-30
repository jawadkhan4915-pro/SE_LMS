const express = require('express');
const router = express.Router();
const {
  getThreadsByCourse,
  createThread,
  replyToThread,
  upvoteThread,
  togglePinThread,
  deleteThread
} = require('../controllers/discussionController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // Require auth for all discussion routes

router.get('/course/:courseId', getThreadsByCourse);
router.post('/', createThread);
router.post('/:id/reply', replyToThread);
router.put('/:id/upvote', upvoteThread);
router.put('/:id/pin', authorizeRoles('teacher', 'admin', 'hod'), togglePinThread);
router.delete('/:id', deleteThread);

module.exports = router;
