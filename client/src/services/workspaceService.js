import api from '../lib/axios';

export const workspaceService = {
  // Fetch user workspaces
  async getMyWorkspaces() {
    const res = await api.get('/workspaces/my-workspaces');
    return res.data;
  },

  // Create new workspace
  async createWorkspace(data) {
    const res = await api.post('/workspaces', data);
    return res.data;
  },

  // Fetch current workspace details
  async getWorkspaceDetails(workspaceId) {
    const res = await api.get('/workspaces/current', {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.data;
  },

  // Fetch workspace members
  async getMembers(workspaceId) {
    const res = await api.get('/workspaces/members', {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.data;
  },

  // Add team member
  async addMember(workspaceId, data) {
    const res = await api.post('/workspaces/members', data, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.data;
  },

  // Update member role/title
  async updateMember(workspaceId, memberId, data) {
    const res = await api.patch(`/workspaces/members/${memberId}`, data, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.data;
  },

  // Remove member
  async removeMember(workspaceId, memberId) {
    const res = await api.delete(`/workspaces/members/${memberId}`, {
      headers: { 'x-workspace-id': workspaceId },
    });
    return res.data;
  },
};

