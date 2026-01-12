# Easy Buy - Second Hand Marketplace

A full-stack MERN application for buying and selling second-hand items with role-based access control (Admin, Buyer, Seller).

## Features

- **Three User Roles:**
  - **Admin**: Manage all users and products
  - **Buyer**: Browse and purchase second-hand items
  - **Seller**: List and manage products for sale

- **Key Functionality:**
  - User authentication and authorization
  - Role-based dashboards
  - Product management (CRUD operations)
  - Search and filter products
  - Image upload support
  - Real-time product status tracking

## Tech Stack

- **Frontend:** React, React Router, Axios
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Authentication:** JWT (JSON Web Tokens)

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn

## Installation & Setup

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd "Easy Buy"
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file (copy from .env.example)
# Windows PowerShell:
Copy-Item .env.example .env

# Linux/Mac:
# cp .env.example .env

# Edit .env file and update:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (a random secret key)
# - PORT (default: 5000)
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install
```

## Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If MongoDB is installed locally, start the service
# Windows:
# MongoDB should start automatically as a service

# Linux/Mac:
# mongod
```

Or use MongoDB Atlas (cloud) and update the connection string in `.env` file.

### Start Backend Server

```bash
# From backend directory
cd backend
npm run dev

# Server will run on http://localhost:5000
```

### Start Frontend Development Server

```bash
# From frontend directory (in a new terminal)
cd frontend
npm start

# Frontend will run on http://localhost:3000
# Browser should open automatically
```

## Default Routes

- **Login/Register:** http://localhost:3000/login
- **Admin Dashboard:** http://localhost:3000/admin/dashboard
- **Buyer Dashboard:** http://localhost:3000/buyer/dashboard
- **Seller Dashboard:** http://localhost:3000/seller/dashboard

## Creating Admin User

To create an admin user, you can:

1. Use MongoDB Compass or mongo shell to manually update a user's role to "admin"
2. Or register a user first, then update the role in MongoDB:
   ```javascript
   // In MongoDB shell or Compass
   db.users.updateOne(
     { email: "your-email@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Seller/Admin)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

## Project Structure

```
Easy Buy/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   └── Product.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   └── products.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Login.css
│   │   │   └── Dashboard/
│   │   │       ├── AdminDashboard.js
│   │   │       ├── BuyerDashboard.js
│   │   │       ├── SellerDashboard.js
│   │   │       └── Dashboard.css
│   │   ├── context/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## Troubleshooting

1. **MongoDB Connection Error:**
   - Make sure MongoDB is running
   - Check the MONGODB_URI in backend/.env file
   - Try using `mongodb://127.0.0.1:27017/easybuy` for local MongoDB

2. **Port Already in Use:**
   - Change PORT in backend/.env file
   - Or kill the process using the port

3. **CORS Errors:**
   - Make sure backend is running on port 5000
   - Check that frontend API calls use the correct backend URL

## License

MIT

## Support

For issues and questions, please create an issue in the repository.
