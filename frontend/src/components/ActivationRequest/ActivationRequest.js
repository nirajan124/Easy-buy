import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Toast from '../Toast';
import './ActivationRequest.css';

const ActivationRequest = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchMyRequests();
    // Refresh requests every 5 seconds to see updates
    const interval = setInterval(() => {
      fetchMyRequests();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ message: msg, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchMyRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/activation-requests/my-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Activation requests fetched:', response.data.data);
      setMyRequests(response.data.data || []);
    } catch (error) {
      console.error('Error fetching activation requests:', error);
      console.error('Error details:', error.response?.data);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!message.trim()) {
      showToast('Please enter a message for your activation request', 'error');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/activation-requests',
        { message: message.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Activation request submitted successfully! Admin will review it soon.', 'success');
      setMessage('');
      setShowForm(false);
      // Refresh requests immediately
      setTimeout(() => {
        fetchMyRequests();
      }, 500);
    } catch (error) {
      showToast(error.response?.data?.message || 'Error submitting activation request', 'error');
    } finally {
      setLoading(false);
    }
  };

  const pendingRequest = myRequests.find(r => r.status === 'pending');
  const latestRequest = myRequests[0];

  // Debug: Log current state
  console.log('ActivationRequest Component Render:', {
    user: user?.email,
    myRequestsCount: myRequests.length,
    myRequests: myRequests,
    pendingRequest: pendingRequest
  });

  return (
    <div className="activation-request-container" style={{ 
      width: '100%',
      margin: '20px auto',
      padding: '20px',
      background: '#f8f9fa',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {user?.isActive === false && (
        <div className="activation-alert">
          <div className="alert-content">
            <div className="alert-icon">⚠️</div>
            <div className="alert-text">
              <h3>Your Account is Inactive</h3>
              <p>Your account has been deactivated. Please request activation from admin.</p>
            </div>
            {!pendingRequest && (
              <button 
                className="request-btn"
                onClick={() => setShowForm(true)}
              >
                Request Activation
              </button>
            )}
            {pendingRequest && (
              <div className="pending-badge">
                Request Pending
              </div>
            )}
          </div>
        </div>
      )}

      {/* Always show request button if user wants to request activation */}
      {user && user.role !== 'admin' && !pendingRequest && (
        <div className="activation-request-section">
          <button 
            className="request-activation-btn"
            onClick={() => setShowForm(true)}
          >
            📝 Request Account Activation
          </button>
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content activation-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowForm(false)}>×</button>
            <h2>Request Account Activation</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Message to Admin *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Please explain why you need account activation..."
                  rows="5"
                  required
                />
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn" 
                  onClick={() => {
                    setShowForm(false);
                    setMessage('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="requests-history" style={{ 
        marginTop: '30px',
        background: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        minHeight: '200px',
        border: '2px solid #667eea'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#333', fontSize: '1.5rem', fontWeight: 'bold' }}>
            📋 My Activation Requests ({myRequests.length})
          </h3>
          <button 
            onClick={fetchMyRequests}
            style={{
              padding: '8px 16px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Refresh
          </button>
        </div>
        {myRequests.length > 0 ? (
          <div className="requests-list">
            {myRequests.map((request) => (
              <div key={request._id} className={`request-card ${request.status}`} style={{ 
                marginBottom: '15px',
                padding: '20px',
                background: 'white',
                borderRadius: '10px',
                border: '2px solid #ddd',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div className="request-header">
                  <span className={`status-badge ${request.status}`}>
                    {request.status === 'pending' && '⏳ Pending'}
                    {request.status === 'approved' && '✅ Approved'}
                    {request.status === 'rejected' && '❌ Rejected'}
                  </span>
                  <span className="request-date">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="request-message" style={{ 
                  marginTop: '15px',
                  padding: '15px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e0e0e0'
                }}>
                  <strong style={{ display: 'block', marginBottom: '8px', color: '#333', fontSize: '1rem' }}>
                    Your Message:
                  </strong>
                  <p style={{ margin: 0, color: '#555', lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
                    {request.message}
                  </p>
                </div>
                {request.adminResponse && (
                  <div className="admin-response" style={{
                    marginTop: '15px',
                    padding: '15px',
                    background: '#e7f3ff',
                    borderRadius: '8px',
                    borderLeft: '4px solid #667eea'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '8px', color: '#667eea', fontSize: '1rem' }}>
                      Admin Response:
                    </strong>
                    <p style={{ margin: 0, color: '#555', lineHeight: '1.6', fontSize: '0.95rem' }}>
                      {request.adminResponse}
                    </p>
                  </div>
                )}
                {request.reviewedAt && (
                  <div className="reviewed-info" style={{
                    marginTop: '10px',
                    fontSize: '0.85rem',
                    color: '#999',
                    fontStyle: 'italic'
                  }}>
                    Reviewed on: {new Date(request.reviewedAt).toLocaleDateString()}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-requests-message" style={{
            textAlign: 'center',
            padding: '40px',
            background: '#fff',
            borderRadius: '10px',
            border: '2px dashed #ddd'
          }}>
            <p style={{ margin: 0, color: '#666', fontSize: '1rem', fontWeight: '500' }}>
              📭 No activation requests yet.
            </p>
            <p style={{ margin: '10px 0 0 0', color: '#999', fontSize: '0.9rem' }}>
              Click "Request Account Activation" button above to submit a request.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivationRequest;


