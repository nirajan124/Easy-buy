import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Toast from '../Toast';
import './Login.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const verifyEmail = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/verify-email/${token}`);
      if (response.data.success) {
        setStatus('success');
        setMessage('Email verified successfully! You can now login.');
        showToast('Email verified successfully!', 'success');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Verification failed. Link may be invalid or expired.');
      showToast(error.response?.data?.message || 'Verification failed', 'error');
    }
  };

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="login-container">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="login-card" style={{ maxWidth: '500px', margin: '50px auto' }}>
        <h2>Email Verification</h2>
        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
            <p>Verifying your email...</p>
          </div>
        )}
        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
            <h3 style={{ color: '#28a745', marginBottom: '10px' }}>Email Verified!</h3>
            <p>{message}</p>
            <Link to="/login" style={{ 
              display: 'inline-block', 
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px'
            }}>
              Go to Login
            </Link>
          </div>
        )}
        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
            <h3 style={{ color: '#dc3545', marginBottom: '10px' }}>Verification Failed</h3>
            <p>{message}</p>
            <Link to="/login" style={{ 
              display: 'inline-block', 
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#667eea',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '8px'
            }}>
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;

