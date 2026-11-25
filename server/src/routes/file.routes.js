import express from 'express';
import { uploadFile, getFiles, deleteFile } from '../controllers/file.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess, requireWorkspaceRole } from '../middleware/workspace.middleware.js';
import { upload } from '../middleware/upload.middleware.js';

const router = express.Router();
router.get('/files', protect, requireWorkspaceAccess, getFiles);
router.post('/files', protect, requireWorkspaceAccess, upload.single('file'), uploadFile);
router.delete('/files/:id', protect, requireWorkspaceAccess, requireWorkspaceRole('OWNER', 'ADMIN', 'MEMBER'), deleteFile);

export default router;

