import { ENV_KEYS } from "constants/env.constant";
import { io } from "socket.io-client";

export const socketIO = () => {
  return io(ENV_KEYS.VITE_APP_API_SOCKET, {
    timeout: 1000,
    reconnection: true,
    reconnectionDelay: 300,
    reconnectionAttempts: Infinity,
    forceNew: true,
  });
};
