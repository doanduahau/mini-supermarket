const jwt = require('jsonwebtoken');

let ioInstance;
const connectedUsers = new Map();

function initSocket(io) {
  ioInstance = io;

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      socket.userId = decoded.id ? decoded.id.toString() : decoded._id.toString();
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    if (socket.userId) {
      connectedUsers.set(socket.userId, socket.id);
    }

    socket.on('disconnect', () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
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
