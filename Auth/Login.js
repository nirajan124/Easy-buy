import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Toast from '../Toast';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [toast, setToast] = useState(null);
  
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const showToast = (message, type = 'success', customDuration = 4000) => {
    setToast({ message, type, id: Date.now(), duration: customDuration });
    setTimeout(() => setToast(null), customDuration + 500);
  };

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
      setTimeout(() => {
        navigate(`/${userRole}/dashboard`);
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
    const result = await register(userData);
    setLoading(false);

    if (result.success) {
      showToast('Registration successful! Redirecting to dashboard...', 'success');
      setTimeout(() => {
        navigate(`/${regData.role}/dashboard`);
      }, 1500);
    } else {
      setError(result.message);
      showToast(result.message, 'error', 5000);
    }
  };

  return (
    <div className="login-container">
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
          <p>Second Hand Marketplace</p>
        </div>

        {!showRegister ? (
          <form onSubmit={handleLogin} className="login-form">
            <h2>Login</h2>
            
            <div className="form-group">
              <label>Login As:</label>
              <div className="role-buttons">
                <button
                  type="button"
                  className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                  onClick={() => setRole('admin')}
                >
                  Admin
                </button>
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

            <p className="switch-form">
              Don't have an account?{' '}
              <span onClick={() => setShowRegister(true)}>Register here</span>
            </p>
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
                onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                placeholder="Enter your phone"
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
