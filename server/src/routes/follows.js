import { Router } from "express";
import followController from "../controllers/follow.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";

const router = Router();

// GET /api/follows/suggested - get suggested users to follow
// Must be defined before /:username to avoid route conflicts
router.get("/suggested", requireAuth, followController.getSuggestedUsers);

// GET /api/follows/:username/followers - get followers list
router.get(
  "/:username/followers",
  optionalAuth,
  followController.getFollowers
);

// GET /api/follows/:username/following - get following list
router.get(
  "/:username/following",
  optionalAuth,
  followController.getFollowing
);

// POST /api/follows/:username - toggle follow, requires auth
router.post("/:username", requireAuth, followController.toggleFollow);

export default router;