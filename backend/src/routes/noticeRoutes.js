const express = require('express');
const router = express.Router();
const { createNotice, getNotices, deleteNotice } = require('../controllers/noticeController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // Require auth

router.route('/')
  .get(getNotices)
  .post(authorizeRoles('admin', 'hod'), createNotice);

router.delete('/:id', authorizeRoles('admin'), deleteNotice);

module.exports = router;
