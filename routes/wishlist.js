const express = require('express');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.user._id }).populate('products.product');
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add product to wishlist
router.post('/add', protect, async (req, res) => {
  try {
    const { productId } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    let wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: req.user._id, products: [] });
    }
    
    const exists = wishlist.products.some(p => p.product.toString() === productId);
    
    if (exists) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }
    
    wishlist.products.push({ product: productId });
    wishlist.updatedAt = new Date();
    await wishlist.save();
    
    await wishlist.populate('products.product');
    
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove product from wishlist
router.delete('/remove/:productId', protect, async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user._id });
    
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }
    
    wishlist.products = wishlist.products.filter(p => p.product.toString() !== req.params.productId);
    wishlist.updatedAt = new Date();
    await wishlist.save();
    
    await wishlist.populate('products.product');
    
    res.status(200).json({ success: true, data: wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

