const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getTeacherStats,
  getStudentStats,
  getHODStats
} = require('../controllers/analyticsController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // Require auth

router.get('/admin', authorizeRoles('admin'), getAdminStats);
router.get('/teacher', authorizeRoles('teacher'), getTeacherStats);
router.get('/student', authorizeRoles('student'), getStudentStats);
router.get('/hod', authorizeRoles('hod'), getHODStats);

module.exports = router;
