import React, { useState, useEffect } from 'react';
import { businessService } from '../../services/businessService';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Users, Search, Plus, Mail, Building2, Phone, MoreVertical, Trash2 } from 'lucide-react';

export default function ClientsPage() {
  const { currentWorkspace, roleInCurrentWorkspace } = useWorkspace();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: '',
  });

  const canManageClients = roleInCurrentWorkspace === 'OWNER' || roleInCurrentWorkspace === 'ADMIN';

  const loadClients = async () => {
    if (!currentWorkspace?._id) return;
    try {
      setLoading(true);
      const res = await businessService.getClients({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setClients(res.data?.clients || []);
    } catch (err) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [currentWorkspace?._id, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadClients();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await businessService.createClient(newClient);
      setShowModal(false);
      setNewClient({ name: '', email: '', company: '', phone: '', notes: '' });
      loadClients();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create client');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await businessService.deleteClient(id);
        loadClients();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete client');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Clients</h1>
          <p className="text-xs text-surface-500 mt-1">
            Manage your accounts, companies, and client portal relationships.
          </p>
        </div>

        {canManageClients && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add Client</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-surface-200 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search by name, company, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </form>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-xs text-surface-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="LEAD">Lead</option>
            <option value="INACTIVE">Inactive</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Clients Data Grid */}
      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : clients.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center shadow-sm">
          <Users className="h-10 w-10 text-surface-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-surface-900">No clients found</h3>
          <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
            Get started by adding your first client or agency partner to this workspace.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-surface-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-200 bg-surface-50 text-[11px] font-semibold uppercase tracking-wider text-surface-500">
                  <th className="py-3 px-4">Client / Company</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 text-xs">
                {clients.map((c) => (
                  <tr key={c._id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-surface-900">{c.company}</div>
                      <div className="text-[11px] text-surface-500">{c.name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-surface-700 flex items-center space-x-1">
                        <Mail className="h-3 w-3 text-surface-400" />
                        <span>{c.email}</span>
                      </div>
                      {c.phone && (
                        <div className="text-surface-500 text-[11px] flex items-center space-x-1 mt-0.5">
                          <Phone className="h-3 w-3 text-surface-400" />
                          <span>{c.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-surface-100 text-surface-600 border border-surface-200'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {canManageClients && (
                        <button
                          onClick={() => handleDelete(c._id)}
                          className="p-1 rounded text-surface-400 hover:text-red-600 transition-colors"
                          title="Delete Client"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Create Client Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-surface-200 max-w-md w-full p-6 animate-in fade-in">
            <h3 className="text-base font-bold text-surface-900 mb-4">Add New Client</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Acme Inc."
                  value={newClient.company}
                  onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Sarah Jenkins"
                  value={newClient.name}
                  onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="sarah@acme.com"
                  value={newClient.email}
                  onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Phone</label>
                <input
                  type="text"
                  placeholder="+1 (555) 019-2834"
                  value={newClient.phone}
                  onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                />
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
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

