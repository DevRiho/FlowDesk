import Workspace from '../models/Workspace.js';
import TeamMember from '../models/TeamMember.js';
import User from '../models/User.js';
import { AppError } from '../utils/appError.js';

export class WorkspaceService {
  // Creates a workspace and assigns the creator as OWNER
  static async createWorkspace(ownerId, { name, currency = 'USD', timezone = 'UTC' }) {
    const slug = Workspace.generateSlug(name);

    const workspace = await Workspace.create({
      name,
      slug,
      owner: ownerId,
      settings: {
        currency,
        timezone,
      },
    });

    // Create owner team membership entry
    await TeamMember.create({
      user: ownerId,
      workspace: workspace._id,
      role: 'OWNER',
      title: 'Founder / Owner',
      status: 'ACTIVE',
    });

    return workspace;
  }

  // Fetches all workspaces where the user is an owner or active member
  static async getUserWorkspaces(userId) {
    // 1. Find all memberships
    const memberships = await TeamMember.find({ user: userId, status: 'ACTIVE' }).populate({
      path: 'workspace',
      select: 'name slug settings owner createdAt',
    });

    return memberships
      .filter((m) => m.workspace) // filter any orphaned null workspaces
      .map((m) => ({
        ...m.workspace.toObject(),
        role: m.role,
        title: m.title,
      }));
  }

  // Invites or adds a team member to the workspace
  static async addTeamMember(workspaceId, { email, name, role = 'MEMBER', title = 'Team Member' }) {
    // 1. Locate or create invited user
    let user = await User.findOne({ email });
    if (!user) {
      // Create user placeholder for invited member
      const tempPassword = Math.random().toString(36).slice(-10) + 'A1!';
      user = await User.create({
        name,
        email,
        password: tempPassword,
        role: role,
        isEmailVerified: false,
      });
    }

    // 2. Check if already a member
    const existing = await TeamMember.findOne({ workspace: workspaceId, user: user._id });
    if (existing) {
      if (existing.status === 'DEACTIVATED') {
        existing.status = 'ACTIVE';
        existing.role = role;
        existing.title = title;
        await existing.save();
        return existing;
      }
      throw new AppError('This user is already a member of this workspace.', 409);
    }

    // 3. Create membership
    const member = await TeamMember.create({
      user: user._id,
      workspace: workspaceId,
      role,
      title,
      status: 'ACTIVE',
    });

    return await member.populate('user', 'name email avatar title');
  }

  // List all members of a workspace
  static async getWorkspaceMembers(workspaceId) {
    return await TeamMember.find({ workspace: workspaceId, status: { $ne: 'DEACTIVATED' } })
      .populate('user', 'name email avatar phone title')
      .sort({ createdAt: -1 });
  }

  // Update a team member's role or title
  static async updateMember(workspaceId, memberId, { role, title }) {
    const member = await TeamMember.findOne({ _id: memberId, workspace: workspaceId });
    if (!member) {
      throw new AppError('Team member not found in this workspace.', 404);
    }

    if (member.role === 'OWNER') {
      throw new AppError('Cannot modify permissions of the primary workspace owner.', 400);
    }

    if (role) member.role = role;
    if (title) member.title = title;
    await member.save();

    return member;
  }

  // Remove a member from workspace
  static async removeMember(workspaceId, memberId) {
    const member = await TeamMember.findOne({ _id: memberId, workspace: workspaceId });
    if (!member) {
      throw new AppError('Team member not found in this workspace.', 404);
    }

    if (member.role === 'OWNER') {
      throw new AppError('Cannot remove the primary workspace owner.', 400);
    }

    member.status = 'DEACTIVATED';
    await member.save();
    return true;
  }
}

