'use strict';

const { errorResponse } = require('../utils/responseHelper');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message || err);

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message);
    return errorResponse(res, messages.join(', '), 422);
  }

  // Sequelize unique constraint
  if (err.name === 'SequelizeUniqueConstraintError') {
    const field = err.errors[0]?.path || 'field';
    return errorResponse(res, `${field} already exists.`, 409);
  }

  // Sequelize foreign key
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return errorResponse(res, 'Referenced record not found.', 400);
  }

  // Sequelize database error
  if (err.name === 'SequelizeDatabaseError') {
    return errorResponse(res, 'Database error occurred.', 500);
  }

  // Multer file size error
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File too large. Maximum 5MB allowed.', 400);
  }

  // Multer unexpected file
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return errorResponse(res, 'Unexpected file field.', 400);
  }

  // JWT errors (shouldn't get here, but just in case)
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token.', 401);
  }

  // Default
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error.';
  return errorResponse(res, message, statusCode);
};

module.exports = { errorHandler };
