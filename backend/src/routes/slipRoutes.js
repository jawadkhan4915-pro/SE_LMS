const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/auth');
const { getFeeSlip, getRollNumberSlip } = require('../controllers/slipController');

router.get('/fee', protect, authorizeRoles('student'), getFeeSlip);
router.get('/rollnumber', protect, authorizeRoles('student'), getRollNumberSlip);

module.exports = router;
