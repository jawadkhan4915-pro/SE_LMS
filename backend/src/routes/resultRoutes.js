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

// Teacher/Admin
router.post('/', protect, authorizeRoles('teacher', 'admin'), uploadResult);
router.post('/bulk', protect, authorizeRoles('teacher', 'admin'), bulkUploadResults);
router.get('/course/:courseId', protect, authorizeRoles('teacher', 'admin', 'hod'), getCourseResults);
router.get('/student/:studentId', protect, authorizeRoles('teacher', 'admin', 'hod'), getStudentResults);

module.exports = router;
