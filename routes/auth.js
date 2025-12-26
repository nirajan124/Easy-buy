const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_secret_key', {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Generate email verification token
const generateEmailVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, address, location } = req.body;

    // Validate phone number if provided
    if (phone && phone.trim() !== '') {
      const phoneTrimmed = phone.trim();
      // Check if phone is numeric and exactly 10 digits
      if (!/^\d{10}$/.test(phoneTrimmed)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Phone number must be exactly 10 digits (numbers only)' 
        });
      }
    }

    // Check if user exists - normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();
    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken();
    const emailVerificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Create user - email will be normalized by schema
    const user = await User.create({
      name,
      email: normalizedEmail,
      password,
      role: role || 'buyer',
      phone: phone ? phone.trim() : phone,
      address,
      location: location ? location.trim() : '',
      emailVerificationToken,
      emailVerificationTokenExpiry,
      isEmailVerified: false // Admin users are auto-verified
    });

    // Auto-verify admin users
    if (user.role === 'admin') {
      user.isEmailVerified = true;
      await user.save();
    }

    const token = generateToken(user._id);

    // In production, send verification email here
    // For now, return token for manual verification
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerificationToken}`;

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      verificationToken: emailVerificationToken, // For development/testing
      message: user.role === 'admin' 
        ? 'Registration successful! Admin account is auto-verified.'
        : 'Registration successful! Please verify your email.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Superadmin credentials detection: superadmin/superadmin (check FIRST before user lookup)
    const SUPERADMIN_EMAIL = 'superadmin';
    const SUPERADMIN_PASSWORD = 'superadmin';
    
    if (email.toLowerCase() === SUPERADMIN_EMAIL.toLowerCase() && password === SUPERADMIN_PASSWORD) {
      // Superadmin credentials detected - create or find admin user
      let adminUser = await User.findOne({ email: SUPERADMIN_EMAIL });
      
      if (!adminUser) {
        // Create superadmin user if doesn't exist
        adminUser = await User.create({
          name: 'Super Admin',
          email: SUPERADMIN_EMAIL,
          password: SUPERADMIN_PASSWORD, // Will be hashed by pre-save hook
          role: 'admin',
          phone: '0000000000',
          address: 'System Admin'
        });
      } else {
        // Update existing user to admin role and ensure password is correct
        adminUser.role = 'admin';
        // Check if password needs to be updated
        const bcrypt = require('bcryptjs');
        const isPasswordCorrect = await bcrypt.compare(SUPERADMIN_PASSWORD, adminUser.password);
        if (!isPasswordCorrect) {
          adminUser.password = SUPERADMIN_PASSWORD; // Will be hashed by pre-save hook
        }
        await adminUser.save();
      }
      
      // Update lastActive timestamp
      adminUser.lastActive = new Date();
      await adminUser.save();
      
      const token = generateToken(adminUser._id);
      return res.status(200).json({
        success: true,
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: 'admin' // Force admin role
        }
      });
    }

    // Check for user - normalize email to lowercase to match schema
    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+password');

    if (!user) {
      console.log(`Login failed: User not found for email: ${normalizedEmail}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if password matches
    if (!user.password) {
      console.log(`Login failed: User password not found for email: ${normalizedEmail}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      console.log(`Login failed: Password mismatch for email: ${normalizedEmail}`);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check if user account is active (for non-admin users only)
    // Admins can always login even if deactivated (for recovery purposes)
    if (user.role !== 'admin' && user.isActive === false) {
      console.log(`Login failed: Account is deactivated for email: ${normalizedEmail}`);
      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been deactivated. Please contact administrator.' 
      });
    }
    
    console.log(`Login successful for email: ${normalizedEmail}, role: ${user.role}`);

    // Update lastActive timestamp
    user.lastActive = new Date();
    await user.save();

    // Admin credentials detection: If admin credentials are used, override role to admin
    const ADMIN_EMAIL = 'nirajanbhattarai20@gmail.com';
    const ADMIN_PASSWORD = '1234';
    
    if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase() && password === ADMIN_PASSWORD) {
      // Admin credentials detected - allow login regardless of selected role
      // But only if user is actually admin in database
      if (user.role === 'admin') {
        // Admins can always login even if deactivated (for recovery purposes)
        // But we still check and warn if needed
        if (user.isActive === false) {
          console.log(`Warning: Admin account is deactivated but allowing login for recovery`);
        }
        
        const token = generateToken(user._id);
        return res.status(200).json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: 'admin' // Force admin role
          }
        });
      }
    }

    // For admin role login, allow if user is admin regardless of role check
    if (role === 'admin') {
      if (user.role === 'admin') {
        // Admins can always login even if deactivated (for recovery purposes)
        if (user.isActive === false) {
          console.log(`Warning: Admin account is deactivated but allowing login for recovery`);
        }
        
        const token = generateToken(user._id);
        return res.status(200).json({
          success: true,
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: 'admin'
          }
        });
      } else {
        return res.status(403).json({ success: false, message: 'Access denied. Admin credentials required.' });
      }
    }

    // For non-admin users, check if role matches (if role is provided)
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `Access denied for ${role} role` });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get current user
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Verify email
router.get('/verify-email/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiry = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Resend verification email
router.post('/resend-verification', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email already verified'
      });
    }

    // Generate new verification token
    const emailVerificationToken = generateEmailVerificationToken();
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    await user.save();

    // In production, send verification email here
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerificationToken}`;

    res.status(200).json({
      success: true,
      message: 'Verification email sent',
      verificationToken: emailVerificationToken // For development/testing
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
