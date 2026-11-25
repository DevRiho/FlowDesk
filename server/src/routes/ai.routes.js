import express from 'express';
import { getProjectRisk, chatWithAssistant } from '../controllers/ai.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware.js';

const router = express.Router();
router.get('/projects/:projectId/risk', protect, requireWorkspaceAccess, getProjectRisk);
router.post('/chat', protect, requireWorkspaceAccess, chatWithAssistant);

export default router;

