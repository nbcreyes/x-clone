import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";

/**
 * Toggles a like on a post.
 * If the user has already liked the post, the like is removed.
 * If the user has not liked the post, the like is added.
 * This toggle pattern avoids needing separate like/unlike endpoints.
 *
 * @param {string} userId
 * @param {string} postId
 * @returns {object} - { liked: boolean, likeCount: number }
 */
const toggleLike = async (userId, postId) => {
  // Verify the post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  // Check if the like already exists
  const existingLike = await prisma.like.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });

  let liked;

  if (existingLike) {
    // Unlike - remove the like record
    await prisma.like.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });
    liked = false;
  } else {
    // Like - create the like record
    await prisma.like.create({
      data: { userId, postId },
    });
    liked = true;
  }

  // Get the updated like count
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