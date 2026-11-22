'use strict';

const express = require('express');
const router = express.Router();
const {
  applyLeave, getMyLeaves, getAllLeaves, approveLeave, rejectLeave, cancelLeave
} = require('../controllers/leaveController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadLeaveDocument } = require('../middleware/upload');

router.use(authenticate);

router.post('/', uploadLeaveDocument, applyLeave);
router.get('/my', getMyLeaves);
router.get('/', requireAdmin, getAllLeaves);
router.put('/:id/approve', requireAdmin, approveLeave);
router.put('/:id/reject', requireAdmin, rejectLeave);
router.delete('/:id', cancelLeave);

module.exports = router;
