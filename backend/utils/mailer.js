const nodemailer = require("nodemailer");
const config = require("../config/env");

let transporter;

const canSendEmail = () =>
  Boolean(
    config.smtpHost &&
      config.smtpPort &&
      config.smtpUser &&
      config.smtpPass &&
      config.mailFrom
  );

const getTransporter = () => {
  if (!canSendEmail()) {
    return null;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: config.smtpSecure,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPass,
      },
    });
  }

  return transporter;
};

const sendPasswordResetEmail = async ({ to, username, resetUrl }) => {
  const mailer = getTransporter();
  if (!mailer) {
    return false;
  }

  await mailer.sendMail({
    from: config.mailFrom,
    to,
    subject: "Taskser password reset",
    text: `Hello ${username},\n\nUse this link to reset your Taskser password:\n${resetUrl}\n\nThis link expires in 1 hour.`,
    html: `
      <p>Hello ${username},</p>
      <p>Use the link below to reset your Taskser password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link expires in 1 hour.</p>
    `,
  });

  return true;
};

module.exports = {
  canSendEmail,
  sendPasswordResetEmail,
};
