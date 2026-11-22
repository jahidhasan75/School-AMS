'use strict';

const bcrypt = require('bcrypt');
const { Op } = require('sequelize');
const { User, Teacher, Attendance, sequelize } = require('../models');
const { successResponse, errorResponse, getPagination, getPaginationMeta } = require('../utils/responseHelper');
const { getMonthRange } = require('../utils/dateHelper');

const SALT_ROUNDS = 12;

// GET /api/teachers
const getAllTeachers = async (req, res, next) => {
  try {
    const { page, limit, search, department, is_active } = req.query;
    const { page: pageNum, limit: limitNum, offset } = getPagination(page, limit);

    const where = {};
    const userWhere = {};

    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { teacher_id: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }
    if (department) {
      where.department = { [Op.like]: `%${department}%` };
    }
    if (is_active !== undefined) {
      userWhere.is_active = is_active === 'true';
    }

    const { count, rows } = await Teacher.findAndCountAll({
      where,
      include: [{ model: User, as: 'user', where: userWhere, attributes: ['id', 'email', 'role', 'is_active', 'last_login'] }],
      limit: limitNum,
      offset,
      order: [['full_name', 'ASC']]
    });

    return successResponse(res, 'Teachers retrieved.', rows, 200, getPaginationMeta(count, pageNum, limitNum));
  } catch (err) {
    next(err);
  }
};

// GET /api/teachers/:id
const getTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Teachers can only view their own profile
    if (req.userRole === 'teacher') {
      const ownTeacher = await Teacher.findOne({ where: { user_id: req.userId } });
      if (!ownTeacher || ownTeacher.id !== parseInt(id)) {
        return errorResponse(res, 'Access denied.', 403);
      }
    }

    const teacher = await Teacher.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role', 'is_active', 'last_login'] }]
    });

    if (!teacher) return errorResponse(res, 'Teacher not found.', 404);

    // Attendance summary for current month
    const { start, end } = getMonthRange(new Date().getMonth() + 1, new Date().getFullYear());
    const summary = await Attendance.findAll({
      where: { teacher_id: id, attendance_date: { [Op.between]: [start, end] } },
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('status')), 'count']],
      group: ['status'],
      raw: true
    });

    return successResponse(res, 'Teacher retrieved.', { teacher, attendance_summary: summary });
  } catch (err) {
    next(err);
  }
};

// POST /api/teachers
const createTeacher = async (req, res, next) => {
  try {
    const {
      email, password, full_name, phone, address, subject, department,
      designation, joining_date
    } = req.body;

    if (!email || !password || !full_name) {
      return errorResponse(res, 'Email, password, and full name are required.', 422);
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) return errorResponse(res, 'Email already exists.', 409);

    // Generate teacher_id
    const lastTeacher = await Teacher.findOne({ order: [['id', 'DESC']] });
    const nextNum = lastTeacher
      ? parseInt(lastTeacher.teacher_id.replace('TCH', '')) + 1
      : 1;
    const teacher_id = `TCH${String(nextNum).padStart(3, '0')}`;

    const transaction = await sequelize.transaction();
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await User.create({ email, password: hashedPassword, role: 'teacher' }, { transaction });

      const profileImage = req.file ? req.file.path.replace(/\\/g, '/') : null;
      const teacher = await Teacher.create({
        user_id: user.id,
        teacher_id,
        full_name,
        phone,
        address,
        subject,
        department,
        designation,
        joining_date,
        profile_image: profileImage
      }, { transaction });

      await transaction.commit();

      const result = await Teacher.findByPk(teacher.id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role', 'is_active'] }]
      });

      return successResponse(res, 'Teacher created successfully.', result, 201);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// PUT /api/teachers/:id
const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    if (!teacher) return errorResponse(res, 'Teacher not found.', 404);

    const { full_name, phone, address, subject, department, designation, joining_date, is_active } = req.body;
    const profileImage = req.file ? req.file.path.replace(/\\/g, '/') : undefined;

    const transaction = await sequelize.transaction();
    try {
      const teacherUpdate = {};
      if (full_name !== undefined) teacherUpdate.full_name = full_name;
      if (phone !== undefined) teacherUpdate.phone = phone;
      if (address !== undefined) teacherUpdate.address = address;
      if (subject !== undefined) teacherUpdate.subject = subject;
      if (department !== undefined) teacherUpdate.department = department;
      if (designation !== undefined) teacherUpdate.designation = designation;
      if (joining_date !== undefined) teacherUpdate.joining_date = joining_date;
      if (profileImage !== undefined) teacherUpdate.profile_image = profileImage;

      await teacher.update(teacherUpdate, { transaction });

      if (is_active !== undefined) {
        await teacher.user.update({ is_active: is_active === 'true' || is_active === true }, { transaction });
      }

      await transaction.commit();

      const updated = await Teacher.findByPk(id, {
        include: [{ model: User, as: 'user', attributes: ['id', 'email', 'role', 'is_active'] }]
      });
      return successResponse(res, 'Teacher updated successfully.', updated);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/teachers/:id
const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findByPk(id, {
      include: [{ model: User, as: 'user' }]
    });
    if (!teacher) return errorResponse(res, 'Teacher not found.', 404);

    const transaction = await sequelize.transaction();
    try {
      await teacher.user.destroy({ transaction }); // paranoid soft delete
      await transaction.commit();
      return successResponse(res, 'Teacher deleted successfully.');
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// POST /api/teachers/:id/reset-password
const resetTeacherPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return errorResponse(res, 'Password must be at least 6 characters.', 422);
    }

    const teacher = await Teacher.findByPk(id, {
      include: [{ model: User.scope('withPassword'), as: 'user' }]
    });
    if (!teacher) return errorResponse(res, 'Teacher not found.', 404);

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await teacher.user.update({ password: hashed });

    return successResponse(res, 'Teacher password reset successfully.');
  } catch (err) {
    next(err);
  }
};

// GET /api/teachers/:id/attendance
const getTeacherAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { page, limit, start_date, end_date, status } = req.query;
    const { page: pageNum, limit: limitNum, offset } = getPagination(page, limit);

    const teacher = await Teacher.findByPk(id);
    if (!teacher) return errorResponse(res, 'Teacher not found.', 404);

    const where = { teacher_id: id };
    if (start_date && end_date) {
      where.attendance_date = { [Op.between]: [start_date, end_date] };
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

// POST /upload-photo
const updateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) return errorResponse(res, 'No image file uploaded.', 422);

    let teacher;
    if (req.userRole === 'teacher') {
      teacher = await Teacher.findOne({ where: { user_id: req.userId } });
    } else if (req.query.teacher_id) {
      teacher = await Teacher.findByPk(req.query.teacher_id);
    }
    if (!teacher) return errorResponse(res, 'Teacher not found.', 404);

    const profileImage = req.file.path.replace(/\\/g, '/');
    await teacher.update({ profile_image: profileImage });
    return successResponse(res, 'Profile image updated.', { profile_image: profileImage });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getTeachers: getAllTeachers,
  getTeacher,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  resetTeacherPassword,
  getTeacherAttendance,
  updateProfileImage
};
