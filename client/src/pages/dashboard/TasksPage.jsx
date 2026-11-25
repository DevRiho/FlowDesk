import React, { useState, useEffect } from 'react';
import { businessService } from '../../services/businessService';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CheckSquare, Plus, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { formatDate } from '../../utils';

export default function TasksPage() {
  const { currentWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    project: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const loadData = async () => {
    if (!currentWorkspace?._id) return;
    try {
      setLoading(true);
      const [taskRes, projRes] = await Promise.all([
        businessService.getTasks({}),
        businessService.getProjects({}),
      ]);
      setTasks(taskRes.data?.tasks || []);
      setProjects(projRes.data?.projects || []);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [currentWorkspace?._id]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await businessService.updateTask(taskId, { status: newStatus });
      loadData();
    } catch (err) {
      alert('Failed to update task status');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await businessService.createTask(newTask);
      setShowModal(false);
      setNewTask({ title: '', project: '', priority: 'MEDIUM', dueDate: '' });
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create task');
    }
  };

  const columns = [
    { title: 'To Do', status: 'TODO' },
    { title: 'In Progress', status: 'IN_PROGRESS' },
    { title: 'In Review', status: 'REVIEW' },
    { title: 'Completed', status: 'COMPLETED' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">Tasks</h1>
          <p className="text-xs text-surface-500 mt-1">
            Kanban workflow tracking team tasks, priority, and completion states.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>New Task</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center">
          <div className="h-6 w-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.status);
            return (
              <div key={col.status} className="bg-surface-100/70 rounded-xl p-3 flex flex-col min-h-[500px]">
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="text-xs font-bold text-surface-700 uppercase tracking-wider">
                    {col.title}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-surface-600 border border-surface-200">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1 overflow-y-auto">
                  {colTasks.map((t) => (
                    <div
                      key={t._id}
                      className="bg-white p-3.5 rounded-lg border border-surface-200 shadow-sm hover:border-brand-400 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-brand-600 truncate max-w-[120px]">
                          {t.project?.title}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            t.priority === 'URGENT'
                              ? 'bg-red-50 text-red-700'
                              : t.priority === 'HIGH'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-surface-100 text-surface-600'
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-surface-900 leading-snug">{t.title}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-surface-100 text-[10px] text-surface-500">
                        <span>{t.dueDate ? formatDate(t.dueDate) : 'No due date'}</span>

                        {/* Quick Status Cycler */}
                        <select
                          value={t.status}
                          onChange={(e) => handleStatusChange(t._id, e.target.value)}
                          className="bg-surface-50 border border-surface-200 rounded px-1.5 py-0.5 text-[10px] text-surface-700 focus:outline-none"
                        >
                          <option value="TODO">To Do</option>
                          <option value="IN_PROGRESS">In Progress</option>
                          <option value="REVIEW">Review</option>
                          <option value="COMPLETED">Completed</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-surface-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-surface-200 max-w-md w-full p-6 animate-in fade-in">
            <h3 className="text-base font-bold text-surface-900 mb-4">Create New Task</h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Design interactive dashboard prototype"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-surface-700 mb-1">Project</label>
                <select
                  required
                  value={newTask.project}
                  onChange={(e) => setNewTask({ ...newTask, project: e.target.value })}
                  className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                >
                  <option value="">Select project...</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-surface-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-lg text-xs"
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
                  Add Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

