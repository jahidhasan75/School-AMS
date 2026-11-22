'use strict';

const express = require('express');
const router = express.Router();
const { generateQr, getActiveQr, verifyQr } = require('../controllers/qrController');
const { authenticate, requireAdmin } = require('../middleware/auth');

router.use(authenticate);

router.post('/generate', requireAdmin, generateQr);
router.get('/active', requireAdmin, getActiveQr);
router.post('/verify', verifyQr);

module.exports = router;
