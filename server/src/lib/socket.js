import { Server } from "socket.io";
import dotenv from "dotenv";

dotenv.config();

// io instance is stored here so other modules can emit events.
let io;

/**
 * Attaches Socket.io to the HTTP server.
 * Called once during server startup in index.js.
 *
 * @param {import("http").Server} httpServer
 * @returns {import("socket.io").Server}
 */
const createServer = (httpServer) => {
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
    // notifications and feed updates to the right socket.
    socket.on("join", (userId) => {
      socket.join(`user:${userId}`);
      console.log(`User ${userId} joined their room`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

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