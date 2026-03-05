import uploadService from "../services/upload.service.js";
import prisma from "../lib/prisma.js";

/**
 * POST /api/upload/post-image
 * Uploads an image for a post.
 * Returns the URL to be stored with the post.
 */
const uploadPostImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const { url, publicId } = await uploadService.uploadImage(
      req.file.buffer,
      req.file.mimetype,
      "x-clone/posts"
    );

    res.json({
      success: true,
      message: "Image uploaded successfully",
      data: { url, publicId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/upload/avatar
 * Uploads a new avatar for the current user.
 * Updates the user's avatarUrl in the database.
 */
const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const { url, publicId } = await uploadService.uploadAvatar(
      req.file.buffer,
      req.file.mimetype
    );

    // Update the user's avatarUrl in the database
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { avatarUrl: url },
      select: {
        id: true,
        name: true,
        username: true,
        avatarUrl: true,
      },
    });

    res.json({
      success: true,
      message: "Avatar updated successfully",
      data: { user, publicId },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/upload/cover
 * Uploads a new cover photo for the current user.
 * Updates the user's coverUrl in the database.
 */
const uploadCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const { url, publicId } = await uploadService.uploadCover(
      req.file.buffer,
      req.file.mimetype
    );

    // Update the user's coverUrl in the database
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { coverUrl: url },
      select: {
        id: true,
        name: true,
        username: true,
        coverUrl: true,
      },
    });

    res.json({
      success: true,
      message: "Cover photo updated successfully",
      data: { user, publicId },
    });
  } catch (error) {
    next(error);
  }
};

export default { uploadPostImage, uploadAvatar, uploadCover };