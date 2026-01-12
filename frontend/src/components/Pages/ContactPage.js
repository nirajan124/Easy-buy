import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Toast from '../Toast';
import Footer from '../Footer/Footer';
import './Pages.css';

const ContactPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [contactInfo, setContactInfo] = useState(null);
  const [toast, setToast] = useState(null);
  const isDeactivated = new URLSearchParams(location.search).get('deactivated') === 'true';

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


  return (
    <div className="page-container">
      <div className="page-header">
        {!isDeactivated && (
          <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        )}
        <h1>📞 Contact Us</h1>
        <p>Get in touch with us</p>
      </div>

      {isDeactivated && (
        <div className="deactivated-banner">
          <div className="deactivated-banner-content">
            <span className="banner-icon">⚠️</span>
            <div className="banner-text">
              <strong>Account Deactivated</strong>
              <p>Your account has been deactivated. Please contact the administration using the contact information below to request account reactivation.</p>
            </div>
          </div>
        </div>
      )}

      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="contact-layout" style={{ 
          maxWidth: '900px', 
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <div className="contact-info-section" style={{ 
            width: '100%',
            maxWidth: '800px',
            padding: '50px',
            background: 'white',
            borderRadius: '20px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
          }}>
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

