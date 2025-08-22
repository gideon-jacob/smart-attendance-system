import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';
import { requireAuth, requireRole, AuthedRequest } from '../middleware/auth';

const router = Router();

const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(1),
  role: z.enum(['admin', 'instructor', 'student', 'parent']),
  password: z.string().min(6),
  parentId: z.string().uuid().optional().nullable(),
  phone: z.string().optional().nullable(),
});

const updateUserSchema = createUserSchema.partial().extend({ active: z.boolean().optional() });

router.use(requireAuth, requireRole('admin'));

router.get('/', async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(users.map(({ passwordHash, ...u }) => u));
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        fullName: data.fullName,
        role: data.role,
        passwordHash,
        parentId: data.parentId ?? null,
        phone: data.phone ?? null,
      },
    });
    res.status(201).json({ id: user.id });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req: AuthedRequest, res, next) => {
  try {
    const { id } = req.params;
    const data = updateUserSchema.parse(req.body);
    const update: any = { ...data };
    if (data.password) {
      update.passwordHash = await hashPassword(data.password);
      delete update.password;
    }
    const user = await prisma.user.update({ where: { id }, data: update });
    res.json({ id: user.id });
  } catch (err) {
    next(err);
  }
});

export default router;
