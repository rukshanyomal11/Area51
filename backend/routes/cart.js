const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const jwt = require('jsonwebtoken');

// Middleware to verify token and extract user ID
const verifyTokenAndGetUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization required' });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Add or update item in cart (FIXED)
router.post('/', verifyTokenAndGetUser, async (req, res) => {
  try {
    const { productId, title, price, imageSrc, size, length, color, quantity } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!productId || !title || !price || !imageSrc || !size || !length || !color || !quantity) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        received: req.body 
      });
    }

    console.log('Adding to cart for user:', userId, 'Item:', { productId, title, size, length, color, quantity });

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      console.log('Creating new cart for user:', userId);
      cart = new Cart({ userId, items: [] });
    }

    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId.toString() &&
        item.size === size &&
        item.length === length &&
        item.color === color
    );

    if (existingItemIndex > -1) {
      console.log('Updating existing item quantity');
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
      console.log('Adding new item to cart');
      cart.items.push({ 
        productId, 
        title, 
        price: parseFloat(price), 
        imageSrc, 
        size, 
        length, 
        color, 
        quantity: parseInt(quantity) 
      });
    }

    cart.updatedAt = Date.now();
    const savedCart = await cart.save();
    console.log('Cart saved successfully:', savedCart._id);

    res.status(200).json({ 
      message: 'Item added to cart successfully', 
      cart: savedCart,
      itemCount: savedCart.items.length 
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ 
      message: 'Server error while adding to cart',
      error: error.message 
    });
  }
});

// Replace entire cart with new items
router.put('/', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    console.log('Replacing cart for user:', userId, 'with items:', items);

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    // Replace the entire items array with the new items
    cart.items = items.map(item => ({
      productId: item.productId || item.id, // Handle both field names
      title: item.title,
      price: parseFloat(item.price),
      imageSrc: item.imageSrc,
      size: item.size,
      length: item.length,
      color: item.color,
      quantity: parseInt(item.quantity),
    }));

    cart.updatedAt = Date.now();
    const savedCart = await cart.save();
    console.log('Cart replaced successfully');

    res.status(200).json({ message: 'Cart updated successfully', cart: savedCart });
  } catch (error) {
    console.error('Error replacing cart:', error);
    res.status(500).json({ message: 'Server error while updating cart', error: error.message });
  }
});

// Get cart for user - IMPROVED with better error handling
router.get('/', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching cart for user:', userId);
    
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    
    if (!cart) {
      console.log('No cart found, returning empty cart');
      cart = { userId, items: [] };
    } else {
      console.log('Cart found with', cart.items.length, 'items');
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error while fetching cart', error: error.message });
  }
});

// Save cart before logout
router.post('/save-before-logout', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    console.log('Saving cart before logout for user:', userId);

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    cart.items = items.map(item => ({
      productId: item.id || item.productId,
      title: item.title,
      price: parseFloat(item.price),
      imageSrc: item.imageSrc,
      size: item.size,
      length: item.length,
      color: item.color,
      quantity: parseInt(item.quantity),
    }));

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Cart saved successfully' });
  } catch (error) {
    console.error('Error saving cart before logout:', error);
    res.status(500).json({ message: 'Server error while saving cart', error: error.message });
  }
});

// Update item quantity in cart
router.put('/item/:productId', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { quantity, size, length, color } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.length === length &&
        item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = parseInt(quantity);
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Cart updated successfully', cart });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error while updating cart item', error: error.message });
  }
});

// Remove specific item from cart
router.delete('/item/:productId', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.params;
    const { size, length, color } = req.query;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId.toString() === productId &&
        item.size === size &&
        item.length === length &&
        item.color === color
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Item not found in cart' });
    }

    cart.items.splice(itemIndex, 1);
    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json({ message: 'Item removed from cart', cart });
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error while removing cart item', error: error.message });
  }
});

// Clear cart completely (for after successful order)
router.delete('/clear', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    await Cart.findOneAndDelete({ userId });
    console.log('Cart cleared for user:', userId);
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error while clearing cart', error: error.message });
  }
});

// Merge guest cart into user cart
router.post('/merge', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

    console.log('Merging guest cart for user:', userId, 'Items:', items);

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    items.forEach(guestItem => {
      const existingItemIndex = cart.items.findIndex(
        (item) =>
          item.productId.toString() === (guestItem.id || guestItem.productId).toString() &&
          item.size === guestItem.size &&
          item.length === guestItem.length &&
          item.color === guestItem.color
      );
      
      if (existingItemIndex > -1) {
        cart.items[existingItemIndex].quantity += parseInt(guestItem.quantity);
      } else {
        cart.items.push({
          productId: guestItem.id || guestItem.productId,
          title: guestItem.title,
          price: parseFloat(guestItem.price),
          imageSrc: guestItem.imageSrc,
          size: guestItem.size,
          length: guestItem.length,
          color: guestItem.color,
          quantity: parseInt(guestItem.quantity),
        });
      }
    });

    cart.updatedAt = Date.now();
    const savedCart = await cart.save();
    console.log('Cart merged successfully');

    res.status(200).json({ message: 'Cart merged successfully', cart: savedCart });
  } catch (error) {
    console.error('Error merging cart:', error);
    res.status(400).json({ message: 'Server error while merging cart', error: error.message });
  }
});

// Check authentication for placing order
router.post('/check-auth-for-order', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ 
      message: 'Please login to place an order',
      requiresLogin: true 
    });
  }
  
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Order auth check passed for user:', decoded.id);
    res.status(200).json({ message: 'Authenticated', requiresLogin: false });
  } catch (err) {
    console.error('Order auth check failed:', err.message);
    res.status(401).json({ 
      message: 'Please login to place an order',
      requiresLogin: true 
    });
  }
});

module.exports = router;