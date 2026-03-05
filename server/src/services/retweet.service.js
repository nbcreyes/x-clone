import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Toggles a retweet on a post.
 * If the user has already retweeted the post, the retweet is removed.
 * If the user has not retweeted the post, the retweet is added.
 *
 * @param {string} userId
 * @param {string} postId
 * @returns {object} - { retweeted: boolean, retweetCount: number }
 */
const toggleRetweet = async (userId, postId) => {
  // Verify the post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  // Check if the retweet already exists
  const existingRetweet = await prisma.retweet.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  let retweeted;

  if (existingRetweet) {
    // Un-retweet - remove the retweet record
    await prisma.retweet.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });
    retweeted = false;
  } else {
    // Retweet - create the retweet record
    await prisma.retweet.create({
      data: { userId, postId },
    });
    retweeted = true;
  }

  // Get the updated retweet count
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