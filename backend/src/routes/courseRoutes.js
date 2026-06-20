const express = require('express');
const router = express.Router();
const {
  createCourse,
  getCourses,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  adminEnrollStudent,
  getEnrolledStudents
} = require('../controllers/courseController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // All course routes require auth

router.route('/')
  .get(getCourses)
  .post(authorizeRoles('admin'), createCourse);

router.get('/all', authorizeRoles('admin', 'hod', 'student', 'teacher'), getAllCourses);

router.route('/:id')
  .get(getCourseById)
  .put(authorizeRoles('admin', 'teacher'), updateCourse)
  .delete(authorizeRoles('admin'), deleteCourse);

router.post('/:id/enroll', authorizeRoles('student'), enrollInCourse);
router.post('/:id/enroll-student', authorizeRoles('admin'), adminEnrollStudent);
router.get('/:id/students', authorizeRoles('admin', 'teacher', 'hod'), getEnrolledStudents);

module.exports = router;
