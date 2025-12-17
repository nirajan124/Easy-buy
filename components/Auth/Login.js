import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Toast from '../Toast';
import VirtualAssistant from '../VirtualAssistant/VirtualAssistant';
import './Login.css';

const Login = () => {
  const location = useLocation();
  const isAdminLogin = location.pathname === '/login/admin';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(isAdminLogin ? 'admin' : 'buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [toast, setToast] = useState(null);
  
  const navigate = useNavigate();
  const { login, register, user, isAuthenticated } = useAuth();

  const showToast = (message, type = 'success', customDuration = 4000) => {
    setToast({ message, type, id: Date.now(), duration: customDuration });
    setTimeout(() => setToast(null), customDuration + 500);
  };

  // Redirect if already logged in as admin (but don't auto-login)
  useEffect(() => {
    if (isAdminLogin && isAuthenticated && user?.role === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [isAdminLogin, isAuthenticated, user, navigate]);

  // Register form fields
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'buyer',
    phone: '',
    address: ''
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password, role);
    setLoading(false);

    if (result.success) {
      showToast('Login successful! Redirecting...', 'success', 5000);
      // Use actual user role from response, not form role
      const userRole = result.user?.role || role;
      
      // Check for redirect parameters from URL
      const urlParams = new URLSearchParams(location.search);
      const redirect = urlParams.get('redirect');
      const productId = urlParams.get('product');
      const viewId = urlParams.get('view');
      
      setTimeout(() => {
        if (redirect && userRole === 'buyer') {
          // Redirect to buyer dashboard with product/view parameter
          if (productId) {
            navigate(`/${redirect}?product=${productId}`);
          } else if (viewId) {
            navigate(`/${redirect}?view=${viewId}`);
          } else {
            navigate(`/${redirect}`);
          }
        } else {
          navigate(`/${userRole}/dashboard`);
        }
      }, 1500);
    } else {
      setError(result.message);
      showToast(result.message, 'error', 5000);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (regData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const { confirmPassword, ...userData } = regData;
    
    // Don't auto-login for any role - just register
    try {
      const response = await axios.post('http://localhost:5000/api/auth/register', userData);
      setLoading(false);
      if (response.data.success) {
        showToast('Registration successful! Please login to continue.', 'success', 5000);
        // Clear form and switch to login
        setRegData({
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'buyer',
          phone: '',
          address: ''
        });
        setShowRegister(false);
        // Pre-fill email in login form
        setEmail(userData.email);
        // Set role for login form
        setRole(userData.role);
      }
    } catch (error) {
      setLoading(false);
      setError(error.response?.data?.message || 'Registration failed');
      showToast(error.response?.data?.message || 'Registration failed', 'error', 5000);
    }
  };

  return (
    <div className="login-container">
      <VirtualAssistant />
      <div className="animated-grid"></div>
      <div className="particles">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="particle"></div>
        ))}
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={toast.duration || 4000}
        />
      )}
      <div className="login-card">
        <div className="login-header">
          <h1>Easy Buy</h1>
          <p>{isAdminLogin ? 'Admin Portal' : 'Second Hand Marketplace'}</p>
        </div>

        {!showRegister ? (
          <form onSubmit={handleLogin} className="login-form">
            <h2>Login</h2>
            
            {!isAdminLogin && (
              <div className="form-group">
                <label>Login As:</label>
                <div className="role-buttons">
                  <button
                    type="button"
                    className={`role-btn ${role === 'buyer' ? 'active' : ''}`}
                    onClick={() => setRole('buyer')}
                  >
                    Buyer
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${role === 'seller' ? 'active' : ''}`}
                    onClick={() => setRole('seller')}
                  >
                    Seller
                  </button>
                </div>
              </div>
            )}
            
            {isAdminLogin && (
              <div className="form-group">
                <label className="admin-label">Admin Login</label>
                <p className="admin-hint">Enter admin credentials to access admin dashboard</p>
              </div>
            )}

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            {!isAdminLogin && (
              <p className="switch-form">
                Don't have an account?{' '}
                <span onClick={() => setShowRegister(true)}>Register here</span>
              </p>
            )}
            
            {isAdminLogin && (
              <p className="switch-form">
                <span onClick={() => navigate('/login')}>Back to regular login</span>
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={handleRegister} className="login-form">
            <h2>Register</h2>

            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={regData.name}
                onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                required
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Register As:</label>
              <div className="role-buttons">
                <button
                  type="button"
                  className={`role-btn ${regData.role === 'buyer' ? 'active' : ''}`}
                  onClick={() => setRegData({ ...regData, role: 'buyer' })}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  className={`role-btn ${regData.role === 'seller' ? 'active' : ''}`}
                  onClick={() => setRegData({ ...regData, role: 'seller' })}
                >
                  Seller
                </button>
              </div>
            </div>

            <div className="form-group">
              <label>Phone (Optional)</label>
              <input
                type="tel"
                value={regData.phone}
                onChange={(e) => {
                  const value = e.target.value;
                  // Only allow numbers and limit to 10 digits
                  if (value === '' || (/^\d+$/.test(value) && value.length <= 10)) {
                    setRegData({ ...regData, phone: value });
                  }
                }}
                placeholder="Enter your phone (10 digits)"
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label>Address (Optional)</label>
              <input
                type="text"
                value={regData.address}
                onChange={(e) => setRegData({ ...regData, address: e.target.value })}
                placeholder="Enter your address"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                required
                placeholder="Enter password (min 6 characters)"
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={regData.confirmPassword}
                onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                required
                placeholder="Confirm your password"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <p className="switch-form">
              Already have an account?{' '}
              <span onClick={() => setShowRegister(false)}>Login here</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
