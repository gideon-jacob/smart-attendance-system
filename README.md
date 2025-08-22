# Smart Attendance System

This repository contains a full-stack implementation of the Smart Attendance System based on the provided SRS.

Stack
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL (Docker), JWT auth, SSE for live updates
- Frontend: React + TypeScript (Vite), React Router, TanStack Query, Chart.js, Tailwind CSS
- Testing: Jest + Supertest (backend), Vitest + React Testing Library (frontend), Playwright (optional E2E)

Quick start
1. Copy environment variables
   cp .env.example backend/.env

2. Start PostgreSQL
   docker compose up -d postgres

3. Install dependencies
   npm install

4. Setup backend database and seed
   npm run --workspace backend prisma:db:push
   npm run --workspace backend prisma:seed

5. Run backend in dev mode
   npm run --workspace backend dev

6. Set up and run the frontend
   npm run --workspace frontend dev

End-to-end smoke test (backend only)
- With the backend running, run:
  npm run --workspace backend smoke

Credentials (seeded)
- Admin: admin@example.com / admin123
- Instructor: instructor@example.com / teach123
- Student: student@example.com / stud123
- Parent: parent@example.com / parent123

Notes
- Live attendance uses Server-Sent Events over GET /api/attendance/live/:courseId.
- Reports are available as JSON, CSV, or PDF via GET /api/reports.
- Email/SMS notifications default to console logging unless provider env vars are configured.
