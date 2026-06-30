const express = require('express');
const router = express.Router();
const {
  registerFace,
  markSelfAttendance,
  getMyLogs,
  getDepartmentLogs,
  getAllLogs
} = require('../controllers/teacherAttendanceController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // All routes require authentication

// Teacher specific routes
router.post('/register-face', authorizeRoles('teacher'), registerFace);
router.post('/mark', authorizeRoles('teacher'), markSelfAttendance);
router.get('/my-logs', authorizeRoles('teacher'), getMyLogs);

// Management/Admin routes
router.get('/department-logs', authorizeRoles('hod', 'admin'), getDepartmentLogs);
router.get('/admin-logs', authorizeRoles('admin'), getAllLogs);

module.exports = router;
