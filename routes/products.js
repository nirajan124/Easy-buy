const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { category, status, seller, search, location } = req.query;
    let query = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (seller) query.seller = seller;
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('seller', 'name email phone location')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email phone address');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create product (Seller only)
router.post('/', protect, authorize('seller', 'admin'), async (req, res) => {
  try {
    // Ensure user is authenticated and has correct role
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
    if (!['seller', 'admin'].includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User with role '${req.user.role}' is not authorized to create products. Required role: seller or admin` 
      });
    }
    
    req.body.seller = req.user._id;
    const product = await Product.create(req.body);
    
    await product.populate('seller', 'name email');
    
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error('Product creation error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update product
router.put('/:id', protect, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Only seller who owns the product or admin can update
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('seller', 'name email');

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete product
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Only seller who owns the product or admin can delete
    if (req.user.role !== 'admin' && product.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
