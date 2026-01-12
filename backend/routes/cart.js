const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper function to remove out-of-stock products from all carts
async function removeOutOfStockFromCarts(productId) {
  try {
    // Find all carts containing this product
    const carts = await Cart.find({ 'items.product': productId });
    
    for (const cart of carts) {
      // Remove items with this product
      cart.items = cart.items.filter(item => item.product.toString() !== productId);
      cart.updatedAt = new Date();
      await cart.save();
    }
    
    return carts.length;
  } catch (error) {
    console.error('Error removing out-of-stock products from carts:', error);
    throw error;
  }
}

// Get user's cart
router.get('/', protect, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add item to cart
router.post('/add', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    if (product.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Product is not available' });
    }

    // Check stock availability
    let addQuantity = parseInt(quantity, 10);
    if (isNaN(addQuantity) || addQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid quantity' });
    }

    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }
    
    const existingItem = cart.items.find(item => item.product.toString() === productId);
    
    // Calculate total quantity that will be in cart after adding
    const currentCartQuantity = existingItem ? existingItem.quantity : 0;
    const totalQuantity = currentCartQuantity + addQuantity;
    
    // Check if stock is sufficient (only check against available stock, allow multiple buyers)
    if (!product.stock || product.stock <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Product is out of stock' 
      });
    }
    
    // Check if the quantity being added exceeds available stock
    if (product.stock < addQuantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Only ${product.stock || 0} item(s) available.` 
      });
    }
    
    // Limit cart quantity to available stock
    if (totalQuantity > product.stock) {
      const maxAllowed = product.stock - currentCartQuantity;
      if (maxAllowed <= 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Maximum ${product.stock} item(s) already in cart. Only ${product.stock} available in stock.` 
        });
      }
      addQuantity = maxAllowed;
    }
    
    if (existingItem) {
      existingItem.quantity += addQuantity;
    } else {
      cart.items.push({ product: productId, quantity: addQuantity });
    }
    
    cart.updatedAt = new Date();
    await cart.save();
    
    await cart.populate('items.product');
    
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update cart item quantity
router.put('/update/:itemId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found in cart' });
    }

    const newQuantity = parseInt(quantity, 10);
    if (isNaN(newQuantity) || newQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid quantity. Quantity must be at least 1' });
    }

    // Check stock availability
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (!product.stock || product.stock < newQuantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Only ${product.stock || 0} item(s) available.` 
      });
    }
    
    item.quantity = newQuantity;
    cart.updatedAt = new Date();
    await cart.save();
    
    await cart.populate('items.product');
    
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove item from cart
router.delete('/remove/:itemId', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    cart.items = cart.items.filter(item => item._id.toString() !== req.params.itemId);
    cart.updatedAt = new Date();
    await cart.save();
    
    await cart.populate('items.product');
    
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Clear cart
router.delete('/clear', protect, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }
    
    cart.items = [];
    cart.updatedAt = new Date();
    await cart.save();
    
    res.status(200).json({ success: true, message: 'Cart cleared', data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = { router, removeOutOfStockFromCarts };

