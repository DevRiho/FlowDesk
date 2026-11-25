import { AnalyticsService } from '../services/analytics.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getDashboardOverview = asyncHandler(async (req, res) => {
  const stats = await AnalyticsService.getDashboardStats(req.workspace._id);
  res.status(200).json({ success: true, data: stats });
});

export const getCharts = asyncHandler(async (req, res) => {
  const charts = await AnalyticsService.getChartAnalytics(req.workspace._id);
  res.status(200).json({ success: true, data: charts });
});

