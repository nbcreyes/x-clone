import searchService from "../services/search.service.js";

/**
 * GET /api/search/users?q=query
 * Searches for users by username or name.
 * Supports pagination via cursor.
 */
const searchUsers = async (req, res, next) => {
  try {
    const { q, cursor, limit } = req.query;
    const viewerId = req.user?.id || null;

    if (!q) {
      return res.json({
        success: true,
        data: { users: [], nextCursor: null },
      });
    }

    const result = await searchService.searchUsers(q, viewerId, {
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
 * GET /api/search/posts?q=query
 * Searches for posts by content.
 * Supports pagination via cursor.
 */
const searchPosts = async (req, res, next) => {
  try {
    const { q, cursor, limit } = req.query;
    const userId = req.user?.id || null;

    if (!q) {
      return res.json({
        success: true,
        data: { posts: [], nextCursor: null },
      });
    }

    const result = await searchService.searchPosts(q, userId, {
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
 * GET /api/search?q=query
 * Combined search returning both users and posts.
 * Used for the search bar dropdown.
 */
const searchAll = async (req, res, next) => {
  try {
    const { q } = req.query;
    const userId = req.user?.id || null;

    if (!q) {
      return res.json({
        success: true,
        data: { users: [], posts: [] },
      });
    }

    const result = await searchService.searchAll(q, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export default { searchUsers, searchPosts, searchAll };