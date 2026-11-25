import express from 'express';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  addTaskComment,
} from '../controllers/business.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess, requireWorkspaceRole } from '../middleware/workspace.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createClientSchema,
  updateClientSchema,
  createProjectSchema,
  updateProjectSchema,
  createTaskSchema,
  updateTaskSchema,
} from '../validators/business.validators.js';

// Workspace-scoped operations: router handles specific paths
const router = express.Router();

// ==============================
// CLIENT ROUTES
// ==============================
router.get('/clients', protect, requireWorkspaceAccess, getClients);
router.get('/clients/:id', protect, requireWorkspaceAccess, getClient);
router.post(
  '/clients',
  protect,
  requireWorkspaceAccess,
  requireWorkspaceRole('OWNER', 'ADMIN'),
  validate(createClientSchema),
  createClient
);
router.patch(
  '/clients/:id',
  protect,
  requireWorkspaceAccess,
  requireWorkspaceRole('OWNER', 'ADMIN'),
  validate(updateClientSchema),
  updateClient
);
router.delete(
  '/clients/:id',
  protect,
  requireWorkspaceAccess,
  requireWorkspaceRole('OWNER', 'ADMIN'),
  deleteClient
);

// ==============================
// PROJECT ROUTES
// ==============================
router.get('/projects', protect, requireWorkspaceAccess, getProjects);
router.get('/projects/:id', protect, requireWorkspaceAccess, getProject);
router.post(
  '/projects',
  protect,
  requireWorkspaceAccess,
  requireWorkspaceRole('OWNER', 'ADMIN'),
  validate(createProjectSchema),
  createProject
);
router.patch(
  '/projects/:id',
  protect,
  requireWorkspaceAccess,
  requireWorkspaceRole('OWNER', 'ADMIN', 'MEMBER'),
  validate(updateProjectSchema),
  updateProject
);
router.delete(
  '/projects/:id',
  protect,
  requireWorkspaceAccess,
  requireWorkspaceRole('OWNER', 'ADMIN'),
  deleteProject
);

// ==============================
// TASK ROUTES
// ==============================
router.get('/tasks', protect, requireWorkspaceAccess, getTasks);
router.post(
  '/tasks',
  protect,
  requireWorkspaceAccess,
  requireWorkspaceRole('OWNER', 'ADMIN', 'MEMBER'),
  validate(createTaskSchema),
  createTask
);
router.patch(
  '/tasks/:id',
  protect,
  requireWorkspaceAccess,
  requireWorkspaceRole('OWNER', 'ADMIN', 'MEMBER'),
  validate(updateTaskSchema),
  updateTask
);
router.delete(
  '/tasks/:id',
  protect,
  requireWorkspaceAccess,
  requireWorkspaceRole('OWNER', 'ADMIN'),
  deleteTask
);
router.post('/tasks/:id/comments', protect, requireWorkspaceAccess, addTaskComment);

export default router;

