import retweetService from "../services/retweet.service.js";
import realtimeService from "../services/realtime.service.js";

/**
 * POST /api/retweets/:postId
 * Toggles a retweet and broadcasts the update to all connected clients.
 */
const toggleRetweet = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const result = await retweetService.toggleRetweet(req.user.id, postId);

    // Broadcast retweet toggle so all clients update the count in real time
    await realtimeService.broadcastRetweetToggled(
      postId,
      req.user.id,
      result.retweeted,
      result.retweetCount
    );

    res.json({
      success: true,
      message: result.retweeted ? "Post retweeted" : "Post un-retweeted",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/retweets/:postId
 * Returns a list of users who retweeted a post.
 */
const getPostRetweets = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const users = await retweetService.getPostRetweets(postId);

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

export default { toggleRetweet, getPostRetweets };