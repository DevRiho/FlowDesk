import mongoose from 'mongoose';
import { config } from './index.js';

// Connect to MongoDB with connection pooling and graceful error handling.
// In professional Node.js architectures, we monitor connection lifecycle events
// (connected, error, disconnected) so the app can react or log appropriately.
export const connectDatabase = async () => {
  try {
    const conn = await mongoose.connect(config.database.uri, {
      serverSelectionTimeoutMS: 5000, // Timeout fast if MongoDB service is offline
    });

    console.log(`[Database] Connected successfully to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.warn(`[Database Warning] MongoDB connection failed: ${error.message}`);
    console.warn(`[Database Notice] Ensure local MongoDB service is running (e.g. 'mongod' or Atlas URI) before performing DB transactions.`);
    // We do not exit process immediately in local dev so health checks & mock modes can run
  }
};

// Event listeners for database connection health
mongoose.connection.on('disconnected', () => {
  console.warn('[Database] Mongoose connection disconnected.');
});

mongoose.connection.on('error', (err) => {
  console.error('[Database Error] Mongoose error:', err.message);
});

