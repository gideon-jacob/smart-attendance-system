process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL_TEST || 'postgresql://postgres:postgres@localhost:5432/smart_attendance_test?schema=public';
process.env.JWT_SECRET = 'test-secret';
