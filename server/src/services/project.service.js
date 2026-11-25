import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Client from '../models/Client.js';
import { AppError } from '../utils/appError.js';

export class ProjectService {
  static async listProjects(workspaceId, { search, status, priority, clientId, page = 1, limit = 10 }) {
    const query = { workspace: workspaceId };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (clientId) query.client = clientId;

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('client', 'name company email')
        .populate('assignedMembers', 'name email avatar')
        .sort({ deadline: 1 })
        .skip(skip)
        .limit(Number(limit)),
      Project.countDocuments(query),
    ]);

    return {
      projects,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    };
  }

  static async getProjectById(workspaceId, projectId) {
    const project = await Project.findOne({ _id: projectId, workspace: workspaceId })
      .populate('client', 'name company email phone')
      .populate('assignedMembers', 'name email avatar title')
      .populate('tasks');

    if (!project) {
      throw new AppError('Project not found in this workspace.', 404);
    }
    return project;
  }

  static async createProject(workspaceId, data) {
    // Verify client belongs to this workspace
    const client = await Client.findOne({ _id: data.client, workspace: workspaceId });
    if (!client) {
      throw new AppError('Invalid client: client does not belong to this workspace.', 400);
    }

    const project = await Project.create({
      ...data,
      workspace: workspaceId,
    });

    return await project.populate('client', 'name company');
  }

  static async updateProject(workspaceId, projectId, data) {
    const project = await Project.findOneAndUpdate(
      { _id: projectId, workspace: workspaceId },
      data,
      { new: true, runValidators: true }
    )
      .populate('client', 'name company email')
      .populate('assignedMembers', 'name email avatar');

    if (!project) {
      throw new AppError('Project not found in this workspace.', 404);
    }
    return project;
  }

  static async deleteProject(workspaceId, projectId) {
    const project = await Project.findOneAndDelete({ _id: projectId, workspace: workspaceId });
    if (!project) {
      throw new AppError('Project not found in this workspace.', 404);
    }

    // Cascade delete associated tasks
    await Task.deleteMany({ project: projectId, workspace: workspaceId });

    return true;
  }

  // Recalculates progress percentage based on task completion
  static async recalculateProgress(workspaceId, projectId) {
    const totalTasks = await Task.countDocuments({ workspace: workspaceId, project: projectId });
    if (totalTasks === 0) return 0;

    const completedTasks = await Task.countDocuments({
      workspace: workspaceId,
      project: projectId,
      status: 'COMPLETED',
    });

    const progress = Math.round((completedTasks / totalTasks) * 100);

    await Project.updateOne(
      { _id: projectId, workspace: workspaceId },
      { progress }
    );

    return progress;
  }
}

