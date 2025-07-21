require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS   
  }
});

const sendWelcomeEmail = async (recipientEmail, userName) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipientEmail,
    subject: 'Welcome to Task Management System ',
    html: `
      <div style="font-family: 'Segoe UI', sans-serif; background-color: #fef6f3; padding: 30px; border-radius: 10px;">
        <h2 style="color: #ff6f61;">Hi ${userName},</h2>
        <p style="font-size: 16px; color: #333;">
          🎉 Thank you for registering with <strong>Task Management System</strong>!<br><br>
          We're excited to have you onboard. You can now start managing your projects and tracking tasks effortlessly.
        </p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 14px; color: #555;">
          If you did not register for this account, please ignore this email.
        </p>
        <p style="margin-top: 30px; font-size: 14px; color: #888;">
          — Task Management System Team
        </p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendOTPEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Task Management System',
    html: `<h3>Your OTP is: <b>${otp}</b></h3><p>It will expire in 5 minutes.</p>`
  };
  return transporter.sendMail(mailOptions);
};

module.exports = { sendWelcomeEmail, sendOTPEmail };