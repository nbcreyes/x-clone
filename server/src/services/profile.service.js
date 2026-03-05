import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Returns a full user profile by username.
 * Includes follower and following counts, post count,
 * and whether the viewer follows this user.
 *
 * @param {string} username
 * @param {string|null} viewerId - Current logged in user ID
 * @returns {object} - The full profile object
 */
const getProfileByUsername = async (username, viewerId) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      location: true,
      website: true,
      avatarUrl: true,
      coverUrl: true,
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

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // Check if the viewer follows this profile
  let isFollowing = false;
  let isOwnProfile = false;

  if (viewerId) {
    isOwnProfile = viewerId === user.id;

    if (!isOwnProfile) {
      const follow = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: viewerId,
            followingId: user.id,
          },
        },
      });
      isFollowing = !!follow;
    }
  }

  return {
    ...user,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    postCount: user._count.posts,
    isFollowing,
    isOwnProfile,
  };
};

/**
 * Updates the current user's profile.
 * Only updates fields that are provided in the data object.
 *
 * @param {string} userId
 * @param {object} data - { name?, bio?, location?, website?, avatarUrl?, coverUrl? }
 * @returns {object} - The updated profile
 */
const updateProfile = async (userId, data) => {
  // Build the update object with only the provided fields
  // This prevents accidentally clearing fields that were not included
  const updateData = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.bio !== undefined) updateData.bio = data.bio;
  if (data.location !== undefined) updateData.location = data.location;
  if (data.website !== undefined) updateData.website = data.website || null;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
  if (data.coverUrl !== undefined) updateData.coverUrl = data.coverUrl;

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      location: true,
      website: true,
      avatarUrl: true,
      coverUrl: true,
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

  return {
    ...user,
    followerCount: user._count.followers,
    followingCount: user._count.following,
    postCount: user._count.posts,
    isOwnProfile: true,
    isFollowing: false,
  };
};

/**
 * Returns the posts that a user has liked.
 * Used for the likes tab on the profile page.
 *
 * @param {string} username
 * @param {string|null} viewerId
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { posts, nextCursor }
 */
const getLikedPosts = async (username, viewerId, { cursor, limit = 10 } = {}) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const take = Math.min(Number(limit), 20);

  const likes = await prisma.like.findMany({
    where: { userId: user.id },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      post: {
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
      },
    },
  });

  const hasNextPage = likes.length > take;
  const trimmed = hasNextPage ? likes.slice(0, take) : likes;
  const nextCursor = hasNextPage ? trimmed[trimmed.length - 1].id : null;

  // Attach interaction flags for the viewer
  let likedPostIds = new Set();
  let retweetedPostIds = new Set();

  if (viewerId) {
    const postIds = trimmed.map((l) => l.post.id);

    const [viewerLikes, viewerRetweets] = await Promise.all([
      prisma.like.findMany({
        where: { userId: viewerId, postId: { in: postIds } },
        select: { postId: true },
      }),
      prisma.retweet.findMany({
        where: { userId: viewerId, postId: { in: postIds } },
        select: { postId: true },
      }),
    ]);

    likedPostIds = new Set(viewerLikes.map((l) => l.postId));
    retweetedPostIds = new Set(viewerRetweets.map((r) => r.postId));
  }

  const posts = trimmed.map((like) => ({
    ...like.post,
    isLiked: likedPostIds.has(like.post.id),
    isRetweeted: retweetedPostIds.has(like.post.id),
  }));

  return { posts, nextCursor };
};

/**
 * Returns the posts that a user has retweeted.
 * Used for the retweets tab on the profile page.
 *
 * @param {string} username
 * @param {string|null} viewerId
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { posts, nextCursor }
 */
const getRetweetedPosts = async (
  username,
  viewerId,
  { cursor, limit = 10 } = {}
) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const take = Math.min(Number(limit), 20);

  const retweets = await prisma.retweet.findMany({
    where: { userId: user.id },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      post: {
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
      },
    },
  });

  const hasNextPage = retweets.length > take;
  const trimmed = hasNextPage ? retweets.slice(0, take) : retweets;
  const nextCursor = hasNextPage ? trimmed[trimmed.length - 1].id : null;

  // Attach interaction flags for the viewer
  let likedPostIds = new Set();
  let retweetedPostIds = new Set();

  if (viewerId) {
    const postIds = trimmed.map((r) => r.post.id);

    const [viewerLikes, viewerRetweets] = await Promise.all([
      prisma.like.findMany({
        where: { userId: viewerId, postId: { in: postIds } },
        select: { postId: true },
      }),
      prisma.retweet.findMany({
        where: { userId: viewerId, postId: { in: postIds } },
        select: { postId: true },
      }),
    ]);

    likedPostIds = new Set(viewerLikes.map((l) => l.postId));
    retweetedPostIds = new Set(viewerRetweets.map((r) => r.postId));
  }

  const posts = trimmed.map((retweet) => ({
    ...retweet.post,
    isLiked: likedPostIds.has(retweet.post.id),
    isRetweeted: retweetedPostIds.has(retweet.post.id),
  }));

  return { posts, nextCursor };
};

export default {
  getProfileByUsername,
  updateProfile,
  getLikedPosts,
  getRetweetedPosts,
};