import Nav from '../../components/Nav';
import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';

type Row = { id: string; timestamp: string; courseId: string; status: string };

export default function StudentDashboard() {
  const { token } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    fetch('/api/student/attendance', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()).then(setRows);
  }, []);

  return (
    <div>
      <Nav />
      <div style={{ padding: 16 }}>
        <h2>My Attendance</h2>
        <table border={1} cellPadding={6} style={{ marginTop: 12, width: '100%' }}>
          <thead><tr><th>Date</th><th>Course</th><th>Status</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>{new Date(r.timestamp).toLocaleString()}</td>
                <td>{r.courseId}</td>
                <td>{r.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
