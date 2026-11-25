import { AIService } from '../services/ai.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getProjectRisk = asyncHandler(async (req, res) => {
  const result = await AIService.analyzeProjectRisk(req.workspace._id, req.params.projectId);
  res.status(200).json({ success: true, data: result });
});

export const chatWithAssistant = asyncHandler(async (req, res) => {
  const { query } = req.body;
  const result = await AIService.queryBusinessCopilot(req.workspace._id, query);
  res.status(200).json({ success: true, data: result });
});

