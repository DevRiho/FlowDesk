import express from 'express';
import { getDashboardOverview, getCharts } from '../controllers/analytics.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess } from '../middleware/workspace.middleware.js';

const router = express.Router();
router.use(protect);
router.use(requireWorkspaceAccess);

router.get('/dashboard-overview', getDashboardOverview);
router.get('/charts', getCharts);

export default router;

