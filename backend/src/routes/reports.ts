import { Router } from 'express';
import { z } from 'zod';
import PDFDocument from 'pdfkit';
import { prisma } from '../lib/prisma';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

const querySchema = z.object({
  courseId: z.string().uuid().optional(),
  studentId: z.string().uuid().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  format: z.enum(['json', 'csv', 'pdf']).default('json'),
});

router.get('/', requireAuth, requireRole('admin', 'instructor'), async (req, res, next) => {
  try {
    const q = querySchema.parse(req.query);
    const where: any = {};
    if (q.courseId) where.courseId = q.courseId;
    if (q.studentId) where.studentId = q.studentId;
    if (q.from || q.to) {
      where.timestamp = {};
      if (q.from) (where.timestamp as any).gte = new Date(q.from);
      if (q.to) (where.timestamp as any).lte = new Date(q.to);
    }

    const rows = await prisma.attendanceRecord.findMany({ where, orderBy: { timestamp: 'asc' } });

    switch (q.format) {
      case 'json':
        return res.json(rows);
      case 'csv': {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="attendance.csv"');
        res.write('id,studentId,courseId,timestamp,status,isOverride,overrideReason\n');
        for (const r of rows) {
          res.write(`${r.id},${r.studentId},${r.courseId},${r.timestamp.toISOString()},${r.status},${r.isOverride},${r.overrideReason ?? ''}\n`);
        }
        return res.end();
      }
      case 'pdf': {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="attendance.pdf"');
        const doc = new PDFDocument();
        doc.pipe(res);
        doc.fontSize(18).text('Attendance Report', { underline: true });
        doc.moveDown();
        for (const r of rows) {
          doc.fontSize(12).text(`${r.timestamp.toISOString()} | Student ${r.studentId} | Course ${r.courseId} | ${r.status}${r.isOverride ? ' (override)' : ''}${r.overrideReason ? ` - ${r.overrideReason}` : ''}`);
        }
        doc.end();
        return;
      }
    }
  } catch (err) {
    next(err);
  }
});

export default router;
