import likeService from "../services/like.service.js";

/**
 * POST /api/likes/:postId
 * Toggles a like on a post.
 * Returns the new like state and updated count.
 */
const toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const result = await likeService.toggleLike(req.user.id, postId);

    res.json({
      success: true,
      message: result.liked ? "Post liked" : "Post unliked",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/likes/:postId
 * Returns a list of users who liked a post.
 */
const getPostLikes = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const users = await likeService.getPostLikes(postId);

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

export default { toggleLike, getPostLikes };