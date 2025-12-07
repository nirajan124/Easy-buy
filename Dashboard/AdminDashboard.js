import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Toast from '../Toast';
import Loading from '../Loading/Loading';
import Footer from '../Footer/Footer';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [usersRes, productsRes, ordersRes, feedbacksRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users', config),
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/orders/all', config),
        axios.get('http://localhost:5000/api/feedback', config).catch(() => ({ data: { data: [] } }))
      ]);
      setUsers(usersRes.data.data);
      setProducts(productsRes.data.data);
      setOrders(ordersRes.data.data || []);
      setFeedbacks(feedbacksRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${userId}`);
        setUsers(users.filter(u => u._id !== userId));
        showToast('User deleted successfully', 'success');
      } catch (error) {
        showToast('Error deleting user: ' + error.response?.data?.message, 'error');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`);
        setProducts(products.filter(p => p._id !== productId));
        showToast('Product deleted successfully', 'success');
      } catch (error) {
        showToast('Error deleting product: ' + error.response?.data?.message, 'error');
      }
    }
  };

  // Calculate statistics
  const stats = {
    totalUsers: users.length,
    totalProducts: products.length,
    totalSales: orders.filter(o => o.paymentStatus === 'Completed').length,
    totalRevenue: orders
      .filter(o => o.paymentStatus === 'Completed')
      .reduce((sum, o) => sum + (o.price || 0), 0),
    totalCustomers: [...new Set(orders.map(o => o.buyer?._id || o.buyer).filter(Boolean))].length,
    totalBuyers: users.filter(u => u.role === 'buyer').length,
    totalSellers: users.filter(u => u.role === 'seller').length,
  };

  // Chart data for sales by month
  const getSalesByMonthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const salesData = new Array(6).fill(0);
    
    orders
      .filter(o => o.paymentStatus === 'Completed')
      .forEach(order => {
        const orderMonth = new Date(order.createdAt).getMonth();
        const monthIndex = (currentMonth - orderMonth + 12) % 12;
        if (monthIndex < 6) {
          salesData[5 - monthIndex] += order.price || 0;
        }
      });

    return {
      labels: months.slice(Math.max(0, currentMonth - 5), currentMonth + 1),
      datasets: [{
        label: 'Sales Revenue (Rs.)',
        data: salesData,
        backgroundColor: 'rgba(102, 126, 234, 0.8)',
        borderColor: 'rgba(102, 126, 234, 1)',
        borderWidth: 2,
      }]
    };
  };

  // Pie chart data for products by category
  const getCategoryData = () => {
    const categoryCount = {};
    products.forEach(product => {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
    });

    // Use only primary color variations
    const colors = [
      'rgba(102, 126, 234, 0.8)',  // Primary
      'rgba(102, 126, 234, 0.6)',  // Primary lighter
      'rgba(102, 126, 234, 0.4)',  // Primary lightest
      'rgba(85, 104, 211, 0.8)',   // Primary dark
      'rgba(85, 104, 211, 0.6)',   // Primary dark lighter
      'rgba(139, 158, 255, 0.8)',  // Primary light
    ];

    return {
      labels: Object.keys(categoryCount),
      datasets: [{
        data: Object.values(categoryCount),
        backgroundColor: colors.slice(0, Object.keys(categoryCount).length),
        borderWidth: 2,
        borderColor: '#fff',
      }]
    };
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.name}!</p>
        </div>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.totalUsers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{stats.totalProducts}</p>
        </div>
        <div className="stat-card">
          <h3>Total Sales</h3>
          <p>{stats.totalSales}</p>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p>Rs. {stats.totalRevenue.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Total Buyers</h3>
          <p>{stats.totalBuyers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Customers</h3>
          <p>{stats.totalCustomers}</p>
        </div>
        <div className="stat-card">
          <h3>Total Sellers</h3>
          <p>{stats.totalSellers}</p>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Orders
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          Feedback
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="charts-container">
          <div className="chart-card">
            <h3>Sales Revenue (Last 6 Months)</h3>
            <div className="chart-wrapper">
              <Bar data={getSalesByMonthData()} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  title: { display: false }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: function(value) {
                        return 'Rs. ' + value.toLocaleString();
                      }
                    }
                  }
                }
              }} />
            </div>
          </div>
          <div className="chart-card">
            <h3>Products by Category</h3>
            <div className="chart-wrapper pie-chart-wrapper">
              <Pie data={getCategoryData()} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom'
                  }
                }
              }} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="orders-admin-list">
            {orders.filter(order => {
              const searchLower = searchTerm.toLowerCase();
              return (
                order.product?.title?.toLowerCase().includes(searchLower) ||
                order.buyer?.name?.toLowerCase().includes(searchLower) ||
                order.seller?.name?.toLowerCase().includes(searchLower)
              );
            }).map((order) => (
              <div key={order._id} className="admin-order-card">
                <div className="admin-order-header">
                  <div>
                    <h3>{order.product?.title || 'Product'}</h3>
                    <p>Buyer: {order.buyer?.name} ({order.buyer?.email})</p>
                    <p>Seller: {order.seller?.name} ({order.seller?.email})</p>
                    <p>Price: Rs. {order.price?.toLocaleString()}</p>
                    <p>Payment Method: {order.paymentMethod}</p>
                    <p>Shipping Address: {order.shippingAddress}</p>
                    <p>Order Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="admin-order-status">
                    <span className={`status-badge ${order.approvalStatus?.toLowerCase() || 'pending'}`}>
                      {order.approvalStatus || 'Pending'}
                    </span>
                    <span className={`status-badge ${order.paymentStatus?.toLowerCase()}`}>
                      {order.paymentStatus}
                    </span>
                    <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
                {order.approvalStatus === 'Pending' && (
                  <div className="admin-order-actions">
                    <button
                      className="approve-btn"
                      onClick={async () => {
                        try {
                          const token = localStorage.getItem('token');
                          await axios.put(
                            `http://localhost:5000/api/orders/${order._id}`,
                            { approvalStatus: 'Approved' },
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          showToast('Order approved successfully!', 'success');
                          fetchData();
                        } catch (error) {
                          showToast('Error approving order', 'error');
                        }
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      className="reject-btn"
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to reject this order?')) {
                          try {
                            const token = localStorage.getItem('token');
                            await axios.put(
                              `http://localhost:5000/api/orders/${order._id}`,
                              { approvalStatus: 'Rejected' },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            showToast('Order rejected', 'success');
                            fetchData();
                          } catch (error) {
                            showToast('Error rejecting order', 'error');
                          }
                        }
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}
                {order.approvalStatus === 'Approved' && (
                  <div className="order-success-badge">
                    ✅ Order Approved - Payment Status: {order.paymentStatus}
                  </div>
                )}
                {order.approvalStatus === 'Rejected' && (
                  <div className="order-rejected-badge">
                    ❌ Order Rejected
                  </div>
                )}
              </div>
            ))}
            {orders.length === 0 && (
              <div className="no-orders">No orders found</div>
            )}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'products' && (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product._id} className="product-card">
                {product.images && product.images.length > 0 ? (
                  <img src={product.images[0]} alt={product.title} />
                ) : (
                  <div className="no-image">No Image</div>
                )}
                <div className="product-info">
                  <h3>{product.title}</h3>
                  <p className="product-price">Rs. {product.price}</p>
                  <p className="product-category">{product.category}</p>
                  <p className="product-status">
                    Status: <span className={product.status}>{product.status}</span>
                  </p>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteProduct(product._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'feedback' && (
        <>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search feedback..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="feedbacks-list">
            {feedbacks.filter(feedback => {
              const searchLower = searchTerm.toLowerCase();
              return (
                feedback.name?.toLowerCase().includes(searchLower) ||
                feedback.email?.toLowerCase().includes(searchLower) ||
                feedback.message?.toLowerCase().includes(searchLower) ||
                feedback.userRole?.toLowerCase().includes(searchLower)
              );
            }).map((feedback) => (
              <div key={feedback._id} className="feedback-card">
                <div className="feedback-header">
                  <div className="feedback-user-info">
                    <h3>{feedback.name}</h3>
                    <p className="feedback-email">{feedback.email}</p>
                    <span className={`role-badge ${feedback.userRole}`}>
                      {feedback.userRole || 'Guest'}
                    </span>
                  </div>
                  <div className="feedback-meta">
                    <div className="feedback-rating">
                      {Array.from({ length: 5 }, (_, i) => (
                        <span key={i} className={i < feedback.rating ? 'star-filled' : 'star-empty'}>
                          ⭐
                        </span>
                      ))}
                      <span className="rating-text">{feedback.rating}/5</span>
                    </div>
                    <p className="feedback-date">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="feedback-message">
                  <p>{feedback.message}</p>
                </div>
                <div className="feedback-actions">
                  <button
                    className="delete-btn"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to delete this feedback?')) {
                        try {
                          const token = localStorage.getItem('token');
                          await axios.delete(
                            `http://localhost:5000/api/feedback/${feedback._id}`,
                            { headers: { Authorization: `Bearer ${token}` } }
                          );
                          showToast('Feedback deleted successfully', 'success');
                          fetchData();
                        } catch (error) {
                          showToast('Error deleting feedback', 'error');
                        }
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {feedbacks.length === 0 && (
              <div className="no-feedbacks">No feedbacks found</div>
            )}
          </div>
        </>
      )}
      <Footer userRole={user?.role} />
    </div>
  );
};

export default AdminDashboard;