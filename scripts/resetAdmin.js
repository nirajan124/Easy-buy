const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function resetAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easybuybackend', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB Connected');
    
    const adminEmail = 'nirajanbhattarai20@gmail.com';
    
    // Find or create admin
    let admin = await User.findOne({ email: adminEmail });
    
    if (!admin) {
      // Create new admin
      const hashedPassword = await bcrypt.hash('1234', 10);
      admin = await User.create({
        name: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        phone: '1234567890',
        address: 'Admin Address'
      });
      console.log('✅ Admin created:', adminEmail);
    } else {
      // Update existing admin
      admin.role = 'admin';
      const hashedPassword = await bcrypt.hash('1234', 10);
      admin.password = hashedPassword;
      await admin.save();
      console.log('✅ Admin password reset:', adminEmail);
    }
    
    console.log('Email:', adminEmail);
    console.log('Password: 1234');
    console.log('Role: admin');
    
    await mongoose.connection.close();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

resetAdmin();
