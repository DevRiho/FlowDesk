import express from 'express';
import {
  createWorkspace,
  getMyWorkspaces,
  getWorkspaceDetails,
  getMembers,
  addMember,
  updateMember,
  removeMember,
} from '../controllers/workspace.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  requireWorkspaceAccess,
  requireWorkspaceRole,
} from '../middleware/workspace.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createWorkspaceSchema,
  addTeamMemberSchema,
  updateMemberSchema,
} from '../validators/workspace.validators.js';

const router = express.Router();

// All workspace operations require an authenticated user
router.use(protect);

// Global user workspace listing & creation
router.get('/my-workspaces', getMyWorkspaces);
router.post('/', validate(createWorkspaceSchema), createWorkspace);

// Workspace-scoped operations: require valid membership & x-workspace-id header
router.use(requireWorkspaceAccess);

router.get('/current', getWorkspaceDetails);
router.get('/members', getMembers);

// Member management restricted to workspace OWNER and ADMIN
router.post(
  '/members',
  requireWorkspaceRole('OWNER', 'ADMIN'),
  validate(addTeamMemberSchema),
  addMember
);

router.patch(
  '/members/:memberId',
  requireWorkspaceRole('OWNER', 'ADMIN'),
  validate(updateMemberSchema),
  updateMember
);

router.delete(
  '/members/:memberId',
  requireWorkspaceRole('OWNER', 'ADMIN'),
  removeMember
);

export default router;

