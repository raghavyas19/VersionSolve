import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/common/Layout';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import LandingPage from './components/landing/LandingPage';
import Dashboard from './components/dashboard/Dashboard';
import OnlineCompiler from './components/compiler/OnlineCompiler';
import ProblemsPage from './pages/ProblemsPage';
import ProblemDetail from './components/problems/ProblemDetail';
import SubmissionsPage from './pages/SubmissionsPage';
import ContestsPage from './pages/ContestsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminDashboard from './components/admin/AdminDashboard';
import ProblemManager from './components/admin/ProblemManager';
import LoadingSpinner from './components/common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  if (user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <LoginForm />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <SignupForm />} />
      <Route path="/compiler" element={<OnlineCompiler />} />
      
      {/* Landing page for non-authenticated users */}
      {!user && <Route path="/" element={<LandingPage />} />}
      
      {/* Main app routes with Layout */}
      <Route path="/" element={<Layout />}>
        {/* Dashboard only for authenticated users */}
        {user && <Route index element={<Dashboard />} />}
        
        {/* Public pages accessible to guests */}
        <Route path="problems" element={<ProblemsPage />} />
        <Route path="problems/:id" element={<ProblemDetail />} />
        <Route path="contests" element={<ContestsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        
        {/* Protected routes requiring authentication */}
        <Route path="submissions" element={
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        } />
        
        {/* Admin routes */}
        <Route path="admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="admin/problems" element={
          <AdminRoute>
            <ProblemManager />
          </AdminRoute>
        } />
      </Route>
      
      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;