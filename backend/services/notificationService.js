'use strict';

const { Notification } = require('../models');

/**
 * Create a notification for a user
 */
async function createNotification(userId, title, message, type = 'announcement', transaction = null) {
  const opts = transaction ? { transaction } : {};
  return await Notification.create({ user_id: userId, title, message, type }, opts);
}

/**
 * Create notifications for multiple users
 */
async function createBulkNotifications(userIds, title, message, type = 'announcement', transaction = null) {
  const opts = transaction ? { transaction } : {};
  const records = userIds.map(user_id => ({ user_id, title, message, type }));
  return await Notification.bulkCreate(records, opts);
}

/**
 * Notify about leave approval
 */
async function notifyLeaveApproval(teacherUserId, leaveDates, transaction = null) {
  return createNotification(
    teacherUserId,
    'Leave Request Approved',
    `Your leave request for ${leaveDates} has been approved.`,
    'leave',
    transaction
  );
}

/**
 * Notify about leave rejection
 */
async function notifyLeaveRejection(teacherUserId, leaveDates, remarks, transaction = null) {
  return createNotification(
    teacherUserId,
    'Leave Request Rejected',
    `Your leave request for ${leaveDates} has been rejected. Remarks: ${remarks || 'No remarks provided.'}`,
    'leave',
    transaction
  );
}

/**
 * Notify about attendance correction
 */
async function notifyAttendanceCorrection(teacherUserId, date, transaction = null) {
  return createNotification(
    teacherUserId,
    'Attendance Record Corrected',
    `Your attendance record for ${date} has been modified by an administrator.`,
    'correction',
    transaction
  );
}

module.exports = {
  createNotification,
  createBulkNotifications,
  notifyLeaveApproval,
  notifyLeaveRejection,
  notifyAttendanceCorrection
};
