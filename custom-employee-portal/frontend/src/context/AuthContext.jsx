import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { setAuthSession, getAuthToken, getStoredUser, clearAuthSession } from '../utils/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function bootstrap() {
      const savedToken = getAuthToken();
      if (savedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            setAuthSession(savedToken, res.user);
          }
        } catch (err) {
          clearAuthSession();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    bootstrap();
  }, []);

  const login = async (username, password) => {
    const res = await authService.login(username, password);
    if (res.success && res.token && res.user) {
      setAuthSession(res.token, res.user);
      setToken(res.token);
      setUser(res.user);
      return res;
    }
    throw new Error(res.error || 'Login failed');
  };

  const logout = async () => {
    await authService.logout();
    clearAuthSession();
    setUser(null);
    setToken(null);
  };

  const refreshProfile = async () => {
    try {
      const res = await authService.getMe();
      if (res.success && res.user) {
        setUser(res.user);
        const currentToken = getAuthToken();
        if (currentToken) setAuthSession(currentToken, res.user);
      }
    } catch (e) {
      console.error('Failed to refresh profile:', e);
    }
  };

  const isAdmin = user && user.roles && user.roles.some(r => r.toLowerCase() === 'admin');

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isAdmin,
        loading,
        login,
        logout,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
