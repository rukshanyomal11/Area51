# n8n Chatbot Setup Guide - Product Query System

## Overview
This guide will help you set up an n8n workflow that answers natural language questions about your clothing products stored in MongoDB Atlas.

## Architecture
```
User Question → Frontend Chat → Backend API → n8n Webhook → 
MongoDB Query + OpenAI Processing → Intelligent Response → User
```

## Prerequisites
1. ✅ MongoDB Atlas with products collection
2. ✅ OpenAI API key (you already have: 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)
3. ✅ n8n installed (we'll set this up)

---

## Step 1: Install n8n

### Option A: Using npx (Recommended for testing)
```bash
npx n8n
```

### Option B: Using Docker
```bash
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n
```

### Option C: Global Installation
```bash
npm install n8n -g
n8n start
```

n8n will be available at: **http://localhost:5678**

---

## Step 2: Create MongoDB Connection in n8n

1. Open n8n at `http://localhost:5678`
2. Go to **Settings** → **Credentials**
3. Click **Add Credential** → Search for **MongoDB**
4. Fill in your MongoDB Atlas credentials:
   - **Connection String**: `mongodb+srv://area51kaveesha:G*gd5Y9!G9GH!Z8@cluster0.ndpq6xt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
   - **Database**: Your database name (likely `test` or `ecommerce`)

---

## Step 3: Add OpenAI Credentials

1. Go to **Settings** → **Credentials**
2. Click **Add Credential** → Search for **OpenAI**
3. Enter your API Key: `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`

---

## Step 4: Create the n8n Workflow

### Workflow Structure:
```
Webhook (Trigger) → 
Get Products from MongoDB → 
Process with OpenAI → 
Format Response → 
Return to Chat
```

### Create New Workflow:

1. **Create new workflow** in n8n
2. **Name it**: "Product Query Chatbot"

### Add Nodes:

#### 1. Webhook Node (Trigger)
- Node: **Webhook**
- Method: **POST**
- Path: `product-chat`
- Response Mode: **Last Node**
- Copy the webhook URL (e.g., `http://localhost:5678/webhook/product-chat`)

#### 2. MongoDB Node - Get All Products
- Node: **MongoDB**
- Operation: **Find**
- Collection: `products`
- Query: `{}`
- Limit: `100`

This will get all your products to provide context to OpenAI.

#### 3. Function Node - Prepare Context
- Node: **Function**
- JavaScript Code:
```javascript
const userQuestion = $input.all()[0].json.query;
const products = $input.all()[1].json;

// Format products for AI context
const productContext = products.map(p => ({
  name: p.title,
  category: p.category,
  price: p.price,
  description: p.description,
  colors: p.color,
  sizes: p.size
}));

return {
  question: userQuestion,
  products: JSON.stringify(productContext, null, 2)
};
```

#### 4. OpenAI Node - Generate Response
- Node: **OpenAI**
- Resource: **Chat**
- Model: **gpt-3.5-turbo** or **gpt-4**
- Messages:
  - **System Message**:
    ```
    You are a helpful fashion assistant for Area 51 Fashion store. 
    Answer customer questions about products based on the provided product catalog.
    Be friendly, concise, and helpful. If asked about specific products, 
    recommend items from the catalog. Include prices when relevant.
    ```
  - **User Message**:
    ```
    Products available: {{ $json.products }}
    
    Customer question: {{ $json.question }}
    
    Provide a helpful answer based on the available products.
    ```

#### 5. Respond to Webhook
- Node: **Respond to Webhook**
- Response Body:
  ```json
  {
    "answer": "={{ $json.choices[0].message.content }}",
    "timestamp": "={{ $now }}",
    "query": "={{ $node['Function'].json.question }}"
  }
  ```

---

## Step 5: Create Backend Route for Chatbot

Create a new file: `backend/routes/chatbot.js`

```javascript
const express = require('express');
const router = express.Router();
const axios = require('axios');

// n8n webhook URL - Update this after creating your workflow
const N8N_WEBHOOK_URL = 'http://localhost:5678/webhook/product-chat';

// Ask product question via n8n
router.post('/ask', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Question is required' });
    }

    // Send question to n8n workflow
    const response = await axios.post(N8N_WEBHOOK_URL, {
      query: query,
      userId: req.user?._id || 'guest',
      timestamp: new Date()
    });

    res.json({
      success: true,
      answer: response.data.answer,
      query: query
    });

  } catch (error) {
    console.error('Chatbot error:', error.message);
    res.status(500).json({ 
      success: false,
      message: 'Failed to process question',
      error: error.message 
    });
  }
});

module.exports = router;
```

---

## Step 6: Register Route in Backend

Update `backend/server.js`:

```javascript
// Add this with other route imports
const chatbotRoutes = require('./routes/chatbot');

// Add this with other route registrations
app.use('/api/chatbot', chatbotRoutes);
```

---

## Step 7: Create Frontend Chatbot Component

Create: `frontend/src/components/chatbot/ProductChatbot.jsx`

```javascript
import React, { useState, useRef, useEffect } from 'react';

const ProductChatbot = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Hi! 👋 Ask me anything about our products!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userMessage })
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, { type: 'bot', text: data.answer }]);
      } else {
        setMessages(prev => [...prev, { 
          type: 'bot', 
          text: 'Sorry, I had trouble understanding that. Could you rephrase?' 
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        text: 'Oops! Something went wrong. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-96 h-[500px] flex flex-col border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl">
          <h3 className="font-bold text-lg">Product Assistant 🤖</h3>
          <p className="text-xs opacity-90">Powered by AI</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  msg.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about products..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductChatbot;
```

---

## Step 8: Add Chatbot to Your App

Update `frontend/src/App.jsx`:

```javascript
import ProductChatbot from './components/chatbot/ProductChatbot';

// Inside your App component, add:
<ProductChatbot />
```

---

## Step 9: Install Required Packages

### Backend:
```bash
cd backend
npm install axios
```

---

## Step 10: Test Your Setup

1. **Start n8n**: `npx n8n`
2. **Create the workflow** in n8n following Step 4
3. **Activate the workflow** in n8n (toggle switch)
4. **Start your backend**: `node server.js`
5. **Start your frontend**: `npm run dev`

### Test Questions:
- "Show me blue dresses under $50"
- "What casual clothes do you have?"
- "Do you have any winter jackets?"
- "What's your cheapest item?"
- "Show me women's tops"

---

## Advanced: Improved Workflow with Vector Search

For better product matching, upgrade to use embeddings:

1. Add **Embeddings** node before OpenAI
2. Store product embeddings in MongoDB
3. Use vector similarity for better matches

---

## Troubleshooting

**Issue**: n8n webhook not responding
- Check n8n is running on port 5678
- Verify workflow is activated
- Check webhook URL is correct

**Issue**: MongoDB connection failed
- Verify credentials in n8n
- Check MongoDB Atlas whitelist includes your IP
- Test connection in n8n

**Issue**: OpenAI not working
- Verify API key is correct
- Check OpenAI credits/quota
- Try with gpt-3.5-turbo instead of gpt-4

---

## Next Steps

1. ✅ Add conversation history
2. ✅ Implement product recommendations
3. ✅ Add image generation for product suggestions
4. ✅ Create analytics dashboard
5. ✅ Add multi-language support

---

**Your chatbot is now ready to answer product questions intelligently! 🎉**
