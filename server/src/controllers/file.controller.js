import { FileService } from '../services/file.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const uploadFile = asyncHandler(async (req, res) => {
  const file = await FileService.saveFileMetadata(req.workspace._id, req.user._id, {
    file: req.file,
    projectId: req.body.projectId,
    isDeliverable: req.body.isDeliverable === 'true',
  });

  res.status(201).json({
    success: true,
    message: 'File uploaded successfully',
    data: { file },
  });
});

export const getFiles = asyncHandler(async (req, res) => {
  const result = await FileService.listFiles(req.workspace._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const deleteFile = asyncHandler(async (req, res) => {
  await FileService.deleteFile(req.workspace._id, req.params.id);
  res.status(200).json({ success: true, message: 'File deleted successfully' });
});

