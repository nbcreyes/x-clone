import { Router } from "express";
import authController from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { registerSchema, loginSchema } from "../lib/validators.js";

const router = Router();

// Apply the strict auth rate limiter to all auth routes
router.use(authLimiter);

// POST /api/auth/register
router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

// POST /api/auth/login
router.post(
  "/login",
  validate(loginSchema),
  authController.login
);

// POST /api/auth/logout
router.post(
  "/logout",
  requireAuth,
  authController.logout
);

// GET /api/auth/me
router.get(
  "/me",
  requireAuth,
  authController.getMe
);

export default router;