import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import { filesToBase64 } from '../../utils/imageUtils';
import Loading from '../Loading/Loading';
import Footer from '../Footer/Footer';
import Toast from '../Toast';
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

const SellerDashboard = () => {
  const { user, logout } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [showReviews, setShowReviews] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [myReviews, setMyReviews] = useState(null);
  const [allLocations, setAllLocations] = useState([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    customCategory: '',
    condition: 'Good',
    location: '',
    stock: 1,
    images: []
  });

  useEffect(() => {
    fetchMyProducts();
    fetchMyOrders();
    fetchLocations();
    fetchMyReviews();
  }, []);

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
    if (!formData.location || formData.location.trim() === '') {
      return [];
    }
    const input = formData.location.toLowerCase().trim();
    return allLocations.filter(loc => 
      loc.toLowerCase().includes(input)
    ).slice(0, 10); // Limit to 10 suggestions
  };

  const handleLocationSelect = (location) => {
    setFormData({ ...formData, location });
    setShowLocationSuggestions(false);
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
      console.error('Error fetching seller orders:', error);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.get('http://localhost:5000/api/feedback/my-reviews', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          setMyReviews(response.data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setMyReviews({ feedbacks: [], averageRating: 0, totalRatings: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });
    }
  };

  // Calculate statistics for visualization
  const calculateSellerStats = () => {
    const totalProducts = products.length;
    const availableProducts = products.filter(p => p.status === 'available').length;
    const soldProducts = products.filter(p => p.status === 'sold').length;
    
    const successfulOrders = myOrders.filter(o => o.paymentStatus === 'Completed' || o.approvalStatus === 'Approved');
    const totalRevenue = successfulOrders.reduce((sum, o) => sum + (o.price || 0), 0);
    const totalOrders = myOrders.length;
    
    // Products by category
    const productsByCategory = {};
    products.forEach(product => {
      const cat = product.category || 'Other';
      productsByCategory[cat] = (productsByCategory[cat] || 0) + 1;
    });
    
    // Products added by month
    const productsByMonth = {};
    products.forEach(product => {
      const month = new Date(product.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      productsByMonth[month] = (productsByMonth[month] || 0) + 1;
    });
    
    // Revenue by month
    const revenueByMonth = {};
    successfulOrders.forEach(order => {
      const month = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      revenueByMonth[month] = (revenueByMonth[month] || 0) + (order.price || 0);
    });
    
    return {
      totalProducts,
      availableProducts,
      soldProducts,
      totalRevenue,
      totalOrders,
      productsByCategory,
      productsByMonth,
      revenueByMonth
    };
  };

  const fetchMyProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products', {
        params: { seller: user?._id }
      });
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Convert stock to number if it's the stock field
    if (name === 'stock') {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue) && numValue >= 1) {
        setFormData({ ...formData, [name]: numValue });
      } else if (value === '') {
        setFormData({ ...formData, [name]: '' });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 4500);
  };

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Check total images limit (max 5)
    const totalImages = formData.images.length + files.length;
    if (totalImages > 5) {
      showToast(`Maximum 5 images allowed. You can add ${5 - formData.images.length} more.`, 'error');
      return;
    }
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp', 'image/svg+xml'];
    const invalidFiles = files.filter(file => !validTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      showToast('Some files are not valid image formats', 'error');
      return;
    }
    
    // Validate file sizes (max 10MB per file)
    const maxSize = 10 * 1024 * 1024; // 10MB
    const largeFiles = files.filter(file => file.size > maxSize);
    if (largeFiles.length > 0) {
      showToast(`Some images are too large (max 10MB per image). They will be compressed.`, 'info');
    }
    
    try {
      setUploading(true);
      showToast('Compressing images...', 'info');
      
      // Convert files to base64 with compression
      const base64Images = await filesToBase64(files);
      const newImages = [...formData.images, ...base64Images].slice(0, 5); // Limit to 5
      
      // Calculate total size of all images
      const totalSize = newImages.reduce((sum, img) => {
        // Base64 size is approximately 4/3 of original binary size
        return sum + (img.length * 3) / 4;
      }, 0);
      const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
      
      // Warn if total size is getting too large
      if (parseFloat(sizeInMB) > 35) {
        showToast(`Warning: Total images size is ${sizeInMB}MB. Consider removing some images.`, 'error');
        setUploading(false);
        return;
      }
      
      setFormData({ ...formData, images: newImages });
      showToast(`${base64Images.length} image(s) added successfully (${sizeInMB} MB total)`, 'success');
    } catch (error) {
      console.error('Image processing error:', error);
      showToast('Error processing images. Please try smaller images.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        showToast('Please login to add products', 'error');
        setUploading(false);
        return;
      }
      
      // Check user role
      if (user && user.role !== 'seller' && user.role !== 'admin') {
        showToast('Only sellers can add products', 'error');
        setUploading(false);
        return;
      }
      
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };
      
      console.log('Submitting product as:', user?.role, 'User:', user);
      
      // Check total payload size before submitting
      const payloadString = JSON.stringify({
        ...formData,
        category: formData.category === 'Other' ? formData.customCategory : formData.category
      });
      const payloadSizeMB = (new Blob([payloadString]).size / (1024 * 1024)).toFixed(2);
      
      console.log('Payload size:', payloadSizeMB, 'MB');
      
      // Warn if payload is too large (over 40MB to be safe)
      if (parseFloat(payloadSizeMB) > 40) {
        showToast(`Payload too large (${payloadSizeMB}MB). Please reduce number of images or use smaller images.`, 'error');
        setUploading(false);
        return;
      }
      
      // Use customCategory if category is "Other"
      const submitData = {
        ...formData,
        category: formData.category === 'Other' ? formData.customCategory : formData.category
      };
      delete submitData.customCategory;
      
      if (editingProduct) {
        const response = await axios.put(`http://localhost:5000/api/products/${editingProduct._id}`, submitData, config);
        showToast('Product updated successfully!', 'success');
      } else {
        const response = await axios.post('http://localhost:5000/api/products', submitData, config);
        showToast('Product added successfully!', 'success');
      }
      setShowAddForm(false);
      setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        customCategory: '',
        condition: 'Good',
        location: '',
        stock: 1,
        images: []
      });
      fetchMyProducts();
    } catch (error) {
      console.error('Product submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add product';
      
      if (error.response?.status === 403) {
        showToast(`Access denied: ${errorMessage}. Please make sure you are logged in as a seller.`, 'error');
      } else if (error.response?.status === 401) {
        showToast('Session expired. Please login again.', 'error');
        setTimeout(() => {
          logout();
          window.location.href = '/login';
        }, 2000);
      } else {
        showToast(`Error: ${errorMessage}`, 'error');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    const isOther = !['Electronics', 'Clothes', 'Perfume', 'Furniture', 'Books', 'Sports', 'Toys', 'Jewelry', 'Shoes', 'Bags', 'Home & Kitchen', 'Beauty & Personal Care'].includes(product.category);
    setFormData({
      title: product.title,
      description: product.description,
      price: product.price,
      category: isOther ? 'Other' : product.category,
      customCategory: isOther ? product.category : '',
      condition: product.condition,
      location: product.location || '',
      stock: product.stock || 1,
      images: product.images || []
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await axios.delete(`http://localhost:5000/api/products/${productId}`);
        showToast('Product deleted successfully!', 'success');
        fetchMyProducts();
      } catch (error) {
        showToast('Error deleting product: ' + error.response?.data?.message, 'error');
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingProduct(null);
      setFormData({
        title: '',
        description: '',
        price: '',
        category: '',
        customCategory: '',
        condition: 'Good',
        location: '',
        stock: 1,
        images: []
      });
  };

  const stats = {
    total: products.length,
    available: products.filter(p => p.status === 'available').length,
    sold: products.filter(p => p.status === 'sold').length
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
          <h1>Seller Dashboard</h1>
          <p>Welcome, {user?.name}! Manage your products</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => window.location.href = '/seller/home'} className="home-btn" title="Home">
            🏠 Home
          </button>
          <button onClick={() => setShowStats(!showStats)} className="stats-btn" title="View Statistics">
            📊 Stats
          </button>
          <button onClick={() => { setShowReviews(!showReviews); if (!showReviews) fetchMyReviews(); }} className="reviews-btn" title="View Reviews">
            ⭐ Reviews
          </button>
          <button onClick={() => window.location.href = '/seller/history'} className="history-btn" title="Sell History">
            📜 Sell History
          </button>
          <button onClick={() => setShowAddForm(true)} className="add-btn">
            + Add Product
          </button>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Products</h3>
          <p>{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Available</h3>
          <p>{stats.available}</p>
        </div>
        <div className="stat-card">
          <h3>Sold</h3>
          <p>{stats.sold}</p>
        </div>
        {(() => {
          const statsData = calculateSellerStats();
          return (
            <>
              <div className="stat-card">
                <h3>Total Revenue</h3>
                <p>Rs. {statsData.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h3>Total Orders</h3>
                <p>{statsData.totalOrders}</p>
              </div>
            </>
          );
        })()}
      </div>

      {showAddForm && (
        <div className="modal-overlay" onClick={handleCancel}>
          <div className="modal-content form-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={handleCancel}>×</button>
            <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Product Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter product title"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows="4"
                  placeholder="Enter product description"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Price (Rs.) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                    min="0"
                    placeholder="Enter price"
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothes">Clothes</option>
                    <option value="Perfume">Perfume</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Books">Books</option>
                    <option value="Sports">Sports</option>
                    <option value="Toys">Toys</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Shoes">Shoes</option>
                    <option value="Bags">Bags</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                    <option value="Other">Other</option>
                  </select>
                  {formData.category === 'Other' && (
                    <input
                      type="text"
                      name="customCategory"
                      value={formData.customCategory || ''}
                      onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
                      placeholder="Enter custom category"
                      style={{ marginTop: '10px' }}
                    />
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Condition *</label>
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="New">New</option>
                    <option value="Like New">Like New</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location/City (Optional)</label>
                  <div className="location-autocomplete-wrapper">
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={(e) => {
                        handleInputChange(e);
                        setShowLocationSuggestions(true);
                      }}
                      onFocus={() => setShowLocationSuggestions(true)}
                      onBlur={() => {
                        // Delay to allow click on suggestion
                        setTimeout(() => setShowLocationSuggestions(false), 200);
                      }}
                      placeholder="Type location..."
                    />
                    {formData.location && (
                      <button
                        type="button"
                        className="clear-location-btn"
                        onClick={() => {
                          setFormData({ ...formData, location: '' });
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
                </div>
              </div>

              <div className="form-group">
                <label>Stock Quantity *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  required
                  min="1"
                  placeholder="Enter stock quantity"
                />
                <p className="help-text">Enter the number of items available for sale</p>
              </div>

              <div className="form-group">
                <label>Images (Max 5 images) *</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/bmp,image/svg+xml"
                  multiple
                  onChange={handleImageChange}
                  disabled={uploading || formData.images.length >= 5}
                />
                <p className="help-text">
                  You can upload up to 5 images. Accepted formats: JPEG, PNG, GIF, WEBP, BMP, SVG
                  {formData.images.length > 0 && ` (${formData.images.length}/5 uploaded)`}
                </p>
                {uploading && (
                  <div className="uploading-indicator">
                    <div className="spinner-small"></div>
                    <span>Processing images...</span>
                  </div>
                )}
                {formData.images.length >= 5 && (
                  <p className="max-images-warning">Maximum 5 images allowed</p>
                )}
                {formData.images.length > 0 && (
                  <div className="image-preview-container">
                    {formData.images.slice(0, 5).map((img, index) => (
                      <div key={index} className="image-preview">
                        <img src={img} alt={`Preview ${index + 1}`} />
                        <div className="image-preview-overlay">
                          <span className="image-number">{index + 1}/5</span>
                        </div>
                        <button type="button" onClick={() => removeImage(index)} className="remove-image-btn">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" onClick={handleCancel} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="submit-btn">
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStats && (
        <div className="seller-stats-section">
          <h2>📊 Your Selling Statistics</h2>
          {(() => {
            const stats = calculateSellerStats();
            const categoryLabels = Object.keys(stats.productsByCategory);
            const monthLabels = Object.keys(stats.productsByMonth).sort();
            
            return (
              <div className="stats-grid">
                {categoryLabels.length > 0 && (
                  <div className="chart-card">
                    <h3>Products by Category</h3>
                    <div className="pie-chart-wrapper">
                      <Pie
                        data={{
                          labels: categoryLabels,
                          datasets: [{
                            data: categoryLabels.map(c => stats.productsByCategory[c]),
                            backgroundColor: [
                              'rgba(255, 99, 132, 0.8)',
                              'rgba(54, 162, 235, 0.8)',
                              'rgba(255, 206, 86, 0.8)',
                              'rgba(75, 192, 192, 0.8)',
                              'rgba(153, 102, 255, 0.8)',
                              'rgba(255, 159, 64, 0.8)'
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
                
                {monthLabels.length > 0 && (
                  <div className="chart-card">
                    <h3>Products Added by Month</h3>
                    <div className="chart-wrapper">
                      <Bar
                        data={{
                          labels: monthLabels,
                          datasets: [{
                            label: 'Products Added',
                            data: monthLabels.map(m => stats.productsByMonth[m]),
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
                
                {Object.keys(stats.revenueByMonth).length > 0 && (
                  <div className="chart-card">
                    <h3>Sales Revenue by Month</h3>
                    <div className="chart-wrapper">
                      <Bar
                        data={{
                          labels: Object.keys(stats.revenueByMonth).sort(),
                          datasets: [{
                            label: 'Revenue (Rs.)',
                            data: Object.keys(stats.revenueByMonth).sort().map(m => stats.revenueByMonth[m]),
                            backgroundColor: 'rgba(102, 126, 234, 0.8)',
                            borderColor: 'rgba(102, 126, 234, 1)',
                            borderWidth: 2
                          }]
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                            title: { display: false }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return 'Rs. ' + value.toLocaleString();
                                }
                              }
                            }
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

      {showReviews && (
        <div className="modal-overlay" onClick={() => setShowReviews(false)}>
          <div className="modal-content stats-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
            <button className="close-btn" onClick={() => setShowReviews(false)}>×</button>
            <h2>My Reviews</h2>
            {myReviews && (
              <div>
                {myReviews.totalRatings > 0 ? (
                  <>
                    <div style={{ marginBottom: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '15px' }}>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#667eea' }}>
                          {myReviews.averageRating}
                        </div>
                        <div>
                          <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                            {Array.from({ length: 5 }, (_, i) => (
                              <span key={i} style={{ fontSize: '28px', color: i < Math.round(myReviews.averageRating) ? '#ffc107' : '#ddd' }}>
                                ⭐
                              </span>
                            ))}
                          </div>
                          <div style={{ color: '#666', fontSize: '14px' }}>
                            Based on {myReviews.totalRatings} {myReviews.totalRatings === 1 ? 'review' : 'reviews'}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px', marginTop: '15px' }}>
                        {[5, 4, 3, 2, 1].map(rating => (
                          <div key={rating} style={{ textAlign: 'center', padding: '10px', background: '#fff', borderRadius: '5px' }}>
                            <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                              {myReviews.ratingDistribution[rating] || 0}
                            </div>
                            <div style={{ fontSize: '12px', color: '#666' }}>
                              {Array.from({ length: rating }, (_, i) => (
                                <span key={i} style={{ color: '#ffc107' }}>⭐</span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ marginTop: '30px' }}>
                      <h3 style={{ marginBottom: '20px' }}>All Reviews</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {myReviews.feedbacks.map((review) => (
                          <div key={review._id} style={{ padding: '20px', background: '#fff', borderRadius: '10px', border: '1px solid #e0e0e0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                              <div>
                                <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>
                                  {review.userId ? review.userId.name : review.name}
                                </div>
                                {review.productId && (
                                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                                    Product: {review.productId.title}
                                  </div>
                                )}
                                <div style={{ fontSize: '12px', color: '#999' }}>
                                  {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                {Array.from({ length: 5 }, (_, i) => (
                                  <span key={i} style={{ fontSize: '20px', color: i < review.rating ? '#ffc107' : '#ddd' }}>
                                    ⭐
                                  </span>
                                ))}
                                <span style={{ marginLeft: '5px', fontWeight: 'bold' }}>{review.rating}/5</span>
                              </div>
                            </div>
                            {review.message && (
                              <div style={{ marginTop: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '5px', color: '#333' }}>
                                {review.message}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                    <div style={{ fontSize: '48px', marginBottom: '20px' }}>⭐</div>
                    <h3>No reviews yet</h3>
                    <p>You haven't received any reviews from buyers yet.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {loading && products.length > 0 && (
        <div className="loading-overlay">
          <Loading message="Refreshing..." />
        </div>
      )}
      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">No products yet. Add your first product!</div>
        ) : (
          products.map((product) => (
            <div key={product._id} className="product-card">
              {product.images && product.images.length > 0 ? (
                <div className="product-image-wrapper">
                  <img src={product.images[0]} alt={product.title} />
                  {product.images.length > 1 && (
                    <span className="image-count">+{Math.min(product.images.length - 1, 4)}</span>
                  )}
                </div>
              ) : (
                <div className="no-image">No Image</div>
              )}
              <div className="product-info">
                <h3>{product.title}</h3>
                <p className="product-price">Rs. {product.price}</p>
                <p className="product-category">{product.category}</p>
                <p className="product-status">
                  Status: <span className={product.status}>{product.status === 'sold' ? 'Sold Out' : product.status}</span>
                </p>
                <div className="product-actions">
                  <button className="edit-btn" onClick={() => handleEdit(product)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => handleDelete(product._id)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <Footer userRole={user?.role} />
    </div>
  );
};

export default SellerDashboard;
