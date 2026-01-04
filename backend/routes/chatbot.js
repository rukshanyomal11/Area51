const express = require('express');
const router = express.Router();
const axios = require('axios');

// n8n webhook URL - Update this after creating your workflow in n8n
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/product-chat';

// Ask product question via n8n
router.post('/ask', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ 
        success: false,
        message: 'Question is required' 
      });
    }

    console.log('Processing chatbot query:', query);

    // Send question to n8n workflow
    const response = await axios.post(N8N_WEBHOOK_URL, {
      query: query,
      userId: req.user?._id || 'guest',
      timestamp: new Date()
    }, {
      timeout: 30000 // 30 second timeout
    });

    console.log('n8n response received');

    res.json({
      success: true,
      answer: response.data.answer,
      query: query,
      timestamp: response.data.timestamp
    });

  } catch (error) {
    console.error('Chatbot error:', error.message);
    
    // Provide helpful error messages
    let errorMessage = 'Failed to process question';
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'n8n server is not running. Please start n8n first.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Request timeout. The AI is taking too long to respond.';
    }

    res.status(500).json({ 
      success: false,
      message: errorMessage,
      error: error.message 
    });
  }
});

// Get chatbot status
router.get('/status', async (req, res) => {
  try {
    const response = await axios.get(N8N_WEBHOOK_URL.replace('/webhook/product-chat', '/healthz'), {
      timeout: 5000
    });
    res.json({ 
      success: true,
      status: 'n8n is running',
      connected: true 
    });
  } catch (error) {
    res.json({ 
      success: false,
      status: 'n8n is not accessible',
      connected: false,
      message: 'Please start n8n using: npx n8n'
    });
  }
});

module.exports = router;
