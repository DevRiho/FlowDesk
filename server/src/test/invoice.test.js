import test from 'node:test';
import assert from 'node:assert/strict';
import { InvoiceService } from '../services/invoice.service.js';
import { PaymentService } from '../services/payment.service.js';

test('FlowDesk Phase 6: Invoice Calculations & Payment Webhooks', async (t) => {
  await t.test('InvoiceService.calculateTotals computes subtotal, discount, and tax accurately', () => {
    const items = [
      { description: 'Design Sprint', quantity: 2, unitPrice: 500 }, // 1000
      { description: 'Development', quantity: 1, unitPrice: 1000 }, // 1000
    ];
    // Subtotal = 2000
    // Discount 10% = 200 => 1800
    // Tax 5% on 1800 = 90 => Total = 1890
    const totals = InvoiceService.calculateTotals(items, 5, 10);

    assert.equal(totals.subtotal, 2000);
    assert.equal(totals.discountAmount, 200);
    assert.equal(totals.taxAmount, 90);
    assert.equal(totals.total, 1890);
  });

  await t.test('PaymentService.verifyWebhookSignature handles hash verification', () => {
    // If no secret key is provided, returns false
    const verified = PaymentService.verifyWebhookSignature('payload-data', 'invalid-signature');
    assert.equal(verified, false);
  });
});

