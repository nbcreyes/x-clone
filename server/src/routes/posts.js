import { Router } from "express";
import postController from "../controllers/post.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { postLimiter } from "../middleware/rateLimiter.js";
import { createPostSchema } from "../lib/validators.js";

const router = Router();

// GET /api/posts/feed - public but interaction flags need auth
router.get("/feed", optionalAuth, postController.getFeed);

// GET /api/posts/user/:username - public
router.get("/user/:username", optionalAuth, postController.getPostsByUsername);

// GET /api/posts/:id - public
router.get("/:id", optionalAuth, postController.getPostById);

// POST /api/posts - requires auth
router.post(
  "/",
  requireAuth,
  postLimiter,
  validate(createPostSchema),
  postController.createPost
);

// DELETE /api/posts/:id - requires auth
router.delete("/:id", requireAuth, postController.deletePost);

export default router;