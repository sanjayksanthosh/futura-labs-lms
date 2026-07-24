const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: false,
    auth: {
      user: config.email.smtpUser,
      pass: config.email.smtpPass,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
      to,
      subject,
      html,
    };
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error('Email sending failed:', error.message);
    throw error;
  }
};

const sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to Futura Labs Ai Tutor LMS!</h1>
    <p>Hi ${user.name},</p>
    <p>Your account has been created successfully.</p>
    <p>Email: ${user.email}</p>
    <p>Role: ${user.role}</p>
    <p>Login at: <a href="${config.cors.origin}/login">${config.cors.origin}/login</a></p>
  `;
  return sendEmail({ to: user.email, subject: 'Welcome to Futura Labs Ai Tutor LMS', html });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${config.cors.origin}/reset-password/${resetToken}`;
  const html = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.name},</p>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="padding:10px 20px;background:#6366f1;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
    <p>This link expires in 10 minutes.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;
  return sendEmail({ to: user.email, subject: 'Password Reset - Futura Labs Ai Tutor LMS', html });
};

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail };
