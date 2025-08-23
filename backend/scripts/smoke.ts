/*
 Basic smoke test to validate core flows from the SRS.
 - Admin login, list users and courses
 - Record attendance for a student
 - Fetch reports
 - Student view attendance
 - Instructor override
*/

const BASE = 'http://localhost:4000';

async function login(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error(`Login failed for ${email}`);
  const data: any = await res.json();
  return { token: data.token as string, user: data.user as { id: string; role: string } };
}

async function get<T>(path: string, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : undefined });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json() as any;
}

async function post<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json() as any;
}

async function put<T>(path: string, body: any, token?: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PUT ${path} failed: ${res.status}`);
  return res.json() as any;
}

function dayRange(date: Date) {
  const from = new Date(date); from.setHours(0,0,0,0);
  const to = new Date(date); to.setHours(23,59,59,999);
  return { from: from.toISOString(), to: to.toISOString() };
}

async function main() {
  // Wait for health
  for (let i = 0; i < 40; i++) {
    try {
      const ok = await get<{ ok: boolean }>(`/api/health`);
      if (ok.ok) break;
    } catch {}
    await new Promise(r => setTimeout(r, 500));
  }

  const admin = await login('admin@example.com', 'admin123');
  console.log('Admin logged in:', admin.user);

  const users: any[] = await get('/api/users', admin.token);
  const student = users.find(u => u.role === 'student') || null;
  const instructor = users.find(u => u.role === 'instructor') || null;
  if (!student || !instructor) throw new Error('Seed users missing');

  const courses: any[] = await get('/api/courses', admin.token);
  const course = courses.find(c => c.daysOfWeek.includes(new Date().getDay())) || courses[0];
  if (!course) throw new Error('No course found for today');

  // Record attendance via hardware endpoint simulation
  const today = new Date();
  const dayOffset = course.daysOfWeek[0] - today.getDay();
  const scheduledDate = new Date(today.setDate(today.getDate() + dayOffset));
  const ts = scheduledDate.toISOString();
  const rec = await post('/api/attendance/record', { studentId: student.id, courseId: course.id, timestamp: ts });
  console.log('Recorded attendance:', rec.id);

  // Reports
  const { from, to } = dayRange(scheduledDate);
  const report: any[] = await get(`/api/reports?courseId=${course.id}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, admin.token);
  if (!report.find(r => r.studentId === student.id)) throw new Error('Report missing recorded attendance');
  console.log('Report items today:', report.length);

  // Student view
  const stud = await login('student@example.com', 'stud123');
  const myRows: any[] = await get('/api/student/attendance', stud.token);
  if (!myRows.length) throw new Error('Student has no attendance');
  console.log('Student rows:', myRows.length);

  // Instructor override to Absent with reason
  const instr = await login('instructor@example.com', 'teach123');
  const over = await put('/api/attendance/override', { studentId: student.id, courseId: course.id, status: 'Absent', reason: 'No show' }, instr.token);
  if (!over.isOverride) throw new Error('Override failed');
  console.log('Override OK:', over.id);

  console.log('Smoke test OK');
}

main().catch((e) => {
  console.error('Smoke test failed:', e);
  process.exit(1);
});
