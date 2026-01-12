const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1'],
    default: 1
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Visa', 'MasterCard'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  approvalStatus: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  shippingAddress: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date
  }
});

module.exports = mongoose.model('Order', orderSchema);
