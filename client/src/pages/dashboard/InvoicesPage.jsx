import React, { useState, useEffect } from 'react';
import { invoiceService } from '../../services/invoiceService';
import { businessService } from '../../services/businessService';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Receipt, Plus, CreditCard, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';

export default function InvoicesPage() {
  const { currentWorkspace, roleInCurrentWorkspace } = useWorkspace();
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    client: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, unitPrice: 0 }],
    taxRate: 0,
    discountRate: 0,
  });

  const canManageInvoices = roleInCurrentWorkspace === 'OWNER' || roleInCurrentWorkspace === 'ADMIN';

  const loadData = async () => {
    if (!currentWorkspace?._id) return;
    try {
      setLoading(true);
      const [invRes, clientRes] = await Promise.all([
        invoiceService.getInvoices({}),
        businessService.getClients({}),
      ]);
      setInvoices(invRes.data?.invoices || []);
      setClients(clientRes.data?.clients || []);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentWorkspace?._id]);

  const handleAddItem = () => {
    setNewInvoice({
      ...newInvoice,
      items: [...newInvoice.items, { description: '', quantity: 1, unitPrice: 0 }],
    });
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...newInvoice.items];
    updated[index][field] = value;
    setNewInvoice({ ...newInvoice, items: updated });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await invoiceService.createInvoice(newInvoice);
      setShowModal(false);
      setNewInvoice({
        client: '',
        dueDate: '',
        items: [{ description: '', quantity: 1, unitPrice: 0 }],
        taxRate: 0,
        discountRate: 0,
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create invoice');
    }
  };

  const handlePayNow = async (invoiceId) => {
    try {
      const res = await invoiceService.initializePayment(invoiceId);
      if (res.data?.authorizationUrl) {
        window.open(res.data.authorizationUrl, '_blank');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment checkout initialization failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Invoices</h1>
          <p className="text-xs text-surface-500 mt-1">
            Generate itemized billing, track outstanding balances, and settle via Paystack.
          </p>
        </div>

        {canManageInvoices && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Invoice</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center shadow-sm">
          <Receipt className="h-10 w-10 text-surface-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-surface-900">No invoices issued</h3>
          <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
            Issue your first invoice to collect client payments securely.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Client</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 text-xs">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-surface-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-surface-900">{inv.client?.company}</div>
                      <div className="text-[11px] text-surface-500">{inv.client?.name}</div>
                    </td>
                    <td className="py-3 px-4 text-surface-600">{formatDate(inv.dueDate)}</td>
                    <td className="py-3 px-4 font-bold text-surface-900">
                      {formatCurrency(inv.total, inv.currency)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          inv.status === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : inv.status === 'SENT'
                            ? 'bg-blue-50 text-brand-700 border border-brand-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {inv.status !== 'PAID' && (
                        <button
                          onClick={() => handlePayNow(inv._id)}
                          className="inline-flex items-center space-x-1 px-2.5 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold border border-brand-200 transition-colors"
                        >
                          <CreditCard className="h-3.5 w-3.5" />
                          <span>Pay Now</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-surface-200 max-w-lg w-full p-6 animate-in fade-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-surface-900 mb-4">Create New Invoice</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Client</label>
                <select
                  required
                  value={newInvoice.client}
                  onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                >
                  <option value="">Select billing client...</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Due Date</label>
                <input
                  type="date"
                  required
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                />
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-surface-700">Line Items</label>
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {newInvoice.items.map((item, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        required
                        placeholder="Description (e.g. Design sprint)"
                        value={item.description}
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        min="1"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', Number(e.target.value))}
                        className="w-16 px-2 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                      />
                      <input
                        type="number"
                        min="0"
                        placeholder="Price"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', Number(e.target.value))}
                        className="w-24 px-2 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newInvoice.taxRate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, taxRate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">
                    Discount (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={newInvoice.discountRate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, discountRate: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-surface-600 hover:bg-surface-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-lg shadow-sm"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

