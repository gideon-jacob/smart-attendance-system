import { useEffect, useState } from 'react';
import { useAuth } from '../../auth/useAuth';

type User = { id: string; email: string; fullName: string; role: string; active: boolean };

export default function UsersPage() {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ email: '', fullName: '', role: 'student', password: '' });

  async function load() {
    const res = await fetch('/api/users', { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    setUsers(data);
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e: React.FormEvent) {
    e.preventDefault();
    await fetch('/api/users', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(form) });
    setForm({ email: '', fullName: '', role: 'student', password: '' });
    await load();
  }

  async function toggleActive(u: User) {
    await fetch(`/api/users/${u.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ active: !u.active }) });
    await load();
  }

  return (
    <div>
      <h2>Users</h2>
      <form onSubmit={createUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 8 }}>
        <input placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          <option value="admin">admin</option>
          <option value="instructor">instructor</option>
          <option value="student">student</option>
          <option value="parent">parent</option>
        </select>
        <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button type="submit">Create</button>
      </form>
      <table border={1} cellPadding={6} style={{ marginTop: 12, width: '100%' }}>
        <thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Active</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.fullName}</td>
              <td>{u.role}</td>
              <td>{String(u.active)}</td>
              <td><button onClick={() => toggleActive(u)}>{u.active ? 'Deactivate' : 'Activate'}</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
