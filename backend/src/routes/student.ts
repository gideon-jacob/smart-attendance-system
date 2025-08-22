import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthedRequest, requireRole } from '../middleware/auth';

const router = Router();

router.get('/attendance', requireAuth, requireRole('student', 'parent'), async (req: AuthedRequest, res, next) => {
  try {
    const childId = (req.query.childId as string) || undefined;
    let studentId = req.user!.id;
    if (req.user!.role === 'parent') {
      if (childId) studentId = childId;
      else {
        const firstChild = await prisma.user.findFirst({ where: { parentId: req.user!.id } });
        if (!firstChild) return res.json([]);
        studentId = firstChild.id;
      }
    }
    const rows = await prisma.attendanceRecord.findMany({ where: { studentId }, orderBy: { timestamp: 'desc' } });
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
