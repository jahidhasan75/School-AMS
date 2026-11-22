'use strict';

const { SchoolSettings } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');

// GET /api/settings
const getSettings = async (req, res, next) => {
  try {
    let settings = await SchoolSettings.findOne();
    if (!settings) {
      // Create defaults if none exist
      settings = await SchoolSettings.create({
        school_name: 'Dhaka Model School',
        school_address: 'Dhaka, Bangladesh',
        school_email: 'info@dhakamodelschool.edu.bd',
        school_phone: '+8801700000000',
        latitude: 23.8103,
        longitude: 90.4125,
        allowed_radius_meters: 200,
        office_start_time: '09:00:00',
        office_end_time: '17:00:00',
        grace_period_minutes: 15,
        min_working_hours: 7,
        late_calculation_minutes: 15,
        weekend_days: ['Friday', 'Saturday'],
        qr_attendance_enabled: true,
        gps_attendance_enabled: false
      });
    }
    return successResponse(res, 'Settings retrieved.', settings);
  } catch (err) {
    next(err);
  }
};

// PUT /api/settings
const updateSettings = async (req, res, next) => {
  try {
    let settings = await SchoolSettings.findOne();
    if (!settings) {
      settings = await SchoolSettings.create({});
    }

    const allowedFields = [
      'school_name', 'school_address', 'school_email', 'school_phone',
      'latitude', 'longitude', 'allowed_radius_meters',
      'office_start_time', 'office_end_time', 'grace_period_minutes',
      'min_working_hours', 'late_calculation_minutes', 'weekend_days',
      'qr_attendance_enabled', 'gps_attendance_enabled'
    ];

    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    if (req.file) {
      updates.school_logo = req.file.path.replace(/\\/g, '/');
    }

    await settings.update(updates);
    const updated = await SchoolSettings.findOne();
    return successResponse(res, 'Settings updated successfully.', updated);
  } catch (err) {
    next(err);
  }
};

module.exports = { getSettings, updateSettings };
