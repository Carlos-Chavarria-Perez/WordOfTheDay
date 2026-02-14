import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function connectSocket(userId: string) {
  if (socket) return socket;

  socket = io("http://10.0.2.2:3000", {
    transports: ["websocket"],
    auth: {
      user_id: userId,
    },
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
