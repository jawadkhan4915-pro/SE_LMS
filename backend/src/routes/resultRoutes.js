const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/auth');
const {
  uploadResult,
  bulkUploadResults,
  getMyResults,
  getStudentResults,
  getCourseResults
} = require('../controllers/resultController');

// Student
router.get('/my', protect, authorizeRoles('student'), getMyResults);

// Teacher/Admin/Coordinator
router.post('/', protect, authorizeRoles('teacher', 'admin', 'coordinator'), uploadResult);
router.post('/bulk', protect, authorizeRoles('teacher', 'admin', 'coordinator'), bulkUploadResults);
router.get('/course/:courseId', protect, authorizeRoles('teacher', 'admin', 'hod', 'coordinator'), getCourseResults);
router.get('/student/:studentId', protect, authorizeRoles('teacher', 'admin', 'hod', 'coordinator'), getStudentResults);

module.exports = router;
