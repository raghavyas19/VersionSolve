const express = require('express');
const router = express.Router();
const vguyController = require('../controllers/vguyController');

router.post('/', vguyController.chatWithVGuy);

module.exports = router; 