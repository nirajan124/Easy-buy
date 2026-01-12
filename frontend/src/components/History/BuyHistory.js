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
  const [reviewingOrder, setReviewingOrder] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, message: '' });

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

  const handleReviewClick = (order) => {
    setReviewingOrder(order);
    setReviewForm({ rating: 5, message: '' });
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.message.trim()) {
      showToast('Please enter your review message', 'error');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/feedback',
        {
          name: user?.name || '',
          email: user?.email || '',
          message: reviewForm.message,
          rating: reviewForm.rating,
          userRole: 'buyer',
          userId: user?._id || null,
          sellerId: reviewingOrder?.seller?._id || reviewingOrder?.seller || null,
          productId: reviewingOrder?.product?._id || reviewingOrder?.product || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      showToast('Review submitted successfully! Thank you for your feedback.', 'success');
      setReviewingOrder(null);
      setReviewForm({ rating: 5, message: '' });
    } catch (error) {
      showToast(error.response?.data?.message || 'Error submitting review', 'error');
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
      fetchOrders();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting order', 'error');
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
                    <div className="detail-row" style={{ marginBottom: '12px' }}>
                      <span className="label">Seller:</span>
                      <span className="value">
                        <span style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>{order.seller.name}</span>
                        <span style={{ fontSize: '0.9em', color: '#666', wordBreak: 'break-word', display: 'block' }}>{order.seller.email}</span>
                      </span>
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
              {order.approvalStatus === 'Approved' && order.orderStatus !== 'Delivered' && (
                <div className="order-success-message">
                  ✅ Order Approved! Waiting for delivery completion.
                </div>
              )}
              <div className="order-actions">
                {order.orderStatus === 'Delivered' && (
                  <div className="order-success-message" style={{ marginBottom: '15px' }}>
                    ✅ Order Delivered! You can now review the seller.
                  </div>
                )}
                {/* Only show review button when order is Delivered */}
                {order.orderStatus === 'Delivered' && order.seller && (
                  <button 
                    className="review-seller-btn"
                    onClick={() => handleReviewClick(order)}
                  >
                    ⭐ Review Seller
                  </button>
                )}
                {/* Show pending message if order is approved but not delivered */}
                {order.approvalStatus === 'Approved' && order.orderStatus !== 'Delivered' && (
                  <div className="order-pending-message" style={{ padding: '10px 15px', background: '#fff3cd', color: '#856404', borderRadius: '8px', fontSize: '0.95em', fontWeight: '500' }}>
                    ⏳ Pending - Waiting for delivery completion
                  </div>
                )}
                {/* Only show delete button for rejected orders */}
                {order.approvalStatus === 'Rejected' && (
                  <button 
                    className="delete-order-btn"
                    onClick={() => handleDeleteOrder(order._id)}
                    style={{ marginLeft: order.orderStatus === 'Delivered' && order.seller ? '10px' : '0' }}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
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

      {reviewingOrder && (
        <div className="modal-overlay" onClick={() => setReviewingOrder(null)}>
          <div className="modal-content review-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <button className="close-btn" onClick={() => setReviewingOrder(null)}>×</button>
            <h2>Review Seller</h2>
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Product: {reviewingOrder.product?.title || 'Product'}</p>
              <p style={{ margin: 0, color: '#666' }}>Seller: {reviewingOrder.seller?.name || 'Seller'}</p>
            </div>
            <div className="form-group">
              <label>Rating *</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setReviewForm({ ...reviewForm, rating })}
                    style={{
                      fontSize: '32px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 0,
                      color: rating <= reviewForm.rating ? '#ffc107' : '#ddd',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    ⭐
                  </button>
                ))}
                <span style={{ marginLeft: '10px', fontWeight: 'bold', color: '#666' }}>
                  {reviewForm.rating} out of 5
                </span>
              </div>
            </div>
            <div className="form-group">
              <label>Your Review *</label>
              <textarea
                value={reviewForm.message}
                onChange={(e) => setReviewForm({ ...reviewForm, message: e.target.value })}
                required
                rows="6"
                placeholder="Share your experience with this seller..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                className="cancel-btn"
                onClick={() => setReviewingOrder(null)}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={handleSubmitReview}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
      <Footer userRole={user?.role} />
    </div>
  );
};

export default BuyHistory;

