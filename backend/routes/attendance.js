'use strict';

const express = require('express');
const router = express.Router();
const {
  checkIn, checkOut, getMyAttendance, getAllAttendance, getAttendanceById,
  updateAttendance, addManualAttendance, getDailySummary, getMySummary, getTodayAttendance
} = require('../controllers/attendanceController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { checkInValidator, checkOutValidator } = require('../validators/attendanceValidator');

router.use(authenticate);

router.post('/check-in', checkInValidator, checkIn);
router.post('/check-out', checkOutValidator, checkOut);
router.get('/my', getMyAttendance);
router.get('/my-summary', getMySummary);
router.get('/summary', requireAdmin, getDailySummary);
router.get('/today', requireAdmin, getTodayAttendance);
router.get('/', requireAdmin, getAllAttendance);
router.get('/:id', getAttendanceById);
router.put('/:id', requireAdmin, updateAttendance);
router.post('/manual', requireAdmin, addManualAttendance);

module.exports = router;
