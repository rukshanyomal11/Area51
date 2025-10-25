/**
 * Migration script to convert existing order numbers to new sequential format
 * Run this once to migrate existing orders to the new format
 */

const mongoose = require('mongoose');
const Order = require('./models/Order');
const Counter = require('./models/Counter');
require('dotenv').config();

async function migrateOrderNumbers() {
  try {
    console.log('🔄 Starting order number migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-project');
    console.log('✅ Connected to MongoDB');

    // Get all existing orders sorted by creation date
    const existingOrders = await Order.find({}).sort({ createdAt: 1 });
    console.log(`📦 Found ${existingOrders.length} existing orders`);

    if (existingOrders.length === 0) {
      console.log('✅ No existing orders to migrate');
      return;
    }

    // Initialize counter to start from 1
    await Counter.findByIdAndUpdate(
      'orderNumber',
      { seq: 0 }, // Will be incremented for each order
      { upsert: true }
    );

    let migrated = 0;
    for (const order of existingOrders) {
      try {
        // Generate new sequential number
        const counter = await Counter.findByIdAndUpdate(
          'orderNumber',
          { $inc: { seq: 1 } },
          { new: true }
        );
        
        const newOrderNumber = `ORD${counter.seq.toString().padStart(6, '0')}`;
        
        console.log(`📝 Migrating order ${order._id}: ${order.orderNumber} → ${newOrderNumber}`);
        
        // Update the order with new number
        await Order.findByIdAndUpdate(order._id, {
          orderNumber: newOrderNumber
        });
        
        migrated++;
      } catch (error) {
        console.error(`❌ Error migrating order ${order._id}:`, error.message);
      }
    }

    console.log(`✅ Migration completed! Migrated ${migrated}/${existingOrders.length} orders`);
    console.log(`📊 Next order number will be: ORD${String(migrated + 1).padStart(6, '0')}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateOrderNumbers()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateOrderNumbers };