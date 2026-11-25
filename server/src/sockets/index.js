import { verifyAccessToken } from '../utils/token.js';
import User from '../models/User.js';

// Setup authenticated Socket.IO rooms and real-time listeners
export const setupSocketHandlers = (io) => {
  // 1. Socket Authentication Middleware:
  // Verifies the incoming handshake token before allowing a connection.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) {
        return next(new Error('Authentication required for socket connection.'));
      }

      const decoded = verifyAccessToken(token);
      let user = null;
      try {
        user = await User.findById(decoded.userId);
      } catch (err) {
        // Dev fallback if DB offline
        user = { _id: decoded.userId, name: decoded.email?.split('@')[0] || 'User' };
      }

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid socket authentication credentials.'));
    }
  });

  // 2. Connection handler
  io.on('connection', (socket) => {
    const userId = socket.user?._id?.toString();
    console.log(`[Socket.IO] Authenticated user connected: ${userId} (${socket.id})`);

    // Join user's personal private notification room
    if (userId) {
      socket.join(`user:${userId}`);
    }

    // Join workspace room for broad workspace activity events
    socket.on('workspace:join', (workspaceId) => {
      socket.join(`workspace:${workspaceId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined workspace room: workspace:${workspaceId}`);
    });

    // Join project room for project-specific chat and task updates
    socket.on('project:join', (projectId) => {
      socket.join(`project:${projectId}`);
      console.log(`[Socket.IO] Socket ${socket.id} joined project room: project:${projectId}`);
    });

    // Leave project room
    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
    });

    // Broadcast typing indicator
    socket.on('typing:start', ({ projectId, userName }) => {
      socket.to(`project:${projectId}`).emit('typing:status', {
        projectId,
        userName,
        isTyping: true,
      });
    });

    socket.on('typing:stop', ({ projectId }) => {
      socket.to(`project:${projectId}`).emit('typing:status', {
        projectId,
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Socket disconnected: ${socket.id}`);
    });
  });
};

