const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/auth');
const {
  saveSessional,
  bulkSaveSessional,
  getMySessional,
  getCourseSessional
} = require('../controllers/sessionalController');

// Student
router.get('/my', protect, authorizeRoles('student'), getMySessional);

// Teacher/Admin
router.post('/', protect, authorizeRoles('teacher', 'admin'), saveSessional);
router.post('/bulk', protect, authorizeRoles('teacher', 'admin'), bulkSaveSessional);
router.get('/course/:courseId', protect, authorizeRoles('teacher', 'admin', 'hod'), getCourseSessional);

module.exports = router;
