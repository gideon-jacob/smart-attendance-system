import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import InstructorDashboard from './pages/instructor/InstructorDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import { useAuth } from './auth/useAuth';
import Nav from './components/Nav';
import { Box } from '@mui/material';

function RequireAuth({ children, role }: { children: JSX.Element; role?: string }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />;
  return children;
}

function Layout({ children }: { children: JSX.Element }) {
  return (
    <Box>
      <Nav />
      {children}
    </Box>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/admin/*"
        element={
          <RequireAuth role="admin">
            <Layout>
              <AdminDashboard />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/instructor/*"
        element={
          <RequireAuth role="instructor">
            <Layout>
              <InstructorDashboard />
            </Layout>
          </RequireAuth>
        }
      />
      <Route
        path="/student/*"
        element={
          <RequireAuth role="student">
            <Layout>
              <StudentDashboard />
            </Layout>
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
