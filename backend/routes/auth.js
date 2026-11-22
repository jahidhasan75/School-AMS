'use strict';

const express = require('express');
const router = express.Router();
const { login, logout, getMe, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { loginValidator, forgotPasswordValidator, resetPasswordValidator } = require('../validators/authValidator');

router.post('/login', loginValidator, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.post('/forgot-password', forgotPasswordValidator, forgotPassword);
router.post('/reset-password', resetPasswordValidator, resetPassword);

module.exports = router;
