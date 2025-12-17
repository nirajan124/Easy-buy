import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Footer from '../Footer/Footer';
import './Pages.css';

const AboutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('story');
  const [footerContent, setFooterContent] = useState(null);

  useEffect(() => {
    fetchAboutContent();
  }, []);

  const fetchAboutContent = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/footer');
      if (response.data && response.data.success && response.data.data) {
        const contents = response.data.data;
        const aboutContent = Array.isArray(contents) 
          ? contents.find(c => c.type === 'about')
          : null;
        setFooterContent(aboutContent);
      }
    } catch (error) {
      // Use default content if API fails
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>ℹ️ About Us</h1>
        <p>Learn more about Easy Buy</p>
      </div>

      <div className="page-tabs">
        <button 
          className={activeTab === 'story' ? 'active' : ''} 
          onClick={() => setActiveTab('story')}
        >
          Our Story
        </button>
        <button 
          className={activeTab === 'team' ? 'active' : ''} 
          onClick={() => setActiveTab('team')}
        >
          Our Team
        </button>
        <button 
          className={activeTab === 'careers' ? 'active' : ''} 
          onClick={() => setActiveTab('careers')}
        >
          Careers
        </button>
        <button 
          className={activeTab === 'blog' ? 'active' : ''} 
          onClick={() => setActiveTab('blog')}
        >
          Blog
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'story' && (
          <div className="content-section">
            <h2>Our Story</h2>
            <div className="content-card">
              <p>
                {footerContent?.content || `Easy Buy was founded with a simple mission: to make buying and selling second-hand items easy, safe, and convenient for everyone in Nepal.`}
              </p>
              <p>
                We started as a small team of passionate individuals who believed that everyone should have access to quality products at affordable prices. Our platform connects buyers and sellers in a trusted marketplace where transactions are secure and straightforward.
              </p>
              <p>
                Today, Easy Buy has grown into Nepal's leading marketplace for second-hand items, serving thousands of users across the country. We continue to innovate and improve our platform to provide the best experience for our community.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="content-section">
            <h2>Our Team</h2>
            <div className="team-grid">
              <div className="team-card">
                <div className="team-avatar">👨‍💼</div>
                <h3>Management Team</h3>
                <p>Our leadership team brings years of experience in e-commerce and technology.</p>
              </div>
              <div className="team-card">
                <div className="team-avatar">👨‍💻</div>
                <h3>Development Team</h3>
                <p>Talented developers working to improve the platform every day.</p>
              </div>
              <div className="team-card">
                <div className="team-avatar">👩‍💼</div>
                <h3>Support Team</h3>
                <p>Dedicated customer support to help you with any questions.</p>
              </div>
              <div className="team-card">
                <div className="team-avatar">👨‍🔧</div>
                <h3>Operations Team</h3>
                <p>Ensuring smooth operations and platform reliability.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'careers' && (
          <div className="content-section">
            <h2>Careers</h2>
            <div className="content-card">
              <h3>Join Our Team</h3>
              <p>
                We're always looking for talented individuals to join our growing team. At Easy Buy, we value innovation, collaboration, and a passion for making a difference.
              </p>
              <div className="careers-list">
                <div className="career-item">
                  <h4>Software Developer</h4>
                  <p>Full-time • Remote/Hybrid</p>
                </div>
                <div className="career-item">
                  <h4>Customer Support Specialist</h4>
                  <p>Full-time • Kathmandu</p>
                </div>
                <div className="career-item">
                  <h4>Marketing Manager</h4>
                  <p>Full-time • Kathmandu</p>
                </div>
              </div>
              <p className="contact-careers">
                Interested? Send your resume to <a href="mailto:careers@easybuy.com">careers@easybuy.com</a>
              </p>
            </div>
          </div>
        )}

        {activeTab === 'blog' && (
          <div className="content-section">
            <h2>Blog</h2>
            <div className="blog-grid">
              <div className="blog-card">
                <div className="blog-image">📝</div>
                <h3>How to Sell Items Safely Online</h3>
                <p>Tips and best practices for selling your items on Easy Buy.</p>
                <span className="blog-date">Published: January 2024</span>
              </div>
              <div className="blog-card">
                <div className="blog-image">💡</div>
                <h3>Buying Guide: What to Look For</h3>
                <p>Learn how to make smart purchasing decisions.</p>
                <span className="blog-date">Published: December 2023</span>
              </div>
              <div className="blog-card">
                <div className="blog-image">🎯</div>
                <h3>Platform Updates & New Features</h3>
                <p>Stay updated with the latest improvements to Easy Buy.</p>
                <span className="blog-date">Published: November 2023</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer userRole={user?.role} />
    </div>
  );
};

export default AboutPage;

