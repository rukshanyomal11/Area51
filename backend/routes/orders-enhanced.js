const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Request = require('../models/Request');
const jwt = require('jsonwebtoken');

// Middleware to verify token and extract user ID
const verifyTokenAndGetUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization required' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Place new order from cart with approval workflow
router.post('/place', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { items, totalAmount } = req.body;
    
    console.log('Received order request:', { userId, items, totalAmount });

    // Validate request data
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Items are required' });
    }

    // Validate each item has required fields
    const requiredFields = ['title', 'price', 'imageSrc', 'size', 'color', 'quantity'];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      for (const field of requiredFields) {
        if (item[field] === undefined || item[field] === null) {
          return res.status(400).json({ 
            message: `Missing required field: ${field} in item ${i + 1}`,
            item: item 
          });
        }
      }
      if (typeof item.price !== 'number' || item.price < 0) {
        return res.status(400).json({ 
          message: `Invalid price for item ${i + 1}: ${item.price}` 
        });
      }
      if (typeof item.quantity !== 'number' || item.quantity < 1) {
        return res.status(400).json({ 
          message: `Invalid quantity for item ${i + 1}: ${item.quantity}` 
        });
      }
    }

    // Get user details for shipping address
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure user has required address fields
    if (!user.name || !user.email || !user.phone || !user.address) {
      return res.status(400).json({ 
        message: 'User profile incomplete. Please update your profile with name, phone, and address.' 
      });
    }

    // Calculate total amount
    const calculatedTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const finalTotalAmount = totalAmount || calculatedTotal;

    // Create order with awaiting approval status
    const order = new Order({
      userId,
      items: items.map(item => ({
        productId: item.productId || null,
        title: item.title,
        price: item.price,
        imageSrc: item.imageSrc,
        size: item.size,
        length: item.length || 'Standard',
        color: item.color,
        quantity: item.quantity
      })),
      totalAmount: finalTotalAmount,
      status: 'awaiting_approval',
      approvalStatus: 'pending',
      shippingAddress: {
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email
      }
      // orderNumber will be generated automatically by the Order model pre-save middleware
    });

    const savedOrder = await order.save();
    console.log('Order saved successfully:', savedOrder._id);

    // Create admin request for this order
    const adminRequest = new Request({
      userId,
      userEmail: user.email,
      items: items.map(item => ({
        productId: item.productId || null,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        imageSrc: item.imageSrc
      })),
      total: finalTotalAmount,
      orderId: savedOrder._id,
      date: new Date(),
      shippingAddress: {
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email
      }
    });

    await adminRequest.save();
    console.log('Admin request created:', adminRequest._id);

    // Clear the cart after successful order
    await Cart.findOneAndDelete({ userId });
    console.log('Cart cleared for user:', userId);

    res.status(201).json({
      message: 'Order placed successfully and awaiting admin approval',
      order: savedOrder,
      requestId: adminRequest._id
    });

  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ 
      message: 'Server error while placing order', 
      error: error.message,
      details: error.stack 
    });
  }
});

// Get user's order history with approval status
router.get('/user/:userId', verifyTokenAndGetUser, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user is accessing their own orders
    if (req.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const orders = await Order.find({ userId })
      .populate('items.productId')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders', error: error.message });
  }
});

// Get specific order details
router.get('/:orderId', verifyTokenAndGetUser, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('items.productId')
      .populate('userId', 'name email phone address');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Verify the user owns this order
    if (order.userId._id.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error while fetching order', error: error.message });
  }
});

// Update order status (admin only)
router.put('/:orderId/status', verifyTokenAndGetUser, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, rejectionReason } = req.body;

    // Validate status
    const validStatuses = ['pending', 'awaiting_approval', 'approved', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const updateData = { 
      status, 
      updatedAt: Date.now() 
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    const order = await Order.findByIdAndUpdate(
      orderId,
      updateData,
      { new: true }
    ).populate('items.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated successfully',
      order
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error while updating order status', error: error.message });
  }
});

// Get all orders (admin only)
router.get('/', verifyTokenAndGetUser, async (req, res) => {
  try {
    const { status, userId } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (userId) query.userId = userId;

    const orders = await Order.find(query)
      .populate('items.productId')
      .populate('userId', 'name email phone address')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error while fetching orders', error: error.message });
  }
});

// Get order statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      }
    ]);
    
    const totalOrders = await Order.countDocuments();
    const pendingApproval = await Order.countDocuments({ status: 'awaiting_approval' });
    const approvedOrders = await Order.countDocuments({ status: 'approved' });
    
    res.json({
      stats,
      totalOrders,
      pendingApproval,
      approvedOrders
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
