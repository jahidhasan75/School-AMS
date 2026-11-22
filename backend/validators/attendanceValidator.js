'use strict';

const { body } = require('express-validator');

const checkInValidator = [
  body('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
];

const checkOutValidator = [
  body('latitude')
    .notEmpty().withMessage('Latitude is required')
    .isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
  body('longitude')
    .notEmpty().withMessage('Longitude is required')
    .isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude')
];

const manualAttendanceValidator = [
  body('teacher_id')
    .notEmpty().withMessage('Teacher ID is required')
    .isInt({ min: 1 }).withMessage('Invalid teacher ID'),
  body('attendance_date')
    .notEmpty().withMessage('Attendance date is required')
    .isDate().withMessage('Invalid date format (YYYY-MM-DD)'),
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['present', 'late', 'absent', 'half_day', 'on_leave', 'early_leave', 'holiday'])
    .withMessage('Invalid attendance status'),
  body('check_in_time')
    .optional()
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid time format (HH:MM or HH:MM:SS)'),
  body('check_out_time')
    .optional()
    .matches(/^\d{2}:\d{2}(:\d{2})?$/).withMessage('Invalid time format (HH:MM or HH:MM:SS)')
];

module.exports = { checkInValidator, checkOutValidator, manualAttendanceValidator };
