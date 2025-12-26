const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Create order
router.post('/', protect, authorize('buyer'), async (req, res) => {
  try {
    const { productId, paymentMethod, shippingAddress } = req.body;

    const product = await Product.findById(productId).populate('seller');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Product is not available' });
    }

    // Create order
    const order = await Order.create({
      product: productId,
      buyer: req.user._id,
      seller: product.seller._id,
      price: product.price,
      paymentMethod,
      shippingAddress,
      paymentStatus: (paymentMethod === 'Visa' || paymentMethod === 'MasterCard') ? 'Completed' : 'Pending',
      orderStatus: 'Pending',
      approvalStatus: 'Pending'
    });

    // Update product status
    product.status = 'sold';
    product.soldAt = new Date();
    await product.save();

    await order.populate([
      { path: 'product', select: 'title images' },
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' }
    ]);

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user orders (must come before /:id route)
router.get('/my-orders', protect, async (req, res) => {
  try {
    const { role } = req.user;
    let query = {};

    if (role === 'buyer') {
      query.buyer = req.user._id;
    } else if (role === 'seller') {
      query.seller = req.user._id;
    }

    const orders = await Order.find(query)
      .populate('product', 'title images category')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all orders (Admin) - must come after /my-orders
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('product', 'title images category')
      .populate('buyer', 'name email')
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('product')
      .populate('buyer', 'name email phone address')
      .populate('seller', 'name email phone address');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization
    if (req.user.role !== 'admin' && 
        order.buyer._id.toString() !== req.user._id.toString() &&
        order.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update order status
router.put('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Only admin or seller can update order status
    if (req.user.role !== 'admin' && order.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (req.body.orderStatus) {
      order.orderStatus = req.body.orderStatus;
      if (req.body.orderStatus === 'Delivered') {
        order.deliveredAt = new Date();
        order.paymentStatus = 'Completed';
      }
    }

    if (req.body.paymentStatus && req.user.role === 'admin') {
      order.paymentStatus = req.body.paymentStatus;
    }

    // Admin can approve/reject orders
    if (req.body.approvalStatus && req.user.role === 'admin') {
      order.approvalStatus = req.body.approvalStatus;
      if (req.body.approvalStatus === 'Approved') {
        order.paymentStatus = 'Completed';
        order.orderStatus = 'Confirmed';
      } else if (req.body.approvalStatus === 'Rejected') {
        order.orderStatus = 'Cancelled';
      }
    }

    // Buyer can edit pending orders (only shipping address and payment method)
    if (req.user.role === 'buyer' && order.buyer.toString() === req.user._id.toString() && order.approvalStatus === 'Pending') {
      if (req.body.shippingAddress) {
        order.shippingAddress = req.body.shippingAddress;
      }
      if (req.body.paymentMethod) {
        order.paymentMethod = req.body.paymentMethod;
        order.paymentStatus = (req.body.paymentMethod === 'Visa' || req.body.paymentMethod === 'MasterCard') ? 'Completed' : 'Pending';
      }
    }

    await order.save();

    await order.populate([
      { path: 'product', select: 'title images' },
      { path: 'buyer', select: 'name email' },
      { path: 'seller', select: 'name email' }
    ]);

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
