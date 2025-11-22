import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import StarsPage from './pages/StarsPage';
import ForkManagement from './pages/ForkManagement';
import ProfileBuilder from './pages/ProfileBuilder';
import AuthCallback from './components/auth/AuthCallback';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/auth-store';

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="callback" element={<AuthCallback />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="stars"
          element={
            <ProtectedRoute>
              <StarsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="fork"
          element={
            <ProtectedRoute>
              <ForkManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile-builder"
          element={
            <ProtectedRoute>
              <ProfileBuilder />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
