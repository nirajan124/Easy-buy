const express = require('express');
const Feedback = require('../models/Feedback');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Submit feedback (public)
router.post('/', async (req, res) => {
  try {
    const { name, email, message, rating, userRole, userId, sellerId, productId } = req.body;
    
    const feedback = await Feedback.create({
      name,
      email,
      message,
      rating: rating || 5,
      userRole: userRole || 'guest',
      userId: userId || null,
      sellerId: sellerId || null,
      productId: productId || null
    });

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get seller ratings
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { sellerId } = req.params;
    
    const feedbacks = await Feedback.find({ sellerId })
      .populate('userId', 'name email')
      .populate('productId', 'title')
      .sort({ createdAt: -1 });
    
    // Calculate average rating
    const ratings = feedbacks.map(f => f.rating).filter(r => r);
    const averageRating = ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1)
      : 0;
    
    const ratingDistribution = {
      5: ratings.filter(r => r === 5).length,
      4: ratings.filter(r => r === 4).length,
      3: ratings.filter(r => r === 3).length,
      2: ratings.filter(r => r === 2).length,
      1: ratings.filter(r => r === 1).length
    };

    res.status(200).json({
      success: true,
      data: {
        feedbacks,
        averageRating: parseFloat(averageRating),
        totalRatings: ratings.length,
        ratingDistribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get all feedbacks (admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name email role')
      .populate('sellerId', 'name email')
      .populate('productId', 'title')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete feedback (admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const feedback = await Feedback.findByIdAndDelete(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

