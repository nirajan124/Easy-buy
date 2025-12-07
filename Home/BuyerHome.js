import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../Loading/Loading';
import Footer from '../Footer/Footer';
import './BuyerHome.css';

const BuyerHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSpent: 0,
    cartItems: 0,
    wishlistItems: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch orders
      const ordersResponse = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = ordersResponse.data.data || [];
      
      // Fetch cart
      let cartCount = 0;
      try {
        const cartResponse = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        cartCount = cartResponse.data.data?.items?.length || 0;
      } catch (error) {
        console.error('Error fetching cart:', error);
      }
      
      // Fetch wishlist
      let wishlistCount = 0;
      try {
        const wishlistResponse = await axios.get('http://localhost:5000/api/wishlist', {
          headers: { Authorization: `Bearer ${token}` }
        });
        wishlistCount = wishlistResponse.data.data?.products?.length || 0;
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      }
      
      // Fetch featured products
      const productsResponse = await axios.get('http://localhost:5000/api/products', {
        params: { status: 'available' }
      });
      const allProducts = productsResponse.data.data || [];
      const featured = allProducts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);
      
      const successfulOrders = orders.filter(o => o.paymentStatus === 'Completed' || o.approvalStatus === 'Approved');
      const totalSpent = successfulOrders.reduce((sum, o) => sum + (o.price || 0), 0);
      
      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.approvalStatus === 'Pending').length,
        totalSpent,
        cartItems: cartCount,
        wishlistItems: wishlistCount
      });
      
      setRecentOrders(orders.slice(0, 5));
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Loading your home..." />;
  }

  return (
    <div className="buyer-home-container">
      <div className="buyer-home-header">
        <div className="welcome-section">
          <h1>🏠 Welcome to Easy Buy, {user?.name}!</h1>
          <p>Your one-stop destination for amazing second-hand deals</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/buyer/dashboard')} className="dashboard-btn">
            🛍️ Go to Dashboard
          </button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="home-content">
        {/* Quick Stats */}
        <div className="stats-section">
          <h2>📊 Your Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pendingOrders}</h3>
                <p>Pending Orders</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>Rs. {stats.totalSpent.toLocaleString()}</h3>
                <p>Total Spent</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛒</div>
              <div className="stat-info">
                <h3>{stats.cartItems}</h3>
                <p>Cart Items</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-info">
                <h3>{stats.wishlistItems}</h3>
                <p>Wishlist Items</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2>⚡ Quick Actions</h2>
          <div className="actions-grid">
            <button onClick={() => navigate('/buyer/dashboard')} className="action-card">
              <div className="action-icon">🛍️</div>
              <h3>Browse Products</h3>
              <p>Explore our collection of second-hand items</p>
            </button>
            <button onClick={() => navigate('/buyer/dashboard')} className="action-card">
              <div className="action-icon">🛒</div>
              <h3>My Cart ({stats.cartItems})</h3>
              <p>View items in your shopping cart</p>
            </button>
            <button onClick={() => navigate('/buyer/dashboard')} className="action-card">
              <div className="action-icon">❤️</div>
              <h3>My Wishlist ({stats.wishlistItems})</h3>
              <p>Check your saved favorite items</p>
            </button>
            <button onClick={() => navigate('/buyer/history')} className="action-card">
              <div className="action-icon">📜</div>
              <h3>Order History</h3>
              <p>View all your past purchases</p>
            </button>
            <button onClick={() => navigate('/buyer/dashboard')} className="action-card">
              <div className="action-icon">📦</div>
              <h3>My Orders ({stats.pendingOrders} pending)</h3>
              <p>Track your current orders</p>
            </button>
            <button onClick={() => navigate('/buyer/dashboard')} className="action-card">
              <div className="action-icon">📊</div>
              <h3>Statistics</h3>
              <p>View your buying statistics and charts</p>
            </button>
          </div>
        </div>

        {/* Recent Orders */}
        {recentOrders.length > 0 && (
          <div className="recent-orders-section">
            <h2>📦 Recent Orders</h2>
            <div className="orders-list">
              {recentOrders.map((order) => (
                <div key={order._id} className="order-card-mini">
                  <div className="order-info-mini">
                    <h4>{order.product?.title || 'Product'}</h4>
                    <p>Rs. {order.price?.toLocaleString()}</p>
                    <span className={`status-badge-mini ${order.approvalStatus?.toLowerCase() || 'pending'}`}>
                      {order.approvalStatus || 'Pending'}
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate('/buyer/history')}
                    className="view-order-btn-mini"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <div className="featured-products-section">
            <h2>⭐ Featured Products</h2>
            <div className="products-grid-mini">
              {featuredProducts.map((product) => (
                <div key={product._id} className="product-card-mini" onClick={() => navigate('/buyer/dashboard')}>
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} />
                  ) : (
                    <div className="no-image-mini">No Image</div>
                  )}
                  <div className="product-info-mini">
                    <h4>{product.title}</h4>
                    <p className="price-mini">Rs. {product.price?.toLocaleString()}</p>
                    <p className="category-mini">{product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Information Section */}
        <div className="info-section">
          <h2>ℹ️ Important Information</h2>
          <div className="info-cards">
            <div className="info-card">
              <h3>🛒 Shopping Tips</h3>
              <ul>
                <li>Browse products by category for easier navigation</li>
                <li>Add items to wishlist to save for later</li>
                <li>Check product details and images before purchasing</li>
                <li>Use filters to find products within your budget</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>💳 Payment Methods</h3>
              <ul>
                <li><strong>Cash on Delivery (COD):</strong> Pay when you receive</li>
                <li><strong>Visa/MasterCard:</strong> Secure online payment</li>
                <li>Payment is processed after admin approval</li>
                <li>Orders are confirmed once payment is completed</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>📦 Order Process</h3>
              <ul>
                <li>Add products to cart or buy directly</li>
                <li>Complete checkout with shipping address</li>
                <li>Wait for admin approval (pending status)</li>
                <li>Track your order status in Order History</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>❓ Need Help?</h3>
              <ul>
                <li>Check your order history for order details</li>
                <li>Contact seller through product details</li>
                <li>View statistics for your buying patterns</li>
                <li>Use search to find specific products</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer userRole={user?.role} />
    </div>
  );
};

export default BuyerHome;

