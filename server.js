const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
// Increase body size limit to 50MB for base64 images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/footer', require('./routes/footer'));
app.use('/api/feedback', require('./routes/feedback'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/easybuybackend', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB Connected Successfully');
  
  // Create default admin user
  const adminEmail = 'nirajanbhattarai20@gmail.com';
  const adminExists = await User.findOne({ email: adminEmail });
  
  if (!adminExists) {
    // Create admin user - password will be hashed by pre-save hook
    const admin = await User.create({
      name: 'Admin',
      email: adminEmail,
      password: '1234', // Will be hashed automatically by pre-save hook
      role: 'admin',
      phone: '1234567890',
      address: 'Admin Address'
    });
    console.log('✅ Default admin user created:', adminEmail);
    console.log('   Email:', adminEmail);
    console.log('   Password: 1234');
  } else {
    // Always update admin role and password
    const bcrypt = require('bcryptjs');
    
    // Check current password
    const isPasswordCorrect = await bcrypt.compare('1234', adminExists.password);
    
    // Always reset password and role to ensure correct values
    const hashedPassword = await bcrypt.hash('1234', 10);
    await User.findOneAndUpdate(
      { email: adminEmail },
      {
        role: 'admin',
        password: hashedPassword
      },
      { runValidators: false, new: false }
    );
    
    if (!isPasswordCorrect) {
      console.log('✅ Admin password reset to: 1234');
    }
    console.log('✅ Admin user verified:', adminEmail);
    console.log('   Email:', adminEmail);
    console.log('   Password: 1234');
    console.log('   Role: admin');
  }
})
.catch((err) => console.error('MongoDB Connection Error:', err));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
