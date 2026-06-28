import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      withCredentials: true,
      autoConnect: false
    });
  }
  return socket;
}

export function connectSocket(userId: string) {
  const s = getSocket();
  if (!s.connected) {
    s.connect();
    s.emit('register', userId);
  }
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
