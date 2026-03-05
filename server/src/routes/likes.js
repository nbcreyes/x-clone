import { Router } from "express";
import likeController from "../controllers/like.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/likes/:postId - toggle like, requires auth
router.post("/:postId", requireAuth, likeController.toggleLike);

// GET /api/likes/:postId - get users who liked a post, public
router.get("/:postId", likeController.getPostLikes);

export default router;