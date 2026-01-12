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
  const [purchaseQuantity, setPurchaseQuantity] = useState(1);
  const [toast, setToast] = useState(null);
  const [cartItemId, setCartItemId] = useState(null); // Track cart item ID for removal after checkout
  const [cartItems, setCartItems] = useState([]); // Store all cart items for checkout
  const [cardDetails, setCardDetails] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    pin: ''
  });
  const [allCategories, setAllCategories] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [priceFilter, setPriceFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [locationInput, setLocationInput] = useState('');
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [sortBy, setSortBy] = useState('latest');
  const [myOrders, setMyOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [sellerRatings, setSellerRatings] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchLocations();
    fetchMyOrders();
  }, [category, locationFilter, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [priceFilter, sortBy]);

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

  // Track if user is actively typing in search
  const [isTypingInSearch, setIsTypingInSearch] = useState(false);
  const shouldMaintainFocus = useRef(false);

  // Maintain focus during typing even when component re-renders
  useEffect(() => {
    if (shouldMaintainFocus.current && searchInputRef.current && isTypingInSearch) {
      const wasFocused = document.activeElement === searchInputRef.current;
      if (!wasFocused) {
        searchInputRef.current.focus();
        const length = searchInputValue.length;
        searchInputRef.current.setSelectionRange(length, length);
      }
    }
  }, [products, loading, searchInputValue, isTypingInSearch]);

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
      if (locationFilter !== 'all') params.location = locationFilter;
      
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

  const fetchLocations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      const locations = [...new Set(response.data.data.map(p => p.location).filter(Boolean))].sort();
      setAllLocations(locations);
    } catch (error) {
      console.error('Error fetching locations:', error);
    }
  };

  // Get filtered location suggestions based on input
  const getLocationSuggestions = () => {
    if (!locationInput || locationInput.trim() === '') {
      return [];
    }
    const input = locationInput.toLowerCase().trim();
    return allLocations.filter(loc => 
      loc.toLowerCase().includes(input)
    ).slice(0, 10); // Limit to 10 suggestions
  };

  const handleLocationInputChange = (value) => {
    setLocationInput(value);
    setShowLocationSuggestions(true);
    if (value === '' || value.trim() === '') {
      setLocationFilter('all');
    } else {
      // Auto-select if exact match
      const exactMatch = allLocations.find(loc => loc.toLowerCase() === value.toLowerCase().trim());
      if (exactMatch) {
        setLocationFilter(exactMatch);
      } else {
        setLocationFilter(value.trim());
      }
    }
  };

  const handleLocationSelect = (location) => {
    setLocationInput(location);
    setLocationFilter(location);
    setShowLocationSuggestions(false);
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
      const product = response.data.data;
      setSelectedProduct(product);
      setShippingAddress(user?.address || '');
      setPurchaseQuantity(1); // Reset quantity when product changes
      
      // Fetch seller ratings if seller exists
      if (product.seller && product.seller._id) {
        try {
          const ratingsResponse = await axios.get(`http://localhost:5000/api/feedback/seller/${product.seller._id}`);
          setSellerRatings(ratingsResponse.data.data);
        } catch (error) {
          console.error('Error fetching seller ratings:', error);
          setSellerRatings(null);
        }
      }
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
    // Check stock availability
    if (!selectedProduct.stock || selectedProduct.stock <= 0) {
      showToast('This product is out of stock', 'error');
      return;
    }
    setPurchaseQuantity(1); // Reset quantity
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
      const token = localStorage.getItem('token');
      
      // Check if checking out from cart (multiple items) or single product
      if (cartItems.length > 0) {
        // Checkout from cart - create orders for all items
        if (paymentMethod === 'Visa' || paymentMethod === 'MasterCard') {
          showToast('Processing payment...', 'info');
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        let ordersCreated = 0;
        const cartItemIdsToRemove = [];
        
        // Create orders for all cart items
        for (const item of cartItems) {
          try {
            await axios.post('http://localhost:5000/api/orders', {
              productId: item.product._id,
              paymentMethod,
              shippingAddress,
              quantity: item.quantity
            }, {
              headers: { Authorization: `Bearer ${token}` }
            });
            ordersCreated++;
            cartItemIdsToRemove.push(item.cartItemId);
          } catch (itemError) {
            console.error('Error creating order for item:', itemError);
            // Continue with other items even if one fails
          }
        }

        // Remove all items from cart after successful checkout
        for (const cartItemId of cartItemIdsToRemove) {
          try {
            await axios.delete(`http://localhost:5000/api/cart/remove/${cartItemId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (cartError) {
            console.error('Error removing item from cart:', cartError);
            // Don't show error to user, order was successful
          }
        }

        const paymentMsg = paymentMethod === 'COD' 
          ? 'Pay on delivery.' 
          : 'Payment completed successfully.';
        showToast(`${ordersCreated} order(s) placed successfully! ${paymentMsg}`, 'success');
        
        // Reset states
        setCartItems([]);
        setSelectedProduct(null);
        setShowPayment(false);
        setPaymentMethod('COD');
        setPurchaseQuantity(1);
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
      } else if (selectedProduct) {
        // Single product checkout
        if (paymentMethod === 'Visa' || paymentMethod === 'MasterCard') {
          showToast('Processing payment...', 'info');
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

        await axios.post('http://localhost:5000/api/orders', {
          productId: selectedProduct._id,
          paymentMethod,
          shippingAddress,
          quantity: purchaseQuantity
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
        setPurchaseQuantity(1);
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
      }
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

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showToast('Order deleted successfully', 'success');
      fetchMyOrders();
    } catch (error) {
      showToast(error.response?.data?.message || 'Error deleting order', 'error');
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

    try {
      const token = localStorage.getItem('token');
      const itemsToCheckout = [];
      
      // Fetch full product details for all cart items
      for (const item of cart.items) {
        if (!item.product) {
          continue;
        }
        
        let product = item.product;
        
        // Ensure we have full product details - fetch if product is just an ID reference
        if (!product.title || !product.price) {
          const productId = product._id || product;
          const response = await axios.get(`http://localhost:5000/api/products/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          product = response.data.data;
        }
        
        itemsToCheckout.push({
          product,
          quantity: item.quantity,
          cartItemId: item._id
        });
      }
      
      if (itemsToCheckout.length === 0) {
        showToast('Error: No valid items in cart', 'error');
        return;
      }
      
      // Close cart modal first
      setShowCart(false);
      
      // Store all cart items for checkout
      setCartItems(itemsToCheckout);
      setSelectedProduct(null); // Clear selected product when checking out from cart
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
            
            {(() => {
              // Filter out delivered/completed orders
              const activeOrders = myOrders.filter(order => order.orderStatus !== 'Delivered');
              return activeOrders.length === 0 ? (
                <div className="empty-orders">
                  <p>No active orders</p>
                  <button onClick={() => setShowOrders(false)} className="continue-shopping-btn">Continue Shopping</button>
                </div>
              ) : (
                <>
                  <div className="orders-list">
                    {activeOrders.map((order) => (
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
                        {/* Only show delete button for rejected orders */}
                        {order.approvalStatus === 'Rejected' && (
                          <button 
                            className="delete-order-btn-modal"
                            onClick={() => handleDeleteOrder(order._id)}
                            style={{
                              marginTop: order.approvalStatus === 'Pending' ? '10px' : '0',
                              padding: '10px 20px',
                              background: '#f44336',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.9em',
                              fontWeight: '600',
                              transition: 'all 0.3s',
                              width: '100%'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#d32f2f';
                              e.target.style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = '#f44336';
                              e.target.style.transform = 'translateY(0)';
                            }}
                          >
                            🗑️ Delete
                          </button>
                        )}
                      </div>
                    </div>
                    ))}
                  </div>
                </>
              );
            })()}
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
            onFocus={() => {
              setIsTypingInSearch(true);
              shouldMaintainFocus.current = true;
            }}
            onChange={(e) => {
              const newValue = e.target.value;
              setSearchInputValue(newValue);
              setIsTypingInSearch(true);
              shouldMaintainFocus.current = true;
              
              // Immediately maintain focus
              if (searchInputRef.current) {
                const wasFocused = document.activeElement === searchInputRef.current;
                // If not focused, focus it
                if (!wasFocused) {
                  searchInputRef.current.focus();
                }
                // Always set cursor to end after value change
                requestAnimationFrame(() => {
                  if (searchInputRef.current) {
                    const length = newValue.length;
                    searchInputRef.current.setSelectionRange(length, length);
                  }
                });
              }
            }}
            onBlur={(e) => {
              // Check what element received focus
              const activeElement = document.activeElement;
              const clickedOnProduct = activeElement && activeElement.closest('.product-card');
              const clickedOnModal = activeElement && activeElement.closest('.modal-overlay, .product-detail-modal');
              const clickedOnButton = activeElement && activeElement.closest('button:not(.category-btn)');
              const clickedOnLink = activeElement && activeElement.closest('a');
              const clickedOnInput = activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'SELECT');
              const clickedOnSuggestions = activeElement && activeElement.closest('.location-suggestions');
              
              // Only allow blur if clicking on truly interactive elements
              if (clickedOnProduct || clickedOnModal || clickedOnButton || clickedOnLink || clickedOnInput || clickedOnSuggestions) {
                setIsTypingInSearch(false);
                shouldMaintainFocus.current = false;
                return; // Allow normal blur
              }
              
              // If clicking on empty space and user was typing, refocus immediately
              if (shouldMaintainFocus.current && searchInputValue) {
                // Immediate refocus to prevent losing focus
                setTimeout(() => {
                  if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
                    searchInputRef.current.focus();
                    const length = searchInputRef.current.value.length;
                    searchInputRef.current.setSelectionRange(length, length);
                  }
                }, 10); // Very short delay
              } else {
                setIsTypingInSearch(false);
                shouldMaintainFocus.current = false;
              }
            }}
            onKeyDown={(e) => {
              // Prevent any focus stealing during key presses
              setIsTypingInSearch(true);
              shouldMaintainFocus.current = true;
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
            <div className="location-autocomplete-wrapper">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => handleLocationInputChange(e.target.value)}
                onFocus={() => setShowLocationSuggestions(true)}
                onBlur={() => {
                  // Delay to allow click on suggestion
                  setTimeout(() => setShowLocationSuggestions(false), 200);
                }}
                placeholder="Type location..."
                className="filter-select location-input"
              />
              {locationInput && (
                <button
                  type="button"
                  className="clear-location-btn"
                  onClick={() => {
                    setLocationInput('');
                    setLocationFilter('all');
                    setShowLocationSuggestions(false);
                  }}
                  title="Clear location"
                >
                  ×
                </button>
              )}
              {showLocationSuggestions && getLocationSuggestions().length > 0 && (
                <div className="location-suggestions">
                  {getLocationSuggestions().map((loc, index) => (
                    <div
                      key={index}
                      className="location-suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault(); // Prevent onBlur from firing before click
                        handleLocationSelect(loc);
                      }}
                    >
                      📍 {loc}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
                <p className="product-stock">
                  {(product.stock === undefined || product.stock === null || product.stock > 0) ? (
                    <span style={{ color: '#28a745' }}>In Stock ({product.stock !== undefined && product.stock !== null ? product.stock : 'Available'})</span>
                  ) : (
                    <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Out of Stock</span>
                  )}
                </p>
                <div className="product-card-actions">
                  <button 
                    className="add-to-cart-card-btn"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.status !== 'available' || (product.stock !== undefined && product.stock !== null && product.stock <= 0)}
                  >
                    {(product.stock === undefined || product.stock === null || product.stock > 0) ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProduct && !showPayment && (
        <div className="modal-overlay" onClick={() => {
          setSelectedProduct(null);
          setSellerRatings(null);
        }}>
          <div className="modal-content product-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => {
              setSelectedProduct(null);
              setSellerRatings(null);
            }}>×</button>
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
                  <p><strong>Stock:</strong> {
                    (selectedProduct.stock === undefined || selectedProduct.stock === null || selectedProduct.stock > 0) ? (
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                        {selectedProduct.stock !== undefined && selectedProduct.stock !== null ? selectedProduct.stock : 1} item(s) available
                      </span>
                    ) : (
                      <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Out of Stock</span>
                    )
                  }</p>
                </div>
                <div className="detail-section">
                  <p><strong>Description:</strong></p>
                  <p className="description-text">{selectedProduct.description}</p>
                </div>
                {selectedProduct.location && (
                  <div className="detail-section">
                    <p><strong>Location:</strong> {selectedProduct.location}</p>
                  </div>
                )}
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
                    {selectedProduct.seller.location && (
                      <p><strong>Location:</strong> {selectedProduct.seller.location}</p>
                    )}
                    {sellerRatings && sellerRatings.totalRatings > 0 && (
                      <div className="seller-ratings" style={{ marginTop: '15px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <h5 style={{ marginBottom: '10px' }}>Seller Ratings</h5>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea' }}>
                            {sellerRatings.averageRating}
                          </span>
                          <div>
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} style={{ fontSize: '20px', color: i < Math.round(sellerRatings.averageRating) ? '#ffc107' : '#ddd' }}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <span style={{ color: '#666', fontSize: '14px' }}>
                            ({sellerRatings.totalRatings} {sellerRatings.totalRatings === 1 ? 'rating' : 'ratings'})
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          <div>5⭐: {sellerRatings.ratingDistribution[5] || 0}</div>
                          <div>4⭐: {sellerRatings.ratingDistribution[4] || 0}</div>
                          <div>3⭐: {sellerRatings.ratingDistribution[3] || 0}</div>
                          <div>2⭐: {sellerRatings.ratingDistribution[2] || 0}</div>
                          <div>1⭐: {sellerRatings.ratingDistribution[1] || 0}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                <div className="detail-section">
                  <label><strong>Quantity:</strong></label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                    <button
                      type="button"
                      onClick={() => setPurchaseQuantity(Math.max(1, purchaseQuantity - 1))}
                      disabled={purchaseQuantity <= 1}
                      style={{
                        padding: '8px 15px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        background: purchaseQuantity <= 1 ? '#f0f0f0' : 'white',
                        cursor: purchaseQuantity <= 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={selectedProduct.stock || 1}
                      value={purchaseQuantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        if (!isNaN(val) && val >= 1 && val <= (selectedProduct.stock || 1)) {
                          setPurchaseQuantity(val);
                        }
                      }}
                      style={{
                        width: '80px',
                        padding: '8px',
                        textAlign: 'center',
                        border: '1px solid #ddd',
                        borderRadius: '5px'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setPurchaseQuantity(Math.min(selectedProduct.stock || 1, purchaseQuantity + 1))}
                      disabled={!selectedProduct.stock || purchaseQuantity >= selectedProduct.stock}
                      style={{
                        padding: '8px 15px',
                        border: '1px solid #ddd',
                        borderRadius: '5px',
                        background: (!selectedProduct.stock || purchaseQuantity >= selectedProduct.stock) ? '#f0f0f0' : 'white',
                        cursor: (!selectedProduct.stock || purchaseQuantity >= selectedProduct.stock) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      +
                    </button>
                    <span style={{ color: '#666', fontSize: '14px' }}>
                      (Max: {selectedProduct.stock || 0})
                    </span>
                  </div>
                </div>
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
                    disabled={selectedProduct.status !== 'available' || !selectedProduct.stock || selectedProduct.stock <= 0}
                  >
                    {selectedProduct.stock > 0 ? 'Buy Now' : 'Out of Stock'}
                  </button>
                  {selectedProduct.status === 'available' && selectedProduct.stock > 0 && (
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

      {showPayment && (selectedProduct || cartItems.length > 0) && (
        <div className="modal-overlay" onClick={() => {
          setShowPayment(false);
          setPaymentMethod('COD'); // Reset on close
        }}>
          <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => {
              setShowPayment(false);
              setPaymentMethod('COD');
              setCartItemId(null);
              setCartItems([]);
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
                {cartItems.length > 0 ? (
                  <>
                    {cartItems.map((item, index) => (
                      <div key={index} style={{ marginBottom: '15px', paddingBottom: '15px', borderBottom: index < cartItems.length - 1 ? '1px solid #e0e0e0' : 'none' }}>
                        <div className="summary-item">
                          <span>Product:</span>
                          <span>{item.product.title}</span>
                        </div>
                        <div className="summary-item">
                          <span>Price (per item):</span>
                          <span>Rs. {item.product.price?.toLocaleString()}</span>
                        </div>
                        <div className="summary-item">
                          <span>Quantity:</span>
                          <span>{item.quantity}</span>
                        </div>
                        <div className="summary-item">
                          <span>Subtotal:</span>
                          <span>Rs. {(item.product.price * item.quantity)?.toLocaleString()}</span>
                        </div>
                      </div>
                    ))}
                    <div className="summary-item total">
                      <span>Total:</span>
                      <span>Rs. {cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toLocaleString()}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="summary-item">
                      <span>Product:</span>
                      <span>{selectedProduct.title}</span>
                    </div>
                    <div className="summary-item">
                      <span>Price (per item):</span>
                      <span>Rs. {selectedProduct.price?.toLocaleString()}</span>
                    </div>
                    <div className="summary-item">
                      <span>Quantity:</span>
                      <span>{purchaseQuantity}</span>
                    </div>
                    <div className="summary-item">
                      <span>Stock Available:</span>
                      <span>{selectedProduct.stock || 0} item(s)</span>
                    </div>
                    <div className="summary-item total">
                      <span>Total:</span>
                      <span>Rs. {(selectedProduct.price * purchaseQuantity)?.toLocaleString()}</span>
                    </div>
                  </>
                )}
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