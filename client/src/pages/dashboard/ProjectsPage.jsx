import React, { useState, useEffect } from 'react';
import { businessService } from '../../services/businessService';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Briefcase, Plus, Calendar, DollarSign, Clock, CheckCircle2 } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils';

export default function ProjectsPage() {
  const { currentWorkspace, roleInCurrentWorkspace } = useWorkspace();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    client: '',
    deadline: '',
    budget: 0,
    priority: 'MEDIUM',
    description: '',
  });

  const canManageProjects = roleInCurrentWorkspace === 'OWNER' || roleInCurrentWorkspace === 'ADMIN';

  const loadData = async () => {
    if (!currentWorkspace?._id) return;
    try {
      setLoading(true);
      const [projRes, clientRes] = await Promise.all([
        businessService.getProjects({}),
        businessService.getClients({}),
      ]);
      setProjects(projRes.data?.projects || []);
      setClients(clientRes.data?.clients || []);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentWorkspace?._id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await businessService.createProject(newProject);
      setShowModal(false);
      setNewProject({ title: '', client: '', deadline: '', budget: 0, priority: 'MEDIUM', description: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create project');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Projects</h1>
          <p className="text-xs text-surface-500 mt-1">
            Track active client engagements, milestones, and deliverable timelines.
          </p>
        </div>

        {canManageProjects && (
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center shadow-sm">
          <Briefcase className="h-10 w-10 text-surface-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-surface-900">No active projects</h3>
          <p className="text-xs text-surface-500 mt-1 max-w-sm mx-auto">
            Launch a new client project to begin tracking tasks, budgets, and milestone progress.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-xl border border-surface-200 p-5 shadow-sm hover:border-brand-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-100 text-surface-600">
                    {p.priority} Priority
                  </span>
                  <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    {p.status}
                  </span>
                </div>

                <h3 className="font-bold text-surface-900 text-sm mb-1">{p.title}</h3>
                <p className="text-xs text-surface-500 mb-4 font-medium">
                  Client: <span className="text-surface-800">{p.client?.company || 'Unassigned'}</span>
                </p>

                {/* Progress Bar */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex justify-between text-[11px] font-medium text-surface-600">
                    <span>Progress</span>
                    <span>{p.progress || 0}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-600 rounded-full transition-all duration-300"
                      style={{ width: `${p.progress || 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-surface-100 flex items-center justify-between text-[11px] text-surface-500">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Due {formatDate(p.deadline)}</span>
                </div>
                <div className="font-semibold text-surface-900">
                  {formatCurrency(p.budget)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-surface-200 max-w-md w-full p-6 animate-in fade-in">
            <h3 className="text-base font-bold text-surface-900 mb-4">Create Project</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Website Redesign & Brand Sprint"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Client</label>
                <select
                  required
                  value={newProject.client}
                  onChange={(e) => setNewProject({ ...newProject, client: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Deadline</label>
                  <input
                    type="date"
                    required
                    value={newProject.deadline}
                    onChange={(e) => setNewProject({ ...newProject, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Budget ($)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="5000"
                    value={newProject.budget}
                    onChange={(e) => setNewProject({ ...newProject, budget: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Priority</label>
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
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
                  Launch Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

