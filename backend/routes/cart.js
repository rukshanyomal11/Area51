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

// Add or update item in cart
router.post('/', verifyTokenAndGetUser, async (req, res) => {
  try {
    const { productId, title, price, imageSrc, size, length, color, quantity } = req.body;
    const userId = req.userId;

    // Validate required fields
    if (!productId || !title || !price || !imageSrc || !size || !length || !color || !quantity) {
      return res.status(400).json({ 
        message: 'Missing required fields'
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
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
      cart.items[existingItemIndex].quantity += parseInt(quantity);
    } else {
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

    res.status(200).json({ 
      message: 'Item added to cart successfully', 
      cart: savedCart
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Checkout and create order from cart
router.post('/checkout', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;

    // Get user's cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Get user details for shipping address
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Calculate total amount
    const totalAmount = cart.items.reduce((total, item) => total + (item.price * item.quantity), 0);

    // Create order
    const order = new Order({
      userId,
      items: cart.items,
      totalAmount,
      shippingAddress: {
        name: user.name,
        phone: user.phone,
        address: user.address,
        email: user.email
      }
    });

    const savedOrder = await order.save();

    // Clear the cart after successful order
    await Cart.findOneAndDelete({ userId });

    res.status(201).json({
      message: 'Order placed successfully',
      order: savedOrder
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get cart for user
router.get('/', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    let cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) {
      cart = { userId, items: [] };
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
});

// Clear cart completely (for after successful order or logout)
router.delete('/', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    await Cart.findOneAndDelete({ userId });
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Clear cart completely (for after successful order)
router.delete('/clear', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    await Cart.findOneAndDelete({ userId });
    res.status(200).json({ message: 'Cart cleared successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Merge guest cart into user cart
router.post('/merge', verifyTokenAndGetUser, async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;

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

    res.status(200).json({ message: 'Cart merged successfully', cart: savedCart });
  } catch (error) {
    res.status(400).json({ message: error.message });
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
    res.status(200).json({ message: 'Authenticated', requiresLogin: false });
  } catch (err) {
    res.status(401).json({ 
      message: 'Please login to place an order',
      requiresLogin: true 
    });
  }
});

module.exports = router;
