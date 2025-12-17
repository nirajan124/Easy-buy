import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Loading from '../Loading/Loading';
import Toast from '../Toast';
import Footer from '../Footer/Footer';
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
import './History.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const SellHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(response.data.data || []);
    } catch (error) {
      showToast('Error loading orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <Loading message="Loading sell history..." />;
  }

  const successfulOrders = orders.filter(o => o.paymentStatus === 'Completed');
  const totalRevenue = successfulOrders.reduce((sum, o) => sum + (o.price || 0), 0);
  
  // Chart data for sales by month
  const getSalesByMonthData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const salesData = new Array(6).fill(0);
    
    successfulOrders.forEach(order => {
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

  // Chart data for payment methods
  const getPaymentMethodData = () => {
    const methods = {};
    successfulOrders.forEach(order => {
      methods[order.paymentMethod] = (methods[order.paymentMethod] || 0) + 1;
    });

    return {
      labels: Object.keys(methods),
      datasets: [{
        data: Object.values(methods),
        backgroundColor: [
          'rgba(102, 126, 234, 0.8)',  // Primary
          'rgba(85, 104, 211, 0.8)',   // Primary dark
          'rgba(102, 126, 234, 0.6)',  // Primary lighter
        ],
        borderWidth: 2,
        borderColor: '#fff',
      }]
    };
  };

  return (
    <div className="history-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="history-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0 }}>My Sell History</h1>
          <button onClick={() => window.location.href = '/seller/dashboard'} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
        <div className="history-stats">
          <div className="stat-box">
            <h3>Total Sales</h3>
            <p>{orders.length}</p>
          </div>
          <div className="stat-box">
            <h3>Successful Sales</h3>
            <p>{successfulOrders.length}</p>
          </div>
          <div className="stat-box">
            <h3>Total Revenue</h3>
            <p>Rs. {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {successfulOrders.length > 0 && (
        <div className="charts-section">
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
            <h3>Payment Methods Distribution</h3>
            <div className="pie-chart-wrapper">
              <Pie data={getPaymentMethodData()} options={{
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

      {orders.length === 0 ? (
        <div className="no-history">
          <p>You haven't sold any products yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>{order.product?.title || 'Product'}</h3>
                  <p className="order-date">Sold on: {formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${order.paymentStatus?.toLowerCase()}`}>
                    {order.paymentStatus}
                  </span>
                  <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
              <div className="order-body">
                {order.product?.images && order.product.images.length > 0 && (
                  <div className="order-image">
                    <img src={order.product.images[0]} alt={order.product.title} />
                  </div>
                )}
                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Price:</span>
                    <span className="value">Rs. {order.price?.toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment Method:</span>
                    <span className="value">{order.paymentMethod}</span>
                  </div>
                  {order.buyer && (
                    <div className="detail-row">
                      <span className="label">Buyer:</span>
                      <span className="value">{order.buyer.name} ({order.buyer.email})</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Shipping Address:</span>
                    <span className="value">{order.shippingAddress}</span>
                  </div>
                  {order.deliveredAt && (
                    <div className="detail-row">
                      <span className="label">Delivered on:</span>
                      <span className="value">{formatDate(order.deliveredAt)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Footer userRole={user?.role} />
    </div>
  );
};

export default SellHistory;

