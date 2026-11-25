import express from 'express';
import {
  sendMessage,
  getProjectMessages,
  getNotifications,
  markNotificationRead,
} from '../controllers/communication.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware.js';

const router = express.Router();
// Messaging
router.post('/messages', protect, requireWorkspaceAccess, sendMessage);
router.get('/messages/project/:projectId', protect, requireWorkspaceAccess, getProjectMessages);

// Notifications
router.get('/notifications', protect, requireWorkspaceAccess, getNotifications);
router.patch('/notifications/:id/read', protect, requireWorkspaceAccess, markNotificationRead);

export default router;

