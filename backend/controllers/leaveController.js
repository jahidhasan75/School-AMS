'use strict';

const { Op } = require('sequelize');
const { LeaveRequest, Teacher, User, sequelize } = require('../models');
const { successResponse, errorResponse, getPagination, getPaginationMeta } = require('../utils/responseHelper');
const { notifyLeaveApproval, notifyLeaveRejection } = require('../services/notificationService');

// POST /api/leaves
const createLeave = async (req, res, next) => {
  try {
    if (req.userRole !== 'teacher') {
      return errorResponse(res, 'Only teachers can submit leave requests.', 403);
    }

    const { leave_type, start_date, end_date, reason } = req.body;
    if (!leave_type || !start_date || !end_date || !reason) {
      return errorResponse(res, 'leave_type, start_date, end_date, and reason are required.', 422);
    }

    const teacher = await Teacher.findOne({ where: { user_id: req.userId } });
    if (!teacher) return errorResponse(res, 'Teacher profile not found.', 404);

    // Calculate total days
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (start > end) return errorResponse(res, 'start_date must be before end_date.', 400);

    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check for overlapping pending/approved leaves
    const overlap = await LeaveRequest.findOne({
      where: {
        teacher_id: teacher.id,
        status: { [Op.in]: ['pending', 'approved'] },
        [Op.or]: [
          { start_date: { [Op.between]: [start_date, end_date] } },
          { end_date: { [Op.between]: [start_date, end_date] } },
          {
            start_date: { [Op.lte]: start_date },
            end_date: { [Op.gte]: end_date }
          }
        ]
      }
    });
    if (overlap) {
      return errorResponse(res, 'You already have a leave request for this date range.', 409);
    }

    const documentPath = req.file ? req.file.path.replace(/\\/g, '/') : null;

    const transaction = await sequelize.transaction();
    try {
      const leave = await LeaveRequest.create({
        teacher_id: teacher.id,
        leave_type,
        start_date,
        end_date,
        total_days: totalDays,
        reason,
        document_path: documentPath,
        status: 'pending'
      }, { transaction });

      await transaction.commit();
      return successResponse(res, 'Leave request submitted successfully.', leave, 201);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// GET /api/leaves/my
const getMyLeaves = async (req, res, next) => {
  try {
    const teacher = await Teacher.findOne({ where: { user_id: req.userId } });
    if (!teacher) return errorResponse(res, 'Teacher profile not found.', 404);

    const { page, limit, status } = req.query;
    const { page: pageNum, limit: limitNum, offset } = getPagination(page, limit);

    const where = { teacher_id: teacher.id };
    if (status) where.status = status;

    const { count, rows } = await LeaveRequest.findAndCountAll({
      where,
      limit: limitNum,
      offset,
      order: [['created_at', 'DESC']]
    });

    return successResponse(res, 'Leave requests retrieved.', rows, 200, getPaginationMeta(count, pageNum, limitNum));
  } catch (err) {
    next(err);
  }
};

// GET /api/leaves (admin)
const getAllLeaves = async (req, res, next) => {
  try {
    const { page, limit, status, teacher_id } = req.query;
    const { page: pageNum, limit: limitNum, offset } = getPagination(page, limit);

    const where = {};
    if (status) where.status = status;
    if (teacher_id) where.teacher_id = teacher_id;

    const { count, rows } = await LeaveRequest.findAndCountAll({
      where,
      include: [{ model: Teacher, as: 'teacher', attributes: ['id', 'teacher_id', 'full_name', 'department'] }],
      limit: limitNum,
      offset,
      order: [['created_at', 'DESC']]
    });

    return successResponse(res, 'Leave requests retrieved.', rows, 200, getPaginationMeta(count, pageNum, limitNum));
  } catch (err) {
    next(err);
  }
};

// PUT /api/leaves/:id/approve
const approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leave = await LeaveRequest.findByPk(id, {
      include: [{ model: Teacher, as: 'teacher' }]
    });
    if (!leave) return errorResponse(res, 'Leave request not found.', 404);
    if (leave.status !== 'pending') {
      return errorResponse(res, `Cannot approve a ${leave.status} leave request.`, 400);
    }

    const transaction = await sequelize.transaction();
    try {
      await leave.update({
        status: 'approved',
        approved_by: req.userId,
        approved_at: new Date(),
        admin_remarks: req.body.admin_remarks || null
      }, { transaction });

      // Notify teacher
      const teacherUser = await User.findByPk(leave.teacher.user_id);
      if (teacherUser) {
        await notifyLeaveApproval(
          teacherUser.id,
          `${leave.start_date} to ${leave.end_date}`,
          transaction
        );
      }

      await transaction.commit();
      return successResponse(res, 'Leave request approved.', leave);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// PUT /api/leaves/:id/reject
const rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { admin_remarks } = req.body;

    if (!admin_remarks) {
      return errorResponse(res, 'Rejection remarks are required.', 422);
    }

    const leave = await LeaveRequest.findByPk(id, {
      include: [{ model: Teacher, as: 'teacher' }]
    });
    if (!leave) return errorResponse(res, 'Leave request not found.', 404);
    if (leave.status !== 'pending') {
      return errorResponse(res, `Cannot reject a ${leave.status} leave request.`, 400);
    }

    const transaction = await sequelize.transaction();
    try {
      await leave.update({
        status: 'rejected',
        approved_by: req.userId,
        approved_at: new Date(),
        admin_remarks
      }, { transaction });

      const teacherUser = await User.findByPk(leave.teacher.user_id);
      if (teacherUser) {
        await notifyLeaveRejection(
          teacherUser.id,
          `${leave.start_date} to ${leave.end_date}`,
          admin_remarks,
          transaction
        );
      }

      await transaction.commit();
      return successResponse(res, 'Leave request rejected.', leave);
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    next(err);
  }
};

// DELETE /api/leaves/:id
const cancelLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const teacher = await Teacher.findOne({ where: { user_id: req.userId } });
    if (!teacher) return errorResponse(res, 'Teacher profile not found.', 404);

    const leave = await LeaveRequest.findOne({
      where: { id, teacher_id: teacher.id }
    });
    if (!leave) return errorResponse(res, 'Leave request not found.', 404);
    if (leave.status !== 'pending') {
      return errorResponse(res, 'Only pending leave requests can be cancelled.', 400);
    }

    await leave.destroy();
    return successResponse(res, 'Leave request cancelled successfully.');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createLeave,
  applyLeave: createLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  cancelLeave
};
