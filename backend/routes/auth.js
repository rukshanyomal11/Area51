const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// Generate JWT token
const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Middleware to verify JWT token (strict - for protected routes)
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified for user:', req.user.id);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Server error during token verification' });
  }
};

// Middleware for optional authentication (for public routes that can benefit from auth)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      if (process.env.JWT_SECRET) {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Optional token verified for user:', req.user.id);
      }
    } catch (error) {
      console.error('Optional token verification error:', error.message);
      // We don't reject the request for invalid tokens in optional auth
    }
  }
  next();
};

// Create Nodemailer transporter lazily so env vars are always current
const getTransporter = () => nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS via STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Register - FIXED: Removed verifyToken to allow public registration
router.post('/register', async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  try {
    // Validation
    if (!name || !email || !password || !phone || !address) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    if (address.length > 500) {
      return res.status(400).json({ message: 'Address cannot be more than 500 characters' });
    }

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    const user = await User.create({ name, email, password, phone, address });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      token: generateToken(user._id, user.email),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {
      const newToken = generateToken(user._id, user.email);
      await User.findByIdAndUpdate(user._id, { currentToken: newToken });
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        token: newToken,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  const { token } = req.body;
  try {
    const user = await User.findOne({ currentToken: token });
    if (user) {
      await User.findByIdAndUpdate(user._id, { currentToken: null });
      res.json({ message: 'Logged out successfully' });
    } else {
      res.status(400).json({ message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check Email
router.post('/check-email', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    res.json({ exists: !!user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Users (Restricted to authenticated users)
router.get('/users', verifyToken, async (req, res) => {
  try {
    const users = await User.find({}, 'name email phone');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete User (Restricted to authenticated users)
router.delete('/users/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes expiry

    await User.findByIdAndUpdate(user._id, { otp, otpExpires });

    const mailOptions = {
      from: `"Password Reset" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP',
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`,
    };

    const transporter = getTransporter();
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Forgot password error:', error.message || error);
    res.status(500).json({ message: `Email sending failed: ${error.message}` });
  }
});

// Verify OTP and Allow Password Reset
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.otp !== otp || Date.now() > user.otpExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const resetToken = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'OTP verified', resetToken });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  const { resetToken, newPassword } = req.body;
  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Let the pre('save') middleware handle the hashing
    user.password = newPassword; // Set plain password
    user.otp = null;
    user.otpExpires = null;
    user.currentToken = null; // Clear current token to force re-login
    
    await user.save(); // This will trigger the pre('save') middleware to hash the password
    
    console.log('Password reset successful for user:', user.email);
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Reset password error:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }
    res.status(500).json({ message: error.message });
  }
});

// Export both router and verifyToken
module.exports = router;
module.exports.verifyToken = verifyToken;
module.exports.optionalAuth = optionalAuth;