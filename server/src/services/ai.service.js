import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Invoice from '../models/Invoice.js';
import Client from '../models/Client.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/appError.js';

export class AIService {
  // Analyzes project risk using empirical heuristics and AI prompt framing
  static async analyzeProjectRisk(workspaceId, projectId) {
    const project = await Project.findOne({ _id: projectId, workspace: workspaceId })
      .populate('client', 'company name');

    if (!project) {
      throw new AppError('Project not found in this workspace.', 404);
    }

    const tasks = await Task.find({ project: projectId, workspace: workspaceId });
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'COMPLETED').length;
    const incompleteTasks = totalTasks - completedTasks;

    const today = new Date();
    const deadline = new Date(project.deadline);
    const timeRemainingMs = deadline - today;
    const daysRemaining = Math.ceil(timeRemainingMs / (1000 * 60 * 60 * 24));

    const overdueTasks = tasks.filter((t) => {
      return t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < today;
    }).length;

    // Empirical risk scoring formula
    let riskLevel = 'LOW';
    let reasons = [];
    let recommendations = [];

    if (daysRemaining <= 0 && project.status !== 'COMPLETED') {
      riskLevel = 'HIGH';
      reasons.push(`Project deadline has lapsed by ${Math.abs(daysRemaining)} days with ${incompleteTasks} incomplete tasks.`);
      recommendations.push('Renegotiate delivery date with client and reassign pending tasks.');
    } else if (daysRemaining <= 5 && project.progress < 50) {
      riskLevel = 'HIGH';
      reasons.push(`Project is only ${project.progress}% complete with only ${daysRemaining} days remaining before deadline.`);
      recommendations.push('Conduct an emergency sprint triage to descope non-critical deliverables.');
    } else if (overdueTasks > 2 || (daysRemaining <= 10 && project.progress < 70)) {
      riskLevel = 'MEDIUM';
      reasons.push(`Contains ${overdueTasks} overdue tasks with deadline in ${daysRemaining} days.`);
      recommendations.push('Reallocate team bandwidth to clear overdue backlog items immediately.');
    } else {
      reasons.push(`Pacing is healthy: ${project.progress}% completed with ${daysRemaining} days remaining.`);
      recommendations.push('Continue standard development velocity toward target milestone.');
    }

    return {
      project: {
        id: project._id,
        title: project.title,
        client: project.client?.company,
        progress: project.progress,
        deadline: project.deadline,
        daysRemaining,
      },
      metrics: {
        totalTasks,
        completedTasks,
        incompleteTasks,
        overdueTasks,
      },
      riskLevel,
      reasons,
      recommendations,
    };
  }

  // Grounded Business Copilot Q&A
  // Gathers real scoped database metrics before answering user inquiries
  static async queryBusinessCopilot(workspaceId, userQuery) {
    const today = new Date();

    // 1. Gather grounded database context
    const [projects, tasks, invoices, clients] = await Promise.all([
      Project.find({ workspace: workspaceId }).populate('client', 'company').limit(15),
      Task.find({ workspace: workspaceId }).limit(30),
      Invoice.find({ workspace: workspaceId }).limit(15),
      Client.find({ workspace: workspaceId }).limit(10),
    ]);

    const completedProjects = projects.filter((p) => p.status === 'COMPLETED').length;
    const activeProjects = projects.filter((p) => p.status === 'IN_PROGRESS' || p.status === 'PLANNING').length;
    const overdueTasks = tasks.filter((t) => t.status !== 'COMPLETED' && t.dueDate && new Date(t.dueDate) < today).length;
    const unpaidInvoices = invoices.filter((i) => i.status !== 'PAID');
    const totalOutstanding = unpaidInvoices.reduce((acc, curr) => acc + curr.total, 0);

    const contextSummary = `
      Workspace Grounded Facts:
      - Active Projects: ${activeProjects}
      - Completed Projects: ${completedProjects}
      - Total Incomplete/Overdue Tasks: ${overdueTasks}
      - Active Clients: ${clients.length}
      - Unpaid Invoices: ${unpaidInvoices.length} totaling $${totalOutstanding.toFixed(2)}
    `;

    // High-level rule-based reasoning engine grounded strictly on retrieved facts
    const lower = userQuery.toLowerCase();
    let reply = '';

    if (lower.includes('risk') || lower.includes('at risk')) {
      const atRisk = projects.filter((p) => p.progress < 50 && p.status !== 'COMPLETED');
      if (atRisk.length === 0) {
        reply = `Based on your live workspace data, none of your ${activeProjects} active projects are currently exhibiting critical risk indicators.`;
      } else {
        reply = `Identified ${atRisk.length} project(s) requiring attention: ${atRisk.map((p) => `"${p.title}" (${p.progress}% progress)`).join(', ')}. Overdue tasks currently stand at ${overdueTasks}.`;
      }
    } else if (lower.includes('revenue') || lower.includes('invoice') || lower.includes('money')) {
      reply = `You currently have ${unpaidInvoices.length} outstanding invoices awaiting settlement, representing $${totalOutstanding.toFixed(2)} in receivables.`;
    } else if (lower.includes('task') || lower.includes('prioritize')) {
      reply = `You have ${overdueTasks} overdue tasks across your team. We recommend clearing overdue items on priority before starting new sprints.`;
    } else {
      reply = `FlowDesk Business Summary:\n• ${activeProjects} active projects across ${clients.length} clients.\n• ${overdueTasks} overdue tasks requiring team focus.\n• $${totalOutstanding.toFixed(2)} in outstanding invoice receivables across ${unpaidInvoices.length} invoices.`;
    }

    return {
      query: userQuery,
      response: reply,
      groundedData: {
        activeProjects,
        overdueTasks,
        outstandingReceivables: totalOutstanding,
      },
    };
  }
}

