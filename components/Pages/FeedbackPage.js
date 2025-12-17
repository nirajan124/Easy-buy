import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Toast from '../Toast';
import Footer from '../Footer/Footer';
import './Pages.css';

const FeedbackPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    message: '',
    rating: 5
  });
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      
      await axios.post('http://localhost:5000/api/feedback', {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        rating: formData.rating,
        userRole: user?.role || 'guest',
        userId: user?._id || null
      }, config);
      
      showToast('Thank you for your feedback! We value your input and will use it to improve our platform.', 'success');
      setFormData({ ...formData, message: '', rating: 5 });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      showToast('Error submitting feedback. Please try again.', 'error');
      console.error('Error submitting feedback:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>💬 Feedback</h1>
        <p>We value your feedback! Let us know how we can improve.</p>
      </div>

      <div className="page-content">
        <div className="feedback-section">
          {submitted && (
            <div className="success-message">
              ✓ Thank you for your feedback! We appreciate your input.
            </div>
          )}

          <div className="feedback-form-card">
            <h2>Share Your Thoughts</h2>
            <p className="feedback-description">
              Your feedback helps us improve Easy Buy. Please share your experience, suggestions, or any issues you've encountered.
            </p>

            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Rating *</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      type="button"
                      className={`rating-star ${formData.rating >= rating ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, rating })}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="rating-text">{formData.rating} out of 5</span>
                </div>
              </div>

              <div className="form-group">
                <label>Your Feedback *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows="8"
                  placeholder="Tell us about your experience, suggestions, or any issues..."
                />
              </div>

              <button type="submit" className="submit-btn">Submit Feedback</button>
            </form>
          </div>

          <div className="feedback-info">
            <h3>What happens next?</h3>
            <ul>
              <li>✓ We review all feedback regularly</li>
              <li>✓ Your suggestions help us prioritize improvements</li>
              <li>✓ We may contact you for more details if needed</li>
              <li>✓ Thank you for helping us make Easy Buy better!</li>
            </ul>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <Footer userRole={user?.role} />
    </div>
  );
};

export default FeedbackPage;

