import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465, // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER || process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const getMailFrom = () => {
  if (process.env.MAIL_FROM) return process.env.MAIL_FROM;
  const user = process.env.SMTP_USER || process.env.SMTP_EMAIL || 'no-reply@society.com';
  return `"SMS Portal" <${user}>`;
};

export default transporter;