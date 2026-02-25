/**
 * Test script for new order number generation
 * This will test the sequential order number generation
 */

const mongoose = require('mongoose');
const Order = require('./models/Order');
const Counter = require('./models/Counter');
const { generateOrderNumber, getCurrentOrderCount, resetOrderCounter } = require('./utils/orderUtils');
require('dotenv').config();

async function testOrderNumbers() {
  try {
    console.log('🧪 Testing new order number generation...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-project');
    console.log('✅ Connected to MongoDB');

    // Test 1: Check current counter
    const currentCount = await getCurrentOrderCount();
    console.log(`📊 Current order count: ${currentCount}`);

    // Test 2: Generate a few order numbers
    console.log('\n🔢 Generating test order numbers:');
    for (let i = 1; i <= 5; i++) {
      const orderNumber = await generateOrderNumber();
      console.log(`${i}. Generated order number: ${orderNumber}`);
    }

    // Test 3: Show what the next numbers would be
    console.log(`\n📈 Next order number will be: ORD${String((await getCurrentOrderCount()) + 1).padStart(6, '0')}`);

    console.log('\n✅ Order number generation test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run test if this file is executed directly
if (require.main === module) {
  testOrderNumbers()
    .then(() => {
      console.log('✅ Test script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test script failed:', error);
      process.exit(1);
    });
}

module.exports = { testOrderNumbers };