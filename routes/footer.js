const express = require('express');
const FooterContent = require('../models/FooterContent');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get all footer content (public)
router.get('/', async (req, res) => {
  try {
    const contents = await FooterContent.find();
    res.status(200).json({ success: true, data: contents });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get specific footer content (public)
router.get('/:type', async (req, res) => {
  try {
    const content = await FooterContent.findOne({ type: req.params.type });
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    res.status(200).json({ success: true, data: content });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Create or update footer content (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { type, title, content, email, phone, address } = req.body;
    
    let footerContent = await FooterContent.findOne({ type });
    
    if (footerContent) {
      footerContent.title = title;
      footerContent.content = content;
      if (email) footerContent.email = email;
      if (phone) footerContent.phone = phone;
      if (address) footerContent.address = address;
      footerContent.updatedAt = new Date();
      await footerContent.save();
    } else {
      footerContent = await FooterContent.create({
        type,
        title,
        content,
        email: email || '',
        phone: phone || '',
        address: address || ''
      });
    }
    
    res.status(200).json({ success: true, data: footerContent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete footer content (Admin only)
router.delete('/:type', protect, authorize('admin'), async (req, res) => {
  try {
    const content = await FooterContent.findOneAndDelete({ type: req.params.type });
    
    if (!content) {
      return res.status(404).json({ success: false, message: 'Content not found' });
    }
    
    res.status(200).json({ success: true, message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

