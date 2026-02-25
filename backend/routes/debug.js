const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const User = require('../models/User');

// Debug endpoint to check order placement
router.get('/order-test', async (req, res) => {
  try {
    const testOrder = {
      userId: 'test-user-id',
      items: [{
        title: 'Test Product',
        price: 99.99,
        imageSrc: 'test.jpg',
        size: 'M',
        color: 'Blue',
        quantity: 1
      }],
      totalAmount: 99.99
    };
    
    res.json({ 
      message: 'Order structure test',
      expectedStructure: testOrder,
      modelFields: Object.keys(Order.schema.paths)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to check user profile completeness
router.get('/user-profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const profileComplete = !!(user.name && user.email && user.phone && user.address);
    
    res.json({
      userId,
      profileComplete,
      missingFields: {
        name: !user.name,
        email: !user.email,
        phone: !user.phone,
        address: !user.address
      },
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
