const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');

router.use(protect); // Require JWT authentication for all chat routes

router.post('/chat', chatWithAI);

module.exports = router;
