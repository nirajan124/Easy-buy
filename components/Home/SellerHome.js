import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loading from '../Loading/Loading';
import Footer from '../Footer/Footer';
import './SellerHome.css';

const SellerHome = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    availableProducts: 0,
    soldProducts: 0,
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch products
      const productsResponse = await axios.get('http://localhost:5000/api/products', {
        params: { seller: user?._id }
      });
      const products = productsResponse.data.data || [];
      
      // Fetch orders
      const ordersResponse = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const orders = ordersResponse.data.data || [];
      
      const availableProducts = products.filter(p => p.status === 'available').length;
      const soldProducts = products.filter(p => p.status === 'sold').length;
      const successfulOrders = orders.filter(o => o.paymentStatus === 'Completed' || o.approvalStatus === 'Approved');
      const totalRevenue = successfulOrders.reduce((sum, o) => sum + (o.price || 0), 0);
      const pendingOrders = orders.filter(o => o.approvalStatus === 'Pending').length;
      
      setStats({
        totalProducts: products.length,
        availableProducts,
        soldProducts,
        totalRevenue,
        totalOrders: orders.length,
        pendingOrders
      });
      
      setRecentProducts(products.slice(0, 6));
      setRecentOrders(orders.slice(0, 5));
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
    <div className="seller-home-container">
      <div className="seller-home-header">
        <div className="welcome-section">
          <h1>🏠 Welcome to Easy Buy, {user?.name}!</h1>
          <p>Manage your products and grow your business</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate('/seller/dashboard')} className="dashboard-btn">
            🛍️ Go to Dashboard
          </button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="home-content">
        {/* Quick Stats */}
        <div className="stats-section">
          <h2>📊 Your Business Stats</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{stats.totalProducts}</h3>
                <p>Total Products</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.availableProducts}</h3>
                <p>Available Products</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>{stats.soldProducts}</h3>
                <p>Sold Products</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💵</div>
              <div className="stat-info">
                <h3>Rs. {stats.totalRevenue.toLocaleString()}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📋</div>
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
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions-section">
          <h2>⚡ Quick Actions</h2>
          <div className="actions-grid">
            <button onClick={() => navigate('/seller/dashboard')} className="action-card">
              <div className="action-icon">➕</div>
              <h3>Add New Product</h3>
              <p>List a new item for sale</p>
            </button>
            <button onClick={() => navigate('/seller/dashboard')} className="action-card">
              <div className="action-icon">📦</div>
              <h3>My Products ({stats.totalProducts})</h3>
              <p>Manage your product listings</p>
            </button>
            <button onClick={() => navigate('/seller/history')} className="action-card">
              <div className="action-icon">📜</div>
              <h3>Sell History</h3>
              <p>View all your sales records</p>
            </button>
            <button onClick={() => navigate('/seller/dashboard')} className="action-card">
              <div className="action-icon">📊</div>
              <h3>Statistics</h3>
              <p>View your selling statistics and charts</p>
            </button>
            <button onClick={() => navigate('/seller/dashboard')} className="action-card">
              <div className="action-icon">⏳</div>
              <h3>Pending Orders ({stats.pendingOrders})</h3>
              <p>Orders waiting for admin approval</p>
            </button>
            <button onClick={() => navigate('/seller/dashboard')} className="action-card">
              <div className="action-icon">✅</div>
              <h3>Available Products</h3>
              <p>View products ready for sale</p>
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
                    <p>Buyer: {order.buyer?.name || 'Unknown'}</p>
                    <p className="price-info">Rs. {order.price?.toLocaleString()}</p>
                    <span className={`status-badge-mini ${order.approvalStatus?.toLowerCase() || 'pending'}`}>
                      {order.approvalStatus || 'Pending'}
                    </span>
                  </div>
                  <button 
                    onClick={() => navigate('/seller/history')}
                    className="view-order-btn-mini"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Products */}
        {recentProducts.length > 0 && (
          <div className="recent-products-section">
            <h2>📦 Your Recent Products</h2>
            <div className="products-grid-mini">
              {recentProducts.map((product) => (
                <div key={product._id} className="product-card-mini" onClick={() => navigate('/seller/dashboard')}>
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} />
                  ) : (
                    <div className="no-image-mini">No Image</div>
                  )}
                  <div className="product-info-mini">
                    <h4>{product.title}</h4>
                    <p className="price-mini">Rs. {product.price?.toLocaleString()}</p>
                    <p className="category-mini">{product.category}</p>
                    <span className={`status-badge-product ${product.status}`}>
                      {product.status}
                    </span>
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
              <h3>📝 Product Listing Tips</h3>
              <ul>
                <li>Add clear, high-quality images (up to 5 images)</li>
                <li>Write detailed product descriptions</li>
                <li>Set competitive prices for better sales</li>
                <li>Choose the correct category for visibility</li>
                <li>Update product status when sold</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>💰 Payment & Orders</h3>
              <ul>
                <li>Orders are initially in "Pending" status</li>
                <li>Admin approves orders before payment</li>
                <li>Payment is processed after approval</li>
                <li>Revenue is calculated from completed orders</li>
                <li>Track all orders in Sell History</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>📊 Managing Products</h3>
              <ul>
                <li>Edit product details anytime</li>
                <li>Mark products as sold when purchased</li>
                <li>Delete products you no longer want to sell</li>
                <li>View statistics for sales insights</li>
                <li>Monitor product views and performance</li>
              </ul>
            </div>
            <div className="info-card">
              <h3>❓ Need Help?</h3>
              <ul>
                <li>Check your sell history for order details</li>
                <li>View statistics for business insights</li>
                <li>Contact buyers through order information</li>
                <li>Update product status regularly</li>
                <li>Use categories to organize your products</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Footer userRole={user?.role} />
    </div>
  );
};

export default SellerHome;

