'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { User, Teacher, Admin, AuditLog } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const SALT_ROUNDS = 12;

// POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 422, errors.array());
    }

    const { email, password } = req.body;

    // Get user with password
    const user = await User.scope('withPassword').findOne({ where: { email } });
    if (!user) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    if (!user.is_active) {
      return errorResponse(res, 'Account is deactivated. Contact administrator.', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password.', 401);
    }

    // Update last login
    await user.update({ last_login: new Date() });

    // Get profile info
    let profile = null;
    if (user.role === 'teacher') {
      profile = await Teacher.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'admin') {
      profile = await Admin.findOne({ where: { user_id: user.id } });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // Audit log
    await AuditLog.create({
      user_id: user.id,
      action: 'LOGIN',
      ip_address: req.ip
    });

    return successResponse(res, 'Login successful.', {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        is_active: user.is_active,
        last_login: user.last_login,
        profile
      }
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/logout
const logout = async (req, res, next) => {
  try {
    await AuditLog.create({
      user_id: req.userId,
      action: 'LOGOUT',
      ip_address: req.ip
    });
    return successResponse(res, 'Logged out successfully.');
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let profile = null;

    if (user.role === 'teacher') {
      profile = await Teacher.findOne({ where: { user_id: user.id } });
    } else if (user.role === 'admin') {
      profile = await Admin.findOne({ where: { user_id: user.id } });
    }

    return successResponse(res, 'User info retrieved.', {
      id: user.id,
      email: user.email,
      role: user.role,
      is_active: user.is_active,
      last_login: user.last_login,
      profile
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 422, errors.array());
    }

    const { email } = req.body;
    const user = await User.scope('withPassword').findOne({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      return successResponse(res, 'If that email exists, a reset link has been sent.');
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await user.update({
      password_reset_token: token,
      password_reset_expires: expires
    });

    // In production, send email here. For now, include token in response (dev only)
    const responseData = process.env.NODE_ENV === 'development'
      ? { reset_token: token, expires_at: expires }
      : {};

    return successResponse(res, 'If that email exists, a reset link has been sent.', responseData);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/reset-password
const resetPassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 422, errors.array());
    }

    const { token, password } = req.body;

    const user = await User.scope('withPassword').findOne({
      where: { password_reset_token: token }
    });

    if (!user || !user.password_reset_expires || new Date() > user.password_reset_expires) {
      return errorResponse(res, 'Invalid or expired reset token.', 400);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    await user.update({
      password: hashedPassword,
      password_reset_token: null,
      password_reset_expires: null
    });

    await AuditLog.create({
      user_id: user.id,
      action: 'PASSWORD_RESET',
      ip_address: req.ip
    });

    return successResponse(res, 'Password reset successfully. Please login with your new password.');
  } catch (err) {
    next(err);
  }
};

module.exports = { login, logout, getMe, forgotPassword, resetPassword };
