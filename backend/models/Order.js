const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: false 
  },
  title: { 
    type: String, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  imageSrc: { 
    type: String, 
    required: true 
  },
  size: { 
    type: String, 
    required: true 
  },
  length: { 
    type: String, 
    required: false,
    default: 'Standard'
  },
  color: { 
    type: String, 
    required: true 
  },
  quantity: { 
    type: Number, 
    required: true, 
    min: 1 
  },
});

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'awaiting_approval', 'approved', 'processing', 'shipped', 'delivered', 'cancelled', 'rejected'],
    default: 'pending'
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
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
  orderNumber: {
    type: String,
    unique: true,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate unique order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

// Update timestamp on save
orderSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Order', orderSchema);
