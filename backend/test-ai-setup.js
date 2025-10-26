const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '.env') });

// Test OpenAI API key
const testAI = async () => {
  try {
    const OpenAI = require('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    console.log('✅ OpenAI API key configured successfully');
    
    // Test a simple completion
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello! Just testing the connection." }],
      max_tokens: 50
    });
    
    console.log('✅ OpenAI API test successful:', response.choices[0].message.content);
  } catch (error) {
    console.log('❌ OpenAI API test failed:', error.message);
  }
};

// Test MongoDB connection
const testMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connection successful');
    
    // Test if we can access the Product model
    const Product = require('./models/Product');
    const productCount = await Product.countDocuments();
    console.log(`✅ Product collection accessible. Total products: ${productCount}`);
    
    await mongoose.disconnect();
  } catch (error) {
    console.log('❌ MongoDB test failed:', error.message);
  }
};

const runTests = async () => {
  console.log('🚀 Testing AI Chatbot Dependencies...\n');
  
  await testMongoDB();
  await testAI();
  
  console.log('\n🎉 All tests completed!');
  process.exit(0);
};

runTests();