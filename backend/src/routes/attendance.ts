import { Router } from 'express';
import { z } from 'zod';
import dayjs from 'dayjs';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';
import { sseBroker } from '../sse/broker';

const router = Router();

const recordSchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  timestamp: z.string().datetime().optional(),
});

const overrideSchema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  status: z.enum(['Present', 'Absent', 'Late']),
  reason: z.string().min(1),
});

router.get('/live/:courseId', requireAuth, requireRole('instructor'), async (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders?.();
  const { courseId } = req.params;
  sseBroker.subscribe(`course:${courseId}`, res);
  res.write(`event: ping\ndata: {"ok":true}\n\n`);
});

function computeStatus(course: { startTimeMinutes: number; endTimeMinutes: number }, ts: Date): 'Present' | 'Late' {
  const minutes = ts.getHours() * 60 + ts.getMinutes();
  return minutes <= course.startTimeMinutes + 10 ? 'Present' : 'Late';
}

router.post('/record', async (req, res, next) => {
  try {
    const { studentId, courseId } = recordSchema.parse(req.body);
    const course = await prisma.course.findUnique({ where: { id: courseId } });
    if (!course) return res.status(404).json({ error: 'Course not found' });
    const ts = req.body.timestamp ? new Date(req.body.timestamp) : new Date();

    // validate course is active today
    const dow = dayjs(ts).day();
    if (!course.daysOfWeek.includes(dow)) {
      return res.status(400).json({ error: 'No class scheduled for this course today' });
    }

    const status = computeStatus(course, ts);
    const rec = await prisma.attendanceRecord.create({
      data: { studentId, courseId, timestamp: ts, status },
    });
    sseBroker.publish(`course:${courseId}`, 'attendance', { studentId, courseId, timestamp: ts, status });
    res.status(201).json(rec);
  } catch (err) {
    next(err);
  }
});

import { sendAbsentNotification } from '../services/notify';

router.put('/override', requireAuth, requireRole('instructor'), async (req: AuthedRequest, res, next) => {
  try {
    const { studentId, courseId, status, reason } = overrideSchema.parse(req.body);
    const rec = await prisma.attendanceRecord.create({
      data: { studentId, courseId, status, isOverride: true, overrideReason: reason, timestamp: new Date() },
    });
    if (status === 'Absent') {
      sendAbsentNotification(studentId, courseId).catch((e) => console.warn('notify error', e));
    }
    sseBroker.publish(`course:${courseId}`, 'override', { studentId, courseId, status, reason });
    res.json(rec);
  } catch (err) {
    next(err);
  }
});

export default router;
