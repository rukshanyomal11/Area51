const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function checkProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database...');
    
    const products = await Product.find();
    console.log('\n=== ALL PRODUCTS ===');
    products.forEach((p, i) => {
      console.log(`${i + 1}. "${p.title}" - Category: "${p.category}"`);
    });
    
    console.log(`\nTotal: ${products.length} products`);
    
    const menProducts = products.filter(p => p.category === 'Men');
    const womenProducts = products.filter(p => p.category === 'Women');
    
    console.log(`Men's products: ${menProducts.length}`);
    console.log(`Women's products: ${womenProducts.length}`);
    
    // Check for any products with different categories
    const otherProducts = products.filter(p => p.category !== 'Men' && p.category !== 'Women');
    if (otherProducts.length > 0) {
      console.log(`\nProducts with other categories: ${otherProducts.length}`);
      otherProducts.forEach(p => console.log(`- "${p.title}" - Category: "${p.category}"`));
    }
    
    // Test exact category filtering
    console.log('\n=== TESTING CATEGORY FILTERING ===');
    console.log('Men filter test:', products.filter(p => p.category === 'Men').length);
    console.log('Women filter test:', products.filter(p => p.category === 'Women').length);
    
    // Check for case sensitivity issues
    const menProducts2 = products.filter(p => p.category.toLowerCase() === 'men');
    const womenProducts2 = products.filter(p => p.category.toLowerCase() === 'women');
    console.log('Case-insensitive - Men:', menProducts2.length);
    console.log('Case-insensitive - Women:', womenProducts2.length);
    
    // List all women products specifically
    console.log('\n=== WOMEN PRODUCTS DETAILS ===');
    const womenProds = products.filter(p => p.category === 'Women');
    womenProds.forEach((p, i) => {
      console.log(`${i + 1}. "${p.title}" - Category: "${p.category}" (${typeof p.category})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProducts();