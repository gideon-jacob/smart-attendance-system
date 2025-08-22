import { Link } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export default function Nav() {
  const { user, logout } = useAuth();
  return (
    <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #ddd' }}>
      <span style={{ fontWeight: 700 }}>Smart Attendance</span>
      <span style={{ flex: 1 }} />
      {user && <span>{user.fullName} ({user.role})</span>}
      {user && <button onClick={logout}>Logout</button>}
    </nav>
  );
}
