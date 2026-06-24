const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middlewares/auth');
const { 
  getFeeSlip, 
  getRollNumberSlip,
  payVoucher,
  applyInstallments,
  getMidtermSettings,
  updateMidtermSettings
} = require('../controllers/slipController');

router.get('/fee', protect, authorizeRoles('student'), getFeeSlip);
router.get('/rollnumber', protect, authorizeRoles('student'), getRollNumberSlip);
router.post('/fee/pay', protect, payVoucher);
router.post('/fee/installment', protect, authorizeRoles('student'), applyInstallments);
router.get('/midterm', protect, getMidtermSettings);
router.post('/midterm', protect, updateMidtermSettings);

module.exports = router;
