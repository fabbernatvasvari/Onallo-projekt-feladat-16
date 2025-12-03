import express from 'express';
import { otpCache } from '../utils/otpCache.js';

const router = express.Router();

router.post('/', (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  if (!otpCache[email]) {
    return res.status(400).json({ message: 'Email not found or OTP expired' });
  }

  if (otpCache[email] !== otp) {
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // OTP is valid, delete it
  delete otpCache[email];

  res.status(200).json({ 
    message: 'Login successful',
    email,
    token: `token_${email}_${Date.now()}` // Simple token for demo
  });
});

export default router;
