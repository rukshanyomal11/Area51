const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{ 
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    title: String, 
    price: Number, 
    quantity: Number,
    size: String,
    color: String,
    imageSrc: String
  }],
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'cancelled', 'rejected'], 
    default: 'pending' 
  },
  approvalDate: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true }
  },
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  notes: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Index for better query performance
requestSchema.index({ userId: 1, status: 1 });
requestSchema.index({ orderId: 1 });

module.exports = mongoose.model('Request', requestSchema);
