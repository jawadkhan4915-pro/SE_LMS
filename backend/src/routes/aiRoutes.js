const express = require('express');
const router = express.Router();
const { chatWithAI, gradeSubmission } = require('../controllers/aiController');
const { protect, authorizeRoles } = require('../middlewares/auth');

router.use(protect); // Require JWT authentication for all chat routes

router.post('/chat', chatWithAI);
router.post('/grade-submission', authorizeRoles('teacher', 'admin'), gradeSubmission);

module.exports = router;
