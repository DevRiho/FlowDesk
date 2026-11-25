import Client from '../models/Client.js';
import Project from '../models/Project.js';
import { AppError } from '../utils/appError.js';

export class ClientService {
  static async listClients(workspaceId, { search, status, page = 1, limit = 10 }) {
    const query = { workspace: workspaceId };

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      Client.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      Client.countDocuments(query),
    ]);

    return {
      clients,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    };
  }

  static async getClientById(workspaceId, clientId) {
    const client = await Client.findOne({ _id: clientId, workspace: workspaceId })
      .populate('projects', 'title status deadline progress budget')
      .populate('portalUser', 'name email');

    if (!client) {
      throw new AppError('Client record not found in this workspace.', 404);
    }
    return client;
  }

  static async createClient(workspaceId, data) {
    const client = await Client.create({
      ...data,
      workspace: workspaceId,
    });
    return client;
  }

  static async updateClient(workspaceId, clientId, data) {
    const client = await Client.findOneAndUpdate(
      { _id: clientId, workspace: workspaceId },
      data,
      { new: true, runValidators: true }
    );

    if (!client) {
      throw new AppError('Client record not found in this workspace.', 404);
    }
    return client;
  }

  static async deleteClient(workspaceId, clientId) {
    // Check if client has active projects before deleting
    const projectCount = await Project.countDocuments({
      workspace: workspaceId,
      client: clientId,
      status: { $ne: 'CANCELLED' },
    });

    if (projectCount > 0) {
      throw new AppError(
        `Cannot delete client with ${projectCount} active projects. Archive client instead.`,
        400
      );
    }

    const client = await Client.findOneAndDelete({ _id: clientId, workspace: workspaceId });
    if (!client) {
      throw new AppError('Client record not found in this workspace.', 404);
    }
    return true;
  }
}

