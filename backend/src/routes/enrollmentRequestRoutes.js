const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/auth');
const {
  submitRequest,
  getAllRequests,
  getMyRequests,
  approveRequest,
  rejectRequest
} = require('../controllers/enrollmentRequestController');

// Student routes
router.post('/', protect, authorizeRoles('student'), submitRequest);
router.get('/my', protect, authorizeRoles('student'), getMyRequests);

// HOD/Admin routes
router.get('/', protect, authorizeRoles('hod', 'admin'), getAllRequests);
router.put('/:id/approve', protect, authorizeRoles('hod', 'admin'), approveRequest);
router.put('/:id/reject', protect, authorizeRoles('hod', 'admin'), rejectRequest);

module.exports = router;
