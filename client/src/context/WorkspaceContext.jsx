import React, { createContext, useContext, useState, useEffect } from 'react';
import { workspaceService } from '../services/workspaceService';
import { useAuth } from './AuthContext';
import api from '../lib/axios';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sync Axios headers whenever current workspace changes
  useEffect(() => {
    if (currentWorkspace?._id) {
      api.defaults.headers.common['x-workspace-id'] = currentWorkspace._id;
      localStorage.setItem('flowdesk_active_workspace', currentWorkspace._id);
    } else {
      delete api.defaults.headers.common['x-workspace-id'];
    }
  }, [currentWorkspace]);

  // Load workspaces when user authenticates
  useEffect(() => {
    const loadWorkspaces = async () => {
      if (!isAuthenticated) {
        setWorkspaces([]);
        setCurrentWorkspace(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await workspaceService.getMyWorkspaces();
        const list = res.data?.workspaces || [];
        setWorkspaces(list);

        // Select previously stored active workspace or first available
        const savedId = localStorage.getItem('flowdesk_active_workspace');
        const matched = list.find((w) => w._id === savedId);

        if (matched) {
          setCurrentWorkspace(matched);
        } else if (list.length > 0) {
          setCurrentWorkspace(list[0]);
        }
      } catch (err) {
        console.error('Failed to load workspaces:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspaces();
  }, [isAuthenticated]);

  const switchWorkspace = (workspace) => {
    setCurrentWorkspace(workspace);
  };

  const refreshWorkspaces = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await workspaceService.getMyWorkspaces();
      const list = res.data?.workspaces || [];
      setWorkspaces(list);
      if (!currentWorkspace && list.length > 0) {
        setCurrentWorkspace(list[0]);
      }
    } catch (err) {
      console.error('Refresh workspaces error:', err);
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        switchWorkspace,
        refreshWorkspaces,
        roleInCurrentWorkspace: currentWorkspace?.role || 'MEMBER',
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}

