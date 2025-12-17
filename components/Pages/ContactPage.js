import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Toast from '../Toast';
import Footer from '../Footer/Footer';
import './Pages.css';

const ContactPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contactInfo, setContactInfo] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/footer');
      if (response.data && response.data.success && response.data.data) {
        const contents = response.data.data;
        const contactContent = Array.isArray(contents) 
          ? contents.find(c => c.type === 'contact')
          : null;
        setContactInfo(contactContent);
      }
    } catch (error) {
      // Use default contact info
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // In a real app, you would send this to a backend endpoint
    showToast('Thank you for contacting us! We will get back to you soon.', 'success');
    setFormData({ name: '', email: '', subject: '', message: '' });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>📞 Contact Us</h1>
        <p>Get in touch with us</p>
      </div>

      <div className="page-content">
        <div className="contact-layout">
          <div className="contact-info-section">
            <h2>Contact Information</h2>
            <div className="contact-details">
              <div className="contact-detail-item">
                <strong>📧 Email:</strong>
                <a href={`mailto:${contactInfo?.email || 'support@easybuy.com'}`}>
                  {contactInfo?.email || 'support@easybuy.com'}
                </a>
              </div>
              <div className="contact-detail-item">
                <strong>📱 Phone:</strong>
                <a href={`tel:${contactInfo?.phone || '+9771234567890'}`}>
                  {contactInfo?.phone || '+977-1234567890'}
                </a>
              </div>
              <div className="contact-detail-item">
                <strong>📍 Address:</strong>
                <p>{contactInfo?.address || 'Kathmandu, Nepal'}</p>
              </div>
              <div className="contact-detail-item">
                <strong>🕒 Business Hours:</strong>
                <p>Sunday - Friday: 9:00 AM - 6:00 PM</p>
                <p>Saturday: 10:00 AM - 4:00 PM</p>
              </div>
            </div>

            <div className="social-section">
              <h3>Follow Us</h3>
              <div className="social-links">
                <a href="#" className="social-link-btn">Facebook</a>
                <a href="#" className="social-link-btn">Instagram</a>
                <a href="#" className="social-link-btn">Twitter</a>
              </div>
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            {submitted && (
              <div className="success-message">
                ✓ Message sent successfully! We'll get back to you soon.
              </div>
            )}
            <form onSubmit={handleSubmit} className="contact-form">
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
                <label>Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                  rows="6"
                />
              </div>
              <button type="submit" className="submit-btn">Send Message</button>
            </form>
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

export default ContactPage;

