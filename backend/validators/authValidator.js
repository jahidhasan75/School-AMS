'use strict';

const { body } = require('express-validator');

const loginValidator = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const forgotPasswordValidator = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail()
];

const resetPasswordValidator = [
  body('token')
    .notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[A-Z])(?=.*[0-9])/).withMessage('Password must contain at least one uppercase letter and one number')
];

module.exports = { loginValidator, forgotPasswordValidator, resetPasswordValidator };
