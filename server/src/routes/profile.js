import { Router } from "express";
import profileController from "../controllers/profile.controller.js";
import { requireAuth, optionalAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { updateProfileSchema } from "../lib/validators.js";

const router = Router();

// PATCH /api/profile - update own profile, requires auth
// Must be defined before /:username to avoid route conflicts
router.patch(
  "/",
  requireAuth,
  validate(updateProfileSchema),
  profileController.updateProfile
);

// GET /api/profile/:username - get a user profile, public
router.get("/:username", optionalAuth, profileController.getProfile);

// GET /api/profile/:username/likes - get liked posts, public
router.get(
  "/:username/likes",
  optionalAuth,
  profileController.getLikedPosts
);

// GET /api/profile/:username/retweets - get retweeted posts, public
router.get(
  "/:username/retweets",
  optionalAuth,
  profileController.getRetweetedPosts
);

export default router;