# Fix Admin Password Issue

## Problem
Admin login showing "Invalid credentials" error.

## Solution

### Option 1: Restart Backend Server (Easiest)
The backend server automatically creates/resets admin user on startup.

1. **Stop the backend server** (Ctrl+C)
2. **Restart it:**
   ```bash
   cd backend
   npm run dev
   ```
3. Check console for:
   - ✅ Admin user created/verified message
   - Email and password confirmation

### Option 2: Run Reset Script
If Option 1 doesn't work, run the reset script:

```bash
cd backend
node scripts/resetAdmin.js
```

This will:
- Find or create admin user
- Set password to: 1234
- Set role to: admin

### Option 3: Manual MongoDB Fix

1. Open MongoDB Compass or mongo shell
2. Connect to database: `easybuybackend`
3. Go to `users` collection
4. Find user with email: `nirajanbhattarai20@gmail.com`
5. Delete that user
6. Restart backend server (it will auto-create admin)

## Admin Credentials

- **Email**: `nirajanbhattarai20@gmail.com`
- **Password**: `1234`
- **Role**: `admin`

## After Fix

1. Try logging in again with admin credentials
2. Make sure you selected "Admin" role button on login page
3. Check browser console for any errors

## Verification

After restarting backend, you should see in console:
```
✅ Admin user verified/reset: nirajanbhattarai20@gmail.com
   Email: nirajanbhattarai20@gmail.com
   Password: 1234
   Role: admin
```

If you see this, admin is ready to login!
