import request from 'supertest';
import app from '../app';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';

beforeAll(async () => {
  await prisma.$executeRawUnsafe('CREATE DATABASE smart_attendance_test').catch(() => {});
  // Reset schema
  await prisma.$executeRawUnsafe('DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;');
  // Create minimal tables via Prisma migrate would be better, but we will count on db push before tests.
});

describe('Auth', () => {
  test('login fails for unknown user', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'x@example.com', password: 'secret123' });
    expect(res.status).toBe(401);
  });

  test('login succeeds for valid user', async () => {
    const passwordHash = await hashPassword('secret123');
    const u = await prisma.user.create({ data: { email: 'a@example.com', fullName: 'Alice', role: 'admin', passwordHash } as any });
    const res = await request(app).post('/api/auth/login').send({ email: 'a@example.com', password: 'secret123' });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
    await prisma.user.delete({ where: { id: u.id } });
  });
});
