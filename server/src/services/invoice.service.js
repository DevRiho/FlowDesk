import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import { AppError } from '../utils/appError.js';

export class InvoiceService {
  // Generates next sequential invoice identifier for the workspace (e.g. INV-0001, INV-0002)
  static async generateInvoiceNumber(workspaceId) {
    const count = await Invoice.countDocuments({ workspace: workspaceId });
    const nextNumber = count + 1;
    return `INV-${String(nextNumber).padStart(4, '0')}`;
  }

  // Recalculates subtotal, tax amount, discount, and final balance server-side.
  // Never trust calculations sent from the browser client.
  static calculateTotals(items = [], taxRate = 0, discountRate = 0) {
    const calculatedItems = items.map((item) => {
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      const total = Number((quantity * unitPrice).toFixed(2));
      return {
        description: item.description,
        quantity,
        unitPrice,
        total,
      };
    });

    const subtotal = Number(
      calculatedItems.reduce((acc, item) => acc + item.total, 0).toFixed(2)
    );

    const discountAmount = Number(((subtotal * (discountRate || 0)) / 100).toFixed(2));
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);

    const taxAmount = Number(((discountedSubtotal * (taxRate || 0)) / 100).toFixed(2));
    const total = Number((discountedSubtotal + taxAmount).toFixed(2));

    return {
      items: calculatedItems,
      subtotal,
      discountAmount,
      taxAmount,
      total,
    };
  }

  static async listInvoices(workspaceId, { status, clientId, page = 1, limit = 10 }) {
    const query = { workspace: workspaceId };
    if (status) query.status = status;
    if (clientId) query.client = clientId;

    const skip = (page - 1) * limit;

    const [invoices, total] = await Promise.all([
      Invoice.find(query)
        .populate('client', 'name company email')
        .populate('project', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Invoice.countDocuments(query),
    ]);

    return {
      invoices,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
        limit: Number(limit),
      },
    };
  }

  static async getInvoiceById(workspaceId, invoiceId) {
    const invoice = await Invoice.findOne({ _id: invoiceId, workspace: workspaceId })
      .populate('client', 'name company email phone address')
      .populate('project', 'title')
      .populate('workspace', 'name settings');

    if (!invoice) {
      throw new AppError('Invoice not found in this workspace.', 404);
    }
    return invoice;
  }

  static async createInvoice(workspaceId, data) {
    const client = await Client.findOne({ _id: data.client, workspace: workspaceId });
    if (!client) {
      throw new AppError('Client does not belong to this workspace.', 400);
    }

    const invoiceNumber = data.invoiceNumber || (await this.generateInvoiceNumber(workspaceId));
    const totals = this.calculateTotals(data.items, data.taxRate, data.discountRate);

    const invoice = await Invoice.create({
      ...data,
      workspace: workspaceId,
      invoiceNumber,
      items: totals.items,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      discountAmount: totals.discountAmount,
      total: totals.total,
    });

    return await invoice.populate('client', 'name company email');
  }

  static async updateInvoiceStatus(workspaceId, invoiceId, status) {
    const invoice = await Invoice.findOne({ _id: invoiceId, workspace: workspaceId });
    if (!invoice) {
      throw new AppError('Invoice not found in this workspace.', 404);
    }

    invoice.status = status;
    if (status === 'SENT' && !invoice.sentAt) {
      invoice.sentAt = new Date();
    }
    if (status === 'PAID' && !invoice.paidAt) {
      invoice.paidAt = new Date();
    }

    await invoice.save();
    return invoice;
  }
}

