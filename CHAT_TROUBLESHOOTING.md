# 🔧 Chat System - Troubleshooting & Testing Guide

## ✅ Pre-Flight Checklist

Before testing, verify these are completed:

- [ ] Backend packages installed: `socket.io`, `cors`
- [ ] Frontend packages installed: `socket.io-client`
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] User logged in (for customer test)
- [ ] Admin logged in (for admin test)

---

## 🧪 Step-by-Step Testing Guide

### Test 1: Customer Chat Creation

**Steps:**
1. Open browser: `http://localhost:5173`
2. Login as regular user
3. Navigate to Account → Order History
4. Find any order
5. Click the **green chat icon** 💬 next to a product

**Expected Result:**
- Chat modal should open immediately
- Header shows: "Chat Support"
- Order number and product name displayed
- Empty state: "Start the conversation!"

**If it fails:**
- Check browser console for errors
- Verify order has items
- Check if user is logged in (localStorage.token)
- Verify API endpoint: `/api/chat/create`

---

### Test 2: Send Message (Customer)

**Steps:**
1. In the open chat, type: "Hello, I have a question"
2. Click "Send" button or press Enter

**Expected Result:**
- Message appears in chat (right side, blue)
- Timestamp shows current time
- Message saved to database
- Input field clears

**If it fails:**
- Check browser console for Socket.IO errors
- Verify network tab shows POST to `/api/chat/:chatId/message`
- Check backend logs for Socket.IO events
- Verify token in request headers

---

### Test 3: Admin Chat Visibility

**Steps:**
1. Open NEW browser window or incognito mode
2. Login as admin: `area51kaveesha@gmail.com`
3. Go to Admin Products (or any admin page)
4. Look for purple floating button (bottom-right)

**Expected Result:**
- Purple chat button visible
- Red badge showing unread count
- Button has chat icon

**If it fails:**
- Verify admin login successful
- Check if AdminChatButton is rendered
- Verify CSS not hiding the button (z-index: 40)
- Check browser console for component errors

---

### Test 4: Admin View Chat

**Steps:**
1. Click purple chat button
2. Sidebar should open from right

**Expected Result:**
- Sidebar slides in smoothly
- Shows list of active chats
- Customer name visible
- Order number displayed
- Last message preview
- Unread badge (if unread)

**If it fails:**
- Check API endpoint: `/api/chat/admin/all`
- Verify admin token in localStorage
- Check network tab for 401 errors
- Verify Chat collection exists in MongoDB

---

### Test 5: Admin Reply

**Steps:**
1. Click on a chat in the sidebar
2. ChatBox opens
3. Type reply: "Hello! How can I help you?"
4. Click Send

**Expected Result:**
- Message appears in chat (left side, white)
- Both users see the message
- Typing indicator works
- Message saved to database

**If it fails:**
- Verify Socket.IO connection
- Check if both users in same chat room
- Verify POST to `/api/chat/:chatId/message` succeeds
- Check Socket.IO emit/receive events

---

### Test 6: Real-Time Communication

**Steps:**
1. Keep both windows open (customer + admin)
2. Send message from customer window
3. Watch admin window

**Expected Result:**
- Message appears INSTANTLY in admin window
- No page refresh needed
- Typing indicator shows when typing
- Unread count updates

**If it fails:**
- Check Socket.IO connection status
- Verify both users joined chat room
- Check backend Socket.IO logs
- Test with `socket.connected` in console

---

## 🐛 Common Issues & Solutions

### Issue 1: "Socket.IO not connecting"

**Symptoms:**
- Console error: `WebSocket connection failed`
- Messages don't appear in real-time
- Typing indicator not working

**Solutions:**
```javascript
// 1. Check backend server.js CORS settings
cors: {
  origin: "http://localhost:5173",  // Must match frontend URL
  methods: ["GET", "POST", "PUT", "DELETE"]
}

// 2. Verify Socket.IO port
const io = new Server(server, { /* config */ });
server.listen(5000);  // Port 5000

// 3. Check frontend SocketContext.jsx
const newSocket = io('http://localhost:5000', {
  autoConnect: true,
  reconnection: true
});
```

**Test:**
```javascript
// In browser console:
window.socketTest = io('http://localhost:5000');
window.socketTest.on('connect', () => console.log('✅ Connected!'));
```

---

### Issue 2: "Chat not opening when clicking icon"

**Symptoms:**
- Click chat icon, nothing happens
- No console errors
- Modal doesn't appear

**Solutions:**
```javascript
// 1. Check OrderHistory.jsx
// Verify handleOpenChat function exists
const handleOpenChat = async (order, item) => {
  console.log('Opening chat for:', order, item);  // Add debug log
  // ...
};

// 2. Check if user data exists
const user = JSON.parse(localStorage.getItem('user'));
console.log('User:', user);  // Should have id, name

// 3. Verify API endpoint
fetch('http://localhost:5000/api/chat/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({ /* data */ })
});
```

**Test:**
```javascript
// In browser console on Order History page:
const token = localStorage.getItem('token');
const user = JSON.parse(localStorage.getItem('user'));
console.log('Token:', token ? '✅ Exists' : '❌ Missing');
console.log('User:', user);
```

---

### Issue 3: "Messages not sending"

**Symptoms:**
- Type message, click send
- Message doesn't appear
- Input field doesn't clear

**Solutions:**
```javascript
// 1. Check ChatBox.jsx handleSendMessage
const handleSendMessage = async () => {
  console.log('Sending message:', newMessage);  // Debug log
  
  if (!newMessage.trim()) {
    console.log('❌ Empty message');
    return;
  }
  
  // Verify token
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No token');
    return;
  }
  
  // Check response
  const response = await fetch(/* ... */);
  console.log('Response:', response.status);
};

// 2. Check backend route
// routes/chat.js - add logging
router.post('/:chatId/message', authenticate, async (req, res) => {
  console.log('📨 Received message:', req.body);
  // ...
});
```

**Test:**
```javascript
// Test API directly in browser console:
const token = localStorage.getItem('token');
const chatId = 'YOUR_CHAT_ID';

fetch(`http://localhost:5000/api/chat/${chatId}/message`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  },
  body: JSON.stringify({
    sender: 'USER_ID',
    senderName: 'Test User',
    senderRole: 'user',
    message: 'Test message'
  })
})
.then(r => r.json())
.then(console.log);
```

---

### Issue 4: "Admin can't see chats"

**Symptoms:**
- Admin sidebar empty
- "No active chats" message
- Chats exist in database

**Solutions:**
```javascript
// 1. Verify admin authentication
const user = JSON.parse(localStorage.getItem('user'));
console.log('Admin user:', user);
console.log('Is admin?', user.email === 'area51kaveesha@gmail.com');

// 2. Check API endpoint
fetch('http://localhost:5000/api/chat/admin/all', {
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(chats => console.log('Chats:', chats));

// 3. Verify isAdmin middleware in backend
// utils/validation.js
const isAdmin = (req, res, next) => {
  console.log('Checking admin:', req.user);
  // ...
};
```

**Test:**
```bash
# Check MongoDB directly
mongosh "YOUR_MONGODB_URI"
use your_database
db.chats.find().pretty()
```

---

### Issue 5: "Unread count not updating"

**Symptoms:**
- Send messages, badge stays same
- Refresh needed to see count
- Count incorrect

**Solutions:**
```javascript
// 1. Check AdminChatButton.jsx fetchUnreadCount
const fetchUnreadCount = async () => {
  console.log('Fetching unread count...');
  const response = await fetch(/* ... */);
  const chats = await response.json();
  console.log('Chats:', chats);
  
  const total = chats.reduce((acc, chat) => {
    console.log('Chat unread:', chat.unreadCount);
    return acc + (chat.unreadCount?.admin || 0);
  }, 0);
  
  console.log('Total unread:', total);
  setUnreadCount(total);
};

// 2. Check backend Chat model
// Ensure unreadCount is updated when message sent
chat.unreadCount.admin += 1;  // For admin
chat.unreadCount.user += 1;   // For user
await chat.save();

// 3. Verify mark as read
router.put('/:chatId/read', authenticate, async (req, res) => {
  console.log('Marking as read:', req.params.chatId, req.body.role);
  // ...
});
```

---

## 🔍 Debugging Tools

### 1. Browser Console Commands

```javascript
// Check Socket.IO connection
const socket = io('http://localhost:5000');
socket.on('connect', () => console.log('Connected:', socket.id));
socket.on('disconnect', () => console.log('Disconnected'));

// Test chat API
const testChat = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/api/chat/admin/all', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  console.table(data);
};
testChat();

// Check localStorage
console.log('Token:', localStorage.getItem('token'));
console.log('User:', JSON.parse(localStorage.getItem('user')));
```

### 2. Backend Logging

Add to `server.js`:
```javascript
io.on('connection', (socket) => {
  console.log('🟢 Connection:', socket.id);
  
  socket.onAny((event, ...args) => {
    console.log('📡 Event:', event, args);
  });
  
  socket.on('disconnect', () => {
    console.log('🔴 Disconnect:', socket.id);
  });
});
```

### 3. Network Monitoring

```javascript
// Log all fetch requests
const originalFetch = window.fetch;
window.fetch = (...args) => {
  console.log('📡 Fetch:', args[0]);
  return originalFetch(...args)
    .then(res => {
      console.log('✅ Response:', res.status);
      return res;
    })
    .catch(err => {
      console.error('❌ Error:', err);
      throw err;
    });
};
```

---

## 📊 Database Verification

### Check Chat Collection

```bash
# MongoDB Shell
mongosh "YOUR_MONGODB_URI"

# Switch to database
use your_database

# Count chats
db.chats.countDocuments()

# View chats
db.chats.find().pretty()

# Find specific chat
db.chats.findOne({ orderNumber: "ORD-12345" })

# View messages in a chat
db.chats.findOne(
  { _id: ObjectId("CHAT_ID") },
  { messages: 1 }
)

# Check unread counts
db.chats.aggregate([
  {
    $project: {
      orderNumber: 1,
      unreadAdmin: "$unreadCount.admin",
      unreadUser: "$unreadCount.user"
    }
  }
])
```

---

## 🚨 Emergency Fixes

### Reset Everything

```bash
# Backend
cd backend
rm -rf node_modules package-lock.json
npm install
npm install socket.io cors

# Frontend
cd frontend
rm -rf node_modules package-lock.json
npm install
npm install socket.io-client

# Restart servers
cd backend && node server.js
cd frontend && npm run dev
```

### Clear Browser Data

```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
// Then reload page
location.reload();
```

### Reset Database

```bash
# MongoDB Shell
use your_database
db.chats.drop()
# Chats will be recreated automatically
```

---

## ✅ Success Criteria

Your chat system is working correctly if:

- [ ] Customer can click chat icon without errors
- [ ] Chat modal opens with correct order/product info
- [ ] Customer can send messages
- [ ] Messages appear in real-time
- [ ] Admin sees purple chat button
- [ ] Admin can open chat sidebar
- [ ] Admin sees all customer chats
- [ ] Admin can reply to chats
- [ ] Unread badges update automatically
- [ ] Typing indicators work
- [ ] No console errors
- [ ] No network errors (check Network tab)
- [ ] Socket.IO connects successfully

---

## 📞 Still Having Issues?

If you're still experiencing problems:

1. **Check all console logs** (both browser and backend terminal)
2. **Verify all files are saved** (no unsaved changes)
3. **Restart both servers** (backend and frontend)
4. **Clear browser cache** (Ctrl+Shift+Delete)
5. **Test in incognito mode** (to rule out extensions)
6. **Check MongoDB connection** (is database accessible?)
7. **Verify port availability** (5000 for backend, 5173 for frontend)

**Last Resort:**
- Delete `node_modules` in both backend and frontend
- Run `npm install` in both directories
- Restart everything

---

## 🎯 Performance Testing

### Load Test Messages

```javascript
// Send 100 test messages
const sendTestMessages = async (chatId) => {
  const token = localStorage.getItem('token');
  
  for (let i = 1; i <= 100; i++) {
    await fetch(`http://localhost:5000/api/chat/${chatId}/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        sender: 'TEST_USER_ID',
        senderName: 'Test User',
        senderRole: 'user',
        message: `Test message ${i}`
      })
    });
    
    console.log(`Sent message ${i}/100`);
  }
};
```

### Stress Test Socket.IO

```javascript
// Connect 10 simultaneous clients
const stressTest = () => {
  const sockets = [];
  
  for (let i = 0; i < 10; i++) {
    const socket = io('http://localhost:5000');
    socket.on('connect', () => {
      console.log(`Client ${i + 1} connected:`, socket.id);
      socket.emit('user_connected', { userId: `user_${i}`, role: 'user' });
    });
    sockets.push(socket);
  }
  
  return sockets;
};

const clients = stressTest();
```

---

## 🎉 Congratulations!

If all tests pass, your real-time chat system is fully functional! 🚀

**Next Steps:**
- Add more features (file upload, emojis, etc.)
- Implement voice/video calls
- Add AI chatbot for auto-responses
- Set up analytics and monitoring

**Happy chatting!** 💬✨
