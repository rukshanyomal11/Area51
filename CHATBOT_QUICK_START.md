# Quick Start Guide - n8n Cloud Product Chatbot

## 🚀 Step-by-Step Setup (15 minutes)

### Step 1: Sign Up for n8n Cloud (Free)
1. Go to **https://n8n.io/cloud**
2. Click **"Get started for free"**
3. Sign up with your email
4. Verify your email and log in
5. You'll be redirected to your n8n cloud dashboard

**Your n8n cloud URL will be something like:**
`https://yourname.app.n8n.cloud`

### Step 2: Create Workflow in n8n Cloud

1. In n8n cloud dashboard, click **"+ New workflow"**
2. Name it: **"Product Query Chatbot"**

### Step 3: Add Nodes (Copy this configuration)

#### Node 1: Webhook (Trigger)
- Search: "Webhook"
- HTTP Method: `POST`
- Path: `product-chat`
- Response Mode: `Last Node`
- Click **"Listen for Test Event"**
- **IMPORTANT:** Copy the Production URL (it will look like):
  ```
  https://yourname.app.n8n.cloud/webhook/product-chat
  ```
  Save this URL - you'll need it for the backend!

#### Node 2: MongoDB - Get Products
- Search: "MongoDB"
- Add MongoDB credentials:
  - Connection String: `mongodb+srv://area51kaveesha:G*gd5Y9!G9GH!Z8@cluster0.ndpq6xt.mongodb.net`
  - Database: `test` (or your database name)
- Operation: `Find`
- Collection: `products`
- Query: `{}`
- Limit: `100`

#### Node 3: Function - Prepare Data
- Search: "Function"
- JavaScript Code:
```javascript
const userQuestion = $input.first().json.query;
const products = $input.all()[1].json;

const productList = products.map(p => ({
  name: p.title,
  category: p.category,
  price: p.price,
  description: p.description,
  colors: p.color ? p.color.join(', ') : 'N/A',
  sizes: p.size ? p.size.join(', ') : 'N/A'
}));

return {
  question: userQuestion,
  products: JSON.stringify(productList.slice(0, 50), null, 2)
};
```

#### Node 4: OpenAI Chat
- Search: "OpenAI"
- Add OpenAI credentials:
  - API Key: `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`
- Resource: `Chat`
- Model: `gpt-3.5-turbo`
- Messages:
  - **System Message**:
    ```
    You are a helpful fashion assistant for Area 51 Fashion. Answer questions about products from the catalog. Be friendly and concise. Recommend specific items with prices when relevant.
    ```
  - **User Message**:
    ```
    Available Products:
    {{ $json.products }}
    
    Customer Question: {{ $json.question }}
    
    Answer helpfully based on available products.
    ```

#### Node 5: Respond to Webhook
- Search: "Respond to Webhook"
- Response Body:
```json
{
  "answer": "={{ $json.choices[0].message.content }}",
  "timestamp": "={{ $now }}"
}
```

### Step 4: Test the Workflow

1. Click **"Execute Workflow"**
2. In Webhook node, send test data:
```json
{
  "query": "Show me blue dresses under $50"
}
```
3. If successful, **ACTIVATE** the workflow (toggle switch in top right)

### Step 5: Update Backend .env

Add to `backend/.env`:
```env
N8N_WEBHOOK_URL=https://yourname.app.n8n.cloud/webhook/product-chat
```
**Replace `yourname` with YOUR actual n8n cloud URL from Step 3!**

### Step 6: Install axios in Backend

```bash
cd backend
npm install axios
```

### Step 7: Start Everything

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Note:** No need to start n8n locally - it's running in the cloud!

### Step 8: Test the Chatbot

1. Open your frontend (http://localhost:5173)
2. Look for the floating chat button (bottom right)
3. Click it and ask questions like:
   - "Show me women's dresses"
   - "What casual clothes do you have?"
   - "Do you have blue items?"
   - "What's your cheapest product?"

## ✅ Success Checklist

- [ ] n8n cloud account created
- [ ] Workflow created and ACTIVATED in n8n cloud
- [ ] MongoDB credentials added in n8n cloud
- [ ] OpenAI credentials added in n8n cloud
- [ ] Webhook URL copied from n8n cloud
- [ ] N8N_WEBHOOK_URL updated in backend/.env
- [ ] Backend running with axios installed
- [ ] Frontend showing chatbot button
- [ ] Test questions returning AI responses

## 🔧 Troubleshooting

**Chatbot button not showing?**
- Check console for errors
- Verify ProductChatbot is imported in App.jsx

**"n8n server is not running" error?**
- Check your N8N_WEBHOOK_URL in .env file
- Make sure you copied the full webhook URL from n8n cloud
- Verify workflow is ACTIVATED in n8n cloud

**MongoDB connection failed in n8n?**
- Check MongoDB credentials in n8n cloud
- Add `0.0.0.0/0` to MongoDB Atlas whitelist (to allow n8n cloud)

**OpenAI not responding?**
- Verify API key in n8n cloud credentials
- Try gpt-3.5-turbo instead of gpt-4
- Check OpenAI usage limits

**Webhook not found (404)?**
- Make sure workflow is ACTIVATED (toggle switch in n8n cloud)
- Check webhook path is exactly `product-chat`
- Verify the full webhook URL in .env matches n8n cloud URL

**CORS errors?**
- n8n cloud webhooks are publicly accessible
- Make sure your backend is making the request, not frontend directly

## 🎯 Example Questions to Test

1. "Show me all dresses"
2. "What do you have in blue?"
3. "I need a jacket for winter"
4. "Show casual wear under $100"
5. "Do you have women's tops?"
6. "What's your most expensive item?"
7. "Show me accessories"
8. "What sizes do you have for men's shirts?"

## 🚀 You're Done!

Your AI chatbot is now live and answering questions about your products!

**Next Steps:**
- Customize the OpenAI prompt for better responses
- Add more product filters
- Track popular questions
- Add product images in responses
