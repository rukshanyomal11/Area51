const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Connect to MongoDB Atlas
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/requests', require('./routes/requests-enhanced'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders-enhanced'));
app.use('/api/users', require('./routes/user'));
app.use('/api/debug', require('./routes/debug'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/ai-chat', require('./routes/aiChat'));

// Socket.IO for real-time chat
const activeUsers = new Map(); // Store userId -> socketId mapping

io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  // User joins with their userId and role
  socket.on('user_connected', ({ userId, role }) => {
    activeUsers.set(userId, { socketId: socket.id, role });
    console.log(`👤 User ${userId} (${role}) connected with socket ${socket.id}`);
    
    // Notify admins about online users
    io.emit('user_status_update', {
      userId,
      status: 'online',
      role
    });
  });

  // Join a specific chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`💬 Socket ${socket.id} joined chat ${chatId}`);
  });

  // Send message in a chat
  socket.on('send_message', (data) => {
    const { chatId, message } = data;
    console.log(`📨 Message in chat ${chatId}:`, message);
    
    // Broadcast to all users in this chat room
    io.to(chatId).emit('receive_message', data);
    
    // Also notify admins about new message
    if (message.senderRole === 'user') {
      io.emit('admin_notification', {
        type: 'new_message',
        chatId,
        message
      });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(data.chatId).emit('user_typing', {
      chatId: data.chatId,
      userName: data.userName,
      isTyping: data.isTyping
    });
  });

  // User disconnects
  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
    
    // Find and remove user from active users
    for (const [userId, userData] of activeUsers.entries()) {
      if (userData.socketId === socket.id) {
        activeUsers.delete(userId);
        io.emit('user_status_update', {
          userId,
          status: 'offline',
          role: userData.role
        });
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO ready for connections`);
});
