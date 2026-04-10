const express = require('express');

const mlController = require('./ml.controller');

const router = express.Router();

router.post('/chat', mlController.chat);
router.post('/recommendations', mlController.recommendations);

module.exports = router;
