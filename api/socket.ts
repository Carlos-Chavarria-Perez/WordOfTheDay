import { io, Socket } from "socket.io-client";
import Toast from "react-native-toast-message";

let socket: Socket | null = null;

// ✅ Environment-aware base URL with proper WebSocket protocol
const SOCKET_URL =
  process.env.NODE_ENV === "production"
    ? "wss://wordofthedaybackend.onrender.com"
    : "http://10.0.2.2:3000";

export function connectSocket(userId: string) {
  if (socket) return socket;

  try {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: {
        user_id: userId,
      },
      forceNew: false,
      rejectUnauthorized: false,
    });

    // Handle connection errors
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      Toast.show({
        type: "error",
        text1: "Connection Error",
        text2: "Failed to connect to game server",
        position: "top",
        visibilityTime: 3000,
      });
    });

    socket.on("disconnect", (reason) => {
      console.warn("Socket disconnected:", reason);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  } catch (error) {
    console.error("Failed to initialize socket:", error);
    Toast.show({
      type: "error",
      text1: "Error",
      text2: "Failed to initialize connection",
      position: "top",
      visibilityTime: 3000,
    });
  }

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
