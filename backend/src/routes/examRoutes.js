const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/auth');
const {
  getExamSchedules,
  createExamSchedule,
  updateExamSchedule,
  deleteExamSchedule,
  getStudentsWithLockStatus,
  overrideStudentSlip
} = require('../controllers/examController');

// All authenticated users can view exam schedules
router.get('/schedules', protect, getExamSchedules);

// Only coordinators and admins can manage schedules
router.post('/schedules', protect, authorizeRoles('coordinator', 'admin'), createExamSchedule);
router.put('/schedules/:id', protect, authorizeRoles('coordinator', 'admin'), updateExamSchedule);
router.delete('/schedules/:id', protect, authorizeRoles('coordinator', 'admin'), deleteExamSchedule);

// Only coordinators and admins can view students with slip locks & override slips
router.get('/students', protect, authorizeRoles('coordinator', 'admin'), getStudentsWithLockStatus);
router.post('/override-slip', protect, authorizeRoles('coordinator', 'admin'), overrideStudentSlip);

module.exports = router;
