'use strict';

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(__dirname, '..', 'uploads');

// Subdirectories mapped by upload category
const SUBDIRS = {
  photo: 'profiles',
  document: 'documents',
  school_logo: 'logos',
  misc: 'misc'
};

// Ensure base upload directory and category subdirectories exist safely
const ensureUploadDirs = () => {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    Object.values(SUBDIRS).forEach(sub => {
      const dirPath = path.join(uploadDir, sub);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    });
  } catch (err) {
    console.warn('⚠️ Could not pre-create upload directories (may be on read-only serverless filesystem):', err.message);
  }
};
ensureUploadDirs();

/**
 * Helper to generate disk storage for a specific category subdirectory
 */
const createDiskStorage = (subDirKey) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const sub = SUBDIRS[subDirKey] || SUBDIRS.misc;
      const targetDir = path.join(uploadDir, sub);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const safeExt = path.extname(file.originalname).toLowerCase();
      // Clean prefix from fieldname or subDirKey
      const prefix = (file.fieldname || subDirKey).replace(/[^a-zA-Z0-9_-]/g, '');
      cb(null, `${prefix}-${uniqueSuffix}${safeExt}`);
    }
  });
};

/**
 * Image mime and extension validator (JPEG, PNG, WEBP, GIF)
 */
const imageMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

const imageFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (imageExtensions.includes(ext) && imageMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid image format. Allowed formats: JPEG, PNG, WEBP, GIF.');
    error.statusCode = 400;
    cb(error, false);
  }
};

/**
 * Document mime and extension validator (PDF, DOC, DOCX, JPEG, PNG)
 */
const documentMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png'
];
const documentExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'];

const documentFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype.toLowerCase();

  if (documentExtensions.includes(ext) && documentMimeTypes.includes(mime)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid document format. Allowed formats: PDF, DOC, DOCX, JPEG, PNG.');
    error.statusCode = 400;
    cb(error, false);
  }
};

// Size limits: 5MB for photos/documents, 2MB for logos
const MAX_IMAGE_SIZE = parseInt(process.env.MAX_IMAGE_SIZE, 10) || 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = parseInt(process.env.MAX_DOCUMENT_SIZE, 10) || 10 * 1024 * 1024; // 10MB
const MAX_LOGO_SIZE = parseInt(process.env.MAX_LOGO_SIZE, 10) || 2 * 1024 * 1024; // 2MB

// Base instances
const photoUpload = multer({
  storage: createDiskStorage('photo'),
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: imageFileFilter
});

const documentUpload = multer({
  storage: createDiskStorage('document'),
  limits: { fileSize: MAX_DOCUMENT_SIZE },
  fileFilter: documentFileFilter
});

const logoUpload = multer({
  storage: createDiskStorage('school_logo'),
  limits: { fileSize: MAX_LOGO_SIZE },
  fileFilter: imageFileFilter
});

/**
 * Route-specific multer middlewares:
 * - uploadTeacherPhoto: accepts single file under 'photo' (or 'profile_image')
 * - uploadLeaveDocument: accepts single file under 'document'
 * - uploadSchoolLogo: accepts single file under 'school_logo' (or 'logo')
 */
const uploadTeacherPhoto = (req, res, next) => {
  const upload = photoUpload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'profile_image', maxCount: 1 }
  ]);

  upload(req, res, (err) => {
    if (err) return next(err);
    // Normalize req.file from fields
    if (req.files) {
      if (req.files.photo && req.files.photo[0]) {
        req.file = req.files.photo[0];
      } else if (req.files.profile_image && req.files.profile_image[0]) {
        req.file = req.files.profile_image[0];
      }
    }
    next();
  });
};

const uploadLeaveDocument = (req, res, next) => {
  const upload = documentUpload.fields([
    { name: 'document', maxCount: 1 }
  ]);

  upload(req, res, (err) => {
    if (err) return next(err);
    if (req.files && req.files.document && req.files.document[0]) {
      req.file = req.files.document[0];
    }
    next();
  });
};

const uploadSchoolLogo = (req, res, next) => {
  const upload = logoUpload.fields([
    { name: 'school_logo', maxCount: 1 },
    { name: 'logo', maxCount: 1 }
  ]);

  upload(req, res, (err) => {
    if (err) return next(err);
    if (req.files) {
      if (req.files.school_logo && req.files.school_logo[0]) {
        req.file = req.files.school_logo[0];
      } else if (req.files.logo && req.files.logo[0]) {
        req.file = req.files.logo[0];
      }
    }
    next();
  });
};

module.exports = {
  uploadTeacherPhoto,
  uploadLeaveDocument,
  uploadSchoolLogo
};
