import Task from '../models/Task.js';
import Project from '../models/Project.js';
import { ProjectService } from './project.service.js';
import { AppError } from '../utils/appError.js';

export class TaskService {
  static async listTasks(workspaceId, { projectId, status, priority, assignedTo, page = 1, limit = 20 }) {
    const query = { workspace: workspaceId };

    if (projectId) query.project = projectId;
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (assignedTo) query.assignedTo = assignedTo;

    const skip = (page - 1) * limit;

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('project', 'title client deadline')
        .populate('assignedTo', 'name email avatar')
        .sort({ dueDate: 1, priority: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Task.countDocuments(query),
    ]);

    return {
      tasks,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    };
  }

  static async createTask(workspaceId, data) {
    // Verify project belongs to this workspace
    const project = await Project.findOne({ _id: data.project, workspace: workspaceId });
    if (!project) {
      throw new AppError('Target project does not exist in this workspace.', 404);
    }

    const task = await Task.create({
      ...data,
      workspace: workspaceId,
    });

    // Update project progress
    await ProjectService.recalculateProgress(workspaceId, data.project);

    return await task.populate('assignedTo', 'name email avatar');
  }

  static async updateTask(workspaceId, taskId, data) {
    const task = await Task.findOneAndUpdate(
      { _id: taskId, workspace: workspaceId },
      data,
      { new: true, runValidators: true }
    ).populate('assignedTo', 'name email avatar');

    if (!task) {
      throw new AppError('Task not found in this workspace.', 404);
    }

    // If status changed, recalculate project completion
    if (data.status) {
      await ProjectService.recalculateProgress(workspaceId, task.project);
    }

    return task;
  }

  static async deleteTask(workspaceId, taskId) {
    const task = await Task.findOneAndDelete({ _id: taskId, workspace: workspaceId });
    if (!task) {
      throw new AppError('Task not found in this workspace.', 404);
    }

    await ProjectService.recalculateProgress(workspaceId, task.project);
    return true;
  }

  static async addComment(workspaceId, taskId, userId, content) {
    const task = await Task.findOne({ _id: taskId, workspace: workspaceId });
    if (!task) {
      throw new AppError('Task not found in this workspace.', 404);
    }

    task.comments.push({
      user: userId,
      content,
      createdAt: new Date(),
    });

    await task.save();
    return await task.populate('comments.user', 'name email avatar');
  }
}

