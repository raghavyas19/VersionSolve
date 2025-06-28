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
import AdminAuthForm from './components/admin/AdminAuthForm';
import AdminDashboard from './components/admin/AdminDashboard';
import ProblemManager from './components/admin/ProblemManager';
import ProblemCodeEditor from './components/problems/ProblemCodeEditor';
import { clearUserData, handleReload, initializeMemoryManagement } from './utils/memoryManager';
import { adminVerify } from './utils/api';
import AdminLayout from './components/common/AdminLayout';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
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
      // Clear any existing user data before setting new token
      clearUserData();
      
      localStorage.setItem('token', token);
      params.delete('token');
      // Verify token and update user
      import('./utils/api').then(({ default: api }) => {
        api.get('/auth/verify')
          .then(res => {
            const userData = res.data.user || null;
            setUser(userData);
            
            // Handle reload for newly authenticated user
            if (userData) {
              handleReload(userData.id || userData._id);
              // Initialize memory management for newly authenticated user
              initializeMemoryManagement(userData.id || userData._id);
            }
            
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
      <div>Loading...</div>
    </div>
  );
};

const AdminProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  useEffect(() => {
    const checkAdmin = async () => {
      try {
        await adminVerify();
      } catch {
        navigate('/admin/auth', { replace: true });
      }
    };
    checkAdmin();
  }, [navigate]);
  // Always render children, as /admin/verify will redirect if not authenticated
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginForm />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignupForm />} />
      <Route path="/compiler" element={<OnlineCompiler />} />
      {/* Landing page only for root */}
      <Route path="/" element={<LandingPage />} />
      {/* Main app routes with Layout */}
      <Route path="/*" element={<Layout />}> 
        <Route path="dashboard" element={
          window.location.search.includes('token=') ? <AuthHandler /> :
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }>
          {/* Nested dashboard routes */}
          <Route path="problems" element={<ProblemsPage />} />
          <Route path="leaderboard" element={<LeaderboardPage />} />
          <Route path="contests" element={<ContestsPage />} />
          <Route path="mysubmissions" element={
            <ProtectedRoute>
              <SubmissionsPage />
            </ProtectedRoute>
          } />
        </Route>
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
        <Route path="problems/solve/:problemId" element={<ProblemCodeEditor />} />
      </Route>
      {/* Admin routes with AdminLayout */}
      <Route path="/admin/auth" element={<AdminAuthForm />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="problems" element={<ProblemManager />} />
        {/* Add more admin routes here as needed */}
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