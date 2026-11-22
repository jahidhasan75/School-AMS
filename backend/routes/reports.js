'use strict';

const express = require('express');
const router = express.Router();
const {
  getDailyReport, getWeeklyReport, getMonthlyReport,
  getYearlyReport, getTeacherReport, getDepartmentReport
} = require('../controllers/reportController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate, requireAdmin);

router.get('/daily', getDailyReport);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/yearly', getYearlyReport);
router.get('/department', getDepartmentReport);
router.get('/teacher/:id', getTeacherReport);

module.exports = router;
