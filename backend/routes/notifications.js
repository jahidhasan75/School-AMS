'use strict';

const express = require('express');
const router = express.Router();
const {
  getNotifications, markOneRead, markAllRead, getUnreadCount
} = require('../controllers/notificationController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllRead);
router.put('/:id/read', markOneRead);

module.exports = router;
