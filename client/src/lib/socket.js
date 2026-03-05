import { io } from "socket.io-client";

const socket = io({
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

/**
 * Connects to the Socket.io server and joins the user's personal room.
 * Called after login or on app load when session is confirmed.
 *
 * @param {string} userId
 */
const connectSocket = (userId) => {
  if (socket.connected) {
    socket.emit("join", userId);
    return;
  }

  socket.connect();

  socket.once("connect", () => {
    socket.emit("join", userId);
  });
};

/**
 * Disconnects from the Socket.io server.
 * Called after logout.
 */
const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export { socket, connectSocket, disconnectSocket };