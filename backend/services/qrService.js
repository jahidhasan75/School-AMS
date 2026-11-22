'use strict';

const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const { QrSession } = require('../models');

/**
 * Generate a new QR session token and QR code image
 * @param {number} userId - Admin user ID creating the QR
 * @param {number} expiryMinutes - Minutes until QR expires (default 5)
 * @returns {object} { token, qrDataUrl, expiresAt, sessionId }
 */
async function generateQrSession(userId, expiryMinutes = 5) {
  const transaction = await QrSession.sequelize.transaction();
  try {
    // Deactivate all existing active QR sessions
    await QrSession.update(
      { is_active: false },
      { where: { is_active: true }, transaction }
    );

    // Generate unique token
    const token = uuidv4();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    // Create new session
    const session = await QrSession.create({
      token,
      expires_at: expiresAt,
      is_active: true,
      created_by: userId
    }, { transaction });

    // Generate QR code as data URL
    const qrPayload = JSON.stringify({
      token,
      type: 'school-ams-attendance',
      expires: expiresAt.toISOString()
    });

    const qrDataUrl = await QRCode.toDataURL(qrPayload, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 300,
      color: { dark: '#000000', light: '#ffffff' }
    });

    await transaction.commit();

    return {
      sessionId: session.id,
      token,
      qrDataUrl,
      expiresAt
    };
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

/**
 * Verify a QR token and return the session if valid
 * @param {string} token - QR token to verify
 * @returns {object|null} QrSession or null if invalid/expired
 */
async function verifyQrToken(token) {
  const session = await QrSession.findOne({
    where: { token, is_active: true }
  });

  if (!session) return null;

  // Check expiry
  if (new Date() > new Date(session.expires_at)) {
    await session.update({ is_active: false });
    return null;
  }

  return session;
}

/**
 * Get the current active QR session
 * @returns {object|null} Active QrSession or null
 */
async function getActiveQrSession() {
  const session = await QrSession.findOne({
    where: { is_active: true },
    order: [['created_at', 'DESC']]
  });

  if (!session) return null;

  // Check if expired
  if (new Date() > new Date(session.expires_at)) {
    await session.update({ is_active: false });
    return null;
  }

  return session;
}

module.exports = { generateQrSession, verifyQrToken, getActiveQrSession };
