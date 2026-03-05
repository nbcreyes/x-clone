import { Router } from "express";
import { generalLimiter } from "../middleware/rateLimiter.js";
import authRoutes from "./auth.js";
import postRoutes from "./posts.js";
import likeRoutes from "./likes.js";
import retweetRoutes from "./retweets.js";
import replyRoutes from "./replies.js";
import followRoutes from "./follows.js";
import notificationRoutes from "./notifications.js";
import searchRoutes from "./search.js";
import profileRoutes from "./profile.js";
import uploadRoutes from "./upload.js";

const router = Router();

router.use(generalLimiter);

router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

router.use("/auth", authRoutes);
router.use("/posts", postRoutes);
router.use("/likes", likeRoutes);
router.use("/retweets", retweetRoutes);
router.use("/replies", replyRoutes);
router.use("/follows", followRoutes);
router.use("/notifications", notificationRoutes);
router.use("/search", searchRoutes);
router.use("/profile", profileRoutes);
router.use("/upload", uploadRoutes);

export default router;