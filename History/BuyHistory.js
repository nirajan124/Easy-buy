import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Loading from '../Loading/Loading';
import Toast from '../Toast';
import Footer from '../Footer/Footer';
import './History.css';

const BuyHistory = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({ shippingAddress: '', paymentMethod: '' });

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

  const handleEditOrder = (order) => {
    if (order.approvalStatus !== 'Pending') {
      showToast('Only pending orders can be edited', 'error');
      return;
    }
    setEditingOrder(order);
    setEditForm({
      shippingAddress: order.shippingAddress,
      paymentMethod: order.paymentMethod
    });
  };

  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/orders/${editingOrder._id}`,
        {
          shippingAddress: editForm.shippingAddress,
          paymentMethod: editForm.paymentMethod
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      showToast('Order updated successfully', 'success');
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error updating order', 'error');
    }
  };

  if (loading) {
    return <Loading message="Loading purchase history..." />;
  }

  const successfulOrders = orders.filter(o => o.paymentStatus === 'Completed');
  const totalSpent = successfulOrders.reduce((sum, o) => sum + (o.price || 0), 0);

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
          <h1 style={{ margin: 0 }}>My Purchase History</h1>
          <button onClick={() => window.location.href = '/buyer/dashboard'} className="back-btn">
            ← Back to Dashboard
          </button>
        </div>
        <div className="history-stats">
          <div className="stat-box">
            <h3>Total Orders</h3>
            <p>{orders.length}</p>
          </div>
          <div className="stat-box">
            <h3>Successful Orders</h3>
            <p>{successfulOrders.length}</p>
          </div>
          <div className="stat-box">
            <h3>Total Spent</h3>
            <p>Rs. {totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-history">
          <p>You haven't made any purchases yet.</p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <div className="order-header">
                <div className="order-info">
                  <h3>{order.product?.title || 'Product'}</h3>
                  <p className="order-date">Ordered on: {formatDate(order.createdAt)}</p>
                </div>
                <div className="order-status">
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
              <div className="order-body">
                <div className="order-image">
                  {order.product?.images && order.product.images.length > 0 ? (
                    <img src={order.product.images[0]} alt={order.product.title || 'Product'} />
                  ) : (
                    <div className="no-image-placeholder">
                      <span>📦</span>
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="order-details">
                  <div className="detail-row">
                    <span className="label">Price:</span>
                    <span className="value">Rs. {order.price?.toLocaleString()}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Payment Method:</span>
                    <span className="value">{order.paymentMethod}</span>
                  </div>
                  <div className="detail-row">
                    <span className="label">Shipping Address:</span>
                    <span className="value">{order.shippingAddress}</span>
                  </div>
                  {order.seller && (
                    <div className="detail-row">
                      <span className="label">Seller:</span>
                      <span className="value">{order.seller.name} ({order.seller.email})</span>
                    </div>
                  )}
                  {order.deliveredAt && (
                    <div className="detail-row">
                      <span className="label">Delivered on:</span>
                      <span className="value">{formatDate(order.deliveredAt)}</span>
                    </div>
                  )}
                </div>
              </div>
              {order.approvalStatus === 'Pending' && (
                <div className="order-actions">
                  <button 
                    className="edit-order-btn"
                    onClick={() => handleEditOrder(order)}
                  >
                    ✏️ Edit Order
                  </button>
                </div>
              )}
              {order.approvalStatus === 'Approved' && (
                <div className="order-success-message">
                  ✅ Order Approved! Your order has been confirmed.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {editingOrder && (
        <div className="modal-overlay" onClick={() => setEditingOrder(null)}>
          <div className="modal-content edit-order-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setEditingOrder(null)}>×</button>
            <h2>Edit Order</h2>
            <div className="edit-order-form">
              <div className="form-group">
                <label>Shipping Address *</label>
                <textarea
                  value={editForm.shippingAddress}
                  onChange={(e) => setEditForm({ ...editForm, shippingAddress: e.target.value })}
                  required
                  rows="3"
                  placeholder="Enter shipping address"
                />
              </div>
              <div className="form-group">
                <label>Payment Method *</label>
                <select
                  value={editForm.paymentMethod}
                  onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                  required
                >
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="Visa">💳 Visa</option>
                  <option value="MasterCard">💳 Master Card</option>
                </select>
              </div>
              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setEditingOrder(null)}>
                  Cancel
                </button>
                <button className="submit-btn" onClick={handleSaveEdit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer userRole={user?.role} />
    </div>
  );
};

export default BuyHistory;

