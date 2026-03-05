import profileService from "../services/profile.service.js";

/**
 * GET /api/profile/:username
 * Returns a full user profile by username.
 */
const getProfile = async (req, res, next) => {
  try {
    const { username } = req.params;
    const viewerId = req.user?.id || null;

    const profile = await profileService.getProfileByUsername(
      username,
      viewerId
    );

    res.json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/profile
 * Updates the current user's profile.
 * Only updates fields that are included in the request body.
 */
const updateProfile = async (req, res, next) => {
  try {
    const profile = await profileService.updateProfile(req.user.id, req.body);

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/profile/:username/likes
 * Returns posts that a user has liked.
 */
const getLikedPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { cursor, limit } = req.query;
    const viewerId = req.user?.id || null;

    const result = await profileService.getLikedPosts(username, viewerId, {
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
 * GET /api/profile/:username/retweets
 * Returns posts that a user has retweeted.
 */
const getRetweetedPosts = async (req, res, next) => {
  try {
    const { username } = req.params;
    const { cursor, limit } = req.query;
    const viewerId = req.user?.id || null;

    const result = await profileService.getRetweetedPosts(username, viewerId, {
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

export default { getProfile, updateProfile, getLikedPosts, getRetweetedPosts };