import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../Toast';
import './Footer.css';

const Footer = ({ userRole }) => {
  const navigate = useNavigate();
  const [footerContent, setFooterContent] = useState({
    about: null,
    contact: null,
    feedback: null
  });
  const [showModal, setShowModal] = useState(null);
  const [feedbackForm, setFeedbackForm] = useState({ name: '', email: '', message: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchFooterContent();
  }, []);

  const fetchFooterContent = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/footer', {
        timeout: 5000 // 5 second timeout
      });
      if (response.data && response.data.success && response.data.data) {
        const contents = response.data.data;
        const contentMap = {
          about: null,
          contact: null,
          feedback: null
        };
        if (Array.isArray(contents)) {
          contents.forEach(content => {
            contentMap[content.type] = content;
          });
        }
        setFooterContent(contentMap);
      }
    } catch (error) {
      // Silently handle 404 or network errors - use default content
      if (error.response?.status !== 404 && error.code !== 'ECONNABORTED') {
        console.error('Error fetching footer content:', error);
      }
      // Set default content if API fails
      setFooterContent({
        about: null,
        contact: null,
        feedback: null
      });
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    // In a real app, you would send this to a backend endpoint
    showToast('Thank you for your feedback! We will get back to you soon.', 'success');
    setFeedbackForm({ name: '', email: '', message: '' });
    setShowModal(null);
  };

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section footer-brand">
          <h2 className="footer-logo">🛒 Easy Buy</h2>
          <p className="footer-tagline">{footerContent.about?.content || 'Your trusted marketplace for second-hand items. Buy and sell with confidence.'}</p>
          <div className="footer-social">
            <span>Follow us:</span>
            <a href="#" className="social-link">Facebook</a>
            <a href="#" className="social-link">Instagram</a>
            <a href="#" className="social-link">Twitter</a>
          </div>
          {userRole === 'admin' && (
            <button className="footer-admin-btn" onClick={() => setShowModal('about')}>
              Edit About
            </button>
          )}
        </div>

        <div className="footer-section">
          <h3>Shop</h3>
          <ul className="footer-links">
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/shop'); }}>Browse Products</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/shop'); }}>Categories</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/shop'); }}>Best Deals</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/shop'); }}>New Arrivals</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3>About Us</h3>
          <p>{footerContent.about?.content || 'Easy Buy is Nepal\'s leading marketplace for buying and selling second-hand items. We connect buyers and sellers in a safe and convenient way.'}</p>
          <ul className="footer-links">
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>Our Story</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>Our Team</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>Careers</a></li>
            <li><a href="#" onClick={(e) => { e.preventDefault(); navigate('/about'); }}>Blog</a></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 onClick={() => navigate('/contact')} style={{ cursor: 'pointer' }}>Contact Us</h3>
          {footerContent.contact ? (
            <>
              {footerContent.contact.email && (
                <p className="contact-item">
                  <strong>Email:</strong> <a href={`mailto:${footerContent.contact.email}`}>{footerContent.contact.email}</a>
                </p>
              )}
              {footerContent.contact.phone && (
                <p className="contact-item">
                  <strong>Phone:</strong> <a href={`tel:${footerContent.contact.phone}`}>{footerContent.contact.phone}</a>
                </p>
              )}
              {footerContent.contact.address && (
                <p className="contact-item">
                  <strong>Address:</strong> {footerContent.contact.address}
                </p>
              )}
            </>
          ) : (
            <>
              <p className="contact-item">
                <strong>Email:</strong> <a href="mailto:support@easybuy.com">support@easybuy.com</a>
              </p>
              <p className="contact-item">
                <strong>Phone:</strong> <a href="tel:+9771234567890">+977-1234567890</a>
              </p>
              <p className="contact-item">
                <strong>Address:</strong> Kathmandu, Nepal
              </p>
            </>
          )}
          {userRole === 'admin' && (
            <button className="footer-admin-btn" onClick={() => setShowModal('contact')}>
              Edit Contact
            </button>
          )}
        </div>

        {userRole !== 'admin' && (
          <div className="footer-section">
            <h3 onClick={() => navigate('/feedback')} style={{ cursor: 'pointer' }}>Feedback</h3>
            <p>We value your feedback! Let us know how we can improve.</p>
            <button className="feedback-btn" onClick={() => navigate('/feedback')}>
              Send Feedback
            </button>
          </div>
        )}
      </div>


      {/* Modals */}
      {showModal === 'feedback' && (
        <div className="modal-overlay" onClick={() => setShowModal(null)}>
          <div className="modal-content feedback-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowModal(null)}>×</button>
            <h2>Send Feedback</h2>
            <form onSubmit={handleFeedbackSubmit}>
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={feedbackForm.name}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={feedbackForm.email}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={feedbackForm.message}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, message: e.target.value })}
                  required
                  rows="5"
                />
              </div>
              <div className="form-actions">
                <button type="button" onClick={() => setShowModal(null)} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {userRole === 'admin' && showModal && ['about', 'contact'].includes(showModal) && (
        <AdminFooterModal
          type={showModal}
          content={footerContent[showModal]}
          onClose={() => setShowModal(null)}
          onUpdate={fetchFooterContent}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </footer>
  );
};

const AdminFooterModal = ({ type, content, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    email: '',
    phone: '',
    address: ''
  });
  const [toast, setToast] = useState(null);

  const showToast = (message, toastType = 'success') => {
    setToast({ message, type: toastType, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    if (content) {
      setFormData({
        title: content.title || '',
        content: content.content || '',
        email: content.email || '',
        phone: content.phone || '',
        address: content.address || ''
      });
    } else {
      const defaults = {
        about: { title: 'About Us', content: 'Easy Buy - Your trusted marketplace' },
        contact: { title: 'Contact Us', content: 'Get in touch with us', email: '', phone: '', address: '' },
        'feedback-admin': { title: 'Feedback', content: 'We value your feedback' }
      };
      setFormData(defaults[type] || {});
    }
  }, [content, type]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/footer',
        {
          type: type === 'feedback-admin' ? 'feedback' : type,
          ...formData
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      showToast('Content updated successfully!', 'success');
      onUpdate();
      onClose();
    } catch (error) {
      showToast('Error updating content: ' + (error.response?.data?.message || error.message), 'error');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(
          `http://localhost:5000/api/footer/${type === 'feedback-admin' ? 'feedback' : type}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        showToast('Content deleted successfully!', 'success');
        onUpdate();
        onClose();
      } catch (error) {
        showToast('Error deleting content: ' + (error.response?.data?.message || error.message), 'error');
      }
    }
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content admin-footer-modal" onClick={(e) => e.stopPropagation()}>
          <button className="close-btn" onClick={onClose}>×</button>
          <h2>Edit {type === 'feedback-admin' ? 'Feedback' : type.charAt(0).toUpperCase() + type.slice(1)}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Content *</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows="5"
            />
          </div>
          {(type === 'contact' || type === 'feedback-admin') && (
            <>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </>
          )}
          <div className="form-actions">
            <button type="button" onClick={handleDelete} className="delete-btn">
              Delete
            </button>
            <button type="button" onClick={onClose} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" className="submit-btn">Save</button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default Footer;

