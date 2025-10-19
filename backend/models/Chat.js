const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  senderRole: {
    type: String,
    enum: ['user', 'admin'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  read: {
    type: Boolean,
    default: false
  }
});

const chatSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  orderNumber: {
    type: String,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productName: {
    type: String
  },
  messages: [messageSchema],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  lastMessage: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    user: { type: Number, default: 0 },
    admin: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for faster queries
chatSchema.index({ userId: 1, orderId: 1 });
chatSchema.index({ status: 1, lastMessage: -1 });

module.exports = mongoose.model('Chat', chatSchema);
