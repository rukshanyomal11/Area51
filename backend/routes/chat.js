const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const { authenticate, isAdmin } = require('../utils/validation');

// Get all chats for a user
router.get('/user/:userId', authenticate, async (req, res) => {
  try {
    const chats = await Chat.find({ 
      userId: req.params.userId,
      status: 'active'
    })
    .populate('orderId')
    .populate('productId')
    .sort({ lastMessage: -1 });
    
    res.json(chats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

// Get all chats for admin
router.get('/admin/all', authenticate, isAdmin, async (req, res) => {
  try {
    const chats = await Chat.find({ status: 'active' })
      .populate('userId', 'name email')
      .populate('orderId')
      .populate('productId')
      .sort({ lastMessage: -1 });
    
    res.json(chats);
  } catch (error) {
    console.error('Error fetching admin chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

// Get specific chat
router.get('/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('userId', 'name email')
      .populate('orderId')
      .populate('productId');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error fetching chat:', error);
    res.status(500).json({ message: 'Failed to fetch chat' });
  }
});

// Create new chat
router.post('/create', authenticate, async (req, res) => {
  try {
    const { orderId, orderNumber, userId, userName, productId, productName } = req.body;
    
    // Check if chat already exists for this order and product
    let chat = await Chat.findOne({ 
      orderId, 
      productId: productId || null 
    });
    
    if (chat) {
      return res.json(chat);
    }
    
    // Create new chat
    chat = new Chat({
      orderId,
      orderNumber,
      userId,
      userName,
      productId,
      productName,
      messages: []
    });
    
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
});

// Add message to chat
router.post('/:chatId/message', authenticate, async (req, res) => {
  try {
    const { sender, senderName, senderRole, message } = req.body;
    
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    const newMessage = {
      sender,
      senderName,
      senderRole,
      message,
      timestamp: new Date()
    };
    
    chat.messages.push(newMessage);
    chat.lastMessage = new Date();
    
    // Update unread count
    if (senderRole === 'admin') {
      chat.unreadCount.user += 1;
    } else {
      chat.unreadCount.admin += 1;
    }
    
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ message: 'Failed to add message' });
  }
});

// Mark messages as read
router.put('/:chatId/read', authenticate, async (req, res) => {
  try {
    const { role } = req.body; // 'user' or 'admin'
    
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    // Reset unread count for the role
    if (role === 'user') {
      chat.unreadCount.user = 0;
    } else if (role === 'admin') {
      chat.unreadCount.admin = 0;
    }
    
    await chat.save();
    res.json(chat);
  } catch (error) {
    console.error('Error marking as read:', error);
    res.status(500).json({ message: 'Failed to mark as read' });
  }
});

// Close chat
router.put('/:chatId/close', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      { status: 'closed' },
      { new: true }
    );
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    console.error('Error closing chat:', error);
    res.status(500).json({ message: 'Failed to close chat' });
  }
});

module.exports = router;
