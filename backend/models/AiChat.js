const mongoose = require('mongoose');

const aiMessageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  products: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    title: String,
    price: Number,
    imageSrc: String,
    relevanceScore: Number
  }]
});

const aiChatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  messages: [aiMessageSchema],
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  context: {
    preferences: {
      category: String, // Men, Women
      priceRange: {
        min: Number,
        max: Number
      },
      size: String,
      color: String,
      brand: String,
      style: String
    },
    searchHistory: [String]
  }
}, {
  timestamps: true
});

// Update lastActivity on new messages
aiChatSchema.pre('save', function(next) {
  this.lastActivity = new Date();
  next();
});

// Index for faster queries
aiChatSchema.index({ userId: 1, sessionId: 1 });
aiChatSchema.index({ status: 1, lastActivity: -1 });

module.exports = mongoose.model('AiChat', aiChatSchema);