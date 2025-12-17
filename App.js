import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Auth/Login';
import LandingPage from './components/Landing/LandingPage';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import BuyerDashboard from './components/Dashboard/BuyerDashboard';
import SellerDashboard from './components/Dashboard/SellerDashboard';
import BuyHistory from './components/History/BuyHistory';
import SellHistory from './components/History/SellHistory';
import BuyerHome from './components/Home/BuyerHome';
import SellerHome from './components/Home/SellerHome';
import ShopPage from './components/Pages/ShopPage';
import AboutPage from './components/Pages/AboutPage';
import ContactPage from './components/Pages/ContactPage';
import FeedbackPage from './components/Pages/FeedbackPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/admin" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute>
                <AdminDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/buyer/dashboard"
            element={
              <PrivateRoute>
                <BuyerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/dashboard"
            element={
              <PrivateRoute>
                <SellerDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/buyer/home"
            element={
              <PrivateRoute>
                <BuyerHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/home"
            element={
              <PrivateRoute>
                <SellerHome />
              </PrivateRoute>
            }
          />
          <Route
            path="/buyer/history"
            element={
              <PrivateRoute>
                <BuyHistory />
              </PrivateRoute>
            }
          />
          <Route
            path="/seller/history"
            element={
              <PrivateRoute>
                <SellHistory />
              </PrivateRoute>
            }
          />
          <Route path="/shop" element={<ShopPage />} />
          <Route
            path="/about"
            element={
              <PrivateRoute>
                <AboutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/contact"
            element={
              <PrivateRoute>
                <ContactPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <PrivateRoute>
                <FeedbackPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
