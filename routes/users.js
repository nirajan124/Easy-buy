const express = require('express');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all users (Admin only)
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    let users = await User.find().select('-password').lean();
    
    // Update lastActive for users that don't have it (migration for existing users)
    // Use createdAt as initial lastActive if lastActive doesn't exist
    const updatePromises = users.map(async (user) => {
      if (!user.lastActive && user.createdAt) {
        await User.findByIdAndUpdate(user._id, { lastActive: user.createdAt }, { new: false });
        user.lastActive = user.createdAt;
      }
      return user;
    });
    
    await Promise.all(updatePromises);
    
    // Fetch fresh data after updates
    users = await User.find().select('-password');
    
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get single user
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update user
router.put('/:id', protect, async (req, res) => {
  try {
    // Only admin can update any user, or user can update themselves
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Validate phone number if provided
    if (req.body.phone !== undefined && req.body.phone !== null) {
      const phoneValue = req.body.phone.toString().trim();
      if (phoneValue !== '' && !/^\d{10}$/.test(phoneValue)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number must be exactly 10 digits (numbers only)' 
        });
      }
      req.body.phone = phoneValue === '' ? null : phoneValue;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete user (Admin only, cannot delete admin users or self)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(403).json({ success: false, message: 'Cannot delete your own account' });
    }

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prevent deleting other admin users
    if (userToDelete.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin users' });
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Activate/Deactivate user (Admin only)
router.patch('/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(403).json({ success: false, message: 'Cannot change status of your own account' });
    }

    const { isActive } = req.body;
    
    // Handle string 'true'/'false' from frontend
    let isActiveValue = isActive;
    if (typeof isActive === 'string') {
      isActiveValue = isActive === 'true';
    }
    if (typeof isActiveValue !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean value' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: isActiveValue },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`User ${user.email} ${isActiveValue ? 'activated' : 'deactivated'}`);

    res.status(200).json({ 
      success: true, 
      message: `User ${isActiveValue ? 'activated' : 'deactivated'} successfully`,
      data: user 
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
