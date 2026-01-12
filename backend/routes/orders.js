const express = require('express');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');
const { removeOutOfStockFromCarts } = require('./cart');

const router = express.Router();

// Create order
router.post('/', protect, authorize('buyer'), async (req, res) => {
  try {
    const { productId, paymentMethod, shippingAddress, quantity = 1 } = req.body;

    const product = await Product.findById(productId).populate('seller');
    
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.status !== 'available') {
      return res.status(400).json({ success: false, message: 'Product is not available' });
    }

    // Validate quantity
    const orderQuantity = parseInt(quantity, 10);
    if (isNaN(orderQuantity) || orderQuantity < 1) {
      return res.status(400).json({ success: false, message: 'Invalid quantity. Quantity must be at least 1' });
    }

    // Check stock availability
    if (!product.stock || product.stock < orderQuantity) {
      return res.status(400).json({ 
        success: false, 
        message: `Insufficient stock. Only ${product.stock || 0} item(s) available.` 
      });
    }

    // Determine initial payment status
    const initialPaymentStatus = (paymentMethod === 'Visa' || paymentMethod === 'MasterCard') ? 'Completed' : 'Pending';
    
    // Create order
    const order = await Order.create({
      product: productId,
      buyer: req.user._id,
      seller: product.seller._id,
      price: product.price,
      quantity: orderQuantity,
      paymentMethod,
      shippingAddress,
      paymentStatus: initialPaymentStatus,
      orderStatus: 'Pending',
      approvalStatus: 'Pending'
    });

    // Update stock and status only when payment is completed
    if (initialPaymentStatus === 'Completed') {
      product.stock -= orderQuantity;
      if (product.stock <= 0) {
        product.status = 'sold';
        product.soldAt = new Date();
        // Remove out-of-stock product from all carts
        await removeOutOfStockFromCarts(productId);
      }
      await product.save();
    }

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
    // Admin can update any order status, seller can only update their own orders
    const isAdmin = req.user.role === 'admin';
    const isSeller = order.seller && order.seller.toString() === req.user._id.toString();
    
    if (!isAdmin && !isSeller) {
      return res.status(403).json({ success: false, message: 'Not authorized. Only admin or order seller can update order status.' });
    }

    // Track if payment status changed to Completed
    let paymentCompleted = false;
    const previousPaymentStatus = order.paymentStatus;

    if (req.body.orderStatus) {
      order.orderStatus = req.body.orderStatus;
      if (req.body.orderStatus === 'Delivered') {
        order.deliveredAt = new Date();
        if (order.paymentStatus !== 'Completed') {
          order.paymentStatus = 'Completed';
          paymentCompleted = true;
        }
      }
    }

    if (req.body.paymentStatus && req.user.role === 'admin') {
      if (req.body.paymentStatus === 'Completed' && previousPaymentStatus !== 'Completed') {
        paymentCompleted = true;
      }
      order.paymentStatus = req.body.paymentStatus;
    }

    // Admin can approve/reject orders
    if (req.body.approvalStatus && req.user.role === 'admin') {
      order.approvalStatus = req.body.approvalStatus;
      if (req.body.approvalStatus === 'Approved') {
        if (order.paymentStatus !== 'Completed') {
          order.paymentStatus = 'Completed';
          paymentCompleted = true;
        }
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
        const newPaymentStatus = (req.body.paymentMethod === 'Visa' || req.body.paymentMethod === 'MasterCard') ? 'Completed' : 'Pending';
        if (newPaymentStatus === 'Completed' && previousPaymentStatus !== 'Completed') {
          paymentCompleted = true;
        }
        order.paymentStatus = newPaymentStatus;
      }
    }

    await order.save();

    // Update stock when payment is completed
    if (paymentCompleted) {
      const product = await Product.findById(order.product);
      if (product) {
        product.stock -= order.quantity;
        if (product.stock < 0) {
          product.stock = 0; // Prevent negative stock
        }
        if (product.stock <= 0) {
          product.status = 'sold';
          product.soldAt = new Date();
          // Remove out-of-stock product from all carts
          await removeOutOfStockFromCarts(order.product.toString());
        }
        await product.save();
      }
    }

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

// Delete order
router.delete('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check authorization - buyers can delete their own orders, sellers can delete their own orders, admins can delete any
    if (req.user.role === 'admin') {
      // Admin can delete any order
    } else if (req.user.role === 'buyer' && order.buyer.toString() === req.user._id.toString()) {
      // Buyer cannot delete pending or approved orders - only rejected orders
      if (order.approvalStatus === 'Pending') {
        return res.status(403).json({ success: false, message: 'Cannot delete pending order. Please wait for admin confirmation.' });
      }
      if (order.approvalStatus === 'Approved') {
        return res.status(403).json({ success: false, message: 'Cannot delete approved order. Order has been confirmed.' });
      }
      // Buyer can delete rejected orders
    } else if (req.user.role === 'seller' && order.seller.toString() === req.user._id.toString()) {
      // Seller can delete their own orders
    } else {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this order' });
    }

    await Order.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
