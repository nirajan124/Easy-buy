const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  userRole: {
    type: String,
    enum: ['buyer', 'seller', 'guest'],
    default: 'guest'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);

