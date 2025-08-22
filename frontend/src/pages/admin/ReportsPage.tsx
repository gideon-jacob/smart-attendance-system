import { useState } from 'react';
import { useAuth } from '../../auth/useAuth';

export default function ReportsPage() {
  const { token } = useAuth();
  const [courseId, setCourseId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [rows, setRows] = useState<any[]>([]);

  async function loadJson() {
    const params = new URLSearchParams();
    if (courseId) params.set('courseId', courseId);
    if (studentId) params.set('studentId', studentId);
    if (from) params.set('from', new Date(from).toISOString());
    if (to) params.set('to', new Date(to).toISOString());
    const res = await fetch('/api/reports?' + params.toString(), { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setRows(data);
  }

  function download(format: 'csv'|'pdf') {
    const params = new URLSearchParams();
    if (courseId) params.set('courseId', courseId);
    if (studentId) params.set('studentId', studentId);
    if (from) params.set('from', new Date(from).toISOString());
    if (to) params.set('to', new Date(to).toISOString());
    params.set('format', format);
    window.open('/api/reports?' + params.toString(), '_blank');
  }

  return (
    <div>
      <h2>Reports</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto auto', gap: 8 }}>
        <input placeholder="Course ID" value={courseId} onChange={(e) => setCourseId(e.target.value)} />
        <input placeholder="Student ID" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
        <input type="datetime-local" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input type="datetime-local" value={to} onChange={(e) => setTo(e.target.value)} />
        <button onClick={loadJson}>Load</button>
        <div>
          <button onClick={() => download('csv')}>CSV</button>
          <button onClick={() => download('pdf')}>PDF</button>
        </div>
      </div>
      <table border={1} cellPadding={6} style={{ marginTop: 12, width: '100%' }}>
        <thead><tr><th>Timestamp</th><th>Student</th><th>Course</th><th>Status</th><th>Override</th><th>Reason</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{new Date(r.timestamp).toLocaleString()}</td>
              <td>{r.studentId}</td>
              <td>{r.courseId}</td>
              <td>{r.status}</td>
              <td>{String(r.isOverride)}</td>
              <td>{r.overrideReason || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
