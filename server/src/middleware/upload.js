import multer from "multer";
import { AppError } from "./errorHandler.js";

// Store files in memory as buffers.
// We never write to disk — files go straight from the request
// buffer to Cloudinary via the upload stream.
const storage = multer.memoryStorage();

/**
 * File filter that only allows image files.
 * Rejects non-image files before they are even buffered.
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // accept the file
  } else {
    cb(
      new AppError(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
        400
      ),
      false // reject the file
    );
  }
};

// Configure multer with memory storage and file filter
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // only one file at a time
  },
});

export default upload;