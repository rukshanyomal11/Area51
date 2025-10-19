const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticate = (req, res, next) => {
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
    console.log(`Token verified for user ${req.user.id} at ${new Date().toISOString()}`);
    next();
  } catch (error) {
    console.error(`Token verification error: ${error.message}`);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    return res.status(500).json({ message: 'Server error during token verification' });
  }
};

// Middleware to verify admin role
const isAdmin = (req, res, next) => {
  const adminEmail = 'area51kaveesha@gmail.com';
  
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.email !== adminEmail) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  next();
};

const validateOrderData = (orderData) => {
  const errors = [];

  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    errors.push('Items array is required and must not be empty');
  }

  orderData.items.forEach((item, index) => {
    const requiredFields = ['title', 'price', 'imageSrc', 'size', 'color', 'quantity'];
    requiredFields.forEach(field => {
      if (!item[field]) {
        errors.push(`Item ${index + 1}: ${field} is required`);
      }
    });

    if (typeof item.price !== 'number' || item.price < 0) {
      errors.push(`Item ${index + 1}: price must be a positive number`);
    }

    if (typeof item.quantity !== 'number' || item.quantity < 1) {
      errors.push(`Item ${index + 1}: quantity must be a positive integer`);
    }
  });

  return errors;
};

module.exports = { 
  validateOrderData,
  authenticate,
  isAdmin
};
