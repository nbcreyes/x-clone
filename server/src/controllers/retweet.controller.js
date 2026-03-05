import retweetService from "../services/retweet.service.js";

/**
 * POST /api/retweets/:postId
 * Toggles a retweet on a post.
 * Returns the new retweet state and updated count.
 */
const toggleRetweet = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const result = await retweetService.toggleRetweet(req.user.id, postId);

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