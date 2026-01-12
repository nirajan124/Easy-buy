const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Update lastActive timestamp immediately (real-time tracking)
    const now = new Date();
    // Update asynchronously without blocking the request
    User.findByIdAndUpdate(decoded.id, { lastActive: now }, { new: false }).catch(err => {
      console.error('Error updating lastActive:', err);
    });
    // Also update in memory for immediate use
    req.user.lastActive = now;
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized to access this route' });
  }
};

// Role authorization
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not authenticated' 
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role '${req.user.role}' is not authorized to access this route. Required roles: ${roles.join(', ')}` 
      });
    }
    next();
  };
};
