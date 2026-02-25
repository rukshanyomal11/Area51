# 🚀 Quick Start - Real-Time Chat System

## 📦 Dependencies Installed

### Backend:
- ✅ `socket.io` - Real-time communication
- ✅ `cors` - Cross-origin support

### Frontend:
- ✅ `socket.io-client` - Socket.IO client library

---

## ⚡ Start the System

### Step 1: Start Backend Server
```bash
cd backend
node server.js
```

**Expected Output:**
```
Server running on port 5000
Socket.IO ready for connections
MongoDB Connected: cluster0.xxxxx.mongodb.net
```

### Step 2: Start Frontend
```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

## 🧪 Quick Test

### As Customer:
1. Open browser: `http://localhost:5173`
2. Login with your account
3. Go to **Account** → **Order History**
4. Click **green chat icon** 💬 next to a product
5. Type a message and send!

### As Admin:
1. Open browser: `http://localhost:5173`
2. Login as admin: `area51kaveesha@gmail.com`
3. Go to any admin page
4. Click **purple chat button** (bottom-right corner)
5. See customer messages and reply!

---

## 🎯 Key Features

| Feature | Customer | Admin |
|---------|----------|-------|
| Chat Icon | ✅ In Order History | ✅ Floating Button |
| Real-time Messages | ✅ | ✅ |
| Typing Indicator | ✅ | ✅ |
| Unread Count | ✅ | ✅ |
| Message History | ✅ | ✅ |
| Product Context | ✅ | ✅ |

---

## 📁 File Structure

```
my-project/
├── backend/
│   ├── models/Chat.js          # ← NEW
│   ├── routes/chat.js          # ← NEW
│   └── server.js               # ← UPDATED
└── frontend/src/
    ├── context/
    │   └── SocketContext.jsx   # ← NEW
    ├── components/
    │   ├── chat/
    │   │   └── ChatBox.jsx     # ← NEW
    │   ├── admin/
    │   │   ├── AdminChatSidebar.jsx    # ← NEW
    │   │   └── AdminChatButton.jsx     # ← NEW
    │   └── account/
    │       └── OrderHistory.jsx        # ← UPDATED
    └── pages/
        ├── AccountPage.jsx             # ← UPDATED
        └── admin/
            ├── AdminDashboard.jsx      # ← UPDATED
            └── AdminProducts.jsx       # ← UPDATED
```

---

## 🔍 Verify Installation

### Check Backend:
```bash
cd backend
npm list socket.io
# Should show: socket.io@x.x.x
```

### Check Frontend:
```bash
cd frontend
npm list socket.io-client
# Should show: socket.io-client@x.x.x
```

---

## 🎨 UI Preview

### Customer Chat:
- **Location**: Order History page
- **Icon**: 🟢 Green chat bubble
- **Window**: Blue/Indigo gradient
- **Features**: Message bubbles, timestamps, typing indicator

### Admin Chat:
- **Location**: All admin pages (floating)
- **Button**: 🟣 Purple circle (bottom-right)
- **Sidebar**: Slides from right
- **Features**: Chat list, unread badges, user info

---

## ✅ System Check

Run these checks to verify everything works:

### 1. Socket.IO Connection
Open browser console (F12) and look for:
```
✅ Socket connected: xxxxx
```

### 2. Backend Logs
Check terminal for:
```
🟢 User connected: xxxxx
👤 User {userId} (user) connected with socket xxxxx
💬 Socket xxxxx joined chat xxxxx
```

### 3. Database
Check MongoDB for new collection:
```
Collection: chats
```

---

## 🐛 Common Issues

### Issue: "Socket.IO not connecting"
**Fix:**
1. Make sure backend is running on port 5000
2. Check `server.js` CORS settings:
   ```javascript
   origin: "http://localhost:5173"
   ```

### Issue: "Chat not opening"
**Fix:**
1. Verify user is logged in
2. Check browser console for errors
3. Ensure order exists in database

### Issue: "Messages not sending"
**Fix:**
1. Check network tab for API errors
2. Verify token in localStorage
3. Check backend logs for errors

---

## 📞 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/chat/create` | POST | Create new chat |
| `/api/chat/user/:userId` | GET | Get user chats |
| `/api/chat/admin/all` | GET | Get all chats |
| `/api/chat/:chatId/message` | POST | Send message |
| `/api/chat/:chatId/read` | PUT | Mark as read |

---

## 🎉 You're Ready!

Your real-time chat system is now:
- ✅ Fully installed
- ✅ Backend configured
- ✅ Frontend integrated
- ✅ Database ready
- ✅ Socket.IO active

**Start chatting and enjoy real-time communication!** 💬✨
