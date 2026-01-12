import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../Loading/Loading';
import Toast from '../Toast';
import './Wishlist.css';

const Wishlist = ({ onClose, onAddToCart }) => {
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to view wishlist', 'error');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/wishlist', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setWishlist(response.data.data);
      }
    } catch (error) {
      console.error('Wishlist error:', error);
      if (error.response?.status === 401) {
        showToast('Please login to view wishlist', 'error');
      } else {
        showToast('Error loading wishlist', 'error');
      }
      setWishlist({ products: [] });
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/wishlist/remove/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Removed from wishlist', 'success');
      fetchWishlist();
    } catch (error) {
      showToast('Error removing item', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Added to cart!', 'success');
      if (onAddToCart) onAddToCart();
    } catch (error) {
      showToast('Error adding to cart', 'error');
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content wishlist-modal" onClick={(e) => e.stopPropagation()}>
          <Loading message="Loading wishlist..." />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wishlist-modal" onClick={(e) => e.stopPropagation()}>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>My Wishlist</h2>
        
        {!wishlist || !wishlist.products || wishlist.products.length === 0 ? (
          <div className="empty-wishlist">
            <p>Your wishlist is empty</p>
            <button onClick={onClose} className="continue-shopping-btn">Continue Shopping</button>
          </div>
        ) : (
          <div className="wishlist-items">
            {wishlist.products.map((item) => (
              item.product && (
                <div key={item.product._id} className="wishlist-item">
                  <div className="wishlist-item-image">
                    {item.product.images && item.product.images.length > 0 ? (
                      <img src={item.product.images[0]} alt={item.product.title} />
                    ) : (
                      <div className="no-image-small">No Image</div>
                    )}
                  </div>
                  <div className="wishlist-item-details">
                    <h4>{item.product.title}</h4>
                    <p className="wishlist-item-price">Rs. {item.product.price?.toLocaleString()}</p>
                    <p className="wishlist-item-category">{item.product.category}</p>
                    {item.product.status === 'available' ? (
                      <span className="status-badge available">Available</span>
                    ) : (
                      <span className="status-badge sold">Sold Out</span>
                    )}
                  </div>
                  <div className="wishlist-item-actions">
                    {item.product.status === 'available' && (
                      <button
                        onClick={() => handleAddToCart(item.product)}
                        className="add-to-cart-btn"
                      >
                        Add to Cart
                      </button>
                    )}
                    <button
                      onClick={() => removeFromWishlist(item.product._id)}
                      className="remove-btn"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

