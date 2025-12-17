import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Store the attempted path to redirect after login
    const path = window.location.pathname;
    if (path.startsWith('/admin')) {
      return <Navigate to="/login/admin" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Role-based routing - redirect to correct dashboard based on user role
  const path = window.location.pathname;
  
  // Check if trying to access admin dashboard
  if (path.startsWith('/admin')) {
    if (user?.role === 'admin') {
      return children; // Admin can access admin dashboard
    } else {
      // Redirect non-admin users to login with error message
      // Or redirect to their own dashboard if they're logged in as different role
      if (user?.role) {
        return <Navigate to={`/${user?.role}/dashboard`} replace />;
      }
      return <Navigate to="/login/admin" replace />;
    }
  }
  
  // Check if trying to access buyer dashboard
  if (path.startsWith('/buyer')) {
    if (user?.role === 'buyer') {
      return children; // Buyer can access buyer dashboard
    } else {
      // Redirect non-buyer users to their own dashboard
      return <Navigate to={`/${user?.role}/dashboard`} replace />;
    }
  }
  
  // Check if trying to access seller dashboard
  if (path.startsWith('/seller')) {
    if (user?.role === 'seller') {
      return children; // Seller can access seller dashboard
    } else {
      // Redirect non-seller users to their own dashboard
      return <Navigate to={`/${user?.role}/dashboard`} replace />;
    }
  }

  return children;
};

export default PrivateRoute;
