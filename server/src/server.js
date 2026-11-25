import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/index.js';
import { connectDatabase } from './config/database.js';
import { setupSocketHandlers } from './sockets/index.js';

// Create native HTTP server wrapping the Express app.
// We dynamically import app to prevent circular dependency resolution issues.
export const httpServer = http.createServer();

// Initialize Socket.IO instance
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.clientUrl,
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
});

// Bind authenticated Socket.IO handlers
setupSocketHandlers(io);

// Bootstrapping function
const startServer = async () => {
  try {
    const { default: app } = await import('./app.js');
    httpServer.on('request', app);

    // 1. Establish database connection
    await connectDatabase();

    // 2. Start HTTP & WebSocket listeners
    httpServer.listen(config.port, () => {
      console.log(`====================================================`);
      console.log(` FlowDesk API Server running in [${config.env.toUpperCase()}] mode`);
      console.log(` Listening on: http://localhost:${config.port}`);
      console.log(` Health check: http://localhost:${config.port}/api/health`);
      console.log(` Client URL  : ${config.clientUrl}`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('[Fatal Error] Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful process shutdown handler (SIGTERM / SIGINT)
const handleGracefulShutdown = (signal) => {
  console.log(`\n[Process] Received ${signal}. Gracefully closing HTTP server & DB connections...`);
  httpServer.close(() => {
    console.log('[Process] HTTP and WebSocket server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

// Only auto-listen if server.js is executed directly as entrypoint (not imported by test runner)
if (process.env.NODE_ENV !== 'test' && !process.argv.some(arg => arg.includes('test'))) {
  startServer();
}

