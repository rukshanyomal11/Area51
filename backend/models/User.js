const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, 'Please add a valid email'],
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
  },
  address: {
    type: String,
    required: [true, 'Please add an address'],
    maxlength: [500, 'Address cannot be more than 500 characters'],
  },
  currentToken: {
    type: String,
    default: null, // Tracks the current active token
  },
  otp: {
    type: String, // Store OTP
    default: null,
  },
  otpExpires: {
    type: Date, // OTP expiry time
    default: null,
  },
}, {
  timestamps: true // Add createdAt and updatedAt timestamps
});

// Hash password before saving - FIXED VERSION
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
    if (this.password.match(/^\$2[aby]\$/)) {
      console.log('Password already hashed, skipping...');
      return next();
    }

    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  try {
    const isMatch = await bcrypt.compare(enteredPassword, this.password);
    console.log('Password comparison result:', isMatch);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);