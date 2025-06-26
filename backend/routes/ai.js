const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { aiLimiter } = require('../middlewares/rateLimiter');

// Remove authentication, only apply rate limiting
router.use(aiLimiter);

router.post('/review', aiController.getAIReview);

module.exports = router; 