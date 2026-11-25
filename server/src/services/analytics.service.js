import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Client from '../models/Client.js';
import Activity from '../models/Activity.js';

export class AnalyticsService {
  // Computes executive KPI summary cards
  static async getDashboardStats(workspaceId) {
    const today = new Date();

    const [
      activeProjects,
      completedProjects,
      totalClients,
      pendingTasks,
      overdueTasks,
      recentActivities,
      upcomingDeadlines,
    ] = await Promise.all([
      Project.countDocuments({
        workspace: workspaceId,
        status: { $in: ['PLANNING', 'IN_PROGRESS'] },
      }),
      Project.countDocuments({
        workspace: workspaceId,
        status: 'COMPLETED',
      }),
      Client.countDocuments({
        workspace: workspaceId,
        status: 'ACTIVE',
      }),
      Task.countDocuments({
        workspace: workspaceId,
        status: { $in: ['TODO', 'IN_PROGRESS', 'REVIEW'] },
      }),
      Task.countDocuments({
        workspace: workspaceId,
        status: { $ne: 'COMPLETED' },
        dueDate: { $lt: today, $ne: null },
      }),
      Activity.find({ workspace: workspaceId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .limit(8),
      Project.find({
        workspace: workspaceId,
        status: { $in: ['PLANNING', 'IN_PROGRESS'] },
        deadline: { $gte: today },
      })
        .populate('client', 'company name')
        .sort({ deadline: 1 })
        .limit(5),
    ]);

    return {
      kpi: {
        totalRevenue: 0, // Augmented in Phase 6 with Invoices & Paystack
        outstandingInvoices: 0,
        activeProjects,
        completedProjects,
        totalClients,
        pendingTasks,
        overdueTasks,
      },
      recentActivities,
      upcomingDeadlines,
    };
  }

  // Aggregates data specifically for charts
  static async getChartAnalytics(workspaceId) {
    // 1. Project breakdown by status
    const projectStatusCounts = await Project.aggregate([
      { $match: { workspace: workspaceId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const formattedProjectStatus = [
      { name: 'Planning', value: 0 },
      { name: 'In Progress', value: 0 },
      { name: 'On Hold', value: 0 },
      { name: 'Completed', value: 0 },
    ];

    projectStatusCounts.forEach((item) => {
      const labelMap = {
        PLANNING: 'Planning',
        IN_PROGRESS: 'In Progress',
        ON_HOLD: 'On Hold',
        COMPLETED: 'Completed',
      };
      const found = formattedProjectStatus.find((p) => p.name === labelMap[item._id]);
      if (found) found.value = item.count;
    });

    // 2. Task completion distribution
    const taskStatusCounts = await Task.aggregate([
      { $match: { workspace: workspaceId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const formattedTaskStatus = [
      { name: 'To Do', count: 0 },
      { name: 'In Progress', count: 0 },
      { name: 'Review', count: 0 },
      { name: 'Completed', count: 0 },
    ];

    taskStatusCounts.forEach((item) => {
      const labelMap = {
        TODO: 'To Do',
        IN_PROGRESS: 'In Progress',
        REVIEW: 'Review',
        COMPLETED: 'Completed',
      };
      const found = formattedTaskStatus.find((t) => t.name === labelMap[item._id]);
      if (found) found.count = item.count;
    });

    // 3. Monthly revenue timeline placeholder (hydrated with invoices in Phase 6)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const revenueOverTime = months.map((month) => ({
      month,
      revenue: 0,
      invoiced: 0,
    }));

    return {
      projectStatus: formattedProjectStatus,
      taskStatus: formattedTaskStatus,
      revenueOverTime,
    };
  }

  // Logs an activity record
  static async logActivity(workspaceId, userId, { action, entityType, entityId, title, description }) {
    try {
      return await Activity.create({
        workspace: workspaceId,
        user: userId,
        action,
        entityType,
        entityId,
        title,
        description,
      });
    } catch (err) {
      console.error('[Activity Audit Error]:', err.message);
    }
  }
}

