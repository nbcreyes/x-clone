import likeService from "../services/like.service.js";
import realtimeService from "../services/realtime.service.js";

/**
 * POST /api/likes/:postId
 * Toggles a like and broadcasts the update to all connected clients.
 */
const toggleLike = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const result = await likeService.toggleLike(req.user.id, postId);

    // Broadcast like toggle so all clients update the count in real time
    await realtimeService.broadcastLikeToggled(
      postId,
      req.user.id,
      result.liked,
      result.likeCount
    );

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