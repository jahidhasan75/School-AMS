'use strict';

const { Notification } = require('../models');
const { successResponse, errorResponse, getPagination, getPaginationMeta } = require('../utils/responseHelper');

// GET /api/notifications
const getNotifications = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const { page: pageNum, limit: limitNum, offset } = getPagination(page, limit);

    const { count, rows } = await Notification.findAndCountAll({
      where: { user_id: req.userId },
      limit: limitNum,
      offset,
      order: [['created_at', 'DESC']]
    });

    return successResponse(res, 'Notifications retrieved.', rows, 200, getPaginationMeta(count, pageNum, limitNum));
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/:id/read
const markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOne({
      where: { id, user_id: req.userId }
    });
    if (!notification) return errorResponse(res, 'Notification not found.', 404);

    await notification.update({ is_read: true });
    return successResponse(res, 'Notification marked as read.', notification);
  } catch (err) {
    next(err);
  }
};

// PUT /api/notifications/read-all
const markAllRead = async (req, res, next) => {
  try {
    await Notification.update(
      { is_read: true },
      { where: { user_id: req.userId, is_read: false } }
    );
    return successResponse(res, 'All notifications marked as read.');
  } catch (err) {
    next(err);
  }
};

// GET /api/notifications/unread-count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.count({
      where: { user_id: req.userId, is_read: false }
    });
    return successResponse(res, 'Unread count retrieved.', { count });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getNotifications,
  markRead,
  markOneRead: markRead,
  markAllRead,
  getUnreadCount
};
