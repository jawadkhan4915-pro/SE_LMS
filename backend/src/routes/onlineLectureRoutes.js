const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/auth');
const {
  createLecture,
  getLectures,
  getLectureByMeetingId,
  joinLecture,
  updateLectureState,
  getLectureState
} = require('../controllers/onlineLectureController');

// All routes require authentication
router.use(protect);

router.route('/')
  .post(authorizeRoles('teacher', 'admin'), createLecture)
  .get(getLectures);

router.route('/:meetingId')
  .get(getLectureByMeetingId);

router.route('/:meetingId/join')
  .post(authorizeRoles('student'), joinLecture);

router.route('/:meetingId/state')
  .get(getLectureState)
  .put(updateLectureState);

module.exports = router;
