import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';

type Course = { id: string; courseName: string; courseCode: string; instructorId: string; startTimeMinutes: number; endTimeMinutes: number; daysOfWeek: number[] };

type User = { id: string; email: string; fullName: string; role: string };

export default function CoursesPage() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [form, setForm] = useState({ courseName: '', courseCode: '', instructorId: '', startTimeMinutes: 540, endTimeMinutes: 600, daysOfWeek: '1,3,5' });

  async function load() {
    const res = await fetch('/api/courses', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setCourses(data);
    const resUsers = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
    const users: User[] = await resUsers.json();
    setInstructors(users.filter(u => u.role === 'instructor'));
  }

  useEffect(() => { load(); }, []);

  async function createCourse(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      courseName: form.courseName,
      courseCode: form.courseCode,
      instructorId: form.instructorId,
      startTimeMinutes: Number(form.startTimeMinutes),
      endTimeMinutes: Number(form.endTimeMinutes),
      daysOfWeek: form.daysOfWeek.split(',').map(s => Number(s.trim())).filter(n => !Number.isNaN(n)),
    };
    await fetch('/api/courses', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
    setForm({ courseName: '', courseCode: '', instructorId: '', startTimeMinutes: 540, endTimeMinutes: 600, daysOfWeek: '1,3,5' });
    await load();
  }

  return (
    <div>
      <h2>Courses</h2>
      <form onSubmit={createCourse} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr auto', gap: 8 }}>
        <input placeholder="Name" value={form.courseName} onChange={(e) => setForm({ ...form, courseName: e.target.value })} />
        <input placeholder="Code" value={form.courseCode} onChange={(e) => setForm({ ...form, courseCode: e.target.value })} />
        <select value={form.instructorId} onChange={(e) => setForm({ ...form, instructorId: e.target.value })}>
          <option value="">Select instructor</option>
          {instructors.map(i => <option key={i.id} value={i.id}>{i.fullName}</option>)}
        </select>
        <input placeholder="Start minutes" value={form.startTimeMinutes} onChange={(e) => setForm({ ...form, startTimeMinutes: Number(e.target.value) })} />
        <input placeholder="End minutes" value={form.endTimeMinutes} onChange={(e) => setForm({ ...form, endTimeMinutes: Number(e.target.value) })} />
        <input placeholder="Days (0-6) e.g. 1,3,5" value={form.daysOfWeek} onChange={(e) => setForm({ ...form, daysOfWeek: e.target.value })} />
        <button type="submit">Create</button>
      </form>
      <ul>
        {courses.map(c => (
          <li key={c.id}>{c.courseCode} - {c.courseName} (instructor: {c.instructorId})</li>
        ))}
      </ul>
    </div>
  );
}
