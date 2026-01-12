# Admin Login Guide

## 🔐 Admin Credentials

- **Email**: `nirajanbhattarai20@gmail.com`
- **Password**: `1234`

## 📝 How to Login as Admin

1. **Start the Application:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

2. **Open Browser:**
   - Go to: `http://localhost:3000`
   - You will see the Login page

3. **Login Steps:**
   - Click on **"Admin"** button (role selection)
   - Enter email: `nirajanbhattarai20@gmail.com`
   - Enter password: `1234`
   - Click **"Login"** button

4. **What Happens:**
   - Toast notification: "Login successful! Redirecting..."
   - Automatically redirects to: `/admin/dashboard`
   - Admin Dashboard loads with:
     - Welcome message
     - Statistics cards (Users, Products, Sales, Revenue, Customers, etc.)
     - Charts (Bar chart & Pie chart)
     - Tabs for Users and Products management

## ✅ Admin Dashboard Features

### Statistics Cards:
- **Total Users** - All registered users
- **Total Products** - All products in the system
- **Total Sales** - Completed orders count
- **Total Revenue** - Total sales amount in Rs.
- **Total Customers** - Unique buyers
- **Total Buyers** - All buyer accounts
- **Total Sellers** - All seller accounts

### Charts:
- **Bar Chart**: Sales Revenue (Last 6 Months)
- **Pie Chart**: Products by Category

### Tabs:
- **Overview**: Shows charts and statistics
- **Users**: View and manage all users
- **Products**: View and manage all products

### Actions:
- View all users
- Delete users
- View all products
- Delete products
- Search functionality

## 🔄 Auto Admin Creation

The admin user is automatically created when the backend server starts:
- If admin doesn't exist → Creates new admin
- If admin exists → Updates password and role to ensure correct credentials

## 🚨 Troubleshooting

### Admin Dashboard Not Showing?

1. **Check if backend is running:**
   - Should see: "Server is running on port 5000"
   - Should see: "MongoDB Connected Successfully"
   - Should see: "Admin user updated" or "Default admin user created"

2. **Check login:**
   - Make sure you selected "Admin" role button
   - Check email and password are correct
   - Look for error messages in toast notifications

3. **Check browser console:**
   - Open Developer Tools (F12)
   - Check for any errors
   - Check Network tab for API calls

4. **Clear cache:**
   - Clear browser cache
   - Or use incognito/private window

### Password Not Working?

1. Stop the backend server
2. Restart the backend server
3. Check console for: "Admin user updated" or "Default admin user created"
4. Try logging in again with password: `1234`

## 📱 Direct URL Access

After logging in, you can directly access:
- Admin Dashboard: `http://localhost:3000/admin/dashboard`

**Note**: If you're not logged in as admin, you'll be redirected to login page.

## ✨ What You'll See

After successful admin login:

```
┌─────────────────────────────────────┐
│  Admin Dashboard                    │
│  Welcome, Admin!          [Logout]  │
├─────────────────────────────────────┤
│  [Total Users] [Total Products]     │
│  [Total Sales] [Total Revenue]      │
│  [Total Customers] [Total Sellers]  │
├─────────────────────────────────────┤
│  [Overview] [Users] [Products]      │
├─────────────────────────────────────┤
│  📊 Charts:                         │
│  - Bar Chart (Sales)                │
│  - Pie Chart (Categories)           │
└─────────────────────────────────────┘
```

## 🎯 Quick Test

1. Login as admin
2. Should see admin dashboard immediately
3. Check statistics cards show numbers
4. Check charts are visible
5. Click on "Users" tab - should see all users
6. Click on "Products" tab - should see all products

Everything working? ✅ You're all set!
