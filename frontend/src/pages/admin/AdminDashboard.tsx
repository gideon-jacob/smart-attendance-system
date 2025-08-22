import { Link, Route, Routes, Navigate } from 'react-router-dom';
import Nav from '../../components/Nav';
import UsersPage from './UsersPage';
import CoursesPage from './CoursesPage';
import ReportsPage from './ReportsPage';

export default function AdminDashboard() {
  return (
    <div>
      <Nav />
      <div style={{ display: 'flex' }}>
        <aside style={{ width: 200, borderRight: '1px solid #ddd', padding: 12 }}>
          <ul>
            <li><Link to="users">User Management</Link></li>
            <li><Link to="courses">Course Management</Link></li>
            <li><Link to="reports">Reports</Link></li>
          </ul>
        </aside>
        <main style={{ flex: 1, padding: 16 }}>
          <Routes>
            <Route path="users" element={<UsersPage />} />
            <Route path="courses" element={<CoursesPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="*" element={<Navigate to="users" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
