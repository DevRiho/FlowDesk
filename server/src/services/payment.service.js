import crypto from 'crypto';
import Invoice from '../models/Invoice.js';
import Payment from '../models/Payment.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/appError.js';
import { AnalyticsService } from './analytics.service.js';

export class PaymentService {
  // Initializes Paystack checkout transaction
  static async initializePayment(invoiceId, userEmail) {
    const invoice = await Invoice.findById(invoiceId).populate('client', 'email name company');
    if (!invoice) {
      throw new AppError('Invoice not found.', 404);
    }

    if (invoice.status === 'PAID') {
      throw new AppError('This invoice has already been fully paid.', 400);
    }

    // Paystack accepts amount in the smallest currency unit (kobo/cents), so multiply by 100
    const amountInKobo = Math.round(invoice.total * 100);
    const reference = `FD_${invoice._id}_${Date.now()}`;

    const payload = {
      email: userEmail || invoice.client?.email,
      amount: amountInKobo,
      currency: invoice.currency === 'USD' ? 'USD' : 'NGN',
      reference,
      callback_url: `${config.clientUrl}/invoices/${invoice._id}?payment=completed`,
      metadata: {
        invoiceId: invoice._id.toString(),
        workspaceId: invoice.workspace.toString(),
        clientId: invoice.client._id.toString(),
      },
    };

    // If real Paystack secret key is configured, invoke live Paystack API
    if (config.paystack.secretKey && !config.paystack.secretKey.includes('placeholder')) {
      const response = await fetch(`${config.paystack.baseUrl}/transaction/initialize`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.paystack.secretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!data.status) {
        throw new AppError(data.message || 'Payment gateway initialization failed.', 502);
      }

      return {
        authorizationUrl: data.data.authorization_url,
        accessCode: data.data.access_code,
        reference,
      };
    }

    // Development fallback mock response for testing without live sandbox credentials
    return {
      authorizationUrl: `https://checkout.paystack.com/mock-checkout-${reference}`,
      accessCode: `mock_code_${reference}`,
      reference,
      isDevelopmentMock: true,
    };
  }

  // Verifies cryptographic webhook signature sent by Paystack
  // Paystack signs requests using HMAC SHA512 using your secret key in the x-paystack-signature header.
  static verifyWebhookSignature(rawBody, signatureHeader) {
    if (!config.paystack.secretKey) return false;
    const hash = crypto
      .createHmac('sha512', config.paystack.secretKey)
      .update(rawBody)
      .digest('hex');

    return hash === signatureHeader;
  }

  // Processes confirmed payment from verified webhook payload
  static async processWebhookEvent(event) {
    // We only care about charge.success
    if (event.event !== 'charge.success') {
      return { handled: false, reason: 'Ignored non-charge event' };
    }

    const data = event.data;
    const reference = data.reference;
    const metadata = data.metadata || {};
    const invoiceId = metadata.invoiceId;

    if (!invoiceId) {
      return { handled: false, reason: 'No invoice metadata found on transaction' };
    }

    // 1. Check for duplicate processing (idempotency check)
    const existingPayment = await Payment.findOne({ reference });
    if (existingPayment) {
      return { handled: true, status: 'Duplicate event ignored' };
    }

    // 2. Locate invoice
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
      throw new AppError(`Webhook target invoice ${invoiceId} not found.`, 404);
    }

    // 3. Create verified Payment transaction log
    const payment = await Payment.create({
      workspace: invoice.workspace,
      invoice: invoice._id,
      client: invoice.client,
      reference,
      amount: data.amount / 100, // Convert back from kobo/cents to standard units
      currency: data.currency,
      channel: data.channel || 'paystack',
      status: 'SUCCESS',
      gatewayResponse: data.gateway_response || 'Successful',
      paidAt: new Date(data.paid_at || Date.now()),
      metadata: data,
    });

    // 4. Update invoice status to PAID
    invoice.status = 'PAID';
    invoice.paidAt = payment.paidAt;
    await invoice.save();

    // 5. Audit log
    await AnalyticsService.logActivity(invoice.workspace, invoice.client, {
      action: 'INVOICE_PAID',
      entityType: 'Invoice',
      entityId: invoice._id,
      title: `settled invoice ${invoice.invoiceNumber}`,
      description: `Payment of ${invoice.currency} ${invoice.total} verified via Paystack.`,
    });

    return { handled: true, paymentId: payment._id, invoiceId: invoice._id };
  }
}

