import prisma from "../lib/prisma.js";

/**
 * Searches for users by username or name.
 * Uses a case-insensitive contains search.
 * Returns users ordered by follower count descending so the most
 * relevant results appear first.
 *
 * @param {string} query - The search term
 * @param {string|null} viewerId - Current logged in user for isFollowing flag
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { users, nextCursor }
 */
const searchUsers = async (query, viewerId, { cursor, limit = 20 } = {}) => {
  if (!query || query.trim().length === 0) {
    return { users: [], nextCursor: null };
  }

  const trimmedQuery = query.trim();
  const take = Math.min(Number(limit), 50);

  const users = await prisma.user.findMany({
    where: {
      OR: [
        {
          username: {
            contains: trimmedQuery,
            mode: "insensitive",
          },
        },
        {
          name: {
            contains: trimmedQuery,
            mode: "insensitive",
          },
        },
      ],
    },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: {
      followers: { _count: "desc" },
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      createdAt: true,
      _count: {
        select: {
          followers: true,
          following: true,
          posts: true,
        },
      },
    },
  });

  const hasNextPage = users.length > take;
  const trimmed = hasNextPage ? users.slice(0, take) : users;
  const nextCursor = hasNextPage ? trimmed[trimmed.length - 1].id : null;

  // Attach isFollowing flag for each user in the results
  let followingIds = new Set();

  if (viewerId) {
    const viewerFollows = await prisma.follow.findMany({
      where: {
        followerId: viewerId,
        followingId: { in: trimmed.map((u) => u.id) },
      },
      select: { followingId: true },
    });
    followingIds = new Set(viewerFollows.map((f) => f.followingId));
  }

  const usersWithFlags = trimmed.map((user) => ({
    ...user,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    postCount: user._count.posts,
    isFollowing: followingIds.has(user.id),
  }));

  return { users: usersWithFlags, nextCursor };
};

/**
 * Searches for posts by content.
 * Uses a case-insensitive contains search.
 * Returns posts ordered by newest first.
 *
 * @param {string} query - The search term
 * @param {string|null} userId - Current logged in user for interaction flags
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { posts, nextCursor }
 */
const searchPosts = async (query, userId, { cursor, limit = 20 } = {}) => {
  if (!query || query.trim().length === 0) {
    return { posts: [], nextCursor: null };
  }

  const trimmedQuery = query.trim();
  const take = Math.min(Number(limit), 50);

  const posts = await prisma.post.findMany({
    where: {
      content: {
        contains: trimmedQuery,
        mode: "insensitive",
      },
    },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: { createdAt: "desc" },
    select: {
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
    },
  });

  const hasNextPage = posts.length > take;
  const trimmedPosts = hasNextPage ? posts.slice(0, take) : posts;
  const nextCursor = hasNextPage
    ? trimmedPosts[trimmedPosts.length - 1].id
    : null;

  // Attach isLiked and isRetweeted flags
  let likedPostIds = new Set();
  let retweetedPostIds = new Set();

  if (userId) {
    const postIds = trimmedPosts.map((p) => p.id);

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

    likedPostIds = new Set(likes.map((l) => l.postId));
    retweetedPostIds = new Set(retweets.map((r) => r.postId));
  }

  const postsWithFlags = trimmedPosts.map((post) => ({
    ...post,
    isLiked: likedPostIds.has(post.id),
    isRetweeted: retweetedPostIds.has(post.id),
  }));

  return { posts: postsWithFlags, nextCursor };
};

/**
 * Combined search that returns both users and posts.
 * Used for the main search bar results dropdown.
 * Returns a limited set of each to keep the response fast.
 *
 * @param {string} query
 * @param {string|null} userId
 * @returns {object} - { users, posts }
 */
const searchAll = async (query, userId) => {
  if (!query || query.trim().length === 0) {
    return { users: [], posts: [] };
  }

  // Run both searches in parallel with a small limit for the dropdown
  const [usersResult, postsResult] = await Promise.all([
    searchUsers(query, userId, { limit: 5 }),
    searchPosts(query, userId, { limit: 5 }),
  ]);

  return {
    users: usersResult.users,
    posts: postsResult.posts,
  };
};

export default { searchUsers, searchPosts, searchAll };