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
import Product360Viewer from '../Product360Viewer/Product360Viewer';
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
  const { user, logout, loading: authLoading, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activationRequests, setActivationRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserForm, setEditUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchData();
    
    // Update admin's own lastActive immediately when dashboard loads
    const updateAdminLastActive = async () => {
      try {
        const token = localStorage.getItem('token');
        // Make a lightweight request to update lastActive
        await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => {}); // Silently fail if needed
      } catch (error) {
        // Ignore errors
      }
    };
    updateAdminLastActive();
    
    // Set up real-time updates every 10 seconds to show accurate last active times
    const interval = setInterval(() => {
      if (activeTab === 'users') {
        fetchData(true); // Silent refresh - don't show loading
      }
    }, 10000); // 10 seconds - only refresh when on users tab
    
    return () => clearInterval(interval);
  }, [activeTab]);

  const showToast = (message, type = 'success') => {
    // Only show toast messages to admin users
    if (user && user.role === 'admin') {
      setToast({ message, type, id: Date.now() });
      setTimeout(() => setToast(null), 4500);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Order deleted successfully', 'success');
      fetchData();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting order', 'error');
    }
  };

  const fetchData = async (silent = false) => {
    try {
      if (!silent) {
      setLoading(true);
      }
      const token = localStorage.getItem('token');
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const [usersRes, productsRes, ordersRes, feedbacksRes, activationRequestsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/users', config),
        axios.get('http://localhost:5000/api/products'),
        axios.get('http://localhost:5000/api/orders/all', config),
        axios.get('http://localhost:5000/api/feedback', config).catch(() => ({ data: { data: [] } })),
        axios.get('http://localhost:5000/api/activation-requests', config).catch(() => ({ data: { data: [] } }))
      ]);
      setUsers(usersRes.data.data);
      setProducts(productsRes.data.data);
      setOrders(ordersRes.data.data || []);
      setFeedbacks(feedbacksRes.data.data || []);
      setActivationRequests(activationRequestsRes.data.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      if (!silent) {
      setLoading(false);
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUsers(users.filter(u => u._id !== userId));
        showToast('User deleted successfully', 'success');
      } catch (error) {
        showToast('Error deleting user: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit);
    setEditUserForm({
      name: userToEdit.name || '',
      email: userToEdit.email || '',
      phone: userToEdit.phone || '',
      address: userToEdit.address || ''
    });
  };

  const handleSaveEditUser = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/users/${editingUser._id}`,
        editUserForm,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('User updated successfully', 'success');
      setEditingUser(null);
      fetchData();
    } catch (error) {
      showToast('Error updating user: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    // Only allow admin to activate/deactivate users
    if (!user || user.role !== 'admin') {
      showToast('Unauthorized: Only admin can perform this action', 'error');
      return;
    }

    // currentStatus is true if active, false if inactive
    const newStatus = !currentStatus;
    const action = newStatus ? 'activate' : 'deactivate';
    
    if (window.confirm(`Are you sure you want to ${action} this user?`)) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.patch(
          `http://localhost:5000/api/users/${userId}/status`,
          { isActive: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Only show toast to admin users
        if (user && user.role === 'admin') {
          showToast(`User ${action}d successfully`, 'success');
        }
        // Immediately update the user in local state
        setUsers(users.map(u => 
          u._id === userId ? { ...u, isActive: newStatus } : u
        ));
        // Also refresh from server
        setTimeout(() => fetchData(true), 500);
      } catch (error) {
        // Only show error toast to admin users
        if (user && user.role === 'admin') {
          showToast('Error updating user status: ' + (error.response?.data?.message || error.message), 'error');
        }
        console.error('Status update error:', error);
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
    const currentYear = new Date().getFullYear();
    
    // Get last 6 months including current month
    const monthLabels = [];
    const salesData = new Array(6).fill(0);
    
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      monthLabels.push(months[monthIndex]);
      
      // Calculate sales for this month
    orders
        .filter(o => {
          if (o.paymentStatus !== 'Completed') return false;
          const orderDate = new Date(o.createdAt);
          return orderDate.getMonth() === monthIndex && orderDate.getFullYear() === year;
        })
      .forEach(order => {
          salesData[5 - i] += order.price || 0;
      });
    }

    return {
      labels: monthLabels,
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
      if (product.category) {
      categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      }
    });

    // Use diverse, distinct colors for better identification
    const colors = [
      'rgba(102, 126, 234, 0.8)',   // Blue
      'rgba(236, 72, 153, 0.8)',    // Pink
      'rgba(34, 197, 94, 0.8)',     // Green
      'rgba(251, 146, 60, 0.8)',    // Orange
      'rgba(168, 85, 247, 0.8)',    // Purple
      'rgba(239, 68, 68, 0.8)',     // Red
      'rgba(59, 130, 246, 0.8)',    // Light Blue
      'rgba(245, 158, 11, 0.8)',    // Yellow
      'rgba(20, 184, 166, 0.8)',    // Teal
      'rgba(139, 92, 246, 0.8)',    // Indigo
      'rgba(249, 115, 22, 0.8)',    // Deep Orange
      'rgba(14, 165, 233, 0.8)',    // Sky Blue
      'rgba(147, 51, 234, 0.8)',    // Violet
      'rgba(16, 185, 129, 0.8)',    // Emerald
      'rgba(217, 70, 239, 0.8)',    // Fuchsia
    ];

    const categories = Object.keys(categoryCount);
    const categoryColors = categories.map((_, index) => colors[index % colors.length]);

    return {
      labels: categories,
      datasets: [{
        data: Object.values(categoryCount),
        backgroundColor: categoryColors,
        borderWidth: 2,
        borderColor: '#fff',
      }]
    };
  };

  const filteredUsers = users.filter(user => {
    if (!searchTerm.trim()) return true;
    const searchLower = searchTerm.toLowerCase().trim();
    // Search by: ID, Name, Email, Phone (contact), Role
    return (
      (user._id && user._id.toString().toLowerCase().includes(searchLower)) ||
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.phone && user.phone.toLowerCase().includes(searchLower)) ||
      (user.role && user.role.toLowerCase().includes(searchLower))
    );
  });

  // Format time ago with real-time updates
  const formatTimeAgo = (date) => {
    if (!date) {
      // If no lastActive, use createdAt as fallback
      return 'New user';
    }
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    }
    
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago`;
    }
    
    const diffInYears = Math.floor(diffInMonths / 12);
    return `${diffInYears} year${diffInYears > 1 ? 's' : ''} ago`;
  };

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      window.location.href = '/login/admin';
      return;
    }
    if (!authLoading && user && user.role !== 'admin') {
      window.location.href = `/${user.role}/dashboard`;
      return;
    }
  }, [user, authLoading, isAuthenticated]);

  if (authLoading || loading) {
    return <Loading message="Loading dashboard..." />;
  }

  // Double check authentication before rendering
  if (!isAuthenticated || !user || user.role !== 'admin') {
    return <Loading message="Redirecting..." />;
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
            <div className="pie-chart-wrapper">
              <Pie data={getCategoryData()} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'bottom',
                    labels: {
                      padding: 15,
                      font: {
                        size: 14
                      }
                    }
                  },
                  tooltip: {
                    padding: 12,
                    titleFont: {
                      size: 16
                    },
                    bodyFont: {
                      size: 14
                    }
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
                {order.approvalStatus === 'Approved' && order.orderStatus !== 'Delivered' && (
                  <div className="admin-order-actions" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                    <div className="order-success-badge" style={{ marginBottom: '10px' }}>
                      ✅ Order Approved - Payment Status: {order.paymentStatus}
                    </div>
                    <button
                      className="complete-btn"
                      onClick={async () => {
                        if (window.confirm('Mark this order as delivered/complete?')) {
                          try {
                            const token = localStorage.getItem('token');
                            const response = await axios.put(
                              `http://localhost:5000/api/orders/${order._id}`,
                              { orderStatus: 'Delivered' },
                              { headers: { Authorization: `Bearer ${token}` } }
                            );
                            showToast('Order marked as delivered successfully!', 'success');
                            fetchData();
                          } catch (error) {
                            console.error('Error marking order as delivered:', error);
                            const errorMessage = error.response?.data?.message || error.message || 'Error marking order as delivered';
                            showToast(errorMessage, 'error');
                          }
                        }
                      }}
                      style={{ 
                        background: '#4caf50', 
                        color: 'white', 
                        border: 'none', 
                        padding: '10px 20px', 
                        borderRadius: '8px', 
                        cursor: 'pointer', 
                        fontSize: '0.95em', 
                        fontWeight: '600', 
                        transition: 'all 0.3s',
                        marginRight: '10px'
                      }}
                      onMouseEnter={(e) => { 
                        e.target.style.background = '#45a049'; 
                        e.target.style.transform = 'translateY(-2px)'; 
                      }}
                      onMouseLeave={(e) => { 
                        e.target.style.background = '#4caf50'; 
                        e.target.style.transform = 'translateY(0)'; 
                      }}
                    >
                      ✅ Mark as Complete
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteOrder(order._id)}
                      style={{ background: '#f44336', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95em', fontWeight: '600', transition: 'all 0.3s' }}
                      onMouseEnter={(e) => { e.target.style.background = '#d32f2f'; e.target.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.target.style.background = '#f44336'; e.target.style.transform = 'translateY(0)'; }}
                    >
                      🗑️ Delete Order
                    </button>
                  </div>
                )}
                {order.approvalStatus === 'Approved' && order.orderStatus === 'Delivered' && (
                  <div className="order-success-badge" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                    ✅ Order Approved - Status: Delivered (Buyer can now review)
                  </div>
                )}
                {order.approvalStatus === 'Rejected' && (
                  <div className="admin-order-actions" style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
                    <div className="order-rejected-badge">
                      ❌ Order Rejected
                    </div>
                    <button
                      className="delete-btn"
                      onClick={() => handleDeleteOrder(order._id)}
                      style={{ marginTop: '10px', background: '#f44336', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.95em', fontWeight: '600', transition: 'all 0.3s' }}
                      onMouseEnter={(e) => { e.target.style.background = '#d32f2f'; e.target.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.target.style.background = '#f44336'; e.target.style.transform = 'translateY(0)'; }}
                    >
                      🗑️ Delete Order
                    </button>
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
              placeholder="Search by ID, Name, Email, Phone, or Role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>{u._id.slice(-6)}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`role-badge ${u.role}`}>{u.role}</span>
                    </td>
                    <td>{u.phone || 'N/A'}</td>
                    <td>
                      <span className={`status-badge ${u.isActive === false ? 'inactive' : 'active'}`}>
                        {u.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#666' }}>
                      {formatTimeAgo(u.lastActive || u.createdAt)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button
                          className="edit-btn"
                          onClick={() => handleEditUser(u)}
                          style={{ 
                            padding: '5px 10px', 
                            backgroundColor: '#667eea', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px', 
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Edit
                        </button>
                        {u._id !== user?._id && (
                          <button
                            className={u.isActive === false ? "activate-btn" : "deactivate-btn"}
                            onClick={() => handleToggleUserStatus(u._id, u.isActive !== false)}
                            style={{ 
                              padding: '5px 10px', 
                              backgroundColor: u.isActive === false ? '#28a745' : '#dc3545', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px', 
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title={u.isActive === false ? 'Activate user account' : 'Deactivate user account'}
                          >
                            {u.isActive === false ? '✓ Activate' : '✗ Deactivate'}
                          </button>
                        )}
                        {u.role !== 'admin' && (
                          <>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        Delete
                      </button>
                          </>
                        )}
                        {u.role === 'admin' && u._id === user?._id && (
                          <span style={{ fontSize: '12px', color: '#999', fontStyle: 'italic' }}>
                            Self
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {editingUser && (
            <div className="modal-overlay" onClick={() => setEditingUser(null)}>
              <div className="modal-content edit-user-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setEditingUser(null)}>×</button>
                <h2>Edit User</h2>
                <div className="edit-user-form">
                  <div className="form-group">
                    <label>Name *</label>
                    <input
                      type="text"
                      value={editUserForm.name}
                      onChange={(e) => setEditUserForm({ ...editUserForm, name: e.target.value })}
                      required
                      placeholder="Enter name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={editUserForm.email}
                      onChange={(e) => setEditUserForm({ ...editUserForm, email: e.target.value })}
                      required
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone (Optional)</label>
                    <input
                      type="tel"
                      value={editUserForm.phone}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === '' || (/^\d+$/.test(value) && value.length <= 10)) {
                          setEditUserForm({ ...editUserForm, phone: value });
                        }
                      }}
                      placeholder="Enter phone (10 digits)"
                      maxLength={10}
                    />
                  </div>
                  <div className="form-group">
                    <label>Address (Optional)</label>
                    <textarea
                      value={editUserForm.address}
                      onChange={(e) => setEditUserForm({ ...editUserForm, address: e.target.value })}
                      placeholder="Enter address"
                      rows="3"
                    />
                  </div>
                  <div className="form-actions" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                    <button 
                      className="cancel-btn" 
                      onClick={() => setEditingUser(null)}
                      style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      className="submit-btn" 
                      onClick={handleSaveEditUser}
                      style={{ padding: '10px 20px', backgroundColor: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
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
              <div key={product._id} className="product-card" style={{ cursor: 'pointer' }} onClick={() => {
                // Fetch full product details with seller info
                axios.get(`http://localhost:5000/api/products/${product._id}`)
                  .then(res => setSelectedProduct(res.data.data))
                  .catch(err => {
                    console.error('Error fetching product:', err);
                    setSelectedProduct(product);
                  });
              }}>
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
                    Status: <span className={product.status}>{product.status === 'sold' ? 'Sold Out' : product.status}</span>
                  </p>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProduct(product._id);
                    }}
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {selectedProduct && (
            <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
              <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={() => setSelectedProduct(null)}>×</button>
                <h2>{selectedProduct.title}</h2>

                <div className="modal-body">
                  {selectedProduct.images && selectedProduct.images.length > 0 ? (
                    <div className="modal-image-section">
                      <Product360Viewer images={selectedProduct.images.slice(0, 5)} productTitle={selectedProduct.title} />
                      {selectedProduct.images.length > 5 && (
                        <p className="images-limit-note">📸 Showing first 5 images out of {selectedProduct.images.length} total</p>
                      )}
                      {selectedProduct.images.length <= 5 && (
                        <p className="images-count-note">📸 {selectedProduct.images.length} image(s)</p>
                      )}
                    </div>
                  ) : (
                    <div className="no-image-large">No Image Available</div>
                  )}
                  <div className="modal-details">
                    <div className="detail-section">
                      <p className="price-large">Rs. {selectedProduct.price?.toLocaleString()}</p>
                    </div>
                    <div className="detail-section">
                      <p><strong>Category:</strong> {selectedProduct.category}</p>
                      <p><strong>Condition:</strong> {selectedProduct.condition}</p>
                      <p><strong>Status:</strong> <span className={`status-badge ${selectedProduct.status}`}>{selectedProduct.status === 'sold' ? 'Sold Out' : selectedProduct.status}</span></p>
                      {selectedProduct.views !== undefined && (
                        <p><strong>Views:</strong> {selectedProduct.views}</p>
                      )}
                    </div>
                    <div className="detail-section">
                      <p><strong>Description:</strong></p>
                      <p className="description-text">{selectedProduct.description}</p>
                    </div>
                    {selectedProduct.seller && (
                      <div className="seller-info">
                        <h4>Seller Information</h4>
                        <p><strong>Name:</strong> {selectedProduct.seller.name || 'N/A'}</p>
                        {selectedProduct.seller.email && (
                          <p><strong>Email:</strong> {selectedProduct.seller.email}</p>
                        )}
                        {selectedProduct.seller.phone && (
                          <p><strong>Phone:</strong> {selectedProduct.seller.phone}</p>
                        )}
                        {selectedProduct.seller.address && (
                          <p><strong>Address:</strong> {selectedProduct.seller.address}</p>
                        )}
                      </div>
                    )}
                    <div className="detail-section">
                      <p><strong>Created:</strong> {new Date(selectedProduct.createdAt).toLocaleDateString()}</p>
                      {selectedProduct.updatedAt && (
                        <p><strong>Last Updated:</strong> {new Date(selectedProduct.updatedAt).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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