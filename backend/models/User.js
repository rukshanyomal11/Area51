const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Please add a valid email'],
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
  },
  phone: {
    type: String,
    required: [true, 'Please add a phone number'],
    match: [/^\d{10}$/, 'Phone number must be exactly 10 digits'],
    trim: true,
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
    minlength: [5, 'Address must be at least 5 characters long'],
    trim: true,
  },
  currentToken: {
    type: String,
    default: null,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Add index for email
userSchema.index({ email: 1 }, { unique: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    if (this.password.match(/^\$2[aby]\$/)) {
      console.log('Password already hashed, skipping...');
      return next();
    }

    console.log('Hashing password for user:', this.email);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password for user:', this.email, error);
    next(error);
  }
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (error) {
    console.error('Error comparing passwords for user:', this.email, error);
    throw error; // Propagate error for better debugging
  }
};

module.exports = mongoose.model('User', userSchema);