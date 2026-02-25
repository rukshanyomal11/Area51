const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const AiChat = require('../models/AiChat');
const Product = require('../models/Product');
const aiService = require('../utils/aiService');
const { authenticate } = require('../utils/validation');

// Create or get AI chat session
router.post('/session', authenticate, async (req, res) => {
  try {
    const { userId, userName } = req.body;
    
    // Check for existing active session
    let aiChat = await AiChat.findOne({ 
      userId,
      status: 'active'
    }).sort({ lastActivity: -1 });

    if (!aiChat) {
      // Create new session
      const sessionId = uuidv4();
      aiChat = new AiChat({
        userId,
        userName,
        sessionId,
        messages: [{
          role: 'assistant',
          content: `Hi ${userName}! 👋 I'm your AI shopping assistant. I can help you find the perfect clothing items from our collection. What are you looking for today?`,
          timestamp: new Date()
        }]
      });
      
      await aiChat.save();
    }

    res.json(aiChat);
  } catch (error) {
    console.error('Error creating AI chat session:', error);
    res.status(500).json({ message: 'Failed to create AI chat session' });
  }
});

// Get AI chat session
router.get('/session/:sessionId', authenticate, async (req, res) => {
  try {
    const aiChat = await AiChat.findOne({ 
      sessionId: req.params.sessionId,
      userId: req.user.id 
    }).populate('messages.products.productId');

    if (!aiChat) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json(aiChat);
  } catch (error) {
    console.error('Error fetching AI chat session:', error);
    res.status(500).json({ message: 'Failed to fetch chat session' });
  }
});

// Send message to AI
router.post('/message', authenticate, async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    // Find the chat session
    const aiChat = await AiChat.findOne({ 
      sessionId,
      userId: req.user.id 
    });

    if (!aiChat) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    // Add user message
    aiChat.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });

    // Extract search intent from user message
    const searchIntent = await aiService.extractSearchIntent(message);
    console.log('Search intent:', searchIntent);

    // Search for products based on intent
    let searchResults = [];
    if (searchIntent.intent === 'search' || searchIntent.intent === 'browse') {
      const searchQuery = searchIntent.keywords.join(' ');
      const filters = {
        category: searchIntent.category,
        priceRange: searchIntent.priceRange,
        size: searchIntent.size,
        color: searchIntent.color,
        brand: searchIntent.brand,
        style: searchIntent.style
      };

      searchResults = await aiService.searchProducts(searchQuery, filters);
      
      // Update user context/preferences
      if (searchIntent.category) {
        aiChat.context.preferences.category = searchIntent.category;
      }
      if (searchIntent.priceRange) {
        aiChat.context.preferences.priceRange = searchIntent.priceRange;
      }
      if (searchIntent.size) {
        aiChat.context.preferences.size = searchIntent.size;
      }
      if (searchIntent.color) {
        aiChat.context.preferences.color = searchIntent.color;
      }
      if (searchIntent.brand) {
        aiChat.context.preferences.brand = searchIntent.brand;
      }
      if (searchIntent.style) {
        aiChat.context.preferences.style = searchIntent.style;
      }

      // Add to search history
      if (searchQuery.trim()) {
        aiChat.context.searchHistory.push(searchQuery.trim());
        // Keep only last 10 searches
        if (aiChat.context.searchHistory.length > 10) {
          aiChat.context.searchHistory = aiChat.context.searchHistory.slice(-10);
        }
      }
    } else if (searchIntent.intent === 'recommend') {
      searchResults = await aiService.getRecommendations(aiChat.context.preferences);
    }

    // Generate AI response
    const conversationHistory = aiChat.messages.slice(-10); // Last 10 messages
    const aiResponse = await aiService.generateResponse(
      message, 
      searchResults, 
      conversationHistory
    );

    // Format products for storage
    const formattedProducts = searchResults.slice(0, 5).map(product => ({
      productId: product._id,
      title: product.title,
      price: product.price,
      imageSrc: product.imageSrc,
      relevanceScore: 1.0 // You can implement more sophisticated scoring
    }));

    // Add AI response
    aiChat.messages.push({
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
      products: formattedProducts
    });

    // Save the updated chat
    await aiChat.save();

    // Return the response with products
    res.json({
      message: aiResponse,
      products: aiService.formatProductsForResponse(searchResults.slice(0, 5)),
      searchIntent,
      sessionId
    });

  } catch (error) {
    console.error('Error processing AI message:', error);
    res.status(500).json({ message: 'Failed to process message' });
  }
});

// Get product details
router.get('/product/:productId', authenticate, async (req, res) => {
  try {
    const product = await Product.findById(req.params.productId);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ message: 'Failed to fetch product details' });
  }
});

// Search products directly
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, size, color, brand, style } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (minPrice || maxPrice) {
      filters.priceRange = {};
      if (minPrice) filters.priceRange.min = parseFloat(minPrice);
      if (maxPrice) filters.priceRange.max = parseFloat(maxPrice);
    }
    if (size) filters.size = size;
    if (color) filters.color = color;
    if (brand) filters.brand = brand;
    if (style) filters.style = style;

    const products = await aiService.searchProducts(q, filters);
    const formattedProducts = aiService.formatProductsForResponse(products);

    res.json({
      products: formattedProducts,
      total: products.length,
      query: q,
      filters
    });

  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({ message: 'Failed to search products' });
  }
});

// Get recommendations
router.get('/recommendations', authenticate, async (req, res) => {
  try {
    const { category, sessionId } = req.query;
    
    let preferences = {};
    
    // Get preferences from session if available
    if (sessionId) {
      const aiChat = await AiChat.findOne({ sessionId, userId: req.user.id });
      if (aiChat && aiChat.context.preferences) {
        preferences = aiChat.context.preferences;
      }
    }
    
    // Override with query parameters
    if (category) {
      preferences.category = category;
    }

    const products = await aiService.getRecommendations(preferences);
    const formattedProducts = aiService.formatProductsForResponse(products);

    res.json({
      products: formattedProducts,
      preferences
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ message: 'Failed to get recommendations' });
  }
});

// Close AI chat session
router.put('/session/:sessionId/close', authenticate, async (req, res) => {
  try {
    const aiChat = await AiChat.findOneAndUpdate(
      { sessionId: req.params.sessionId, userId: req.user.id },
      { status: 'closed' },
      { new: true }
    );

    if (!aiChat) {
      return res.status(404).json({ message: 'Chat session not found' });
    }

    res.json({ message: 'Chat session closed successfully' });
  } catch (error) {
    console.error('Error closing AI chat session:', error);
    res.status(500).json({ message: 'Failed to close chat session' });
  }
});

// Get user's AI chat history
router.get('/history', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const aiChats = await AiChat.find({ userId: req.user.id })
      .sort({ lastActivity: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('sessionId status lastActivity messages');

    // Get summary of each chat (first user message and last activity)
    const chatSummary = aiChats.map(chat => {
      const firstUserMessage = chat.messages.find(msg => msg.role === 'user');
      return {
        sessionId: chat.sessionId,
        status: chat.status,
        lastActivity: chat.lastActivity,
        preview: firstUserMessage ? firstUserMessage.content.slice(0, 100) + '...' : 'No messages',
        messageCount: chat.messages.length
      };
    });

    res.json({
      chats: chatSummary,
      total: await AiChat.countDocuments({ userId: req.user.id }),
      page: parseInt(page),
      totalPages: Math.ceil(await AiChat.countDocuments({ userId: req.user.id }) / limit)
    });

  } catch (error) {
    console.error('Error fetching AI chat history:', error);
    res.status(500).json({ message: 'Failed to fetch chat history' });
  }
});

module.exports = router;