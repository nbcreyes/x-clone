import cloudinary from "../lib/cloudinary.js";
import { AppError } from "../middleware/errorHandler.js";

// Allowed image MIME types
const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Uploads an image buffer to Cloudinary.
 * Validates file type and size before uploading.
 * Returns the secure URL and public ID of the uploaded image.
 *
 * @param {Buffer} fileBuffer - The file buffer from multer
 * @param {string} mimetype - The file MIME type
 * @param {string} folder - Cloudinary folder to upload to
 * @returns {object} - { url, publicId }
 */
const uploadImage = async (fileBuffer, mimetype, folder = "x-clone/posts") => {
  // Validate file type
  if (!ALLOWED_TYPES.includes(mimetype)) {
    throw new AppError(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
      400
    );
  }

  // Validate file size
  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new AppError("File size exceeds the 5MB limit.", 400);
  }

  // Upload to Cloudinary using a promise wrapper around the stream API
  // We use the stream API because multer gives us a buffer, not a file path
  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        // Auto-format and quality for optimal delivery
        transformation: [
          { quality: "auto", fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(new AppError(error.message, 500));
        else resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/**
 * Uploads an avatar image.
 * Applies a square crop transformation for consistent avatar display.
 *
 * @param {Buffer} fileBuffer
 * @param {string} mimetype
 * @returns {object} - { url, publicId }
 */
const uploadAvatar = async (fileBuffer, mimetype) => {
  if (!ALLOWED_TYPES.includes(mimetype)) {
    throw new AppError(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
      400
    );
  }

  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new AppError("File size exceeds the 5MB limit.", 400);
  }

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "x-clone/avatars",
        resource_type: "image",
        transformation: [
          // Crop to square and resize to 400x400 for avatars
          {
            width: 400,
            height: 400,
            crop: "fill",
            gravity: "face", // focus on face if detected
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) reject(new AppError(error.message, 500));
        else resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/**
 * Uploads a cover image.
 * Applies a wide crop transformation for consistent cover display.
 *
 * @param {Buffer} fileBuffer
 * @param {string} mimetype
 * @returns {object} - { url, publicId }
 */
const uploadCover = async (fileBuffer, mimetype) => {
  if (!ALLOWED_TYPES.includes(mimetype)) {
    throw new AppError(
      "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
      400
    );
  }

  if (fileBuffer.length > MAX_FILE_SIZE) {
    throw new AppError("File size exceeds the 5MB limit.", 400);
  }

  const result = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "x-clone/covers",
        resource_type: "image",
        transformation: [
          // Crop to banner dimensions for cover photos
          {
            width: 1500,
            height: 500,
            crop: "fill",
            gravity: "auto",
            quality: "auto",
            fetch_format: "auto",
          },
        ],
      },
      (error, result) => {
        if (error) reject(new AppError(error.message, 500));
        else resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

/**
 * Deletes an image from Cloudinary by its public ID.
 * Called when a user replaces their avatar or cover photo.
 *
 * @param {string} publicId - The Cloudinary public ID of the image
 */
const deleteImage = async (publicId) => {
  await cloudinary.uploader.destroy(publicId);
};

export default { uploadImage, uploadAvatar, uploadCover, deleteImage };