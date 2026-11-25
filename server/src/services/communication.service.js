import Message from '../models/Message.js';
import Notification from '../models/Notification.js';
import Project from '../models/Project.js';
import { AppError } from '../utils/appError.js';

export class CommunicationService {
  // Save new message and fetch populated sender
  static async sendMessage(workspaceId, senderId, { projectId, content, attachments = [] }) {
    // 1. Verify project exists in workspace
    const project = await Project.findOne({ _id: projectId, workspace: workspaceId });
    if (!project) {
      throw new AppError('Project not found in this workspace.', 404);
    }

    // 2. Create message
    const message = await Message.create({
      workspace: workspaceId,
      project: projectId,
      sender: senderId,
      content,
      attachments,
      readBy: [senderId],
    });

    return await message.populate('sender', 'name email avatar role');
  }

  // Get project message history
  static async getProjectMessages(workspaceId, projectId, limit = 50) {
    return await Message.find({ workspace: workspaceId, project: projectId })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: 1 })
      .limit(Number(limit));
  }

  // Dispatch a notification
  static async createNotification(workspaceId, { recipientId, senderId, type, title, message, link }) {
    return await Notification.create({
      workspace: workspaceId,
      recipient: recipientId,
      sender: senderId || null,
      type,
      title,
      message,
      link: link || '',
    });
  }

  // Get notifications for user
  static async getUserNotifications(workspaceId, userId) {
    return await Notification.find({ workspace: workspaceId, recipient: userId })
      .sort({ createdAt: -1 })
      .limit(30);
  }

  // Mark notification as read
  static async markNotificationRead(workspaceId, userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, workspace: workspaceId, recipient: userId },
      { isRead: true },
      { new: true }
    );
    return notification;
  }
}

