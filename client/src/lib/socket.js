import { io } from "socket.io-client";

// Create the Socket.io client instance.
// autoConnect: false means we connect manually after the user is authenticated.
// This prevents anonymous connections and ensures we can join the user room
// immediately after connecting.
const socket = io(import.meta.env.VITE_SOCKET_URL || "", {
  autoConnect: false,
  withCredentials: true,
});

/**
 * Connects to the Socket.io server and joins the user's personal room.
 * Call this after the user logs in or on app load when user is authenticated.
 *
 * @param {string} userId
 */
const connectSocket = (userId) => {
  if (!socket.connected) {
    socket.connect();
    socket.emit("join", userId);
  }
};

/**
 * Disconnects from the Socket.io server.
 * Call this after the user logs out.
 */
const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export { socket, connectSocket, disconnectSocket };