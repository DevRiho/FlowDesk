import express from 'express';
import {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoiceStatus,
  initializePayment,
  handlePaystackWebhook,
} from '../controllers/invoice.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireWorkspaceAccess, requireWorkspaceRole } from '../middleware/workspace.middleware.js';

const router = express.Router();

// Webhook endpoint: Must be public and unauthenticated by JWT (verified via HMAC signature)
router.post('/payments/webhook', handlePaystackWebhook);

// Authenticated Payment and Invoice Routes
router.post('/payments/initialize', protect, initializePayment);

// Workspace-scoped invoice routes
router.get('/invoices', protect, requireWorkspaceAccess, getInvoices);
router.get('/invoices/:id', protect, requireWorkspaceAccess, getInvoice);
router.post('/invoices', protect, requireWorkspaceAccess, requireWorkspaceRole('OWNER', 'ADMIN'), createInvoice);
router.patch('/invoices/:id/status', protect, requireWorkspaceAccess, requireWorkspaceRole('OWNER', 'ADMIN'), updateInvoiceStatus);

export default router;

