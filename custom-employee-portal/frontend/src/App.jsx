import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';
import ProtectedRoute from './components/ProtectedRoute';

function MainRouter() {
  const { isAuthenticated, loading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState('dashboard');

  // Synchronize initial browser URL path
  useEffect(() => {
    const path = window.location.pathname.replace('/', '') || 'dashboard';
    if (['login', 'dashboard', 'admin'].includes(path)) {
      setCurrentRoute(path);
    } else {
      setCurrentRoute(path ? '404' : 'dashboard');
    }

    const handlePopState = () => {
      const p = window.location.pathname.replace('/', '') || 'dashboard';
      setCurrentRoute(p);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (route) => {
    setCurrentRoute(route);
    const targetPath = route === 'dashboard' ? '/dashboard' : `/${route}`;
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

  // Routing Switch
  if (!isAuthenticated) {
    if (window.location.pathname !== '/login' && window.location.pathname !== '/') {
      window.history.replaceState(null, '', '/login');
    }
    return <LoginPage onNavigate={navigateTo} />;
  }

  if (currentRoute === 'login') {
    // If authenticated user visits /login, redirect to /dashboard
    window.history.replaceState(null, '', '/dashboard');
    return (
      <ProtectedRoute onNavigate={navigateTo}>
        <DashboardPage onNavigate={navigateTo} />
      </ProtectedRoute>
    );
  }

  if (currentRoute === 'dashboard') {
    return (
      <ProtectedRoute onNavigate={navigateTo}>
        <DashboardPage onNavigate={navigateTo} />
      </ProtectedRoute>
    );
  }

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
