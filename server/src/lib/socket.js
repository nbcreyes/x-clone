import { Server } from "socket.io";
import { subscribe } from "./redisPubSub.js";
import dotenv from "dotenv";

dotenv.config();

// io instance stored here so other modules can emit events
let io;

// Redis channels used for pub/sub
export const CHANNELS = {
  NEW_POST: "new_post",
  DELETE_POST: "delete_post",
  LIKE_TOGGLED: "like_toggled",
  RETWEET_TOGGLED: "retweet_toggled",
  NEW_REPLY: "new_reply",
  FOLLOW_TOGGLED: "follow_toggled",
  NEW_NOTIFICATION: "new_notification",
};

/**
 * Attaches Socket.io to the HTTP server and sets up Redis subscriptions.
 * Called once during server startup in index.js.
 *
 * @param {import("http").Server} httpServer
 * @returns {import("socket.io").Server}
 */
const createServer = async (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Client sends their userId on connect so we can route
    // events to the correct socket room
    socket.on("join", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    // Client joins a post room to receive real-time reply updates
    socket.on("joinPost", (postId) => {
      socket.join(`post:${postId}`);
    });

    // Client leaves a post room when navigating away
    socket.on("leavePost", (postId) => {
      socket.leave(`post:${postId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  // Subscribe to Redis channels and broadcast to connected clients.
  // This is what makes real-time work across multiple server instances.
  // When any server publishes to Redis, all servers receive it and
  // broadcast to their connected clients.

  // New post - broadcast to all connected clients for the feed
  await subscribe(CHANNELS.NEW_POST, (data) => {
    io.emit("newPost", data);
  });

  // Deleted post - broadcast to all connected clients
  await subscribe(CHANNELS.DELETE_POST, (data) => {
    io.emit("deletePost", data);
  });

  // Like toggled - broadcast to all connected clients
  await subscribe(CHANNELS.LIKE_TOGGLED, (data) => {
    io.emit("likeToggled", data);
  });

  // Retweet toggled - broadcast to all connected clients
  await subscribe(CHANNELS.RETWEET_TOGGLED, (data) => {
    io.emit("retweetToggled", data);
  });

  // New reply - broadcast to clients viewing that post
  await subscribe(CHANNELS.NEW_REPLY, (data) => {
    io.to(`post:${data.postId}`).emit("newReply", data);
  });

  // Follow toggled - notify the user who was followed/unfollowed
  await subscribe(CHANNELS.FOLLOW_TOGGLED, (data) => {
    io.to(`user:${data.followingId}`).emit("followToggled", data);
  });

  // New notification - send to the recipient only
  await subscribe(CHANNELS.NEW_NOTIFICATION, (data) => {
    io.to(`user:${data.recipientId}`).emit("newNotification", data);
  });

  console.log("Socket.io server initialized with Redis pub/sub");

  return io;
};

/**
 * Returns the Socket.io instance.
 * Import this in services that need to emit real-time events.
 *
 * @returns {import("socket.io").Server}
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized. Call createServer first.");
  }
  return io;
};

export { createServer, getIO };