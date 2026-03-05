import postService from "../services/post.service.js";

/**
 * POST /api/posts
 * Creates a new post for the authenticated user.
 */
const createPost = async (req, res, next) => {
  try {
    const post = await postService.createPost(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/posts/feed
 * Returns the paginated main feed.
 * Supports cursor-based pagination via ?cursor=postId&limit=10
 */
const getFeed = async (req, res, next) => {
  try {
    const { cursor, limit } = req.query;
    const userId = req.user?.id || null;

    const result = await postService.getFeed(userId, { cursor, limit });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/posts/user/:username
 * Returns paginated posts by a specific user.
 */
const getPostsByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { cursor, limit } = req.query;
    const userId = req.user?.id || null;

    const result = await postService.getPostsByUsername(username, userId, {
      cursor,
      limit,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/posts/:id
 * Returns a single post by ID.
 */
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const post = await postService.getPostById(id, userId);

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/posts/:id
 * Deletes a post. Only the author can delete their own post.
 */
const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;

    await postService.deletePost(id, req.user.id);

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export default { createPost, getFeed, getPostsByUsername, getPostById, deletePost };