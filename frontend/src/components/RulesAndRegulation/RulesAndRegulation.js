import React from 'react';
import './RulesAndRegulation.css';

const RulesAndRegulation = () => {
  return (
    <div className="rules-regulation-container">
      <div className="rules-header">
        <h1>📋 Rules and Regulations</h1>
        <p className="rules-subtitle">Please read and follow these guidelines carefully</p>
      </div>

      <div className="rules-content">
        <div className="rules-section warning-section">
          <div className="warning-icon">⚠️</div>
          <h2>Important Warning</h2>
          <p className="warning-text">
            Violation of these rules will result in <strong>immediate account deletion or deactivation</strong> without prior notice.
          </p>
        </div>

        <div className="rules-section">
          <h2>🚫 Prohibited Products</h2>
          <div className="rules-list">
            <div className="rule-item critical">
              <div className="rule-icon">❌</div>
              <div className="rule-content">
                <h3>Unwanted or Damaged Products</h3>
                <p>
                  Do <strong>NOT</strong> list products that are:
                </p>
                <ul>
                  <li>Severely damaged beyond reasonable use</li>
                  <li>Unwanted items that are essentially trash</li>
                  <li>Products with major defects that make them unusable</li>
                  <li>Items that are broken and cannot be repaired</li>
                </ul>
                <p className="consequence">
                  <strong>Consequence:</strong> Account will be <span className="highlight-delete">DELETED</span> or <span className="highlight-deactivate">DEACTIVATED</span> immediately.
                </p>
              </div>
            </div>

            <div className="rule-item critical">
              <div className="rule-icon">🚫</div>
              <div className="rule-content">
                <h3>Vulgar or Inappropriate Products</h3>
                <p>
                  Do <strong>NOT</strong> list products that are:
                </p>
                <ul>
                  <li>Vulgar, offensive, or inappropriate content</li>
                  <li>Adult content or explicit materials</li>
                  <li>Products with offensive language or imagery</li>
                  <li>Items that violate community standards</li>
                </ul>
                <p className="consequence">
                  <strong>Consequence:</strong> Account will be <span className="highlight-delete">DELETED</span> or <span className="highlight-deactivate">DEACTIVATED</span> immediately.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <h2>✅ Product Listing Guidelines</h2>
          <div className="rules-list">
            <div className="rule-item">
              <div className="rule-icon">✓</div>
              <div className="rule-content">
                <h3>Accurate Product Description</h3>
                <ul>
                  <li>Provide honest and accurate descriptions</li>
                  <li>Mention any defects or issues clearly</li>
                  <li>Use clear, high-quality images</li>
                  <li>Set fair and reasonable prices</li>
                </ul>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-icon">✓</div>
              <div className="rule-content">
                <h3>Product Condition</h3>
                <ul>
                  <li>Only list products in usable condition</li>
                  <li>Minor wear and tear is acceptable</li>
                  <li>Clearly state the condition in description</li>
                  <li>Products must be functional and safe to use</li>
                </ul>
              </div>
            </div>

            <div className="rule-item">
              <div className="rule-icon">✓</div>
              <div className="rule-content">
                <h3>Appropriate Content</h3>
                <ul>
                  <li>Use professional language in descriptions</li>
                  <li>Avoid offensive or inappropriate content</li>
                  <li>Respect all users and community standards</li>
                  <li>Follow local laws and regulations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <h2>⚖️ Account Actions</h2>
          <div className="action-cards">
            <div className="action-card delete-card">
              <h3>Account Deletion</h3>
              <p>Your account will be permanently deleted if you:</p>
              <ul>
                <li>List unwanted/damaged products</li>
                <li>Post vulgar or inappropriate content</li>
                <li>Repeatedly violate platform rules</li>
                <li>Engage in fraudulent activities</li>
              </ul>
            </div>

            <div className="action-card deactivate-card">
              <h3>Account Deactivation</h3>
              <p>Your account will be deactivated if you:</p>
              <ul>
                <li>List products that violate guidelines</li>
                <li>Receive multiple complaints from buyers</li>
                <li>Fail to maintain product quality standards</li>
                <li>Engage in suspicious activities</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="rules-section">
          <h2>📞 Contact & Support</h2>
          <p>
            If you have questions about these rules or need clarification, please contact our support team.
            We are here to help you succeed as a seller while maintaining a safe and trustworthy marketplace.
          </p>
        </div>

        <div className="rules-acknowledgment">
          <div className="acknowledgment-box">
            <h3>⚠️ Acknowledgment</h3>
            <p>
              By using this platform as a seller, you acknowledge that you have read, understood, and agree to follow 
              all the rules and regulations stated above. You understand that violation of these rules will result in 
              immediate account deletion or deactivation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RulesAndRegulation;

