'use strict';

const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { uploadSchoolLogo } = require('../middleware/upload');

router.use(authenticate);

router.get('/', getSettings);
router.put('/', requireAdmin, uploadSchoolLogo, updateSettings);
router.post('/logo', requireAdmin, uploadSchoolLogo, updateSettings);

module.exports = router;
