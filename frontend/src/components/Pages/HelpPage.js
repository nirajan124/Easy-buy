import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Footer from '../Footer/Footer';
import './Pages.css';

const HelpPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>❓ Help & Support</h1>
        <p>Learn how to use Easy Buy with our helpful guides and tutorials</p>
      </div>

      <div className="page-content">
        <div className="help-section">
          <div className="help-card">
            <h2>📹 System Tutorial Video</h2>
            <p className="help-description">
              Watch our tutorial video to learn how to use the Easy Buy platform effectively.
            </p>
            <div className="video-container">
              <video 
                width="100%" 
                height="500" 
                controls 
                style={{ borderRadius: '10px', backgroundColor: '#000' }}
                preload="metadata"
                onError={(e) => {
                  console.error('Video loading error - file not found or format not supported');
                  const errorMsg = document.getElementById('video-error');
                  if (errorMsg) {
                    errorMsg.style.display = 'block';
                  }
                }}
                onLoadedData={() => {
                  const errorMsg = document.getElementById('video-error');
                  if (errorMsg) {
                    errorMsg.style.display = 'none';
                  }
                }}
              >
                <source src={`${process.env.PUBLIC_URL || ''}/videos/tutorial-video.mp4`} type="video/mp4" />
                <source src={`${process.env.PUBLIC_URL || ''}/videos/tutorial-video.mov`} type="video/quicktime" />
                <source src={`${process.env.PUBLIC_URL || ''}/videos/tutorial-video.avi`} type="video/x-msvideo" />
                <source src={`${process.env.PUBLIC_URL || ''}/videos/tutorial-video.webm`} type="video/webm" />
                <source src={`${process.env.PUBLIC_URL || ''}/videos/tutorial-video.mkv`} type="video/x-matroska" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          <div className="help-info">
            <h3>Quick Help Topics</h3>
            <div className="help-topics">
              <div className="topic-item">
                <h4>🛒 How to Buy Products</h4>
                <ul>
                  <li>Browse products by category or search</li>
                  <li>View product details and images</li>
                  <li>Add items to cart or buy directly</li>
                  <li>Complete checkout with your address</li>
                </ul>
              </div>

              <div className="topic-item">
                <h4>💳 Payment Methods</h4>
                <ul>
                  <li>Cash on Delivery (COD) - Pay when you receive</li>
                  <li>Visa/MasterCard - Secure online payment</li>
                  <li>Orders require admin approval before payment</li>
                </ul>
              </div>

              <div className="topic-item">
                <h4>📦 Order Management</h4>
                <ul>
                  <li>Track your orders in Order History</li>
                  <li>Edit pending orders before approval</li>
                  <li>View order status and details</li>
                </ul>
              </div>

              <div className="topic-item">
                <h4>❤️ Wishlist & Cart</h4>
                <ul>
                  <li>Save products to wishlist for later</li>
                  <li>Add multiple items to cart</li>
                  <li>Manage your saved items</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer userRole={user?.role} />
    </div>
  );
};

export default HelpPage;

