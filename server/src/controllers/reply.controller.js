import replyService from "../services/reply.service.js";
import realtimeService from "../services/realtime.service.js";

/**
 * POST /api/replies/:postId
 * Creates a reply and broadcasts it to clients viewing the post.
 */
const createReply = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const reply = await replyService.createReply(req.user.id, postId, req.body);

    // Broadcast to clients currently viewing this post
    await realtimeService.broadcastNewReply(reply);

    res.status(201).json({
      success: true,
      message: "Reply created successfully",
      data: { reply },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/replies/:postId
 * Returns paginated top-level replies for a post.
 */
const getRepliesForPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { cursor, limit } = req.query;

    const result = await replyService.getRepliesForPost(postId, {
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
 * GET /api/replies/:postId/thread
 * Returns the full thread view for a post.
 */
const getThread = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const result = await replyService.getThread(postId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/replies/nested/:replyId
 * Returns paginated nested replies for a specific reply.
 */
const getRepliesForReply = async (req, res, next) => {
  try {
    const { replyId } = req.params;
    const { cursor, limit } = req.query;

    const result = await replyService.getRepliesForReply(replyId, {
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
 * DELETE /api/replies/:postId/:replyId
 * Deletes a reply. Only the author can delete their own reply.
 */
const deleteReply = async (req, res, next) => {
  try {
    const { replyId } = req.params;
    await replyService.deleteReply(replyId, req.user.id);

    res.json({
      success: true,
      message: "Reply deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createReply,
  getRepliesForPost,
  getThread,
  getRepliesForReply,
  deleteReply,
};