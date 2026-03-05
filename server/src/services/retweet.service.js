import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import notificationService from "./notification.service.js";
import realtimeService from "./realtime.service.js";

/**
 * Toggles a retweet on a post.
 * Creates a notification for the post author when retweeted.
 *
 * @param {string} userId
 * @param {string} postId
 * @returns {object} - { retweeted: boolean, retweetCount: number }
 */
const toggleRetweet = async (userId, postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const existingRetweet = await prisma.retweet.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  let retweeted;

  if (existingRetweet) {
    await prisma.retweet.delete({
      where: { userId_postId: { userId, postId } },
    });
    retweeted = false;
  } else {
    await prisma.retweet.create({
      data: { userId, postId },
    });
    retweeted = true;

    // Create a notification for the post author when someone retweets their post
    const notification = await notificationService.createNotification({
      type: "RETWEET",
      recipientId: post.authorId,
      senderId: userId,
      postId,
    });

    // Send real-time notification to the post author
    if (notification) {
      await realtimeService.broadcastNotification(notification);
    }
  }

  const retweetCount = await prisma.retweet.count({
    where: { postId },
  });

  return { retweeted, retweetCount };
};

/**
 * Returns a list of users who retweeted a post.
 *
 * @param {string} postId
 * @returns {array} - Array of users
 */
const getPostRetweets = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const retweets = await prisma.retweet.findMany({
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

  return retweets.map((retweet) => ({
    ...retweet.user,
    retweetedAt: retweet.createdAt,
  }));
};

export default { toggleRetweet, getPostRetweets };