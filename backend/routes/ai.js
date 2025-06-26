const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { authenticateJWT } = require('../middlewares/auth');
const { aiLimiter } = require('../middlewares/rateLimiter');

// All AI routes require authentication and have strict rate limiting
router.use(authenticateJWT);
router.use(aiLimiter);

router.post('/review', aiController.getAIReview);

module.exports = router; 