import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state on page load by checking existing access token
  // or transparently refreshing session via cookie
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('flowdesk_access_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.data?.user) {
            setUser(res.data.user);
            setIsAuthenticated(true);
          }
        } catch (error) {
          // Token expired or invalid, attempt silent refresh
          try {
            const refreshRes = await authService.refresh();
            if (refreshRes.data?.accessToken) {
              localStorage.setItem('flowdesk_access_token', refreshRes.data.accessToken);
              setUser(refreshRes.data.user);
              setIsAuthenticated(true);
            }
          } catch (refreshErr) {
            localStorage.removeItem('flowdesk_access_token');
            setUser(null);
            setIsAuthenticated(false);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { accessToken, user } = res.data;
    localStorage.setItem('flowdesk_access_token', accessToken);
    setUser(user);
    setIsAuthenticated(true);
    return user;
  };

  const register = async (userData) => {
    return await authService.register(userData);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.warn('Logout notification error:', err.message);
    } finally {
      localStorage.removeItem('flowdesk_access_token');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

