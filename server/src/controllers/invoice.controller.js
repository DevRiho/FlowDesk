import { InvoiceService } from '../services/invoice.service.js';
import { PaymentService } from '../services/payment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/appError.js';

export const getInvoices = asyncHandler(async (req, res) => {
  const result = await InvoiceService.listInvoices(req.workspace._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const getInvoice = asyncHandler(async (req, res) => {
  const invoice = await InvoiceService.getInvoiceById(req.workspace._id, req.params.id);
  res.status(200).json({ success: true, data: { invoice } });
});

export const createInvoice = asyncHandler(async (req, res) => {
  const invoice = await InvoiceService.createInvoice(req.workspace._id, req.body);
  res.status(201).json({
    success: true,
    message: 'Invoice created successfully',
    data: { invoice },
  });
});

export const updateInvoiceStatus = asyncHandler(async (req, res) => {
  const invoice = await InvoiceService.updateInvoiceStatus(
    req.workspace._id,
    req.params.id,
    req.body.status
  );
  res.status(200).json({
    success: true,
    message: 'Invoice status updated',
    data: { invoice },
  });
});

export const initializePayment = asyncHandler(async (req, res) => {
  const { invoiceId } = req.body;
  const result = await PaymentService.initializePayment(invoiceId, req.user?.email);

  res.status(200).json({
    success: true,
    message: 'Paystack transaction initialized',
    data: result,
  });
});

// Paystack Webhook Handler
// Webhooks are server-to-server calls from Paystack; they are not authenticated via JWT
// but verified cryptographically using the x-paystack-signature header.
export const handlePaystackWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-paystack-signature'];
  const rawBody = JSON.stringify(req.body);

  const isValidSignature = PaymentService.verifyWebhookSignature(rawBody, signature);

  // In production, reject any unsigned or tampered requests immediately
  if (process.env.NODE_ENV === 'production' && !isValidSignature) {
    throw new AppError('Invalid webhook cryptographic signature.', 401);
  }

  const result = await PaymentService.processWebhookEvent(req.body);

  // Always return 200 to Paystack so they do not retry already handled events
  res.status(200).json({
    status: 'success',
    data: result,
  });
});

