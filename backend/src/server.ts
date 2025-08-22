import http from 'http';
import app from './app';
import { env } from './env';
import { prisma } from './lib/prisma';
import { sendAbsentNotification } from './services/notify';
import dayjs from 'dayjs';

// Simple scheduler to mark ABSENT for students who didn't scan by end time
async function markAbsences() {
  const now = new Date();
  const dow = dayjs(now).day();
  const courses = await prisma.course.findMany({ where: { daysOfWeek: { has: dow } } });
  for (const course of courses) {
    const end = new Date(now);
    end.setHours(Math.floor(course.endTimeMinutes / 60), course.endTimeMinutes % 60, 0, 0);
    // only act shortly after class end
    if (now.getTime() < end.getTime() || now.getTime() - end.getTime() > 5 * 60 * 1000) continue;

    const enrollments = await prisma.enrollment.findMany({ where: { courseId: course.id } });
    for (const enr of enrollments) {
      const startOfDay = dayjs(now).startOf('day').toDate();
      const endOfDay = dayjs(now).endOf('day').toDate();
      const existing = await prisma.attendanceRecord.findFirst({
        where: { courseId: course.id, studentId: enr.studentId, timestamp: { gte: startOfDay, lte: endOfDay } },
      });
      if (!existing) {
        await prisma.attendanceRecord.create({ data: { courseId: course.id, studentId: enr.studentId, status: 'Absent' } });
        sendAbsentNotification(enr.studentId, course.id).catch((e) => console.warn('notify error', e));
      }
    }
  }
}

setInterval(() => {
  markAbsences().catch((e) => console.error('markAbsences error', e));
}, 60 * 1000);

const server = http.createServer(app);
server.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${env.PORT}`);
});
