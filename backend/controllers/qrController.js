'use strict';

const { SchoolSettings } = require('../models');
const { generateQrSession, getActiveQrSession, verifyQrToken } = require('../services/qrService');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { getToday, getCurrentTime, calculateAttendanceStatus } = require('../utils/dateHelper');
const { Attendance, Teacher, Holiday, sequelize } = require('../models');

// POST /api/qr/generate (admin only)
const generateQr = async (req, res, next) => {
  try {
    const settings = await SchoolSettings.findOne();
    if (settings && !settings.qr_attendance_enabled) {
      return errorResponse(res, 'QR attendance is disabled in settings.', 400);
    }

    const expiryMinutes = parseInt(req.body.expiry_minutes) || 5;
    if (expiryMinutes < 1 || expiryMinutes > 60) {
      return errorResponse(res, 'Expiry must be between 1 and 60 minutes.', 400);
    }

    const result = await generateQrSession(req.userId, expiryMinutes);

    return successResponse(res, 'QR code generated successfully.', {
      session_id: result.sessionId,
      token: result.token,
      qr_data_url: result.qrDataUrl,
      expires_at: result.expiresAt,
      expiry_minutes: expiryMinutes
    }, 201);
  } catch (err) {
    next(err);
  }
};

// GET /api/qr/active
const getActiveQr = async (req, res, next) => {
  try {
    const session = await getActiveQrSession();
    if (!session) {
      return successResponse(res, 'No active QR session.', null);
    }

    return successResponse(res, 'Active QR session retrieved.', {
      session_id: session.id,
      token: session.token,
      expires_at: session.expires_at,
      created_at: session.created_at
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/qr/verify (teacher)
const verifyQr = async (req, res, next) => {
  try {
    if (req.userRole !== 'teacher') {
      return errorResponse(res, 'Only teachers can verify QR codes.', 403);
    }

    const { token } = req.body;
    if (!token) return errorResponse(res, 'QR token is required.', 400);

    const session = await verifyQrToken(token);
    if (!session) {
      return errorResponse(res, 'QR code is invalid or expired.', 400);
    }

    const teacher = await Teacher.findOne({ where: { user_id: req.userId } });
    if (!teacher) return errorResponse(res, 'Teacher profile not found.', 404);

    const today = getToday();

    // Check if already checked in
    const existing = await Attendance.findOne({
      where: { teacher_id: teacher.id, attendance_date: today }
    });
    if (existing && existing.check_in_time) {
      return errorResponse(res, 'Already checked in today.', 409);
    }

    // Check holiday
    const holiday = await Holiday.findOne({ where: { date: today } });
    if (holiday) {
      return errorResponse(res, `Today is a holiday: ${holiday.name}`, 400);
    }

    const settings = await SchoolSettings.findOne();
    const checkInTime = getCurrentTime();
    const status = settings
      ? calculateAttendanceStatus(checkInTime, settings.office_start_time, settings.grace_period_minutes)
      : 'present';

    const transaction = await sequelize.transaction();
    try {
      let attendance;
      if (existing) {
        await existing.update({
          check_in_time: checkInTime,
          check_in_method: 'qr',
          status
        }, { transaction });
        attendance = existing;
      } else {
        attendance = await Attendance.create({
          teacher_id: teacher.id,
          attendance_date: today,
          check_in_time: checkInTime,
          check_in_method: 'qr',
          status
        }, { transaction });
      }

      await transaction.commit();

      return successResponse(res, `QR check-in successful. Status: ${status}`, {
        attendance,
        status,
        check_in_time: checkInTime
      }, 201);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

module.exports = { generateQr, getActiveQr, verifyQr };
