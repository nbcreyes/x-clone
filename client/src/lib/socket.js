import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

const socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
});

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

const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export { socket, connectSocket, disconnectSocket };