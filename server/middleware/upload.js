const multer = require('multer');
const path = require('path');
const AppError = require('../utils/AppError');
const config = require('../config');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.upload.path);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'video/mp4',
    'video/webm',
    'video/ogg',
    'audio/mpeg',
    'audio/wav',
    'application/zip',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('File type not supported. Allowed: images, PDFs, docs, videos, audio, zip.', 400), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: config.upload.maxFileSize },
  fileFilter,
});

const uploadToCloudinary = async (file) => {
  const cloudinary = require('cloudinary').v2;
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'futura-labs-ai-tutor-lms',
      resource_type: 'auto',
    });
    return { url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type };
  } catch (error) {
    throw new AppError('File upload to cloud failed', 500);
  }
};

module.exports = { upload, uploadToCloudinary };
