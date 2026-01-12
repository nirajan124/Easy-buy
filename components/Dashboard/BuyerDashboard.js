import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Product360Viewer from '../Product360Viewer/Product360Viewer';
import Toast from '../Toast';
import Loading from '../Loading/Loading';
import Cart from '../Cart/Cart';
import Wishlist from '../Wishlist/Wishlist';
import Footer from '../Footer/Footer';
import { Bar, Pie, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const BuyerDashboard = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInputValue, setSearchInputValue] = useState('');
  const [category, setCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [toast, setToast] = useState(null);
  const [cartItemId, setCartItemId] = useState(null); // Track cart item ID for removal after checkout
  const [cardDetails, setCardDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    pin: ''
  });
  const [allCategories, setAllCategories] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('latest');
  const [myOrders, setMyOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchMyOrders();
  }, []);

  // Calculate statistics for visualization
  const calculateBuyerStats = () => {
    const successfulOrders = myOrders.filter(o => o.paymentStatus === 'Completed' || o.approvalStatus === 'Approved');
    const totalSpent = successfulOrders.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalOrders = myOrders.length;
    const pendingOrders = myOrders.filter(o => o.approvalStatus === 'Pending').length;
    const approvedOrders = myOrders.filter(o => o.approvalStatus === 'Approved').length;

    // Orders by month
    const ordersByMonth = {};
    myOrders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
    });

    // Payment methods distribution
    const paymentMethods = {};
    myOrders.forEach(order => {
      const method = order.paymentMethod || 'COD';
      paymentMethods[method] = (paymentMethods[method] || 0) + 1;
    });

    // Spending by month
    const spendingByMonth = {};
    successfulOrders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      spendingByMonth[month] = (spendingByMonth[month] || 0) + (order.price || 0);
    });

    return {
      totalSpent,
      totalOrders,
      pendingOrders,
      approvedOrders,
      ordersByMonth,
      paymentMethods,
      spendingByMonth
    };
  };

  const fetchMyOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:5000/api/orders/my-orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMyOrders(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  // Update searchTerm from searchInputValue with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchTerm(searchInputValue);
    }, 300); // 300ms debounce
    
    return () => clearTimeout(timeoutId);
  }, [searchInputValue]);

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, category, priceFilter, sortBy]);

  // Maintain focus on search input after products are loaded
  useEffect(() => {
    if (!loading && searchInputRef.current && searchInputValue) {
      // Always maintain focus if there's text in search, regardless of results
      const timeoutId = setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          // Set cursor position to end of input
          const length = searchInputRef.current.value.length;
          searchInputRef.current.setSelectionRange(length, length);
        }
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [products, loading, searchInputValue]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { status: 'available' };
      if (searchTerm) params.search = searchTerm;
      if (category !== 'all') params.category = category;
      
      const response = await axios.get('http://localhost:5000/api/products', { params });
      let filteredProducts = response.data.data || [];
      
      // Apply price filter
      if (priceFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => {
          const price = product.price || 0;
          switch(priceFilter) {
            case 'under-1000': return price < 1000;
            case '1000-5000': return price >= 1000 && price <= 5000;
            case '5000-10000': return price > 5000 && price <= 10000;
            case 'over-10000': return price > 10000;
            default: return true;
          }
        });
      }
      
      // Apply sorting
      if (sortBy === 'latest') {
        filteredProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sortBy === 'price-low') {
        filteredProducts.sort((a, b) => (a.price || 0) - (b.price || 0));
      } else if (sortBy === 'price-high') {
        filteredProducts.sort((a, b) => (b.price || 0) - (a.price || 0));
      }
      
      setProducts(filteredProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
      showToast('Error loading products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      const categories = [...new Set(response.data.data.map(p => p.category).filter(Boolean))];
      setAllCategories(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleProductClick = async (productId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/${productId}`);
      setSelectedProduct(response.data.data);
      setShippingAddress(user?.address || '');
    } catch (error) {
      console.error('Error fetching product details:', error);
      showToast('Error loading product details', 'error');
    }
  };

  const handleBuyClick = () => {
    if (!shippingAddress.trim()) {
      showToast('Please enter shipping address', 'error');
      return;
    }
    setCartItemId(null); // Not from cart, reset cart item ID
    setPaymentMethod('COD'); // Reset to default
    setShowPayment(true);
  };

  const handlePayment = async () => {
    if (!shippingAddress.trim()) {
      showToast('Please enter shipping address', 'error');
      return;
    }

    // Validate card details if card payment is selected
    if (paymentMethod === 'Visa' || paymentMethod === 'MasterCard') {
      if (!cardDetails.cardholderName.trim()) {
        showToast('Please enter cardholder name', 'error');
        return;
      }
      if (!cardDetails.cardNumber.trim() || cardDetails.cardNumber.replace(/\s/g, '').length < 16) {
        showToast('Please enter valid card number (16 digits)', 'error');
        return;
      }
      if (!cardDetails.expiryDate.trim()) {
        showToast('Please enter expiry date', 'error');
        return;
      }
      if (!cardDetails.cvc.trim() || cardDetails.cvc.length < 3) {
        showToast('Please enter valid CVC (3 digits)', 'error');
        return;
      }
      if (!cardDetails.pin.trim() || cardDetails.pin.length < 4) {
        showToast('Please enter valid PIN (4 digits)', 'error');
        return;
      }
    }

    try {
      if (paymentMethod === 'Visa' || paymentMethod === 'MasterCard') {
        showToast('Processing payment...', 'info');
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/orders', {
        productId: selectedProduct._id,
        paymentMethod,
        shippingAddress
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove product from cart if it was checked out from cart
      if (cartItemId) {
        try {
          await axios.delete(`http://localhost:5000/api/cart/remove/${cartItemId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
        } catch (cartError) {
          console.error('Error removing item from cart:', cartError);
          // Don't show error to user, order was successful
        }
        setCartItemId(null); // Reset cart item ID
      }

      const paymentMsg = paymentMethod === 'COD' 
        ? 'Pay on delivery.' 
        : 'Payment completed successfully.';
      showToast(`Order placed successfully! ${paymentMsg}`, 'success');
      
      // Reset states
      setSelectedProduct(null);
      setShowPayment(false);
      setPaymentMethod('COD');
      setCardDetails({
        cardholderName: '',
        cardNumber: '',
        expiryDate: '',
        cvc: '',
        pin: ''
      });
      
      fetchProducts();
      fetchMyOrders(); // Refresh orders
      setShowCart(false); // Close cart if open
    } catch (error) {
      showToast(error.response?.data?.message || 'Error placing order', 'error');
    }
  };

  const handleAddToCart = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to add items to cart', 'error');
        return;
      }
      if (product.status !== 'available') {
        showToast('Product is not available', 'error');
        return;
      }
      await axios.post(
        'http://localhost:5000/api/cart/add',
        { productId: product._id, quantity: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Added to cart!', 'success');
    } catch (error) {
      if (error.response?.status === 401) {
        showToast('Please login to add items to cart', 'error');
      } else {
        showToast(error.response?.data?.message || 'Error adding to cart', 'error');
      }
    }
  };

  const handleAddToWishlist = async (product) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        showToast('Please login to add items to wishlist', 'error');
        return;
      }
      await axios.post(
        'http://localhost:5000/api/wishlist/add',
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Added to wishlist!', 'success');
    } catch (error) {
      if (error.response?.status === 401) {
        showToast('Please login to add items to wishlist', 'error');
      } else if (error.response?.status === 400) {
        showToast('Product already in wishlist', 'info');
      } else {
        showToast(error.response?.data?.message || 'Error adding to wishlist', 'error');
      }
    }
  };

  const handleCartCheckout = async (cart) => {
    if (!cart || !cart.items || cart.items.length === 0) {
      showToast('Your cart is empty. Please add items to cart first.', 'error');
      return;
    }

    // Get the first item from cart
    const firstItem = cart.items[0];
    if (!firstItem || !firstItem.product) {
      showToast('Error: Cart item is invalid', 'error');
      return;
    }

    try {
      let productToCheckout = firstItem.product;
      
      // Ensure we have full product details - fetch if product is just an ID reference
      if (!productToCheckout.title || !productToCheckout.price) {
        const productId = productToCheckout._id || productToCheckout;
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:5000/api/products/${productId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        productToCheckout = response.data.data;
      }
      
      // Close cart modal first
      setShowCart(false);
      
      // Set the product and store cart item ID for removal after checkout
      setSelectedProduct(productToCheckout);
      setCartItemId(firstItem._id); // Store cart item ID
      setPaymentMethod('COD');
      setShippingAddress(user?.address || '');
      
      // Small delay to ensure cart modal closes before payment modal opens
      setTimeout(() => {
        setShowPayment(true);
      }, 200);
    } catch (error) {
      console.error('Error preparing checkout:', error);
      showToast('Error loading product details for checkout', 'error');
    }
  };

  if (loading) {
    return <Loading message="Loading products..." />;
  }

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="dashboard-header">
        <div>
          <h1>Buyer Dashboard</h1>
          <p>Welcome, {user?.name}! Find great deals on second-hand items</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.location.href = '/buyer/home'} className="home-btn" title="Home">
            🏠 Home
          </button>
          <button onClick={() => setShowStats(!showStats)} className="stats-btn" title="View Statistics">
            📊 Stats
          </button>
          <button onClick={() => setShowOrders(!showOrders)} className="orders-btn" title="My Orders">
            📦 Orders ({myOrders.filter(o => o.approvalStatus === 'Pending').length})
          </button>
          <button onClick={() => window.location.href = '/buyer/history'} className="history-btn" title="Purchase History">
            📜 History
          </button>
          <button onClick={() => setShowCart(true)} className="cart-btn" title="View Cart">
            🛒 Cart
          </button>
          <button onClick={() => setShowWishlist(true)} className="wishlist-btn" title="View Wishlist">
            ❤️ Wishlist
          </button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      {showStats && (
        <div className="buyer-stats-section">
          <h2>📊 Your Buying Statistics</h2>
          {(() => {
            const stats = calculateBuyerStats();
            const monthLabels = Object.keys(stats.ordersByMonth).sort();
            const paymentLabels = Object.keys(stats.paymentMethods);
            
            return (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Total Spent</h3>
                  <p className="stat-value">Rs. {stats.totalSpent.toLocaleString()}</p>
                </div>
                <div className="stat-card">
                  <h3>Total Orders</h3>
                  <p className="stat-value">{stats.totalOrders}</p>
                </div>
                <div className="stat-card">
                  <h3>Pending Orders</h3>
                  <p className="stat-value">{stats.pendingOrders}</p>
                </div>
                <div className="stat-card">
                  <h3>Approved Orders</h3>
                  <p className="stat-value">{stats.approvedOrders}</p>
                </div>
                
                {monthLabels.length > 0 && (
                  <div className="chart-card">
                    <h3>Orders by Month</h3>
                    <div className="chart-wrapper">
                      <Bar
                        data={{
                          labels: monthLabels,
                          datasets: [{
                            label: 'Orders',
                            data: monthLabels.map(m => stats.ordersByMonth[m]),
                            backgroundColor: 'rgba(102, 126, 234, 0.8)',
                            borderColor: 'rgba(102, 126, 234, 1)',
                            borderWidth: 1
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            title: { display: false }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {Object.keys(stats.spendingByMonth).length > 0 && (
                  <div className="chart-card">
                    <h3>Spending by Month</h3>
                    <div className="chart-wrapper">
                      <Line
                        data={{
                          labels: Object.keys(stats.spendingByMonth).sort(),
                          datasets: [{
                            label: 'Amount (Rs.)',
                            data: Object.keys(stats.spendingByMonth).sort().map(m => stats.spendingByMonth[m]),
                            borderColor: 'rgba(102, 126, 234, 1)',
                            backgroundColor: 'rgba(102, 126, 234, 0.2)',
                            tension: 0.4
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: true }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
                
                {paymentLabels.length > 0 && (
                  <div className="chart-card">
                    <h3>Payment Methods</h3>
                    <div className="pie-chart-wrapper">
                      <Pie
                        data={{
                          labels: paymentLabels,
                          datasets: [{
                            data: paymentLabels.map(m => stats.paymentMethods[m]),
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.8)',
                              'rgba(54, 162, 235, 0.8)',
                              'rgba(255, 206, 86, 0.8)',
                              'rgba(75, 192, 192, 0.8)'
                            ]
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { position: 'bottom' }
                          }
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}

      {showOrders && (
        <div className="modal-overlay" onClick={() => setShowOrders(false)}>
          <div className="modal-content orders-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowOrders(false)}>×</button>
            <h2>My Orders</h2>
            
            {myOrders.length === 0 ? (
              <div className="empty-orders">
                <p>No orders yet</p>
                <button onClick={() => setShowOrders(false)} className="continue-shopping-btn">Continue Shopping</button>
              </div>
            ) : (
              <>
                <div className="orders-list">
                  {myOrders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-card-image">
                        {order.product?.images && order.product.images.length > 0 ? (
                          <img src={order.product.images[0]} alt={order.product.title} />
                        ) : (
                          <div className="no-image-small">No Image</div>
                        )}
                      </div>
                      <div className="order-card-details">
                        <h4>{order.product?.title || 'Product'}</h4>
                        <p className="order-price">Rs. {order.price?.toLocaleString()}</p>
                        <div className="order-info">
                          <p><strong>Payment Method:</strong> {order.paymentMethod || 'N/A'}</p>
                          <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                          {order.shippingAddress && (
                            <p><strong>Address:</strong> {order.shippingAddress}</p>
                          )}
                        </div>
                      </div>
                      <div className="order-card-status">
                        <span className={`status-badge ${order.approvalStatus?.toLowerCase() || 'pending'}`}>
                          {order.approvalStatus || 'Pending'}
                        </span>
                        {order.paymentStatus && (
                          <span className={`status-badge ${order.paymentStatus?.toLowerCase()}`}>
                            {order.paymentStatus}
                          </span>
                        )}
                        {order.orderStatus && (
                          <span className={`status-badge ${order.orderStatus?.toLowerCase()}`}>
                            {order.orderStatus}
                          </span>
                        )}
                        {order.approvalStatus === 'Pending' && (
                          <button 
                            className="view-order-btn"
                            onClick={() => {
                              setShowOrders(false);
                              window.location.href = '/buyer/history';
                            }}
                          >
                            View & Edit
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="dashboard-filters">
        <div className="search-bar">
          <input
            ref={searchInputRef}
            type="text"
            placeholder="🔍 Search products by name, category..."
            value={searchInputValue}
            onChange={(e) => {
              setSearchInputValue(e.target.value);
            }}
            onBlur={(e) => {
              // Maintain focus on search input if there's text
              // Only lose focus if clicking on products or other interactive elements
              if (searchInputValue) {
                setTimeout(() => {
                  const activeElement = document.activeElement;
                  const clickedOnInteractive = activeElement && (
                    activeElement.closest('.product-card') ||
                    activeElement.closest('button:not(.category-btn)') ||
                    activeElement.closest('a') ||
                    activeElement.closest('.modal-overlay') ||
                    activeElement.closest('.product-detail-modal')
                  );
                  
                  // If not clicking on interactive elements, keep focus on search
                  if (!clickedOnInteractive && searchInputRef.current) {
                    searchInputRef.current.focus();
                  }
                }, 200);
              }
            }}
            autoComplete="off"
          />
        </div>
        <div className="filters-row">
          <div className="category-filters">
            <button
              className={`category-btn ${category === 'all' ? 'active' : ''}`}
              onClick={() => setCategory('all')}
            >
              All Categories
            </button>
            {allCategories.map(cat => (
              <button
                key={cat}
                className={`category-btn ${category === cat ? 'active' : ''}`}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="filter-controls">
            <select 
              value={priceFilter} 
              onChange={(e) => setPriceFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Prices</option>
              <option value="under-1000">Under Rs. 1,000</option>
              <option value="1000-5000">Rs. 1,000 - 5,000</option>
              <option value="5000-10000">Rs. 5,000 - 10,000</option>
              <option value="over-10000">Over Rs. 10,000</option>
            </select>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="filter-select"
            >
              <option value="latest">Latest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      <div className="products-grid">
        {loading ? (
          <div className="loading-products">
            <Loading message="Loading products..." />
          </div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <p>No products available</p>
            <p className="sub-text">Try adjusting your filters or check back later</p>
          </div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card">
              {product.images && product.images.length > 0 ? (
                <div className="product-image-wrapper" onClick={() => handleProductClick(product._id)}>
                  <img src={product.images[0]} alt={product.title} />
                  <button 
                    className="wishlist-heart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(product);
                    }}
                    title="Add to Wishlist"
                  >
                    ❤️
                  </button>
                </div>
              ) : (
                <div className="no-image" onClick={() => handleProductClick(product._id)}>
                  No Image
                  <button 
                    className="wishlist-heart-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(product);
                    }}
                    title="Add to Wishlist"
                  >
                    ❤️
                  </button>
                </div>
              )}
              <div className="product-info">
                <h3 onClick={() => handleProductClick(product._id)} style={{ cursor: 'pointer' }}>{product.title}</h3>
                <p className="product-price">Rs. {product.price?.toLocaleString()}</p>
                <p className="product-category">{product.category}</p>
                <p className="product-condition">Condition: {product.condition}</p>
                <div className="product-card-actions">
                  <button 
                    className="add-to-cart-card-btn"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.status !== 'available'}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProduct && !showPayment && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedProduct(null)}>×</button>
            <h2>{selectedProduct.title}</h2>

            <div className="modal-body">
              {selectedProduct.images && selectedProduct.images.length > 0 ? (
                <div className="modal-image-section">
                  <Product360Viewer images={selectedProduct.images.slice(0, 5)} productTitle={selectedProduct.title} />
                  {selectedProduct.images.length > 5 && (
                    <p className="images-limit-note">📸 Showing first 5 images out of {selectedProduct.images.length} total</p>
                  )}
                  {selectedProduct.images.length <= 5 && (
                    <p className="images-count-note">📸 {selectedProduct.images.length} image(s)</p>
                  )}
                </div>
              ) : (
                <div className="no-image-large">No Image Available</div>
              )}
              <div className="modal-details">
                <div className="detail-section">
                  <p className="price-large">Rs. {selectedProduct.price?.toLocaleString()}</p>
                </div>
                <div className="detail-section">
                  <p><strong>Category:</strong> {selectedProduct.category}</p>
                  <p><strong>Condition:</strong> {selectedProduct.condition}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${selectedProduct.status}`}>{selectedProduct.status === 'sold' ? 'Sold Out' : selectedProduct.status}</span></p>
                </div>
                <div className="detail-section">
                  <p><strong>Description:</strong></p>
                  <p className="description-text">{selectedProduct.description}</p>
                </div>
                {selectedProduct.seller && (
                  <div className="seller-info">
                    <h4>Seller Information</h4>
                    <p><strong>Name:</strong> {selectedProduct.seller.name}</p>
                    {selectedProduct.seller.email && (
                      <p><strong>Email:</strong> {selectedProduct.seller.email}</p>
                    )}
                    {selectedProduct.seller.phone && (
                      <p><strong>Phone:</strong> {selectedProduct.seller.phone}</p>
                    )}
                  </div>
                )}
                <div className="detail-section">
                  <label><strong>Shipping Address:</strong></label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your shipping address"
                    rows="3"
                    className="address-input"
                  />
                </div>
                <div className="product-action-buttons">
                  <button
                    className="buy-btn"
                    onClick={handleBuyClick}
                    disabled={selectedProduct.status !== 'available'}
                  >
                    {selectedProduct.status === 'available' ? 'Buy Now' : 'Sold Out'}
                  </button>
                  {selectedProduct.status === 'available' && (
                    <>
                      <button
                        className="add-to-cart-btn-small"
                        onClick={() => handleAddToCart(selectedProduct)}
                      >
                        Add to Cart
                      </button>
                      <button
                        className="add-to-wishlist-btn-small"
                        onClick={() => handleAddToWishlist(selectedProduct)}
                      >
                        Add to Wishlist
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPayment && selectedProduct && (
        <div className="modal-overlay" onClick={() => {
          setShowPayment(false);
          setPaymentMethod('COD'); // Reset on close
        }}>
          <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => {
              setShowPayment(false);
              setPaymentMethod('COD');
              setCartItemId(null);
              setCardDetails({
                cardholderName: '',
                cardNumber: '',
                expiryDate: '',
                cvc: '',
                pin: ''
              });
            }}>×</button>
            <h2>Complete Your Purchase</h2>
            <div className="payment-body">
              <div className="order-summary">
                <h3>Order Summary</h3>
                <div className="summary-item">
                  <span>Product:</span>
                  <span>{selectedProduct.title}</span>
                </div>
                <div className="summary-item">
                  <span>Price:</span>
                  <span>Rs. {selectedProduct.price?.toLocaleString()}</span>
                </div>
                <div className="summary-item total">
                  <span>Total:</span>
                  <span>Rs. {selectedProduct.price?.toLocaleString()}</span>
                </div>
              </div>
              <div className="payment-methods">
                <h3>Select Payment Method</h3>
                <div className="payment-options">
                  <label className={`payment-option ${paymentMethod === 'COD' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div>
                      <strong>Cash on Delivery (COD)</strong>
                      <p>Pay when you receive the product</p>
                    </div>
                  </label>
                  <label className={`payment-option ${paymentMethod === 'Visa' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="Visa"
                      checked={paymentMethod === 'Visa'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div>
                      <strong>💳 Visa</strong>
                      <p>Pay securely with Visa card</p>
                    </div>
                  </label>
                  <label className={`payment-option ${paymentMethod === 'MasterCard' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="payment"
                      value="MasterCard"
                      checked={paymentMethod === 'MasterCard'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <div>
                      <strong>💳 Master Card</strong>
                      <p>Pay securely with Master Card</p>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Card Payment Form */}
              {(paymentMethod === 'Visa' || paymentMethod === 'MasterCard') && (
                <div className="card-payment-form">
                  <h3>Card Details</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Cardholder Name *</label>
                      <input
                        type="text"
                        value={cardDetails.cardholderName}
                        onChange={(e) => setCardDetails({...cardDetails, cardholderName: e.target.value})}
                        placeholder="Enter cardholder name"
                        className="card-input"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Card Number *</label>
                      <input
                        type="text"
                        value={cardDetails.cardNumber}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\s/g, '').slice(0, 16);
                          const formatted = value.replace(/(.{4})/g, '$1 ').trim();
                          setCardDetails({...cardDetails, cardNumber: formatted});
                        }}
                        placeholder="1234 5678 9012 3456"
                        className="card-input"
                        maxLength="19"
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Expiry Date (MM/YY) *</label>
                      <input
                        type="text"
                        value={cardDetails.expiryDate}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          setCardDetails({...cardDetails, expiryDate: value});
                        }}
                        placeholder="MM/YY"
                        className="card-input"
                        maxLength="5"
                      />
                    </div>
                    <div className="form-group">
                      <label>CVC *</label>
                      <input
                        type="text"
                        value={cardDetails.cvc}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 3);
                          setCardDetails({...cardDetails, cvc: value});
                        }}
                        placeholder="123"
                        className="card-input"
                        maxLength="3"
                      />
                    </div>
                    <div className="form-group">
                      <label>PIN *</label>
                      <input
                        type="text"
                        value={cardDetails.pin}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setCardDetails({...cardDetails, pin: value});
                        }}
                        placeholder="1234"
                        className="card-input"
                        maxLength="4"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Address */}
              <div className="shipping-address-section">
                <h3>Shipping Address</h3>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Enter your shipping address"
                  rows="3"
                  className="address-input"
                  required
                />
              </div>

              <div className="payment-actions">
                <button className="cancel-btn" onClick={() => {
                  setShowPayment(false);
                  setPaymentMethod('COD');
                  setCartItemId(null);
                  setCardDetails({
                    cardholderName: '',
                    cardNumber: '',
                    expiryDate: '',
                    cvc: '',
                    pin: ''
                  });
                }}>
                  Cancel
                </button>
                <button className="confirm-btn" onClick={handlePayment}>
                  {paymentMethod === 'COD' ? 'Place Order' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCart && (
        <Cart
          onClose={() => setShowCart(false)}
          onCheckout={handleCartCheckout}
        />
      )}

      {showWishlist && (
        <Wishlist
          onClose={() => setShowWishlist(false)}
          onAddToCart={() => setShowCart(true)}
        />
      )}

      <Footer userRole={user?.role} />
    </div>
  );
};

export default BuyerDashboard;