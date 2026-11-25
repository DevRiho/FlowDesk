import { WorkspaceService } from '../services/workspace.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createWorkspace = asyncHandler(async (req, res) => {
  const workspace = await WorkspaceService.createWorkspace(req.user._id, req.body);

  res.status(201).json({
    success: true,
    message: 'Workspace created successfully',
    data: { workspace },
  });
});

export const getMyWorkspaces = asyncHandler(async (req, res) => {
  const workspaces = await WorkspaceService.getUserWorkspaces(req.user._id);

  res.status(200).json({
    success: true,
    data: { workspaces },
  });
});

export const getWorkspaceDetails = asyncHandler(async (req, res) => {
  // req.workspace and req.membership populated by requireWorkspaceAccess middleware
  res.status(200).json({
    success: true,
    data: {
      workspace: req.workspace,
      membership: req.membership,
    },
  });
});

export const getMembers = asyncHandler(async (req, res) => {
  const members = await WorkspaceService.getWorkspaceMembers(req.workspace._id);

  res.status(200).json({
    success: true,
    data: { members },
  });
});

export const addMember = asyncHandler(async (req, res) => {
  const member = await WorkspaceService.addTeamMember(req.workspace._id, req.body);

  res.status(201).json({
    success: true,
    message: 'Team member added successfully',
    data: { member },
  });
});

export const updateMember = asyncHandler(async (req, res) => {
  const member = await WorkspaceService.updateMember(
    req.workspace._id,
    req.params.memberId,
    req.body
  );

  res.status(200).json({
    success: true,
    message: 'Team member updated successfully',
    data: { member },
  });
});

export const removeMember = asyncHandler(async (req, res) => {
  await WorkspaceService.removeMember(req.workspace._id, req.params.memberId);

  res.status(200).json({
    success: true,
    message: 'Team member removed from workspace',
  });
});

