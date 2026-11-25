import React, { useState, useEffect } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { useWorkspace } from '../../context/WorkspaceContext';
import {
  TrendingUp,
  Users,
  Briefcase,
  CheckSquare,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Calendar,
  Activity as ActivityIcon,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { currentWorkspace } = useWorkspace();
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!currentWorkspace?._id) return;
      try {
        setLoading(true);
        const [overviewRes, chartsRes] = await Promise.all([
          analyticsService.getDashboardOverview(),
          analyticsService.getCharts(),
        ]);
        setStats(overviewRes.data);
        setCharts(chartsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentWorkspace?._id]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-surface-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-surface-500 mt-1">
            Real-time business telemetry for{' '}
            <span className="font-semibold text-surface-800">{currentWorkspace?.name}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold px-3 py-1.5 bg-brand-50 text-brand-700 rounded-lg border border-brand-200">
          <ActivityIcon className="h-4 w-4 text-brand-600 animate-pulse" />
          <span>Realtime Telemetry Active</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Total Revenue
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-surface-900">
            {formatCurrency(stats?.kpi?.totalRevenue || 0)}
          </div>
          <span className="text-[11px] text-surface-400 mt-1 block">Paystack Verified Settlement</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Active Projects
            </span>
            <div className="h-8 w-8 rounded-lg bg-blue-50 text-brand-600 flex items-center justify-center">
              <Briefcase className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-surface-900">
            {stats?.kpi?.activeProjects || 0}
          </div>
          <span className="text-[11px] text-surface-400 mt-1 block">
            {stats?.kpi?.completedProjects || 0} completed to date
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Pending Tasks
            </span>
            <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-surface-900">
            {stats?.kpi?.pendingTasks || 0}
          </div>
          <span className="text-[11px] text-red-500 mt-1 block font-medium">
            {stats?.kpi?.overdueTasks || 0} overdue tasks
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-surface-500 uppercase tracking-wider">
              Total Clients
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-surface-900">
            {stats?.kpi?.totalClients || 0}
          </div>
          <span className="text-[11px] text-surface-400 mt-1 block">Active accounts</span>
        </div>
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Velocity Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
          <h3 className="text-sm font-bold text-surface-900 mb-1">Task Completion Velocity</h3>
          <p className="text-xs text-surface-500 mb-4">Distribution of tasks across Kanban workflow</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.taskStatus || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Donut Chart */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-surface-900 mb-1">Project Status Breakdown</h3>
            <p className="text-xs text-surface-500 mb-2">Projects by current lifecycle stage</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.projectStatus || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(charts?.projectStatus || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-100 text-[11px]">
            {(charts?.projectStatus || []).map((item, index) => (
              <div key={item.name} className="flex items-center space-x-2">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></span>
                <span className="text-surface-600 truncate">{item.name}</span>
                <span className="font-bold text-surface-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Deadlines & Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-surface-900">Upcoming Project Deadlines</h3>
            <span className="text-xs text-brand-600 font-semibold">Track Milestones</span>
          </div>

          {(stats?.upcomingDeadlines || []).length === 0 ? (
            <p className="text-xs text-surface-500 py-6 text-center">No upcoming deadlines.</p>
          ) : (
            <div className="divide-y divide-surface-100">
              {stats?.upcomingDeadlines.map((proj) => (
                <div key={proj._id} className="py-3 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-surface-900">{proj.title}</h4>
                    <p className="text-[11px] text-surface-500">{proj.client?.company}</p>
                  </div>
                  <div className="flex items-center space-x-1.5 text-xs text-surface-600 font-medium bg-surface-50 px-2.5 py-1 rounded-md border border-surface-200">
                    <Calendar className="h-3.5 w-3.5 text-surface-400" />
                    <span>{formatDate(proj.deadline)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Activity Stream */}
        <div className="bg-white p-6 rounded-xl border border-surface-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-surface-900">Workspace Activity Stream</h3>
            <span className="text-xs text-brand-600 font-semibold">Live Audit</span>
          </div>

          {(stats?.recentActivities || []).length === 0 ? (
            <p className="text-xs text-surface-500 py-6 text-center">
              No recent workspace activity recorded.
            </p>
          ) : (
            <div className="divide-y divide-surface-100">
              {stats?.recentActivities.map((act) => (
                <div key={act._id} className="py-3 flex items-start space-x-3">
                  <div className="h-7 w-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {act.user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-surface-800">
                      <span className="font-semibold text-surface-900">{act.user?.name}</span>{' '}
                      {act.title}
                    </p>
                    <span className="text-[10px] text-surface-400">{formatDate(act.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
