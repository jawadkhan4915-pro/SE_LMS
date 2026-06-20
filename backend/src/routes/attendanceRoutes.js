const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getCourseAttendance,
  getAttendancePercentage
} = require('../controllers/attendanceController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // Require auth

router.post('/', authorizeRoles('teacher', 'admin'), markAttendance);
router.get('/course/:courseId', getCourseAttendance);
router.get('/course/:courseId/percentage', getAttendancePercentage);

module.exports = router;
