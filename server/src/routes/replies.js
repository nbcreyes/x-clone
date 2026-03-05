import { Router } from "express";
import replyController from "../controllers/reply.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { postLimiter } from "../middleware/rateLimiter.js";
import { createReplySchema } from "../lib/validators.js";

const router = Router();

// GET /api/replies/nested/:replyId - get nested replies for a reply
// This must be defined before /:postId to avoid route conflicts
router.get("/nested/:replyId", replyController.getRepliesForReply);

// GET /api/replies/:postId/thread - get full thread for a post
router.get("/:postId/thread", replyController.getThread);

// GET /api/replies/:postId - get top-level replies for a post
router.get("/:postId", replyController.getRepliesForPost);

// POST /api/replies/:postId - create a reply, requires auth
router.post(
  "/:postId",
  requireAuth,
  postLimiter,
  validate(createReplySchema),
  replyController.createReply
);

// DELETE /api/replies/:postId/:replyId - delete a reply, requires auth
router.delete("/:postId/:replyId", requireAuth, replyController.deleteReply);

export default router;