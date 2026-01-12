# Deployment Guide - Easy Buy

## Deployment Checklist

### Backend Deployment (Heroku/Railway/Render)

1. **Prepare Backend:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment Variables (.env):**
   ```
   PORT=5000 (or use platform's PORT)
   MONGODB_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_secure_random_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=production
   ```

3. **Update package.json scripts:**
   ```json
   "scripts": {
     "start": "node server.js",
     "dev": "nodemon server.js"
   }
   ```

4. **Create Procfile (for Heroku):**
   ```
   web: node server.js
   ```

5. **MongoDB Atlas Setup:**
   - Create cluster on MongoDB Atlas
   - Whitelist all IPs (0.0.0.0/0) or specific server IPs
   - Get connection string
   - Update MONGODB_URI

6. **Deploy:**
   - Push to GitHub
   - Connect to deployment platform
   - Set environment variables
   - Deploy

### Frontend Deployment (Vercel/Netlify)

1. **Build Frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Update API URLs:**
   - Change `http://localhost:5000` to your backend URL in:
     - `src/context/AuthContext.js`
     - `src/components/Dashboard/*.js`
     - All axios calls

3. **Create .env.production:**
   ```
   REACT_APP_API_URL=https://your-backend-url.herokuapp.com
   ```

4. **Update axios base URL:**
   ```javascript
   const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
   axios.get(`${API_URL}/api/...`)
   ```

5. **Deploy:**
   - Push to GitHub
   - Connect to Vercel/Netlify
   - Set environment variables
   - Deploy

### Platform-Specific Instructions

#### Heroku (Backend)
```bash
heroku create easy-buy-backend
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set JWT_SECRET=your_secret
git push heroku main
```

#### Vercel (Frontend)
```bash
npm install -g vercel
cd frontend
vercel --prod
```

#### Railway
1. Connect GitHub repo
2. Select backend/frontend folder
3. Set environment variables
4. Deploy

### Post-Deployment

1. **Test Admin Login:**
   - Email: nirajanbhattarai20@gmail.com
   - Password: 1234

2. **Verify:**
   - All API endpoints working
   - Authentication working
   - File uploads working
   - MongoDB connection stable

3. **SSL Certificate:**
   - Use HTTPS for production
   - Update CORS settings if needed

### Important Notes

- Always use environment variables for sensitive data
- Never commit .env files
- Use MongoDB Atlas for production database
- Enable CORS for your frontend domain
- Set up proper error logging
- Configure auto-scaling if needed

## Quick Deployment Commands

### Backend
```bash
cd backend
heroku create easy-buy-api
git push heroku main
```

### Frontend
```bash
cd frontend
npm run build
vercel --prod
```

## Environment Variables Summary

**Backend (.env):**
- PORT
- MONGODB_URI
- JWT_SECRET
- JWT_EXPIRE

**Frontend (.env.production):**
- REACT_APP_API_URL
