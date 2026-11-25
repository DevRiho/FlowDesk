import multer from 'multer';
import { AppError } from '../utils/appError.js';

// Multer memory storage holds the uploaded file in memory as a Buffer.
// This is optimal for cloud setups because we can stream directly to Cloudinary
// without writing temporary files to the local container disk.
const storage = multer.memoryStorage();

// File filter to safeguard against dangerous executable uploads
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        `Unsupported file format (${file.mimetype}). Allowed types: PDF, images, CSV, DOCX, ZIP.`,
        415
      ),
      false
    );
  }
};

// Limit uploads to 25MB per file
export const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter,
});

