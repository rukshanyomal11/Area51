// Test script to verify product sync
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function testProductSync() {
    console.log('🔍 Testing Product Synchronization System...\n');
    
    try {
        // Test 1: Check if backend is running
        console.log('1️⃣ Checking backend connection...');
        const healthCheck = await fetch(`${BASE_URL}/api/products`).catch(err => {
            console.error('❌ Backend is not running!');
            console.error('Please start backend with: cd backend && npm start');
            process.exit(1);
        });
        console.log('✅ Backend is running\n');
        
        // Test 2: Fetch all products
        console.log('2️⃣ Fetching all products...');
        const allProducts = await fetch(`${BASE_URL}/api/products`);
        const allData = await allProducts.json();
        console.log(`✅ Total products in database: ${allData.length}`);
        
        if (allData.length > 0) {
            console.log('   Sample product:', JSON.stringify(allData[0], null, 2));
        }
        console.log('');
        
        // Test 3: Fetch Men's products
        console.log('3️⃣ Fetching Men\'s products...');
        const menProducts = await fetch(`${BASE_URL}/api/products?category=Men`);
        const menData = await menProducts.json();
        console.log(`✅ Men's products: ${menData.length}`);
        if (menData.length > 0) {
            console.log('   Latest Men\'s product:', menData[0].title);
        }
        console.log('');
        
        // Test 4: Fetch Women's products
        console.log('4️⃣ Fetching Women\'s products...');
        const womenProducts = await fetch(`${BASE_URL}/api/products?category=Women`);
        const womenData = await womenProducts.json();
        console.log(`✅ Women's products: ${womenData.length}`);
        if (womenData.length > 0) {
            console.log('   Latest Women\'s product:', womenData[0].title);
        }
        console.log('');
        
        // Summary
        console.log('📊 SUMMARY:');
        console.log(`   Total Products: ${allData.length}`);
        console.log(`   Men's Products: ${menData.length}`);
        console.log(`   Women's Products: ${womenData.length}`);
        console.log('');
        
        if (allData.length === 0) {
            console.log('⚠️  WARNING: No products in database!');
            console.log('   Please add products through admin panel first.');
        } else {
            console.log('✅ Products are available in backend!');
            console.log('');
            console.log('🔍 If products don\'t show in frontend:');
            console.log('   1. Check browser console (F12) for errors');
            console.log('   2. Make sure frontend is running: cd frontend && npm run dev');
            console.log('   3. Check Network tab to see if API calls are made');
            console.log('   4. Try hard refresh: Ctrl+Shift+R');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Make sure backend is running: cd backend && npm start');
        console.error('   2. Check MongoDB connection in backend/.env');
        console.error('   3. Check if port 5000 is available');
    }
}

testProductSync();
