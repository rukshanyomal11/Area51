const express = require('express');
const router = express.Router();
const Request = require('../models/Request');
const Order = require('../models/Order');

// Middleware to verify admin access
const verifyAdmin = async (req, res, next) => {
  // In production, implement proper admin role checking
  next();
};

// GET /api/requests
// Fetch all request records with enhanced filtering
router.get('/', async (req, res) => {
  try {
    const { status, userId } = req.query;
    let query = {};
    
    if (status) query.status = status;
    if (userId) query.userId = userId;
    
    const requests = await Request.find(query)
      .populate('userId', 'name email phone address')
      .populate('orderId')
      .sort({ date: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests/user/:userId
// Get user's own requests
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const requests = await Request.find({ userId })
      .populate('orderId')
      .sort({ date: -1 });
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/requests/:id/approve
// Approve a request with admin tracking
router.put('/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request status
    request.status = 'approved';
    request.approvalDate = new Date();
    request.notes = notes || null;
    
    await request.save();

    // Update corresponding order
    await Order.findByIdAndUpdate(request.orderId, { 
      status: 'approved',
      approvalStatus: 'approved',
      updatedAt: Date.now()
    });

    const updatedRequest = await Request.findById(id)
      .populate('userId', 'name email phone address')
      .populate('orderId');
    
    res.json({ 
      message: 'Request approved successfully', 
      request: updatedRequest 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/requests/:id/reject
// Reject a request with reason
router.put('/:id/reject', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;
    
    if (!reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request status
    request.status = 'rejected';
    request.rejectionReason = reason;
    request.notes = notes || null;
    request.approvalDate = new Date();
    
    await request.save();

    // Update corresponding order
    await Order.findByIdAndUpdate(request.orderId, { 
      status: 'rejected',
      approvalStatus: 'rejected',
      rejectionReason: reason,
      updatedAt: Date.now()
    });

    const updatedRequest = await Request.findById(id)
      .populate('userId', 'name email phone address')
      .populate('orderId');
    
    res.json({ 
      message: 'Request rejected successfully', 
      request: updatedRequest 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/requests/:id/cancel
// Cancel a request (user or admin)
router.put('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, notes } = req.body;
    
    const request = await Request.findById(id);
    
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    // Update request status
    request.status = 'cancelled';
    request.rejectionReason = reason || 'Cancelled by user';
    request.notes = notes || null;
    request.approvalDate = new Date();
    
    await request.save();

    // Update corresponding order
    await Order.findByIdAndUpdate(request.orderId, { 
      status: 'cancelled',
      approvalStatus: 'cancelled',
      rejectionReason: reason || 'Cancelled by user',
      updatedAt: Date.now()
    });

    const updatedRequest = await Request.findById(id)
      .populate('userId', 'name email phone address')
      .populate('orderId');
    
    res.json({ 
      message: 'Request cancelled successfully', 
      request: updatedRequest 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/requests/stats
// Get request statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = await Request.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
