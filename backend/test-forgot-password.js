const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Test forgot password functionality
const testForgotPassword = async () => {
  try {
    await connectDB();

    const testEmail = 'area51kaveesha@gmail.com'; // Use your test email
    
    console.log(`\nTesting forgot password for: ${testEmail}`);
    console.log(`EMAIL_USER: ${process.env.EMAIL_USER}`);
    console.log(`EMAIL_PASS length: ${process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0}`);
    
    // Check if user exists
    const user = await User.findOne({ email: testEmail });
    if (!user) {
      console.error('User not found! Create a test user first.');
      process.exit(1);
    }
    
    console.log(`User found: ${user.name} (${user.email})`);
    
    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000;
    
    console.log(`Generated OTP: ${otp}`);
    
    // Update user with OTP
    await User.findByIdAndUpdate(user._id, { otp, otpExpires });
    console.log('OTP saved to database');
    
    // Prepare email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: 'Password Reset OTP - Test',
      text: `Your OTP for password reset is ${otp}. It is valid for 10 minutes. Do not share it with anyone.`,
    };
    
    console.log('Sending email...');
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');
    console.log('Message ID:', info.messageId);
    
    process.exit(0);
  } catch (error) {
    console.error('Error occurred:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    process.exit(1);
  }
};

testForgotPassword();
