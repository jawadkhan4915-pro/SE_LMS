const express = require('express');
const router = express.Router();
const {
  createExpense,
  paySalary,
  markFeePaid,
  getTransactions,
  getUnpaidVouchers,
  getFacultyList
} = require('../controllers/transactionController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect);
router.use(authorizeRoles('accountant', 'admin')); // Only Accountant and Admin can manage university money

router.post('/expense', createExpense);
router.post('/pay-salary', paySalary);
router.put('/fees/:voucherId/pay', markFeePaid);
router.get('/ledger', getTransactions);
router.get('/vouchers', getUnpaidVouchers);
router.get('/faculty', getFacultyList);

module.exports = router;
