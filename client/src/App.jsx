import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { SocketProvider } from './context/SocketContext';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import ClientsPage from './pages/dashboard/ClientsPage';
import ProjectsPage from './pages/dashboard/ProjectsPage';
import TasksPage from './pages/dashboard/TasksPage';
import InvoicesPage from './pages/dashboard/InvoicesPage';
import FilesPage from './pages/dashboard/FilesPage';
import MessagesPage from './pages/dashboard/MessagesPage';
import AIAssistantPage from './pages/dashboard/AIAssistantPage';
import ProtectedRoute from './components/common/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <WorkspaceProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
            {/* Public Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* Authenticated Workspace Routes */}
            <Route element={<ProtectedRoute allowedRoles={['OWNER', 'ADMIN', 'MEMBER']} />}>
              <Route element={<DashboardLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/projects" element={<ProjectsPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/files" element={<FilesPage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
              </Route>
            </Route>

            {/* Root redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </WorkspaceProvider>
  </AuthProvider>
  );
}
