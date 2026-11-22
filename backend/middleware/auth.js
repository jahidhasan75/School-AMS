'use strict';

const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { errorResponse } = require('../utils/responseHelper');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided. Authorization required.', 401);
    }

    const token = authHeader.split(' ')[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired. Please login again.', 401);
      }
      return errorResponse(res, 'Invalid token.', 401);
    }

    const userId = decoded.id || decoded.userId;
    if (!userId) {
      return errorResponse(res, 'Invalid token payload.', 401);
    }

    const user = await User.findOne({
      where: { id: userId, is_active: true }
    });

    if (!user) {
      return errorResponse(res, 'User not found or account deactivated.', 401);
    }

    req.user = user;
    req.userId = user.id;
    req.userRole = user.role;
    next();
  } catch (err) {
    next(err);
  }
};

const requireAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return errorResponse(res, 'Access denied. Admin only.', 403);
  }
  next();
};

const requireTeacher = (req, res, next) => {
  if (req.userRole !== 'teacher') {
    return errorResponse(res, 'Access denied. Teachers only.', 403);
  }
  next();
};

module.exports = { authenticate, requireAdmin, requireTeacher };
