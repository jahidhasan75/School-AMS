'use strict';

const express = require('express');
const router = express.Router();
const {
  getTeachers, getTeacher, createTeacher, updateTeacher,
  deleteTeacher, resetTeacherPassword, getTeacherAttendance, updateProfileImage
} = require('../controllers/teacherController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadTeacherPhoto } = require('../middleware/upload');

// All teacher routes require auth
router.use(authenticate);

router.post('/upload-photo', uploadTeacherPhoto, updateProfileImage);
router.get('/', requireAdmin, getTeachers);
router.post('/', requireAdmin, uploadTeacherPhoto, createTeacher);
router.get('/:id', getTeacher);
router.put('/:id', requireAdmin, uploadTeacherPhoto, updateTeacher);
router.delete('/:id', requireAdmin, deleteTeacher);
router.post('/:id/reset-password', requireAdmin, resetTeacherPassword);
router.get('/:id/attendance', getTeacherAttendance);

module.exports = router;
