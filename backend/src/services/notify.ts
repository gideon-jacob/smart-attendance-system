import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { prisma } from '../lib/prisma';

const smtpUrl = process.env.SMTP_URL;
const twSid = process.env.TWILIO_ACCOUNT_SID;
const twToken = process.env.TWILIO_AUTH_TOKEN;
const twFrom = process.env.TWILIO_FROM_NUMBER;

const mailer = smtpUrl ? nodemailer.createTransport(smtpUrl) : null;
const sms = twSid && twToken ? twilio(twSid, twToken) : null;

async function notifyParent(studentId: string, message: string) {
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student) return;
  let parent = null as null | { email?: string; phone?: string; fullName?: string };
  if (student.parentId) {
    const p = await prisma.user.findUnique({ where: { id: student.parentId } });
    if (p) parent = { email: p.email, phone: p.phone ?? undefined, fullName: p.fullName };
  }
  if (!parent) return;

  // email
  if (mailer && parent.email) {
    try {
      await mailer.sendMail({ from: 'no-reply@smart-attendance.local', to: parent.email, subject: 'Absent Notification', text: message });
    } catch (e) {
      console.warn('Email send failed:', e);
    }
  } else {
    console.log('[EMAIL:simulated]', parent.email, message);
  }

  // sms
  if (sms && twFrom && parent.phone) {
    try {
      await sms.messages.create({ from: twFrom, to: parent.phone, body: message });
    } catch (e) {
      console.warn('SMS send failed:', e);
    }
  } else if (parent.phone) {
    console.log('[SMS:simulated]', parent.phone, message);
  }
}

export async function sendAbsentNotification(studentId: string, courseId: string) {
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  const student = await prisma.user.findUnique({ where: { id: studentId } });
  const message = `Your student ${student?.fullName ?? studentId} was marked Absent for course ${course?.courseCode ?? courseId}.`;
  await notifyParent(studentId, message);
}
