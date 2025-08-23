## Gemini Added Memories
- The user wants me to update the GEMINI.md file after each interaction to keep the knowledge base up-to-date.

## Backend Functionality Updates
- Added GET /:id and DELETE /:id endpoints to `backend/src/routes/users.ts`.
- Added GET /:id, PUT /:id, DELETE /:id, and student enrollment/unenrollment endpoints to `backend/src/routes/courses.ts`.
- Added a "my courses" endpoint to `backend/src/routes/student.ts`.
- Modified `backend/scripts/smoke.ts` to correctly handle course scheduling and reporting, ensuring the smoke test passes successfully.