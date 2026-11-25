import { AppError } from '../utils/appError.js';
import Workspace from '../models/Workspace.js';
import TeamMember from '../models/TeamMember.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// requireWorkspaceAccess ensures:
// 1. A valid workspace identifier is supplied (via header 'x-workspace-id' or route param ':workspaceId').
// 2. The authenticated user (req.user) is an active member or owner of this workspace.
// 3. Attaches req.workspace and req.membership (with their role in this workspace) to the request.
export const requireWorkspaceAccess = asyncHandler(async (req, res, next) => {
  const workspaceId =
    req.headers['x-workspace-id'] ||
    req.params.workspaceId ||
    req.body.workspaceId ||
    req.query.workspaceId;

  if (!workspaceId) {
    return next(
      new AppError(
        'Workspace context required. Please provide a valid workspace ID in header or parameters.',
        400
      )
    );
  }

  // 1. Fetch workspace
  const workspace = await Workspace.findById(workspaceId);
  if (!workspace || !workspace.isActive) {
    return next(new AppError('Workspace not found or is currently inactive.', 404));
  }

  // 2. Check if user is the direct workspace owner
  if (workspace.owner.toString() === req.user._id.toString()) {
    req.workspace = workspace;
    req.membership = {
      role: 'OWNER',
      user: req.user._id,
      workspace: workspace._id,
    };
    return next();
  }

  // 3. Check membership in TeamMember collection
  const membership = await TeamMember.findOne({
    workspace: workspace._id,
    user: req.user._id,
    status: 'ACTIVE',
  });

  if (!membership) {
    return next(
      new AppError(
        'Access denied: You do not have permission to access resources in this workspace.',
        403
      )
    );
  }

  req.workspace = workspace;
  req.membership = membership;
  next();
});

// requireWorkspaceRole enforces role authorization based on the user's role
// *within the currently active workspace* (not merely their global user default).
export const requireWorkspaceRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.membership) {
      return next(
        new AppError('Workspace access verification must run before role evaluation.', 500)
      );
    }

    const currentRole = req.membership.role;
    if (!allowedRoles.includes(currentRole)) {
      return next(
        new AppError(
          `Permission denied: Action requires one of [${allowedRoles.join(', ')}], but your workspace role is ${currentRole}.`,
          403
        )
      );
    }

    next();
  };
};

