import { publish } from "../lib/redisPubSub.js";
import { CHANNELS } from "../lib/socket.js";

/**
 * Publishes a new post event to all connected clients.
 * The frontend feed will prepend this post in real time.
 *
 * @param {object} post - The full post object
 */
const broadcastNewPost = async (post) => {
  await publish(CHANNELS.NEW_POST, { post });
};

/**
 * Publishes a delete post event to all connected clients.
 * The frontend feed will remove this post in real time.
 *
 * @param {string} postId
 */
const broadcastDeletePost = async (postId) => {
  await publish(CHANNELS.DELETE_POST, { postId });
};

/**
 * Publishes a like toggle event to all connected clients.
 * The frontend will update the like count and state in real time.
 *
 * @param {string} postId
 * @param {string} userId - The user who toggled the like
 * @param {boolean} liked - New like state
 * @param {number} likeCount - Updated like count
 */
const broadcastLikeToggled = async (postId, userId, liked, likeCount) => {
  await publish(CHANNELS.LIKE_TOGGLED, { postId, userId, liked, likeCount });
};

/**
 * Publishes a retweet toggle event to all connected clients.
 *
 * @param {string} postId
 * @param {string} userId - The user who toggled the retweet
 * @param {boolean} retweeted - New retweet state
 * @param {number} retweetCount - Updated retweet count
 */
const broadcastRetweetToggled = async (postId, userId, retweeted, retweetCount) => {
  await publish(CHANNELS.RETWEET_TOGGLED, {
    postId,
    userId,
    retweeted,
    retweetCount,
  });
};

/**
 * Publishes a new reply event to clients viewing the post.
 *
 * @param {object} reply - The full reply object
 */
const broadcastNewReply = async (reply) => {
  await publish(CHANNELS.NEW_REPLY, { postId: reply.postId, reply });
};

/**
 * Publishes a follow toggle event to the user being followed.
 *
 * @param {string} followerId - The user who followed
 * @param {string} followingId - The user who was followed
 * @param {boolean} following - New follow state
 * @param {number} followerCount - Updated follower count
 */
const broadcastFollowToggled = async (
  followerId,
  followingId,
  following,
  followerCount
) => {
  await publish(CHANNELS.FOLLOW_TOGGLED, {
    followerId,
    followingId,
    following,
    followerCount,
  });
};

/**
 * Publishes a new notification event to the recipient.
 *
 * @param {object} notification - The full notification object
 */
const broadcastNotification = async (notification) => {
  await publish(CHANNELS.NEW_NOTIFICATION, {
    recipientId: notification.recipientId,
    notification,
  });
};

export default {
  broadcastNewPost,
  broadcastDeletePost,
  broadcastLikeToggled,
  broadcastRetweetToggled,
  broadcastNewReply,
  broadcastFollowToggled,
  broadcastNotification,
};