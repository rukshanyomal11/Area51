const express = require('express');
const router = express.Router();
const Request = require('../models/Request');

// GET /requests
// Fetch all request records from the database with populated user data
router.get('/', async (req, res) => {
  try {
    const requests = await Request.find()
      .populate('userId', 'name email phone address')
      .sort({ date: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/requests/:id/approve
// Approve a request and update corresponding order
router.put('/:id/approve', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update request status
    request.status = 'approved';
    await request.save();

    // Update corresponding order status
    const Order = require('../models/Order');
    await Order.findByIdAndUpdate(request.orderId, { 
      status: 'confirmed',
      updatedAt: Date.now()
    });

    const updatedRequest = await Request.findById(req.params.id)
      .populate('userId', 'name email phone address');
    
    res.json({ message: 'Request approved successfully', request: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/requests/:id/cancel
// Cancel a request and update corresponding order
router.put('/:id/cancel', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    // Update request status
    request.status = 'cancelled';
    await request.save();

    // Update corresponding order status
    const Order = require('../models/Order');
    await Order.findByIdAndUpdate(request.orderId, { 
      status: 'cancelled',
      updatedAt: Date.now()
    });

    const updatedRequest = await Request.findById(req.params.id)
      .populate('userId', 'name email phone address');
    
    res.json({ message: 'Request cancelled successfully', request: updatedRequest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests/:id
// Get specific request details
router.get('/:id', async (req, res) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate('userId', 'name email phone address');
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }
    
    res.json(request);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Export the router to be used in main app
module.exports = router;
