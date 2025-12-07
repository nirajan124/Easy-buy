import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loading from '../Loading/Loading';
import Toast from '../Toast';
import './Cart.css';

const Cart = ({ onClose, onCheckout }) => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to view cart', 'error');
        return;
      }
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.success) {
        setCart(response.data.data);
      }
    } catch (error) {
      console.error('Cart error:', error);
      if (error.response?.status === 401) {
        showToast('Please login to view cart', 'error');
      } else {
        showToast('Error loading cart', 'error');
      }
      setCart({ items: [] });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      removeItem(itemId);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/cart/update/${itemId}`,
        { quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchCart();
    } catch (error) {
      showToast('Error updating quantity', 'error');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/cart/remove/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Item removed from cart', 'success');
      fetchCart();
    } catch (error) {
      showToast('Error removing item', 'error');
    }
  };

  const clearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete('http://localhost:5000/api/cart/clear', {
          headers: { Authorization: `Bearer ${token}` }
        });
        showToast('Cart cleared', 'success');
        fetchCart();
      } catch (error) {
        showToast('Error clearing cart', 'error');
      }
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      if (item.product && item.product.price) {
        return total + (item.product.price * item.quantity);
      }
      return total;
    }, 0);
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content cart-modal" onClick={(e) => e.stopPropagation()}>
          <Loading message="Loading cart..." />
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content cart-modal" onClick={(e) => e.stopPropagation()}>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Shopping Cart</h2>
        
        {!cart || !cart.items || cart.items.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button onClick={onClose} className="continue-shopping-btn">Continue Shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {cart.items.map((item) => (
                <div key={item._id} className="cart-item">
                  {item.product && (
                    <>
                      <div className="cart-item-image">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img src={item.product.images[0]} alt={item.product.title} />
                        ) : (
                          <div className="no-image-small">No Image</div>
                        )}
                      </div>
                      <div className="cart-item-details">
                        <h4>{item.product.title}</h4>
                        <p className="cart-item-price">Rs. {item.product.price?.toLocaleString()}</p>
                        <div className="quantity-controls">
                          <button onClick={() => updateQuantity(item._id, item.quantity - 1)}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)}>+</button>
                        </div>
                      </div>
                      <div className="cart-item-actions">
                        <p className="item-total">Rs. {(item.product.price * item.quantity).toLocaleString()}</p>
                        <button onClick={() => removeItem(item._id)} className="remove-btn">Remove</button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="cart-footer">
              <div className="cart-total">
                <strong>Total: Rs. {calculateTotal().toLocaleString()}</strong>
              </div>
              <div className="cart-actions">
                <button onClick={clearCart} className="clear-cart-btn">Clear Cart</button>
                <button onClick={() => onCheckout(cart)} className="checkout-btn">Proceed to Checkout</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;

