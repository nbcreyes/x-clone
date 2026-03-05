import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import notificationService from "./notification.service.js";
import realtimeService from "./realtime.service.js";

/**
 * Toggles a like on a post.
 * Creates a notification for the post author when liked.
 * Removes the notification when unliked.
 *
 * @param {string} userId
 * @param {string} postId
 * @returns {object} - { liked: boolean, likeCount: number }
 */
const toggleLike = async (userId, postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  let liked;

  if (existingLike) {
    await prisma.like.delete({
      where: { userId_postId: { userId, postId } },
    });
    liked = false;
  } else {
    await prisma.like.create({
      data: { userId, postId },
    });
    liked = true;

    // Create a notification for the post author when someone likes their post
    const notification = await notificationService.createNotification({
      type: "LIKE",
      recipientId: post.authorId,
      senderId: userId,
      postId,
    });

    // Send real-time notification to the post author
    if (notification) {
      await realtimeService.broadcastNotification(notification);
    }
  }

  const likeCount = await prisma.like.count({
    where: { postId },
  });

  return { liked, likeCount };
};

/**
 * Returns a list of users who liked a post.
 *
 * @param {string} postId
 * @returns {array} - Array of users
 */
const getPostLikes = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const likes = await prisma.like.findMany({
    where: { postId },
    select: {
      user: {
        select: {
          id: true,
          name: true,
          username: true,
          avatarUrl: true,
          bio: true,
        },
      },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return likes.map((like) => ({
    ...like.user,
    likedAt: like.createdAt,
  }));
};

export default { toggleLike, getPostLikes };