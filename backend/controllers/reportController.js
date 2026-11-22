'use strict';

const { Op } = require('sequelize');
const { Attendance, Teacher, User, Holiday, sequelize } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { getMonthRange, getWorkingDaysCount } = require('../utils/dateHelper');

// GET /api/reports/daily?date=
const getDailyReport = async (req, res, next) => {
  try {
    const date = req.query.date || new Date().toISOString().slice(0, 10);

    const teachers = await Teacher.findAll({
      include: [{ model: User, as: 'user', where: { is_active: true } }],
      order: [['full_name', 'ASC']]
    });

    const attendanceRecords = await Attendance.findAll({ where: { attendance_date: date } });
    const attendanceMap = {};
    attendanceRecords.forEach(a => { attendanceMap[a.teacher_id] = a; });

    const isHoliday = await Holiday.findOne({ where: { date } });

    const report = teachers.map(teacher => ({
      teacher_id: teacher.teacher_id,
      full_name: teacher.full_name,
      department: teacher.department,
      attendance: attendanceMap[teacher.id] || { status: isHoliday ? 'holiday' : 'absent' }
    }));

    const statusCounts = { present: 0, late: 0, absent: 0, on_leave: 0, half_day: 0, holiday: 0 };
    report.forEach(r => {
      const s = r.attendance.status;
      if (s in statusCounts) statusCounts[s]++;
      else statusCounts.absent++;
    });

    return successResponse(res, 'Daily report retrieved.', { date, is_holiday: !!isHoliday, holiday_name: isHoliday?.name, summary: statusCounts, records: report });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/weekly?start=&end=
const getWeeklyReport = async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return errorResponse(res, 'start and end query parameters are required.', 400);

    const teachers = await Teacher.findAll({
      include: [{ model: User, as: 'user', where: { is_active: true } }],
      order: [['full_name', 'ASC']]
    });

    const attendanceRecords = await Attendance.findAll({
      where: { attendance_date: { [Op.between]: [start, end] } },
      order: [['attendance_date', 'ASC']]
    });

    const report = teachers.map(teacher => {
      const records = attendanceRecords.filter(a => a.teacher_id === teacher.id);
      const summary = { present: 0, late: 0, absent: 0, on_leave: 0, half_day: 0 };
      records.forEach(r => { if (r.status in summary) summary[r.status]++; });
      return {
        teacher_id: teacher.teacher_id,
        full_name: teacher.full_name,
        department: teacher.department,
        summary,
        total_working_minutes: records.reduce((acc, r) => acc + (r.working_minutes || 0), 0)
      };
    });

    return successResponse(res, 'Weekly report retrieved.', { start, end, records: report });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/monthly?month=&year=
const getMonthlyReport = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month) || new Date().getMonth() + 1;
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const { start, end } = getMonthRange(month, year);

    const teachers = await Teacher.findAll({
      include: [{ model: User, as: 'user', where: { is_active: true } }],
      order: [['full_name', 'ASC']]
    });

    const attendanceRecords = await Attendance.findAll({
      where: { attendance_date: { [Op.between]: [start, end] } }
    });

    const workingDays = getWorkingDaysCount(start, end);

    const report = teachers.map(teacher => {
      const records = attendanceRecords.filter(a => a.teacher_id === teacher.id);
      const summary = { present: 0, late: 0, absent: 0, on_leave: 0, half_day: 0, holiday: 0, early_leave: 0 };
      records.forEach(r => { if (r.status in summary) summary[r.status]++; });
      const attended = summary.present + summary.late + summary.half_day;
      summary.absent = Math.max(0, workingDays - attended - summary.on_leave - summary.holiday);
      const totalWorkingMinutes = records.reduce((acc, r) => acc + (r.working_minutes || 0), 0);

      return {
        teacher_id: teacher.teacher_id,
        full_name: teacher.full_name,
        department: teacher.department,
        working_days: workingDays,
        summary,
        total_working_minutes: totalWorkingMinutes,
        total_working_hours: (totalWorkingMinutes / 60).toFixed(1),
        attendance_percentage: workingDays > 0 ? ((attended / workingDays) * 100).toFixed(1) : '0.0'
      };
    });

    return successResponse(res, 'Monthly report retrieved.', { month, year, working_days: workingDays, records: report });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/yearly?year=
const getYearlyReport = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const start = `${year}-01-01`;
    const end = `${year}-12-31`;

    const teachers = await Teacher.findAll({
      include: [{ model: User, as: 'user', where: { is_active: true } }],
      order: [['full_name', 'ASC']]
    });

    const attendanceRecords = await Attendance.findAll({
      where: { attendance_date: { [Op.between]: [start, end] } }
    });

    const report = teachers.map(teacher => {
      const records = attendanceRecords.filter(a => a.teacher_id === teacher.id);
      const summary = { present: 0, late: 0, absent: 0, on_leave: 0, half_day: 0 };
      records.forEach(r => { if (r.status in summary) summary[r.status]++; });
      return {
        teacher_id: teacher.teacher_id,
        full_name: teacher.full_name,
        department: teacher.department,
        summary,
        total_working_hours: (records.reduce((acc, r) => acc + (r.working_minutes || 0), 0) / 60).toFixed(1)
      };
    });

    return successResponse(res, 'Yearly report retrieved.', { year, records: report });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/teacher/:id?start=&end=
const getTeacherReport = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start, end } = req.query;

    const teacher = await Teacher.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['email', 'is_active'] }]
    });
    if (!teacher) return errorResponse(res, 'Teacher not found.', 404);

    const where = { teacher_id: id };
    if (start && end) where.attendance_date = { [Op.between]: [start, end] };

    const records = await Attendance.findAll({
      where,
      order: [['attendance_date', 'DESC']]
    });

    const summary = { present: 0, late: 0, absent: 0, on_leave: 0, half_day: 0, holiday: 0, early_leave: 0 };
    records.forEach(r => { if (r.status in summary) summary[r.status]++; });
    const totalWorkingMinutes = records.reduce((acc, r) => acc + (r.working_minutes || 0), 0);

    return successResponse(res, 'Teacher report retrieved.', {
      teacher,
      date_range: { start, end },
      summary,
      total_working_minutes: totalWorkingMinutes,
      total_working_hours: (totalWorkingMinutes / 60).toFixed(1),
      records
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/reports/department
const getDepartmentReport = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();
    const { start, end } = getMonthRange(m, y);

    const teachers = await Teacher.findAll({
      include: [{ model: User, as: 'user', where: { is_active: true } }]
    });

    const attendanceRecords = await Attendance.findAll({
      where: { attendance_date: { [Op.between]: [start, end] } }
    });

    // Group by department
    const deptMap = {};
    teachers.forEach(teacher => {
      const dept = teacher.department || 'Unassigned';
      if (!deptMap[dept]) {
        deptMap[dept] = { department: dept, teacher_count: 0, present: 0, late: 0, absent: 0, on_leave: 0 };
      }
      deptMap[dept].teacher_count++;

      const records = attendanceRecords.filter(a => a.teacher_id === teacher.id);
      records.forEach(r => {
        if (r.status in deptMap[dept]) deptMap[dept][r.status]++;
      });
    });

    return successResponse(res, 'Department report retrieved.', {
      month: m, year: y,
      departments: Object.values(deptMap)
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDailyReport, getWeeklyReport, getMonthlyReport, getYearlyReport, getTeacherReport, getDepartmentReport };
