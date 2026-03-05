import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

// Standard post select object reused across all queries.
// Keeps the shape of every post response consistent.
const postSelect = {
  id: true,
  content: true,
  imageUrl: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
    },
  },
  _count: {
    select: {
      likes: true,
      retweets: true,
      replies: true,
    },
  },
};

/**
 * Builds the isLiked and isRetweeted fields for a post or list of posts.
 * These fields tell the frontend whether the current user has
 * already liked or retweeted a given post.
 *
 * @param {object|array} posts - Single post or array of posts
 * @param {string|null} userId - Current user ID or null if not logged in
 * @returns {object|array} - Posts with isLiked and isRetweeted fields
 */
const attachUserInteractions = async (posts, userId) => {
  if (!userId) {
    // Not logged in — all interaction flags are false
    const addFlags = (post) => ({
      ...post,
      isLiked: false,
      isRetweeted: false,
    });
    return Array.isArray(posts) ? posts.map(addFlags) : addFlags(posts);
  }

  const isArray = Array.isArray(posts);
  const postsArray = isArray ? posts : [posts];
  const postIds = postsArray.map((p) => p.id);

  // Fetch all likes and retweets by this user for these posts in parallel
  const [likes, retweets] = await Promise.all([
    prisma.like.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
    prisma.retweet.findMany({
      where: { userId, postId: { in: postIds } },
      select: { postId: true },
    }),
  ]);

  const likedPostIds = new Set(likes.map((l) => l.postId));
  const retweetedPostIds = new Set(retweets.map((r) => r.postId));

  const withFlags = postsArray.map((post) => ({
    ...post,
    isLiked: likedPostIds.has(post.id),
    isRetweeted: retweetedPostIds.has(post.id),
  }));

  return isArray ? withFlags : withFlags[0];
};

/**
 * Creates a new post.
 *
 * @param {string} authorId
 * @param {object} data - { content, imageUrl? }
 * @returns {object} - The created post
 */
const createPost = async (authorId, { content, imageUrl }) => {
  const post = await prisma.post.create({
    data: {
      content,
      imageUrl: imageUrl || null,
      authorId,
    },
    select: postSelect,
  });

  return attachUserInteractions(post, authorId);
};

/**
 * Returns a paginated list of posts for the main feed.
 * Shows all posts ordered by newest first.
 * Cursor-based pagination is used for infinite scroll.
 *
 * @param {string|null} userId - Current user ID for interaction flags
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { posts, nextCursor }
 */
const getFeed = async (userId, { cursor, limit = 10 } = {}) => {
  const take = Math.min(Number(limit), 20); // cap at 20 per page

  const posts = await prisma.post.findMany({
    take: take + 1, // fetch one extra to determine if there is a next page
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1, // skip the cursor post itself
    }),
    orderBy: { createdAt: "desc" },
    select: postSelect,
  });

  // If we got more than take, there is a next page
  const hasNextPage = posts.length > take;
  const trimmedPosts = hasNextPage ? posts.slice(0, take) : posts;

  // The next cursor is the ID of the last post in the current page
  const nextCursor = hasNextPage ? trimmedPosts[trimmedPosts.length - 1].id : null;

  const postsWithFlags = await attachUserInteractions(trimmedPosts, userId);

  return { posts: postsWithFlags, nextCursor };
};

/**
 * Returns a paginated list of posts by a specific user.
 *
 * @param {string} username - The profile being viewed
 * @param {string|null} viewerId - Current logged in user ID
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { posts, nextCursor }
 */
const getPostsByUsername = async (username, viewerId, { cursor, limit = 10 } = {}) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const take = Math.min(Number(limit), 20);

  const posts = await prisma.post.findMany({
    where: { authorId: user.id },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: { createdAt: "desc" },
    select: postSelect,
  });

  const hasNextPage = posts.length > take;
  const trimmedPosts = hasNextPage ? posts.slice(0, take) : posts;
  const nextCursor = hasNextPage ? trimmedPosts[trimmedPosts.length - 1].id : null;

  const postsWithFlags = await attachUserInteractions(trimmedPosts, viewerId);

  return { posts: postsWithFlags, nextCursor };
};

/**
 * Returns a single post by ID with full interaction data.
 *
 * @param {string} postId
 * @param {string|null} userId
 * @returns {object} - The post
 */
const getPostById = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: postSelect,
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  return attachUserInteractions(post, userId);
};

/**
 * Deletes a post. Only the author can delete their own post.
 *
 * @param {string} postId
 * @param {string} userId - Must match the post's authorId
 */
const deletePost = async (postId, userId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (post.authorId !== userId) {
    throw new AppError("You are not authorized to delete this post", 403);
  }

  await prisma.post.delete({
    where: { id: postId },
  });
};

export default {
  createPost,
  getFeed,
  getPostsByUsername,
  getPostById,
  deletePost,
  attachUserInteractions,
  postSelect,
};