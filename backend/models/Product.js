const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a product title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    default: 'Good'
  },
  images: [{
    type: String
  }],
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['available', 'sold', 'pending'],
    default: 'available'
  },
  views: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    min: [0, 'Stock cannot be negative'],
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  soldAt: {
    type: Date
  }
});

// Pre-save hook to set default stock for existing products and sync status with stock
productSchema.pre('save', function(next) {
  // If stock is undefined or null, set it to 1 for backward compatibility
  if (this.stock === undefined || this.stock === null) {
    this.stock = 1;
  }
  // Sync status with stock: if stock is 0, set status to 'sold'
  if (this.stock === 0 && this.status === 'available') {
    this.status = 'sold';
    if (!this.soldAt) {
      this.soldAt = new Date();
    }
  }
  // If stock > 0 and status is 'sold', reset to 'available'
  if (this.stock > 0 && this.status === 'sold') {
    this.status = 'available';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
