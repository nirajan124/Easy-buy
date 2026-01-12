const express = require('express');
const ActivationRequest = require('../models/ActivationRequest');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Submit activation request (Client only)
router.post('/', protect, async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a message for activation request' 
      });
    }

    // Check if user already has a pending request
    const existingRequest = await ActivationRequest.findOne({
      userId: req.user._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ 
        success: false, 
        message: 'You already have a pending activation request. Please wait for admin review.' 
      });
    }

    const activationRequest = await ActivationRequest.create({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      message: message.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Activation request submitted successfully',
      data: activationRequest
    });
  } catch (error) {
    console.error('Error submitting activation request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user's own activation requests
router.get('/my-requests', protect, async (req, res) => {
  try {
    const requests = await ActivationRequest.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching activation requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all activation requests (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const requests = await ActivationRequest.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email role isActive')
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching activation requests:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Approve activation request and activate user (Admin only)
router.patch('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const request = await ActivationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activation request not found' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'This request has already been processed' 
      });
    }

    // Activate the user
    const user = await User.findByIdAndUpdate(
      request.userId,
      { isActive: true },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Update the request status
    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.adminResponse = req.body.adminResponse || 'Account activated successfully';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'User activated successfully',
      data: {
        request,
        user
      }
    });
  } catch (error) {
    console.error('Error approving activation request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Reject activation request (Admin only)
router.patch('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const request = await ActivationRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ 
        success: false, 
        message: 'Activation request not found' 
      });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: 'This request has already been processed' 
      });
    }

    // Update the request status
    request.status = 'rejected';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.adminResponse = req.body.adminResponse || 'Activation request rejected';
    await request.save();

    res.status(200).json({
      success: true,
      message: 'Activation request rejected',
      data: request
    });
  } catch (error) {
    console.error('Error rejecting activation request:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;




