import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ProtectedRoute } from './components/ProtectedRoute';
import Login from './pages/Login';
import TechHeadDashboard from './pages/TechHeadDashboard';
import MemberDashboard from './pages/MemberDashboard';

function RoleRedirect() {
  const { isAuthenticated, user, initializing } = useAuth();
  if (initializing) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'tech_head' ? '/tech-head' : '/member'} replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/tech-head"
              element={
                <ProtectedRoute roles={['tech_head']}>
                  <TechHeadDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/member"
              element={
                <ProtectedRoute roles={['co_committee']}>
                  <MemberDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<RoleRedirect />} />
            <Route path="*" element={<RoleRedirect />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
