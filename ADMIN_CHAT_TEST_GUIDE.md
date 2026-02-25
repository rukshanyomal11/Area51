# 🧪 Admin Chat Test Guide

## How to Test the Chat Loading Functionality

### 1. **Start the Application**
```bash
# Terminal 1 - Backend
cd C:\Users\Rukshan\Desktop\Kaveesha\my-project\backend
node server.js

# Terminal 2 - Frontend  
cd C:\Users\Rukshan\Desktop\Kaveesha\my-project\frontend
npm run dev
```

### 2. **Access Admin Panel**
- Navigate to the admin dashboard
- Look for the chat button (💬) or go to the Chats section

### 3. **Test the Chat Loading**
- Click on the chat button/section
- You should see:
  - **Left panel**: List of customer chats (like Amal, Unknown User, Area51)
  - **Right panel**: Default message "Select a chat to start messaging"

### 4. **Click on a Chat**
- Click on any chat from the left panel (e.g., "Amal" chat)
- **Expected Result**: The chat should load in the white area on the right
- **Visual Changes**:
  - Selected chat gets highlighted with blue background and border
  - Right panel shows the full chat interface with:
    - Chat header with customer name and order number
    - Message history
    - Input field to type responses

### 5. **Console Debugging**
Open browser Developer Tools (F12) and check the Console for:
- `🔵 Admin selected chat:` - Shows when you click a chat
- `🟢 ChatBox in embedded mode, chat data:` - Shows chat data being loaded

### 6. **Test Chat Functionality**
- Type a message in the input field
- Press Enter or click Send
- Message should appear in the chat
- Real-time updates should work

### 7. **Test Back Navigation**
- Click the close button (X) in the chat header
- Should return to the default "Select a chat" message

## 🎯 Expected Behavior
✅ **Working**: Click chat → Chat loads in right panel  
✅ **Working**: Selected chat gets highlighted  
✅ **Working**: Can send/receive messages  
✅ **Working**: Can close chat and return to default state  

## 🚨 Troubleshooting
If chat doesn't load:
1. Check browser console for errors
2. Verify backend is running and chat API is working
3. Check network tab for API calls
4. Ensure admin user is properly logged in

## 🔧 Recent Changes Made
- Added `isEmbedded` prop to ChatBox component
- Modified AdminChatSidebar layout for left/right panels
- Added visual selection indicators
- Improved styling for embedded chat display