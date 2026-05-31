let ioInstance;
const connectedUsers = new Map();

function initSocket(io) {
  ioInstance = io;
  io.on('connection', (socket) => {
    socket.on('register', (userId) => {
      if (!userId) return;
      connectedUsers.set(userId.toString(), socket.id);
      socket.userId = userId.toString();
      console.log(`Socket.IO User registered: ${userId}`);
    });

    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        console.log(`Socket.IO User disconnected: ${socket.userId}`);
      }
    });
  });
}

function sendNotificationToUser(userId, event, data) {
  if (!ioInstance) return;
  const socketId = connectedUsers.get(userId.toString());
  if (socketId) {
    ioInstance.to(socketId).emit(event, data);
  }
}

function broadcastToAll(event, data) {
  if (!ioInstance) return;
  ioInstance.emit(event, data);
}

module.exports = { initSocket, sendNotificationToUser, broadcastToAll };
