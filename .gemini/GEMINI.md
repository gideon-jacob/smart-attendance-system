## Gemini Added Memories
- The user wants me to update the GEMINI.md file after each interaction to keep the knowledge base up-to-date.
- The user wants me to ask about creating a git commit message after I finish building something.
- The user wants me to generate a commit message and return it in the prompt, but not to commit anything by myself unless explicitly told to.

## Backend Functionality Updates
- Added GET /:id and DELETE /:id endpoints to `backend/src/routes/users.ts`.
- Added GET /:id, PUT /:id, DELETE /:id, and student enrollment/unenrollment endpoints to `backend/src/routes/courses.ts`.
- Added a "my courses" endpoint to `backend/src/routes/student.ts`.
- Modified `backend/scripts/smoke.ts` to correctly handle course scheduling and reporting, ensuring the smoke test passes successfully.

## Project Overview

This is a full-stack "Smart Attendance System" built with a TypeScript-based monorepo using npm workspaces. It consists of a `backend` and a `frontend`.

### Backend

*   **Framework:** Node.js with Express.
*   **Database:** PostgreSQL, managed with Prisma ORM.
*   **Authentication:** JWT-based authentication (`jsonwebtoken`).
*   **API:** RESTful API with routes for authentication, users, courses, attendance, reports, and students.
*   **Dependencies:** `bcryptjs` for password hashing, `zod` for validation, `dayjs` for date manipulation, `nodemailer` and `twilio` for notifications, and `pdfkit` for generating reports.
*   **Testing:** Jest for testing.

### Frontend

*   **Framework:** React with Vite.
*   **UI Library:** Material-UI (MUI).
*   **Routing:** React Router (`react-router-dom`).
*   **Data Fetching:** React Query (`@tanstack/react-query`).
*   **Charting:** Chart.js for data visualization.
*   **Authentication:** Role-based authentication with a `useAuth` hook and a `RequireAuth` component.
*   **Structure:** The application is divided into pages for different user roles (admin, instructor, student).

### Database Schema (`schema.prisma`)

*   **Models:** `User`, `Course`, `Enrollment`, `AttendanceRecord`.
*   **User Roles:** `admin`, `instructor`, `student`, `parent`.
*   **Relationships:**
    *   Users can be parents of other users (students).
    *   Instructors are associated with courses.
    *   Students are enrolled in courses.
    *   Attendance records are linked to students and courses.

### Development Environment

*   **Containerization:** Docker is used to run a PostgreSQL database.
*   **Monorepo:** The project is a monorepo using npm workspaces to manage the `backend` and `frontend` packages.