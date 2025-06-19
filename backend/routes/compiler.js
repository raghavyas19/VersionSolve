const express = require('express');
const router = express.Router();
const compilerController = require('../controllers/compilerController');

router.post('/submit', compilerController.submitCode);

module.exports = router;    