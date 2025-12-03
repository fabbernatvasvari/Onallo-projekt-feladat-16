import express from 'express';
import randomstring from 'randomstring';
import nodemailer from 'nodemailer';
import { otpCache } from '../utils/otpCache.js';

const router = express.Router();

const sendMail = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.APP_PASSWORD,
    },
  });

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Chat Verification Code',
      text: `Your verification code is: ${otp}`,
    });
    console.log(`Email sent: ${info.response}`);
  } catch (err) {
    console.log(`Email error: ${err}`);
  }
};

router.post('/', (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const otp = randomstring.generate({ length: 4, charset: 'numeric' });
  otpCache[email] = otp;

  // Attempt to send email (optional for demo)
  if (process.env.EMAIL_USER && process.env.APP_PASSWORD) {
    sendMail(email, otp);
  } else {
    console.log(`Demo OTP for ${email}: ${otp}`);
  }

  res.status(200).json({ 
    message: 'OTP sent successfully',
    email,
    otp: otp // Remove this in production; only for testing
  });
});

export default router;