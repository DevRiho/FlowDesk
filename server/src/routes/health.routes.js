import express from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = express.Router();

// GET /api/health
// Health check endpoint used by uptime monitors, container orchestration (Docker/K8s),
// and developer verification to confirm the API and its dependent subsystems are responsive.
router.get(
  '/',
  asyncHandler(async (req, res) => {
    // Determine database readiness status
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    const dbStatusMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const dbState = dbStatusMap[mongoose.connection.readyState] || 'unknown';

    return res.status(200).json({
      success: true,
      service: 'FlowDesk API Server',
      version: '1.0.0',
      status: 'operational',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbState,
        connected: mongoose.connection.readyState === 1,
      },
    });
  })
);

export default router;

