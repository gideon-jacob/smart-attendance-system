import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth';

type Row = { id: string; studentId: string; courseId: string; timestamp: string; status: 'Present'|'Absent'|'Late'; isOverride: boolean; overrideReason?: string };

export default function CourseView() {
  const { id } = useParams();
  const { token } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [override, setOverride] = useState({ studentId: '', status: 'Present', reason: '' });

  useEffect(() => {
    if (!id) return;
    const from = new Date(); from.setHours(0,0,0,0);
    const to = new Date(); to.setHours(23,59,59,999);
    const params = new URLSearchParams({ courseId: id, from: from.toISOString(), to: to.toISOString() });
    fetch('/api/reports?' + params.toString(), { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(setRows);

    const es = new EventSource(`/api/attendance/live/${id}`, { withCredentials: false });
    es.addEventListener('attendance', (ev: MessageEvent) => {
      const data = JSON.parse(ev.data);
      setRows(prev => [{ id: crypto.randomUUID(), studentId: data.studentId, courseId: data.courseId, timestamp: new Date(data.timestamp).toISOString(), status: data.status, isOverride: false }, ...prev]);
    });
    es.addEventListener('override', (ev: MessageEvent) => {
      const data = JSON.parse(ev.data);
      setRows(prev => [{ id: crypto.randomUUID(), studentId: data.studentId, courseId: data.courseId, timestamp: new Date().toISOString(), status: data.status, isOverride: true, overrideReason: data.reason }, ...prev]);
    });
    return () => es.close();
  }, [id]);

  async function submitOverride(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/attendance/override', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ studentId: override.studentId, courseId: id, status: override.status, reason: override.reason }) });
    setOverride({ studentId: '', status: 'Present', reason: '' });
  }

  const presentCount = useMemo(() => rows.filter(r => r.status === 'Present').length, [rows]);

  return (
    <div>
      <h2>Course Attendance</h2>
      <div>Present count: {presentCount}</div>
      <form onSubmit={submitOverride} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, marginTop: 8 }}>
        <input placeholder="Student ID" value={override.studentId} onChange={(e) => setOverride(s => ({ ...s, studentId: e.target.value }))} />
        <select value={override.status} onChange={(e) => setOverride(s => ({ ...s, status: e.target.value }))}>
          <option>Present</option>
          <option>Late</option>
          <option>Absent</option>
        </select>
        <input placeholder="Reason" value={override.reason} onChange={(e) => setOverride(s => ({ ...s, reason: e.target.value }))} />
        <button type="submit">Override</button>
      </form>
      <table border={1} cellPadding={6} style={{ marginTop: 12, width: '100%' }}>
        <thead><tr><th>Time</th><th>Student</th><th>Status</th><th>Override</th><th>Reason</th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
              <td>{r.studentId}</td>
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
