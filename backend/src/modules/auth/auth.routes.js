const express = require('express');

const authMiddleware = require('../../middlewares/auth.middleware');
const validateMiddleware = require('../../middlewares/validate.middleware');
const authController = require('./auth.controller');
const authValidator = require('./auth.validator');

const router = express.Router();

router.post('/register', validateMiddleware({ body: authValidator.registerBody }), authController.register);
router.post('/login', validateMiddleware({ body: authValidator.loginBody }), authController.login);
router.post('/refresh', validateMiddleware({ body: authValidator.refreshBody }), authController.refresh);
router.post('/logout', validateMiddleware({ body: authValidator.logoutBody }), authController.logout);
router.get('/me', authMiddleware, authController.me);

module.exports = router;
