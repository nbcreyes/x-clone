import { Router } from "express";
import uploadController from "../controllers/upload.controller.js";
import { requireAuth } from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = Router();

// All upload routes require auth
router.use(requireAuth);

// POST /api/upload/post-image - upload image for a post
router.post(
  "/post-image",
  upload.single("image"), // "image" is the form field name
  uploadController.uploadPostImage
);

// POST /api/upload/avatar - upload avatar for current user
router.post(
  "/avatar",
  upload.single("image"),
  uploadController.uploadAvatar
);

// POST /api/upload/cover - upload cover photo for current user
router.post(
  "/cover",
  upload.single("image"),
  uploadController.uploadCover
);

export default router;