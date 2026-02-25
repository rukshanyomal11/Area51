const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function testWomenQuery() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database...');
    
    // Test the exact same query that would be used by the API
    const query = { category: 'Women' };
    console.log('Testing query:', query);
    
    const results = await Product.find(query);
    console.log('Query results:', results.length, 'products found');
    
    if (results.length === 0) {
      // Let's check what categories actually exist
      const allProducts = await Product.find({});
      const categories = [...new Set(allProducts.map(p => p.category))];
      console.log('Available categories:', categories);
      
      // Check if there are any products with "Women" (exact match)
      const womenCount = allProducts.filter(p => p.category === 'Women').length;
      const menCount = allProducts.filter(p => p.category === 'Men').length;
      console.log('Direct filter - Women:', womenCount, 'Men:', menCount);
      
      // Check for any invisible characters
      console.log('First women product category string analysis:');
      const firstWomenProduct = allProducts.find(p => p.category === 'Women');
      if (firstWomenProduct) {
        const categoryStr = firstWomenProduct.category;
        console.log('Category value:', JSON.stringify(categoryStr));
        console.log('Category length:', categoryStr.length);
        console.log('Category char codes:', [...categoryStr].map(c => c.charCodeAt(0)));
      }
    } else {
      console.log('Found women products:');
      results.forEach((p, i) => {
        console.log(`${i + 1}. ${p.title} - Category: "${p.category}"`);
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testWomenQuery();