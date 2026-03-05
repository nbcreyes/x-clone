import followService from "../services/follow.service.js";
import realtimeService from "../services/realtime.service.js";
import prisma from "../lib/prisma.js";

/**
 * POST /api/follows/:username
 * Toggles a follow and broadcasts the update to the target user.
 */
const toggleFollow = async (req, res, next) => {
  try {
    const { username } = req.params;
    const result = await followService.toggleFollow(req.user.id, username);

    // Get the target user ID so we can send them the real-time event
    const targetUser = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });

    // Notify the user who was followed or unfollowed
    await realtimeService.broadcastFollowToggled(
      req.user.id,
      targetUser.id,
      result.following,
      result.followerCount
    );

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