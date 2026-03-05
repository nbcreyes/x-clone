import prisma from "../lib/prisma.js";
import { AppError } from "../middleware/errorHandler.js";
import notificationService from "./notification.service.js";
import realtimeService from "./realtime.service.js";

// Standard reply select object reused across all queries
const replySelect = {
  id: true,
  content: true,
  imageUrl: true,
  postId: true,
  parentId: true,
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
      children: true,
    },
  },
};

/**
 * Creates a reply to a post or to another reply.
 * Sends a notification to the post author or parent reply author.
 *
 * @param {string} authorId
 * @param {string} postId
 * @param {object} data - { content, imageUrl?, parentId? }
 * @returns {object} - The created reply
 */
const createReply = async (authorId, postId, { content, imageUrl, parentId }) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, authorId: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  if (parentId) {
    const parentReply = await prisma.reply.findUnique({
      where: { id: parentId },
      select: { id: true, postId: true },
    });

    if (!parentReply) {
      throw new AppError("Parent reply not found", 404);
    }

    if (parentReply.postId !== postId) {
      throw new AppError("Parent reply does not belong to this post", 400);
    }
  }

  const reply = await prisma.reply.create({
    data: {
      content,
      imageUrl: imageUrl || null,
      authorId,
      postId,
      parentId: parentId || null,
    },
    select: replySelect,
  });

  // Notify the post author that someone replied to their post
  const notification = await notificationService.createNotification({
    type: "REPLY",
    recipientId: post.authorId,
    senderId: authorId,
    postId,
    replyId: reply.id,
  });

  if (notification) {
    await realtimeService.broadcastNotification(notification);
  }

  return reply;
};

/**
 * Returns paginated top-level replies for a post.
 *
 * @param {string} postId
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { replies, nextCursor }
 */
const getRepliesForPost = async (postId, { cursor, limit = 10 } = {}) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const take = Math.min(Number(limit), 20);

  const replies = await prisma.reply.findMany({
    where: { postId, parentId: null },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: { createdAt: "desc" },
    select: replySelect,
  });

  const hasNextPage = replies.length > take;
  const trimmedReplies = hasNextPage ? replies.slice(0, take) : replies;
  const nextCursor = hasNextPage
    ? trimmedReplies[trimmedReplies.length - 1].id
    : null;

  return { replies: trimmedReplies, nextCursor };
};

/**
 * Returns nested replies for a specific reply.
 *
 * @param {string} replyId
 * @param {object} options - { cursor?, limit? }
 * @returns {object} - { replies, nextCursor }
 */
const getRepliesForReply = async (replyId, { cursor, limit = 10 } = {}) => {
  const parentReply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: { id: true },
  });

  if (!parentReply) {
    throw new AppError("Reply not found", 404);
  }

  const take = Math.min(Number(limit), 20);

  const replies = await prisma.reply.findMany({
    where: { parentId: replyId },
    take: take + 1,
    ...(cursor && {
      cursor: { id: cursor },
      skip: 1,
    }),
    orderBy: { createdAt: "asc" },
    select: replySelect,
  });

  const hasNextPage = replies.length > take;
  const trimmedReplies = hasNextPage ? replies.slice(0, take) : replies;
  const nextCursor = hasNextPage
    ? trimmedReplies[trimmedReplies.length - 1].id
    : null;

  return { replies: trimmedReplies, nextCursor };
};

/**
 * Returns a single reply by ID.
 *
 * @param {string} replyId
 * @returns {object} - The reply
 */
const getReplyById = async (replyId) => {
  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: replySelect,
  });

  if (!reply) {
    throw new AppError("Reply not found", 404);
  }

  return reply;
};

/**
 * Deletes a reply. Only the author can delete their own reply.
 *
 * @param {string} replyId
 * @param {string} userId
 */
const deleteReply = async (replyId, userId) => {
  const reply = await prisma.reply.findUnique({
    where: { id: replyId },
    select: { authorId: true },
  });

  if (!reply) {
    throw new AppError("Reply not found", 404);
  }

  if (reply.authorId !== userId) {
    throw new AppError("You are not authorized to delete this reply", 403);
  }

  await prisma.reply.delete({
    where: { id: replyId },
  });
};

/**
 * Returns a full thread view for a post.
 *
 * @param {string} postId
 * @returns {object} - { post, replies }
 */
const getThread = async (postId) => {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      content: true,
      imageUrl: true,
      createdAt: true,
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

  if (!post) {
    throw new AppError("Post not found", 404);
  }

  const replies = await prisma.reply.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    select: {
      ...replySelect,
      children: {
        take: 3,
        orderBy: { createdAt: "asc" },
        select: replySelect,
      },
    },
  });

  return { post, replies };
};

export default {
  createReply,
  getRepliesForPost,
  getRepliesForReply,
  getReplyById,
  deleteReply,
  getThread,
};