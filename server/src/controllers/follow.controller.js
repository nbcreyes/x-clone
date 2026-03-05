import followService from "../services/follow.service.js";

/**
 * POST /api/follows/:username
 * Toggles a follow on a user.
 * Returns the new follow state and updated follower count.
 */
const toggleFollow = async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await followService.toggleFollow(req.user.id, username);

    res.json({
      success: true,
      message: result.following
        ? `You are now following ${username}`
        : `You have unfollowed ${username}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/follows/:username/followers
 * Returns paginated list of followers for a user.
 */
const getFollowers = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { cursor, limit } = req.query;
    const viewerId = req.user?.id || null;

    const result = await followService.getFollowers(username, viewerId, {
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
 * GET /api/follows/:username/following
 * Returns paginated list of users a user follows.
 */
const getFollowing = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { cursor, limit } = req.query;
    const viewerId = req.user?.id || null;

    const result = await followService.getFollowing(username, viewerId, {
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
 * GET /api/follows/suggested
 * Returns a list of suggested users to follow.
 * Requires auth so we can exclude already-followed users.
 */
const getSuggestedUsers = async (req, res, next) => {
  try {
    const users = await followService.getSuggestedUsers(req.user.id);

    res.json({
      success: true,
      data: { users },
    });
  } catch (error) {
    next(error);
  }
};

export default { toggleFollow, getFollowers, getFollowing, getSuggestedUsers };