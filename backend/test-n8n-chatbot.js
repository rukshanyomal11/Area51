// Test n8n webhook connection
const axios = require('axios');

const N8N_WEBHOOK_URL = 'https://area51kaveesha.app.n8n.cloud/webhook/product-chat';

async function testChatbot() {
  console.log('🧪 Testing n8n chatbot webhook...');
  console.log('Webhook URL:', N8N_WEBHOOK_URL);
  console.log('');

  try {
    console.log('📤 Sending test question: "Show me blue dresses"');
    
    const response = await axios.post(N8N_WEBHOOK_URL, {
      query: 'Show me blue dresses',
      userId: 'test-user',
      timestamp: new Date()
    }, {
      timeout: 30000
    });

    console.log('✅ Success! Chatbot is working!');
    console.log('');
    console.log('📥 Response:');
    console.log('Answer:', response.data.answer);
    console.log('Timestamp:', response.data.timestamp);
    console.log('');
    console.log('🎉 Your n8n chatbot is configured correctly!');

  } catch (error) {
    console.error('❌ Error testing chatbot:');
    
    if (error.code === 'ENOTFOUND') {
      console.error('❌ Cannot reach n8n cloud. Check your internet connection.');
    } else if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('');
      console.error('⚠️ Possible issues:');
      console.error('1. Workflow is not activated in n8n cloud');
      console.error('2. Webhook path is incorrect');
      console.error('3. Check workflow in: https://area51kaveesha.app.n8n.cloud');
    } else {
      console.error('Message:', error.message);
      console.error('');
      console.error('⚠️ Make sure:');
      console.error('1. Your n8n workflow is ACTIVE');
      console.error('2. MongoDB credentials are set in n8n cloud');
      console.error('3. OpenAI credentials are set in n8n cloud');
    }
  }
}

testChatbot();
