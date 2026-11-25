import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/index.js';
import File from '../models/File.js';
import { AppError } from '../utils/appError.js';
import { AnalyticsService } from './analytics.service.js';

// Configure Cloudinary instance
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export class FileService {
  // Streams file buffer to Cloudinary using upload_stream
  static async uploadToCloudinary(buffer, originalName, folder = 'flowdesk') {
    // If running in development without valid credentials, provide mock response
    if (!config.cloudinary.apiKey || config.cloudinary.apiKey.includes('placeholder') || config.cloudinary.apiKey === 'dev_key') {
      const mockId = `mock_${Date.now()}_${originalName.replace(/\s+/g, '_')}`;
      return {
        url: `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60`,
        publicId: mockId,
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) return reject(new AppError(`Cloudinary upload failed: ${error.message}`, 502));
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );

      uploadStream.end(buffer);
    });
  }

  // Deletes file asset from Cloudinary
  static async deleteFromCloudinary(publicId) {
    if (!publicId || publicId.startsWith('mock_')) return true;

    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (err) {
      console.warn('[Cloudinary Warning] Could not destroy asset:', err.message);
      return false;
    }
  }

  // Saves uploaded file metadata in MongoDB
  static async saveFileMetadata(workspaceId, userId, { file, projectId, isDeliverable }) {
    if (!file) {
      throw new AppError('No file payload was provided for upload.', 400);
    }

    // 1. Stream upload to Cloudinary
    const { url, publicId } = await this.uploadToCloudinary(
      file.buffer,
      file.originalname,
      `flowdesk/${workspaceId}`
    );

    // 2. Persist record in MongoDB
    const fileDoc = await File.create({
      workspace: workspaceId,
      uploadedBy: userId,
      filename: `${Date.now()}-${file.originalname}`,
      originalName: file.originalname,
      url,
      publicId,
      mimeType: file.mimetype,
      size: file.size,
      project: projectId || null,
      isDeliverable: isDeliverable || false,
    });

    // 3. Log activity audit
    await AnalyticsService.logActivity(workspaceId, userId, {
      action: 'TASK_UPDATED',
      entityType: 'Project',
      entityId: projectId || workspaceId,
      title: `uploaded document "${file.originalname}"`,
    });

    return await fileDoc.populate('uploadedBy', 'name email avatar');
  }

  // Lists files in workspace
  static async listFiles(workspaceId, { projectId, page = 1, limit = 20 }) {
    const query = { workspace: workspaceId };
    if (projectId) query.project = projectId;

    const skip = (page - 1) * limit;

    const [files, total] = await Promise.all([
      File.find(query)
        .populate('uploadedBy', 'name email avatar')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      File.countDocuments(query),
    ]);

    return {
      files,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    };
  }

  // Delete file
  static async deleteFile(workspaceId, fileId) {
    const file = await File.findOne({ _id: fileId, workspace: workspaceId });
    if (!file) {
      throw new AppError('File not found in this workspace.', 404);
    }

    // Remove from Cloudinary
    await this.deleteFromCloudinary(file.publicId);

    // Remove from MongoDB
    await File.findByIdAndDelete(fileId);
    return true;
  }
}

