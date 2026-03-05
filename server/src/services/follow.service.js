import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import notificationService from "./notification.service.js";
import realtimeService from "./realtime.service.js";

/**
 * Toggles a follow relationship between two users.
 * Creates a notification for the target user when followed.
 *
 * @param {string} followerId
 * @param {string} username
 * @returns {object} - { following: boolean, followerCount: number }
 */
const toggleFollow = async (followerId, username) => {
  const targetUser = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!targetUser) {
    throw new AppError("User not found", 404);
  }

  if (targetUser.id === followerId) {
    throw new AppError("You cannot follow yourself", 400);
  }

  const followingId = targetUser.id;

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  let following;

  if (existingFollow) {
    await prisma.follow.delete({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });
    following = false;
  } else {
    await prisma.follow.create({
      data: { followerId, followingId },
    });
    following = true;

    // Create a notification for the user being followed
    const notification = await notificationService.createNotification({
      type: "FOLLOW",
      recipientId: followingId,
      senderId: followerId,
    });

    if (notification) {
      await realtimeService.broadcastNotification(notification);
    }
  }

  const followerCount = await prisma.follow.count({
    where: { followingId },
  });

  return { following, followerCount };
};

/**
 * Returns a paginated list of followers for a user.
 *
 * @param {string} username
 * @param {string|null} viewerId
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { users, nextCursor }
 */
const getFollowers = async (username, viewerId, { cursor, limit = 20 } = {}) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const take = Math.min(Number(limit), 50);

  const follows = await prisma.follow.findMany({
    where: { followingId: user.id },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      follower: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          bio: true,
          _count: {
            select: { followers: true },
          },
        },
      },
    },
  });

  const hasNextPage = follows.length > take;
  const trimmed = hasNextPage ? follows.slice(0, take) : follows;
  const nextCursor = hasNextPage ? trimmed[trimmed.length - 1].id : null;

  let followingIds = new Set();

  if (viewerId) {
    const viewerFollows = await prisma.follow.findMany({
      where: {
        followerId: viewerId,
        followingId: { in: trimmed.map((f) => f.follower.id) },
      },
      select: { followingId: true },
    });
    followingIds = new Set(viewerFollows.map((f) => f.followingId));
  }

  const users = trimmed.map((f) => ({
    ...f.follower,
    followerCount: f.follower._count.followers,
    isFollowing: followingIds.has(f.follower.id),
    followedAt: f.createdAt,
  }));

  return { users, nextCursor };
};

/**
 * Returns a paginated list of users that a given user follows.
 *
 * @param {string} username
 * @param {string|null} viewerId
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { users, nextCursor }
 */
const getFollowing = async (username, viewerId, { cursor, limit = 20 } = {}) => {
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const take = Math.min(Number(limit), 50);

  const follows = await prisma.follow.findMany({
    where: { followerId: user.id },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
      following: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          bio: true,
          _count: {
            select: { followers: true },
          },
        },
      },
    },
  });

  const hasNextPage = follows.length > take;
  const trimmed = hasNextPage ? follows.slice(0, take) : follows;
  const nextCursor = hasNextPage ? trimmed[trimmed.length - 1].id : null;

  let followingIds = new Set();

  if (viewerId) {
    const viewerFollows = await prisma.follow.findMany({
      where: {
        followerId: viewerId,
        followingId: { in: trimmed.map((f) => f.following.id) },
      },
      select: { followingId: true },
    });
    followingIds = new Set(viewerFollows.map((f) => f.followingId));
  }

  const users = trimmed.map((f) => ({
    ...f.following,
    followerCount: f.following._count.followers,
    isFollowing: followingIds.has(f.following.id),
    followedAt: f.createdAt,
  }));

  return { users, nextCursor };
};

/**
 * Returns suggested users to follow.
 *
 * @param {string} userId
 * @param {number} limit
 * @returns {array} - Array of users
 */
const getSuggestedUsers = async (userId, limit = 5) => {
  const alreadyFollowing = await prisma.follow.findMany({
    where: { followerId: userId },
    select: { followingId: true },
  });

  const excludeIds = [
    userId,
    ...alreadyFollowing.map((f) => f.followingId),
  ];

  const users = await prisma.user.findMany({
    where: {
      id: { notIn: excludeIds },
    },
    take: limit,
    orderBy: {
      followers: { _count: "desc" },
    },
    select: {
      id: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      _count: {
        select: { followers: true },
      },
    },
  });

  return users.map((user) => ({
    ...user,
    followerCount: user._count.followers,
    isFollowing: false,
  }));
};

/**
 * Checks if a user follows another user.
 *
 * @param {string} followerId
 * @param {string} followingId
 * @returns {boolean}
 */
const isFollowing = async (followerId, followingId) => {
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: { followerId, followingId },
    },
  });

  return !!follow;
};

export default {
  toggleFollow,
  getFollowers,
  getFollowing,
  getSuggestedUsers,
  isFollowing,
};