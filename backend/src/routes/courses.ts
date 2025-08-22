import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

const courseSchema = z.object({
  courseName: z.string().min(1),
  courseCode: z.string().min(1),
  instructorId: z.string().uuid(),
  startTimeMinutes: z.number().int().min(0).max(1439),
  endTimeMinutes: z.number().int().min(0).max(1439),
  daysOfWeek: z.array(z.number().int().min(0).max(6)).nonempty(),
});

router.use(requireAuth);

router.get('/', requireRole('admin'), async (_req, res, next) => {
  try {
    const courses = await prisma.course.findMany({ include: { instructor: true } });
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

router.post('/', requireRole('admin'), async (req, res, next) => {
  try {
    const data = courseSchema.parse(req.body);
    const course = await prisma.course.create({ data });
    res.status(201).json(course);
  } catch (err) {
    next(err);
  }
});

router.get('/mine', requireRole('instructor'), async (req: any, res, next) => {
  try {
    const courses = await prisma.course.findMany({ where: { instructorId: req.user!.id } });
    res.json(courses);
  } catch (err) {
    next(err);
  }
});

export default router;
