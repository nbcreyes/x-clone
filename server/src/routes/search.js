import { Router } from "express";
import searchController from "../controllers/search.controller.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

// All search routes use optionalAuth so logged-in users get
// interaction flags (isLiked, isFollowing) in results

// GET /api/search?q=query - combined search (users + posts)
router.get("/", optionalAuth, searchController.searchAll);

// GET /api/search/users?q=query - search users only
router.get("/users", optionalAuth, searchController.searchUsers);

// GET /api/search/posts?q=query - search posts only
router.get("/posts", optionalAuth, searchController.searchPosts);

export default router;