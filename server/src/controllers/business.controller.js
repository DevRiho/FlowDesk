import { ClientService } from '../services/client.service.js';
import { ProjectService } from '../services/project.service.js';
import { TaskService } from '../services/task.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// ========================
// CLIENT CONTROLLERS
// ========================
export const getClients = asyncHandler(async (req, res) => {
  const result = await ClientService.listClients(req.workspace._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const getClient = asyncHandler(async (req, res) => {
  const client = await ClientService.getClientById(req.workspace._id, req.params.id);
  res.status(200).json({ success: true, data: { client } });
});

export const createClient = asyncHandler(async (req, res) => {
  const client = await ClientService.createClient(req.workspace._id, req.body);
  res.status(201).json({ success: true, message: 'Client created successfully', data: { client } });
});

export const updateClient = asyncHandler(async (req, res) => {
  const client = await ClientService.updateClient(req.workspace._id, req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Client updated successfully', data: { client } });
});

export const deleteClient = asyncHandler(async (req, res) => {
  await ClientService.deleteClient(req.workspace._id, req.params.id);
  res.status(200).json({ success: true, message: 'Client deleted successfully' });
});

// ========================
// PROJECT CONTROLLERS
// ========================
export const getProjects = asyncHandler(async (req, res) => {
  const result = await ProjectService.listProjects(req.workspace._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await ProjectService.getProjectById(req.workspace._id, req.params.id);
  res.status(200).json({ success: true, data: { project } });
});

export const createProject = asyncHandler(async (req, res) => {
  const project = await ProjectService.createProject(req.workspace._id, req.body);
  res.status(201).json({ success: true, message: 'Project created successfully', data: { project } });
});

export const updateProject = asyncHandler(async (req, res) => {
  const project = await ProjectService.updateProject(req.workspace._id, req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Project updated successfully', data: { project } });
});

export const deleteProject = asyncHandler(async (req, res) => {
  await ProjectService.deleteProject(req.workspace._id, req.params.id);
  res.status(200).json({ success: true, message: 'Project deleted successfully' });
});

// ========================
// TASK CONTROLLERS
// ========================
export const getTasks = asyncHandler(async (req, res) => {
  const result = await TaskService.listTasks(req.workspace._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await TaskService.createTask(req.workspace._id, req.body);
  res.status(201).json({ success: true, message: 'Task created successfully', data: { task } });
});

export const updateTask = asyncHandler(async (req, res) => {
  const task = await TaskService.updateTask(req.workspace._id, req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Task updated successfully', data: { task } });
});

export const deleteTask = asyncHandler(async (req, res) => {
  await TaskService.deleteTask(req.workspace._id, req.params.id);
  res.status(200).json({ success: true, message: 'Task deleted successfully' });
});

export const addTaskComment = asyncHandler(async (req, res) => {
  const task = await TaskService.addComment(req.workspace._id, req.params.id, req.user._id, req.body.content);
  res.status(200).json({ success: true, message: 'Comment posted', data: { task } });
});

