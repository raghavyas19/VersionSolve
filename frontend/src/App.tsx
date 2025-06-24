import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import ProblemCodeEditor from './components/editor/ProblemCodeEditor';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const AuthHandler: React.FC = () => {
  const { setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      params.delete('token');
      // Verify token and update user
      import('./utils/api').then(({ default: api }) => {
        api.get('/auth/verify')
          .then(res => {
            setUser(res.data.user || null);
            navigate('/dashboard', { replace: true });
          })
          .catch(() => {
            setUser(null);
            navigate('/login', { replace: true });
          });
      });
    } else {
      navigate('/login', { replace: true });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
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
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginForm />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupForm />} />
      <Route path="/compiler" element={<OnlineCompiler />} />
      {/* Landing page always accessible */}
      <Route path="/" element={<LandingPage />} />
      {/* Main app routes with Layout */}
      <Route path="/" element={<Layout />}> 
        {/* Dashboard only for authenticated users, with AuthHandler for Google OAuth */}
        <Route path="dashboard" element={
          window.location.search.includes('token=') ? <AuthHandler /> :
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        {/* Dashboard subroutes */}
        <Route path="dashboard/problems" element={<ProblemsPage />} />
        <Route path="dashboard/leaderboard" element={<LeaderboardPage />} />
        <Route path="dashboard/contests" element={<ContestsPage />} />
        <Route path="dashboard/mysubmissions" element={
          <ProtectedRoute>
            <SubmissionsPage />
          </ProtectedRoute>
        } />
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
          <AdminDashboard />
        } />
        <Route path="admin/problems" element={
          <ProblemManager />
        } />
        <Route path="problems/solve/:problemId" element={<ProblemCodeEditor />} />
      </Route>
      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
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