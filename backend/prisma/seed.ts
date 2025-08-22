import { prisma } from '../src/lib/prisma';
import { hashPassword } from '../src/utils/password';

async function main() {
  const adminPass = await hashPassword('admin123');
  const instructorPass = await hashPassword('teach123');
  const studentPass = await hashPassword('stud123');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: { email: 'admin@example.com', fullName: 'Admin', role: 'admin', passwordHash: adminPass },
  });
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: { email: 'instructor@example.com', fullName: 'Instructor One', role: 'instructor', passwordHash: instructorPass },
  });
  const parent = await prisma.user.upsert({
    where: { email: 'parent@example.com' },
    update: {},
    create: { email: 'parent@example.com', fullName: 'Parent One', role: 'parent', passwordHash: await hashPassword('parent123') },
  });
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: { email: 'student@example.com', fullName: 'Student One', role: 'student', passwordHash: studentPass, parentId: parent.id },
  });

  const course = await prisma.course.upsert({
    where: { courseCode: 'CS101' },
    update: {},
    create: {
      courseName: 'Intro to CS',
      courseCode: 'CS101',
      instructorId: instructor.id,
      startTimeMinutes: 9 * 60, // 09:00
      endTimeMinutes: 10 * 60,  // 10:00
      daysOfWeek: [1, 3, 5], // Mon, Wed, Fri
    },
  });

  await prisma.enrollment.upsert({
    where: { id: `${student.id}-${course.id}` },
    update: {},
    create: { studentId: student.id, courseId: course.id },
  }).catch(async () => {
    // fallback if composite not supported by where: just ensure exists
    const exists = await prisma.enrollment.findFirst({ where: { studentId: student.id, courseId: course.id } });
    if (!exists) await prisma.enrollment.create({ data: { studentId: student.id, courseId: course.id } });
  });

  // eslint-disable-next-line no-console
  console.log('Seed complete:', { admin: admin.email, instructor: instructor.email, student: student.email, course: course.courseCode });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
