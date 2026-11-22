'use strict';

const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const { Attendance, Teacher, User, SchoolSettings, Holiday, AuditLog, sequelize } = require('../models');
const { successResponse, errorResponse, getPagination, getPaginationMeta } = require('../utils/responseHelper');
const { getToday, getCurrentTime, calculateAttendanceStatus, minutesBetweenTimes, getMonthRange } = require('../utils/dateHelper');
const { verifyGpsLocation } = require('../services/gpsService');
const { notifyAttendanceCorrection } = require('../services/notificationService');

// POST /api/attendance/check-in
const checkIn = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 422, errors.array());
    }

    if (req.userRole !== 'teacher') {
      return errorResponse(res, 'Only teachers can check in.', 403);
    }

    const { latitude, longitude } = req.body;

    // Get teacher record
    const teacher = await Teacher.findOne({ where: { user_id: req.userId } });
    if (!teacher) return errorResponse(res, 'Teacher profile not found.', 404);

    const today = getToday();

    // Check if already checked in today
    const existing = await Attendance.findOne({
      where: { teacher_id: teacher.id, attendance_date: today }
    });
    if (existing && existing.check_in_time) {
      return errorResponse(res, 'Already checked in today.', 409);
    }

    // Get school settings
    const settings = await SchoolSettings.findOne();
    if (!settings) return errorResponse(res, 'School settings not configured.', 500);

    // Verify GPS if enabled
    if (settings.gps_attendance_enabled) {
      if (!settings.latitude || !settings.longitude) {
        return errorResponse(res, 'School GPS location not configured.', 500);
      }

      const { isValid, distance } = verifyGpsLocation(
        { latitude, longitude },
        { latitude: settings.latitude, longitude: settings.longitude },
        settings.allowed_radius_meters
      );

      if (!isValid) {
        return errorResponse(res, `You are too far from school. Distance: ${distance}m (Allowed: ${settings.allowed_radius_meters}m).`, 400);
      }
    }

    // Check if today is a holiday
    const holiday = await Holiday.findOne({ where: { date: today } });
    if (holiday) {
      return errorResponse(res, `Today is a holiday: ${holiday.name}`, 400);
    }

    const checkInTime = getCurrentTime();
    const status = calculateAttendanceStatus(
      checkInTime,
      settings.office_start_time,
      settings.grace_period_minutes
    );

    const transaction = await sequelize.transaction();
    try {
      let attendance;
      if (existing) {
        await existing.update({
          check_in_time: checkInTime,
          check_in_latitude: latitude,
          check_in_longitude: longitude,
          check_in_method: 'gps',
          status
        }, { transaction });
        attendance = existing;
      } else {
        attendance = await Attendance.create({
          teacher_id: teacher.id,
          attendance_date: today,
          check_in_time: checkInTime,
          check_in_latitude: latitude,
          check_in_longitude: longitude,
          check_in_method: 'gps',
          status
        }, { transaction });
      }

      await transaction.commit();

      return successResponse(res, `Check-in successful. Status: ${status}`, {
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

// POST /api/attendance/check-out
const checkOut = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 422, errors.array());
    }

    if (req.userRole !== 'teacher') {
      return errorResponse(res, 'Only teachers can check out.', 403);
    }

    const { latitude, longitude } = req.body;

    const teacher = await Teacher.findOne({ where: { user_id: req.userId } });
    if (!teacher) return errorResponse(res, 'Teacher profile not found.', 404);

    const today = getToday();
    const attendance = await Attendance.findOne({
      where: { teacher_id: teacher.id, attendance_date: today }
    });

    if (!attendance || !attendance.check_in_time) {
      return errorResponse(res, 'You have not checked in today.', 400);
    }
    if (attendance.check_out_time) {
      return errorResponse(res, 'Already checked out today.', 409);
    }

    // Get school settings
    const settings = await SchoolSettings.findOne();
    if (settings && settings.gps_attendance_enabled && settings.latitude && settings.longitude) {
      const { isValid, distance } = verifyGpsLocation(
        { latitude, longitude },
        { latitude: settings.latitude, longitude: settings.longitude },
        settings.allowed_radius_meters
      );
      if (!isValid) {
        return errorResponse(res, `You are too far from school. Distance: ${distance}m (Allowed: ${settings.allowed_radius_meters}m).`, 400);
      }
    }

    const checkOutTime = getCurrentTime();
    const workingMinutes = Math.round(minutesBetweenTimes(attendance.check_in_time, checkOutTime));

    // Check for early leave
    let finalStatus = attendance.status;
    if (settings) {
      const minWorkingMinutes = (parseFloat(settings.min_working_hours) || 7) * 60;
      if (workingMinutes < minWorkingMinutes / 2) {
        finalStatus = 'early_leave';
      } else if (workingMinutes < minWorkingMinutes) {
        finalStatus = attendance.status === 'present' ? 'half_day' : attendance.status;
      }
    }

    const transaction = await sequelize.transaction();
    try {
      await attendance.update({
        check_out_time: checkOutTime,
        check_out_latitude: latitude,
        check_out_longitude: longitude,
        check_out_method: 'gps',
        working_minutes: workingMinutes,
        status: finalStatus
      }, { transaction });

      await transaction.commit();

      return successResponse(res, 'Check-out successful.', {
        attendance,
        working_minutes: workingMinutes,
        check_out_time: checkOutTime
      });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/my
const getMyAttendance = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ where: { user_id: req.userId } });
    if (!teacher) return errorResponse(res, 'Teacher profile not found.', 404);

    const { page, limit, start_date, end_date, status } = req.query;
    const { page: pageNum, limit: limitNum, offset } = getPagination(page, limit);

    const where = { teacher_id: teacher.id };
    if (start_date && end_date) {
      where.attendance_date = { [Op.between]: [start_date, end_date] };
    } else if (start_date) {
      where.attendance_date = { [Op.gte]: start_date };
    }
    if (status) where.status = status;

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['attendance_date', 'DESC']]
    });

    return successResponse(res, 'Attendance records retrieved.', rows, 200, getPaginationMeta(count, pageNum, limitNum));
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance (admin)
const getAllAttendance = async (req, res, next) => {
  try {
    const { page, limit, search, start_date, end_date, status, teacher_id } = req.query;
    const { page: pageNum, limit: limitNum, offset } = getPagination(page, limit);

    const where = {};
    const teacherWhere = {};

    if (teacher_id) where.teacher_id = teacher_id;
    if (status) where.status = status;
    if (start_date && end_date) {
      where.attendance_date = { [Op.between]: [start_date, end_date] };
    }
    if (search) {
      teacherWhere[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { teacher_id: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows } = await Attendance.findAndCountAll({
      where,
      include: [{ model: Teacher, as: 'teacher', where: teacherWhere, required: !!search }],
      limit: limitNum,
      offset,
      order: [['attendance_date', 'DESC'], ['created_at', 'DESC']]
    });

    return successResponse(res, 'Attendance records retrieved.', rows, 200, getPaginationMeta(count, pageNum, limitNum));
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/:id
const getAttendanceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const attendance = await Attendance.findByPk(id, {
      include: [{ model: Teacher, as: 'teacher' }]
    });
    if (!attendance) return errorResponse(res, 'Attendance record not found.', 404);
    return successResponse(res, 'Attendance record retrieved.', attendance);
  } catch (err) {
    next(err);
  }
};

// PUT /api/attendance/:id (admin edit)
const updateAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { check_in_time, check_out_time, status, remarks, reason } = req.body;

    const attendance = await Attendance.findByPk(id, {
      include: [{ model: Teacher, as: 'teacher' }]
    });
    if (!attendance) return errorResponse(res, 'Attendance record not found.', 404);

    const oldValues = {
      check_in_time: attendance.check_in_time,
      check_out_time: attendance.check_out_time,
      status: attendance.status,
      remarks: attendance.remarks
    };

    const updates = { modified_by: req.userId };
    if (check_in_time !== undefined) updates.check_in_time = check_in_time;
    if (check_out_time !== undefined) updates.check_out_time = check_out_time;
    if (status !== undefined) updates.status = status;
    if (remarks !== undefined) updates.remarks = remarks;

    // Recalculate working_minutes if times changed
    if ((check_in_time || attendance.check_in_time) && (check_out_time || attendance.check_out_time)) {
      const inTime = check_in_time || attendance.check_in_time;
      const outTime = check_out_time || attendance.check_out_time;
      updates.working_minutes = Math.round(minutesBetweenTimes(inTime, outTime));
    }

    const transaction = await sequelize.transaction();
    try {
      await attendance.update(updates, { transaction });

      // Audit log
      await AuditLog.create({
        user_id: req.userId,
        action: 'ATTENDANCE_EDIT',
        table_name: 'attendances',
        record_id: id,
        old_values: oldValues,
        new_values: updates,
        reason: reason || null,
        ip_address: req.ip
      }, { transaction });

      // Notify teacher
      const teacher = attendance.teacher;
      if (teacher) {
        const teacherUser = await User.findByPk(teacher.user_id);
        if (teacherUser) {
          await notifyAttendanceCorrection(teacherUser.id, attendance.attendance_date, transaction);
        }
      }

      await transaction.commit();
      const updated = await Attendance.findByPk(id, { include: [{ model: Teacher, as: 'teacher' }] });
      return successResponse(res, 'Attendance updated successfully.', updated);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/attendance/manual (admin)
const manualAttendance = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 'Validation failed', 422, errors.array());
    }

    const { teacher_id, attendance_date, check_in_time, check_out_time, status, remarks } = req.body;

    const teacher = await Teacher.findByPk(teacher_id);
    if (!teacher) return errorResponse(res, 'Teacher not found.', 404);

    let workingMinutes = 0;
    if (check_in_time && check_out_time) {
      workingMinutes = Math.round(minutesBetweenTimes(check_in_time, check_out_time));
    }

    const transaction = await sequelize.transaction();
    try {
      const [attendance, created] = await Attendance.upsert({
        teacher_id,
        attendance_date,
        check_in_time: check_in_time || null,
        check_out_time: check_out_time || null,
        check_in_method: 'manual',
        check_out_method: check_out_time ? 'manual' : null,
        status,
        working_minutes: workingMinutes,
        remarks: remarks || null,
        modified_by: req.userId
      }, { transaction });

      await AuditLog.create({
        user_id: req.userId,
        action: 'ATTENDANCE_MANUAL',
        table_name: 'attendances',
        record_id: attendance.id,
        new_values: { teacher_id, attendance_date, status, check_in_time, check_out_time },
        ip_address: req.ip
      }, { transaction });

      await transaction.commit();
      return successResponse(res, `Manual attendance ${created ? 'created' : 'updated'} successfully.`, attendance, created ? 201 : 200);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/summary (admin dashboard)
const getSummary = async (req, res, next) => {
  try {
    const today = getToday();
    const totalTeachers = await Teacher.count({
      include: [{ model: User, as: 'user', where: { is_active: true } }]
    });

    const todayRecords = await Attendance.findAll({
      where: { attendance_date: today },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      group: ['status'],
      raw: true
    });

    const summary = {
      total_teachers: totalTeachers,
      present: 0, late: 0, absent: 0, on_leave: 0, half_day: 0
    };

    todayRecords.forEach(r => {
      if (r.status in summary) summary[r.status] = parseInt(r.count);
    });

    const attendedCount = summary.present + summary.late + summary.half_day;
    summary.absent = totalTeachers - attendedCount - summary.on_leave;
    if (summary.absent < 0) summary.absent = 0;

    return successResponse(res, 'Today summary retrieved.', summary);
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/my-summary
const getMySummary = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ where: { user_id: req.userId } });
    if (!teacher) return errorResponse(res, 'Teacher profile not found.', 404);

    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const { start, end } = getMonthRange(month, year);

    const records = await Attendance.findAll({
      where: { teacher_id: teacher.id, attendance_date: { [Op.between]: [start, end] } },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      group: ['status'],
      raw: true
    });

    const totalWorkingMinutes = await Attendance.sum('working_minutes', {
      where: { teacher_id: teacher.id, attendance_date: { [Op.between]: [start, end] } }
    });

    const summary = { present: 0, late: 0, absent: 0, on_leave: 0, half_day: 0, holiday: 0, early_leave: 0 };
    records.forEach(r => { if (r.status in summary) summary[r.status] = parseInt(r.count); });

    return successResponse(res, 'Monthly summary retrieved.', {
      month, year, ...summary,
      total_working_minutes: totalWorkingMinutes || 0,
      total_working_hours: ((totalWorkingMinutes || 0) / 60).toFixed(1)
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/attendance/today (admin)
const getTodayAttendance = async (req, res, next) => {
  try {
    const today = getToday();
    const { search } = req.query;
    const teacherWhere = {};
    if (search) {
      teacherWhere[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { teacher_id: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get all active teachers
    const teachers = await Teacher.findAll({
      include: [{ model: User, as: 'user', where: { is_active: true } }],
      where: teacherWhere
    });

    // Get today's attendance records
    const attendanceRecords = await Attendance.findAll({
      where: { attendance_date: today }
    });

    const attendanceMap = {};
    attendanceRecords.forEach(a => { attendanceMap[a.teacher_id] = a; });

    const result = teachers.map(teacher => ({
      teacher_id: teacher.id,
      teacher_code: teacher.teacher_id,
      full_name: teacher.full_name,
      department: teacher.department,
      attendance: attendanceMap[teacher.id] || { status: 'absent' }
    }));

    return successResponse(res, 'Today attendance retrieved.', result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  checkIn, checkOut, getMyAttendance, getAllAttendance, getAttendanceById,
  updateAttendance, addManualAttendance: manualAttendance, getDailySummary: getSummary, getMySummary, getTodayAttendance
};
