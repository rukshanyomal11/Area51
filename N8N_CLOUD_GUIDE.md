# n8n Cloud Setup - Visual Guide

## Step 1: Create n8n Cloud Account

1. Go to: **https://n8n.io/cloud**
2. Click **"Get started for free"**
3. Sign up (Free tier includes 5,000 executions/month)
4. After email verification, you'll get your workspace URL

**Your URL will be:**
```
https://[your-workspace].app.n8n.cloud
```

---

## Step 2: MongoDB Atlas Whitelist Setup

Since n8n cloud runs from different IPs, you need to allow all IPs:

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Navigate to **Network Access**
3. Click **"+ ADD IP ADDRESS"**
4. Choose **"ALLOW ACCESS FROM ANYWHERE"**
5. Enter IP: `0.0.0.0/0`
6. Click **"Confirm"**

⚠️ **Note:** This is necessary for n8n cloud to access your MongoDB.

---

## Step 3: Add Credentials in n8n Cloud

### MongoDB Credentials:

1. In n8n cloud, click your profile (bottom left)
2. Go to **Settings** → **Credentials**
3. Click **"+ New Credential"**
4. Search for **"MongoDB"**
5. Enter:
   - **Connection String**: 
     ```
     mongodb+srv://area51kaveesha:G*gd5Y9!G9GH!Z8@cluster0.ndpq6xt.mongodb.net
     ```
   - **Database**: `test` (or your database name)
6. Click **"Save"**
7. Test the connection

### OpenAI Credentials:

1. Click **"+ New Credential"** again
2. Search for **"OpenAI"**
3. Enter:
   - **API Key**: 
     ```
     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
     ```
4. Click **"Save"**

---

## Step 4: Create Workflow

### Create New Workflow:
1. Click **"Workflows"** in left sidebar
2. Click **"+ Add workflow"**
3. Name: **"Product Query Chatbot"**

### Add Nodes (Drag and drop from left panel):

#### 1️⃣ Webhook Node
```
Settings:
- HTTP Method: POST
- Path: product-chat
- Response Mode: Last Node
```

**After adding, you'll see Production URL like:**
```
https://your-workspace.app.n8n.cloud/webhook/product-chat
```
📋 **COPY THIS URL!** You need it for your backend .env file.

#### 2️⃣ MongoDB Node
```
Settings:
- Credentials: [Select MongoDB credential you created]
- Operation: Find
- Collection: products
- Query: {}
- Limit: 100
```

#### 3️⃣ Function Node
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

#### 4️⃣ OpenAI Node
```
Settings:
- Credentials: [Select OpenAI credential]
- Resource: Chat
- Model: gpt-3.5-turbo

System Message:
You are a helpful fashion assistant for Area 51 Fashion. Answer questions about products from the catalog. Be friendly and concise. Recommend specific items with prices when relevant.

User Message:
Available Products:
{{ $json.products }}

Customer Question: {{ $json.question }}

Answer helpfully based on available products.
```

#### 5️⃣ Respond to Webhook Node
```json
Response Body:
{
  "answer": "={{ $json.choices[0].message.content }}",
  "timestamp": "={{ $now }}"
}
```

### Connect the Nodes:
```
Webhook → MongoDB → Function → OpenAI → Respond to Webhook
```

---

## Step 5: Test & Activate Workflow

### Test the Workflow:

1. Click **"Execute Workflow"** (or **"Test workflow"**)
2. In the Webhook node, use this test data:
   ```json
   {
     "query": "Show me blue dresses"
   }
   ```
3. Click **"Execute"**
4. Check each node to see if data flows correctly
5. The Respond to Webhook should show an AI response

### Activate Workflow:

1. Toggle the **Active** switch (top right)
2. Workflow status should show **"Active"**

---

## Step 6: Configure Your Backend

### Update backend/.env:

Open `backend/.env` and add:

```env
# n8n Cloud Webhook URL
N8N_WEBHOOK_URL=https://YOUR-WORKSPACE.app.n8n.cloud/webhook/product-chat
```

**⚠️ IMPORTANT:** Replace `YOUR-WORKSPACE` with your actual n8n cloud workspace name!

Example:
```env
N8N_WEBHOOK_URL=https://kaveesha-fashion.app.n8n.cloud/webhook/product-chat
```

### Install axios:

```bash
cd backend
npm install axios
```

---

## Step 7: Start Your Application

### Terminal 1 - Backend:
```bash
cd backend
node server.js
```

Should show:
```
Server running on port 5000
MongoDB Connected
Socket.IO ready for connections
```

### Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Should show:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## Step 8: Test Your Chatbot

1. Open browser: **http://localhost:5173**
2. Look for the **floating chat icon** (bottom right corner)
3. Click the icon to open chatbot
4. Try these questions:
   - "Show me all dresses"
   - "What do you have in blue?"
   - "Show me casual wear"
   - "What's your cheapest item?"

---

## 🎉 Success!

If you get AI responses, your chatbot is working!

---

## 📊 Monitor Your Workflow

In n8n cloud:
1. Go to **"Executions"** (left sidebar)
2. See all chatbot requests
3. Click any execution to see the data flow
4. Debug issues if needed

---

## 💰 n8n Cloud Pricing (as of 2026)

**Free Tier:**
- 5,000 workflow executions/month
- Perfect for testing and small projects

**Starter Plan ($20/month):**
- 10,000 executions/month
- Better for production

For your chatbot, each question = 1 execution.

---

## 🔐 Security Best Practices

1. **Environment Variables**: Keep webhook URL in .env, not hardcoded
2. **MongoDB**: Use specific database user with limited permissions
3. **OpenAI**: Monitor API usage to avoid unexpected costs
4. **Rate Limiting**: Consider adding rate limiting to your chatbot endpoint

---

## 🚀 Next Steps

Once working, you can:
1. ✅ Add authentication to chatbot (require login)
2. ✅ Save chat history to MongoDB
3. ✅ Add product image URLs in responses
4. ✅ Track popular questions for analytics
5. ✅ Add product recommendations based on chat
6. ✅ Implement follow-up questions

---

## Need Help?

**n8n Cloud Issues:**
- Check: https://docs.n8n.io/hosting/cloud/
- Community: https://community.n8n.io/

**Your Project Issues:**
- Check browser console for errors
- Check backend terminal for errors
- Verify all credentials in n8n cloud
- Make sure workflow is ACTIVE

---

**You're all set! Happy chatting! 🤖✨**
