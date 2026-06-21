const express = require('express');
const router = express.Router();
const {
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getTimetable,
  getFreeClassrooms
} = require('../controllers/timetableController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // All routes require auth

router.route('/')
  .get(getTimetable)
  .post(authorizeRoles('admin'), createTimetableEntry);

router.get('/free-classrooms', authorizeRoles('admin'), getFreeClassrooms);

router.route('/:id')
  .put(authorizeRoles('admin'), updateTimetableEntry)
  .delete(authorizeRoles('admin'), deleteTimetableEntry);

module.exports = router;
