const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, optionalAuth } = require('./auth'); // Adjust path if needed

// Debug middleware to log all requests
router.use((req, res, next) => {
  console.log(`🔍 PRODUCTS API: ${req.method} ${req.path} - Query:`, req.query, '- Body:', req.body);
  next();
});

// SPECIFIC ROUTES FIRST - Get all products for admin (restricted to authenticated users)
router.get('/admin', verifyToken, async (req, res) => {
  try {
    console.log('👨‍💼 ADMIN: Admin request received for user:', req.user?.id);
    const products = await Product.find().sort({ createdAt: -1 }); // Sort by newest first
    console.log('📦 ADMIN: Products fetched:', products.length);
    
    // Log category breakdown
    const menCount = products.filter(p => p.category === 'Men').length;
    const womenCount = products.filter(p => p.category === 'Women').length;
    console.log(`👔 ADMIN: Men's products: ${menCount}, 👗 Women's products: ${womenCount}`);
    
    res.json(products);
  } catch (error) {
    console.error('❌ ADMIN: Error fetching products for admin:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get products with optional filtering (public access)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, brand, style, material, minPrice, maxPrice } = req.query;
    console.log('🔍 PUBLIC: Fetching products with filters:', { category, brand, style, material, minPrice, maxPrice });
    
    // Build query object
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (brand) {
      query.brand = brand;
    }
    
    if (style) {
      query.style = style;
    }
    
    if (material) {
      query.material = material;
    }
    
    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    console.log('🔍 PUBLIC: Final query:', query);
    
    const products = await Product.find(query).sort({ createdAt: -1 });
    console.log('📦 PUBLIC: Products found:', products.length);
    
    // Log category breakdown for filtered results
    if (products.length > 0) {
      const menCount = products.filter(p => p.category === 'Men').length;
      const womenCount = products.filter(p => p.category === 'Women').length;
      console.log(`👔 PUBLIC: Men's products: ${menCount}, 👗 Women's products: ${womenCount}`);
    }
    
    res.json(products);
  } catch (error) {
    console.error('❌ PUBLIC: Error fetching products:', error);
    res.status(500).json({ 
      message: error.message,
      retry: true,
      error: 'Failed to fetch products. Please try again.'
    });
  }
});

// Get available filter options (public access)
router.get('/filters', optionalAuth, async (req, res) => {
  try {
    console.log('🎚️ FILTERS: Fetching filter options');
    
    const products = await Product.find();
    
    // Extract unique values for filters
    const brands = [...new Set(products.map(p => p.brand).filter(Boolean))].sort();
    const materials = [...new Set(products.map(p => p.material).filter(Boolean))].sort();
    const styles = [...new Set(products.map(p => p.style).filter(Boolean))].sort();
    const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort();
    
    // Extract unique sizes, colors, and lengths from arrays
    const allSizes = products.flatMap(p => p.size || []);
    const sizes = [...new Set(allSizes)].sort();
    
    const allColors = products.flatMap(p => p.color || []);
    const colors = [...new Set(allColors)].sort();
    
    const allLengths = products.flatMap(p => p.length || []);
    const lengths = [...new Set(allLengths)].sort();
    
    // Get price range
    const prices = products.map(p => p.price).filter(price => !isNaN(price));
    const priceRange = {
      min: Math.min(...prices) || 0,
      max: Math.max(...prices) || 200
    };
    
    const filterOptions = {
      brands,
      materials,
      styles,
      categories,
      sizes,
      colors,
      lengths,
      priceRange
    };
    
    console.log('🎚️ FILTERS: Available options:', filterOptions);
    res.json(filterOptions);
  } catch (error) {
    console.error('❌ FILTERS: Error fetching filter options:', error);
    res.status(500).json({ message: error.message });
  }
});

// PARAMETERIZED ROUTES LAST - Get product by ID (public access)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 PRODUCT: Fetching product by ID:', id);
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ PRODUCT: Invalid ID format:', id);
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const product = await Product.findById(id);
    
    if (!product) {
      console.log('❌ PRODUCT: Product not found with ID:', id);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('✅ PRODUCT: Product found:', product.title, '- Category:', product.category);
    res.json(product);
  } catch (error) {
    console.error('❌ PRODUCT: Error fetching product by ID:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create product (restricted to authenticated users)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, price, imageSrc, size, color, brand, material, length, style, category } = req.body;
    
    console.log('➕ CREATE: Creating new product by user:', req.user?.id);
    console.log('➕ CREATE: Product data:', { title, price, category, brand, style });
    
    // Validation
    const requiredFields = { title, price, imageSrc, brand, material, style, category };
    const missingFields = Object.entries(requiredFields)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missingFields.length > 0) {
      console.log('❌ CREATE: Missing required fields:', missingFields);
      return res.status(400).json({ 
        message: `Missing required fields: ${missingFields.join(', ')}` 
      });
    }
    
    // Validate category
    if (!['Men', 'Women'].includes(category)) {
      console.log('❌ CREATE: Invalid category:', category);
      return res.status(400).json({ message: 'Category must be either "Men" or "Women"' });
    }
    
    // Validate price
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      console.log('❌ CREATE: Invalid price:', price);
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }
    
    // Ensure arrays are properly formatted
    const productData = {
      title: title.trim(),
      price: numericPrice,
      imageSrc: imageSrc.trim(),
      size: Array.isArray(size) ? size : (size ? [size] : []),
      color: Array.isArray(color) ? color : (color ? [color] : []),
      brand: brand.trim(),
      material: material.trim(),
      length: Array.isArray(length) ? length : (length ? [length] : []),
      style: style.trim(),
      category: category.trim()
    };
    
    console.log('➕ CREATE: Processed product data:', productData);
    
    const product = await Product.create(productData);
    console.log('✅ CREATE: Product created successfully:', product._id, '-', product.title);
    console.log('📂 CREATE: Product category:', product.category);
    
    res.status(201).json(product);
  } catch (error) {
    console.error('❌ CREATE: Error creating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: `Validation error: ${errors.join(', ')}` });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Update product (restricted to authenticated users)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, imageSrc, size, color, brand, material, length, style, category } = req.body;
    
    console.log('📝 UPDATE: Updating product:', id, 'by user:', req.user?.id);
    console.log('📝 UPDATE: New data:', { title, price, category, brand, style });
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ UPDATE: Invalid ID format:', id);
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    // Validate category if provided
    if (category && !['Men', 'Women'].includes(category)) {
      console.log('❌ UPDATE: Invalid category:', category);
      return res.status(400).json({ message: 'Category must be either "Men" or "Women"' });
    }
    
    // Validate price if provided
    if (price !== undefined) {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        console.log('❌ UPDATE: Invalid price:', price);
        return res.status(400).json({ message: 'Price must be a valid positive number' });
      }
    }
    
    // Build update data
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (price !== undefined) updateData.price = parseFloat(price);
    if (imageSrc !== undefined) updateData.imageSrc = imageSrc.trim();
    if (size !== undefined) updateData.size = Array.isArray(size) ? size : (size ? [size] : []);
    if (color !== undefined) updateData.color = Array.isArray(color) ? color : (color ? [color] : []);
    if (brand !== undefined) updateData.brand = brand.trim();
    if (material !== undefined) updateData.material = material.trim();
    if (length !== undefined) updateData.length = Array.isArray(length) ? length : (length ? [length] : []);
    if (style !== undefined) updateData.style = style.trim();
    if (category !== undefined) updateData.category = category.trim();
    
    console.log('📝 UPDATE: Processed update data:', updateData);
    
    const product = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      console.log('❌ UPDATE: Product not found:', id);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('✅ UPDATE: Product updated successfully:', product._id, '-', product.title);
    console.log('📂 UPDATE: Product category:', product.category);
    
    res.json(product);
  } catch (error) {
    console.error('❌ UPDATE: Error updating product:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: `Validation error: ${errors.join(', ')}` });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Delete product (restricted to authenticated users)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('🗑️ DELETE: Deleting product:', id, 'by user:', req.user?.id);
    
    // Validate MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ DELETE: Invalid ID format:', id);
      return res.status(400).json({ message: 'Invalid product ID format' });
    }
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      console.log('❌ DELETE: Product not found:', id);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    console.log('✅ DELETE: Product deleted successfully:', product._id, '-', product.title);
    console.log('📂 DELETE: Deleted from category:', product.category);
    
    res.status(200).json({ 
      message: 'Product deleted successfully',
      deletedProduct: {
        id: product._id,
        title: product.title,
        category: product.category
      }
    });
  } catch (error) {
    console.error('❌ DELETE: Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Bulk operations for admin (restricted to authenticated users)
router.post('/bulk-delete', verifyToken, async (req, res) => {
  try {
    const { productIds } = req.body;
    
    console.log('🗑️ BULK DELETE: Deleting products:', productIds, 'by user:', req.user?.id);
    
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs array is required' });
    }
    
    // Validate all IDs
    const invalidIds = productIds.filter(id => !id.match(/^[0-9a-fA-F]{24}$/));
    if (invalidIds.length > 0) {
      return res.status(400).json({ message: `Invalid product ID format: ${invalidIds.join(', ')}` });
    }
    
    const result = await Product.deleteMany({ _id: { $in: productIds } });
    
    console.log('✅ BULK DELETE: Deleted', result.deletedCount, 'products');
    
    res.json({ 
      message: `Successfully deleted ${result.deletedCount} products`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ BULK DELETE: Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get product statistics (admin only)
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    console.log('📊 STATS: Fetching product statistics for user:', req.user?.id);
    
    const totalProducts = await Product.countDocuments();
    const menProducts = await Product.countDocuments({ category: 'Men' });
    const womenProducts = await Product.countDocuments({ category: 'Women' });
    
    // Get price statistics
    const priceStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
      }
    ]);
    
    // Get brand distribution
    const brandStats = await Product.aggregate([
      {
        $group: {
          _id: '$brand',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    const stats = {
      totalProducts,
      categoryBreakdown: {
        men: menProducts,
        women: womenProducts
      },
      priceStats: priceStats[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 },
      brandStats
    };
    
    console.log('📊 STATS: Statistics calculated:', stats);
    res.json(stats);
  } catch (error) {
    console.error('❌ STATS: Error fetching statistics:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;