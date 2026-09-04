import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

function MainRouter() {
  const { isAuthenticated, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('root');

  // Synchronize initial browser URL path
  useEffect(() => {
    const rawPath = window.location.pathname.replace(/^\/+/, '');
    if (!rawPath || rawPath === 'login') {
      setCurrentRoute('root');
    } else if (['dashboard', 'admin'].includes(rawPath)) {
      setCurrentRoute(rawPath);
    } else {
      setCurrentRoute('404');
    }

    const handlePopState = () => {
      const p = window.location.pathname.replace(/^\/+/, '');
      if (!p || p === 'login') {
        setCurrentRoute('root');
      } else if (['dashboard', 'admin'].includes(p)) {
        setCurrentRoute(p);
      } else {
        setCurrentRoute('404');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route) => {
    setCurrentRoute(route);
    const targetPath = (route === 'root' || route === 'login') ? '/' : `/${route}`;
    if (window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    );
  }

  // 1. Unauthenticated users: Canonical single URL is '/'
  if (!isAuthenticated) {
    if (window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/');
    }
    return <LoginPage onNavigate={navigateTo} />;
  }

  // 2. Authenticated user visiting root '/' or '/login' -> Redirect to '/dashboard'
  if (currentRoute === 'root' || currentRoute === 'login' || window.location.pathname === '/') {
    if (window.location.pathname !== '/dashboard') {
      window.history.replaceState(null, '', '/dashboard');
    }
    return (
      <ProtectedRoute onNavigate={navigateTo}>
        <DashboardPage onNavigate={navigateTo} />
      </ProtectedRoute>
    );
  }

  // 3. Authenticated Dashboard route
  if (currentRoute === 'dashboard') {
    return (
      <ProtectedRoute onNavigate={navigateTo}>
        <DashboardPage onNavigate={navigateTo} />
      </ProtectedRoute>
    );
  }

  // 4. Authenticated Admin route
  if (currentRoute === 'admin') {
    return (
      <ProtectedRoute adminOnly={true} onNavigate={navigateTo}>
        <AdminPage onNavigate={navigateTo} />
      </ProtectedRoute>
    );
  }

  return <NotFoundPage onNavigate={navigateTo} />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
