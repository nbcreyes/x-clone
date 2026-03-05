import { Router } from "express";
import retweetController from "../controllers/retweet.controller.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// POST /api/retweets/:postId - toggle retweet, requires auth
router.post("/:postId", requireAuth, retweetController.toggleRetweet);

// GET /api/retweets/:postId - get users who retweeted a post, public
router.get("/:postId", retweetController.getPostRetweets);

export default router;