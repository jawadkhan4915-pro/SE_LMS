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

// Teacher/Admin/Coordinator
router.post('/', protect, authorizeRoles('teacher', 'admin', 'coordinator'), saveSessional);
router.post('/bulk', protect, authorizeRoles('teacher', 'admin', 'coordinator'), bulkSaveSessional);
router.get('/course/:courseId', protect, authorizeRoles('teacher', 'admin', 'hod', 'coordinator'), getCourseSessional);

module.exports = router;
