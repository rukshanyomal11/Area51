# 💬 Real-Time Chat System

> A complete real-time chat and communication system for your e-commerce clothing website, built with Socket.IO, React, and MongoDB.

[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)

---

## 🌟 Features

### For Customers:
- 💬 **Product-Specific Chat** - Ask questions about specific products in your orders
- ⚡ **Real-Time Messaging** - Instant communication with support team
- 📱 **Mobile Friendly** - Fully responsive chat interface
- 🕐 **Message History** - All conversations saved and accessible
- ⌨️ **Typing Indicators** - See when admin is typing
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations

### For Admins:
- 🔔 **Instant Notifications** - Get alerted when customers send messages
- 📊 **Chat Dashboard** - View all active customer conversations
- 🟣 **Floating Chat Button** - Always accessible from any admin page
- 📋 **Context-Aware** - See order and product details for each chat
- 🔴 **Unread Badges** - Never miss important messages
- ⚡ **Quick Replies** - Respond to customers instantly

---

## 🚀 Quick Start

### Prerequisites:
- Node.js 18+ installed
- MongoDB database
- Backend server running
- Frontend development server

### Installation:

1. **Install Backend Dependencies:**
```bash
cd backend
npm install socket.io cors
```

2. **Install Frontend Dependencies:**
```bash
cd frontend
npm install socket.io-client
```

3. **Start Backend Server:**
```bash
cd backend
node server.js
```

4. **Start Frontend:**
```bash
cd frontend
npm run dev
```

5. **Test the System:**
- Customer: Login → Account → Order History → Click 💬
- Admin: Login → Admin Dashboard → Click 🟣 (bottom-right)

---

## 📁 Project Structure

```
my-project/
├── backend/
│   ├── models/
│   │   └── Chat.js                 # Chat database model
│   ├── routes/
│   │   └── chat.js                 # Chat API endpoints
│   └── server.js                   # Socket.IO server setup
│
└── frontend/src/
    ├── context/
    │   └── SocketContext.jsx       # Socket.IO React context
    ├── components/
    │   ├── chat/
    │   │   └── ChatBox.jsx         # Chat window component
    │   ├── admin/
    │   │   ├── AdminChatSidebar.jsx    # Admin chat list
    │   │   └── AdminChatButton.jsx     # Floating button
    │   └── account/
    │       └── OrderHistory.jsx    # Order history with chat
    └── pages/
        ├── AccountPage.jsx         # Customer account page
        └── admin/
            ├── AdminDashboard.jsx  # Admin dashboard
            └── AdminProducts.jsx   # Admin products page
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/chat/create` | Create new chat | ✅ |
| GET | `/api/chat/user/:userId` | Get user's chats | ✅ |
| GET | `/api/chat/admin/all` | Get all chats | 👑 Admin |
| GET | `/api/chat/:chatId` | Get specific chat | ✅ |
| POST | `/api/chat/:chatId/message` | Send message | ✅ |
| PUT | `/api/chat/:chatId/read` | Mark as read | ✅ |
| PUT | `/api/chat/:chatId/close` | Close chat | ✅ |

---

## 🌐 Socket.IO Events

### Client → Server:
| Event | Data | Description |
|-------|------|-------------|
| `user_connected` | `{ userId, role }` | User connects to Socket.IO |
| `join_chat` | `chatId` | Join specific chat room |
| `send_message` | `{ chatId, message }` | Send message in chat |
| `typing` | `{ chatId, userName, isTyping }` | Typing indicator |

### Server → Client:
| Event | Data | Description |
|-------|------|-------------|
| `receive_message` | `{ chatId, message }` | New message received |
| `user_typing` | `{ chatId, userName, isTyping }` | User typing status |
| `user_status_update` | `{ userId, status, role }` | Online/offline status |
| `admin_notification` | `{ type, chatId, message }` | Admin notification |

---

## 💾 Database Schema

### Chat Model:
```javascript
{
  orderId: ObjectId,              // Reference to order
  orderNumber: String,            // Human-readable order ID
  userId: ObjectId,               // Customer ID
  userName: String,               // Customer name
  productId: ObjectId,            // Product (optional)
  productName: String,            // Product name (optional)
  messages: [
    {
      sender: ObjectId,
      senderName: String,
      senderRole: "user" | "admin",
      message: String,
      timestamp: Date,
      read: Boolean
    }
  ],
  status: "active" | "closed",
  lastMessage: Date,
  unreadCount: {
    user: Number,
    admin: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🎨 UI Components

### ChatBox
Reusable chat window component used by both customers and admins.

**Props:**
- `chat` - Chat object with messages
- `onClose` - Function to close chat
- `currentUser` - Current user object (id, name, role)

**Features:**
- Real-time message updates
- Typing indicators
- Auto-scroll to latest message
- Message timestamps
- Responsive design

### AdminChatButton
Floating chat button that appears on all admin pages.

**Features:**
- Fixed position (bottom-right)
- Unread message badge
- Pulse animation
- Opens chat sidebar

### AdminChatSidebar
Sliding sidebar showing all customer chats.

**Features:**
- List of all active chats
- Customer information
- Order and product context
- Unread message counts
- Click to open chat

### OrderHistory (Enhanced)
Order history with chat icons on each product.

**Features:**
- Green chat icon per product
- Click to start conversation
- Context-aware (order + product)
- Smooth modal transition

---

## 🔐 Authentication

### Customer Access:
- Must be logged in
- Can only create chats for their own orders
- Can only see their own chats
- JWT token required in headers

### Admin Access:
- Must be logged in as admin
- Can see ALL customer chats
- Can reply to any conversation
- Can close chats
- JWT token required in headers

---

## 📱 Responsive Design

### Desktop (> 768px):
- Chat window: 600px wide, centered
- Admin sidebar: 384px wide, slides from right
- Floating button: 64px × 64px

### Mobile (< 768px):
- Chat window: Full screen modal
- Admin sidebar: Full screen overlay
- Floating button: 56px × 56px

---

## 🎯 Usage Examples

### Customer - Start a Chat:
```javascript
// In OrderHistory component
<button onClick={() => handleOpenChat(order, item)}>
  💬 Chat
</button>
```

### Admin - View Chats:
```javascript
// In AdminDashboard
<AdminChatButton />
// Floating button with unread count
```

### Send Message:
```javascript
// In ChatBox component
const handleSendMessage = async () => {
  const messageData = {
    sender: currentUser.id,
    senderName: currentUser.name,
    senderRole: currentUser.role,
    message: newMessage
  };
  
  // Send via REST API
  await fetch(`/api/chat/${chat._id}/message`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify(messageData)
  });
  
  // Send via Socket.IO for real-time
  sendMessage(chat._id, messageData);
};
```

---

## 🧪 Testing

### Test Customer Chat:
1. Login as regular user
2. Go to Account → Order History
3. Click green chat icon 💬 on any product
4. Send a test message
5. Verify message appears

### Test Admin Chat:
1. Login as admin
2. Go to any admin page
3. Click purple floating button 🟣
4. See the customer chat
5. Reply to the message
6. Verify customer receives instantly

### Test Real-Time:
1. Open two browser windows
2. Login customer in one, admin in other
3. Send messages from both sides
4. Verify instant delivery
5. Check typing indicators work

---

## 🐛 Troubleshooting

### Socket.IO Not Connecting?
```javascript
// Check backend CORS settings
cors: {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"]
}

// Verify frontend connection
const socket = io('http://localhost:5000', {
  autoConnect: true,
  reconnection: true
});
```

### Messages Not Sending?
```javascript
// Verify token exists
const token = localStorage.getItem('token');
console.log('Token:', token ? '✅' : '❌');

// Check API response
const response = await fetch(endpoint);
console.log('Status:', response.status);
```

### Unread Count Wrong?
```javascript
// Check backend calculation
const totalUnread = chats.reduce((acc, chat) => 
  acc + (chat.unreadCount?.admin || 0), 0
);

// Verify mark as read works
await fetch(`/api/chat/${chatId}/read`, {
  method: 'PUT',
  body: JSON.stringify({ role: 'admin' })
});
```

---

## 📊 Performance

### Optimization Tips:
- ✅ Use single Socket.IO connection per user
- ✅ Only join active chat rooms
- ✅ Implement message pagination
- ✅ Add database indexes on userId, orderId
- ✅ Cache frequently accessed chats
- ✅ Debounce typing indicators

### Load Testing:
```javascript
// Test with multiple connections
const clients = Array.from({ length: 10 }, () => 
  io('http://localhost:5000')
);
```

---

## 🚀 Deployment

### Production Checklist:
- [ ] Set environment variables
- [ ] Update Socket.IO origin for production URL
- [ ] Enable HTTPS for Socket.IO
- [ ] Set up database indexes
- [ ] Configure CDN for assets
- [ ] Enable error logging
- [ ] Set up monitoring
- [ ] Test on production environment

### Environment Variables:
```bash
# Backend .env
MONGO_URI=mongodb+srv://...
PORT=5000
JWT_SECRET=your_secret_key
SOCKET_IO_ORIGIN=https://yourdomain.com
```

---

## 📚 Documentation

Complete documentation available:

- **[Complete Guide](CHAT_SYSTEM_COMPLETE.md)** - Full feature overview
- **[Quick Start](CHAT_QUICK_START.md)** - Get started quickly
- **[Visual Flow](CHAT_VISUAL_FLOW.md)** - Architecture diagrams
- **[Troubleshooting](CHAT_TROUBLESHOOTING.md)** - Debug guide
- **[UI Preview](CHAT_UI_PREVIEW.md)** - Interface mockups
- **[Summary](CHAT_IMPLEMENTATION_SUMMARY.md)** - Overview

---

## 🔮 Future Enhancements

### Planned Features:
- 📎 **File Upload** - Share images and documents
- 📞 **Voice Calls** - WebRTC voice communication
- 🎥 **Video Calls** - Live video support
- 🤖 **AI Chatbot** - Automated responses
- 🔔 **Push Notifications** - Browser and email alerts
- 🌍 **Multi-language** - Translation support
- 📊 **Analytics** - Chat metrics and insights
- 💾 **Chat Export** - Download conversation history

---

## 🤝 Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

This project is part of your e-commerce clothing website.

---

## 👏 Acknowledgments

- Socket.IO for real-time communication
- React for UI components
- MongoDB for data persistence
- Express.js for API routing
- Tailwind CSS for styling

---

## 📞 Support

Need help? Check the documentation:
- [Troubleshooting Guide](CHAT_TROUBLESHOOTING.md)
- [Quick Start Guide](CHAT_QUICK_START.md)

---

## 🎉 Success!

You now have a **production-ready real-time chat system** for your e-commerce website!

**Key Achievements:**
- ✅ Real-time Socket.IO communication
- ✅ Beautiful responsive UI
- ✅ Customer and admin interfaces
- ✅ Message persistence
- ✅ Unread tracking
- ✅ Typing indicators
- ✅ Order/product context

**Start chatting and enjoy instant customer communication!** 💬✨

---

Made with ❤️ for your clothing e-commerce success 🛍️👔👗
