import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Loading from '../Loading/Loading';
import Footer from '../Footer/Footer';
import VirtualAssistant from '../VirtualAssistant/VirtualAssistant';
import './LandingPage.css';

const LandingPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // All products without filters
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      fetchProducts();
    }
  }, [searchTerm]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      // Fetch all products
      const params = { status: 'available' };
      if (searchTerm) params.search = searchTerm;
      
      const response = await axios.get('http://localhost:5000/api/products', { params });
      const allAvailableProducts = response.data.data || [];
      
      // Set all products (for Latest Products and Best Deals sections)
      setAllProducts(allAvailableProducts);
      
      // Set filtered products (for "All Products" section - shows search results if search term exists)
      setProducts(allAvailableProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/products');
      const uniqueCategories = [...new Set(response.data.data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleBuyClick = (productId) => {
    if (isAuthenticated && user?.role === 'buyer') {
      navigate(`/buyer/dashboard?product=${productId}`);
    } else {
      navigate('/login?redirect=buyer/dashboard&product=' + productId);
    }
  };

  const handleViewClick = (productId) => {
    if (isAuthenticated && user?.role === 'buyer') {
      navigate(`/buyer/dashboard?view=${productId}`);
    } else {
      // Show product details in a modal or navigate to login
      navigate('/login?redirect=buyer/dashboard&view=' + productId);
    }
  };

  const getLatestProducts = () => {
    return allProducts
      .filter(p => p.status === 'available')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 8);
  };

  const getBestDeals = () => {
    return allProducts
      .filter(p => p.status === 'available' && (p.price || 0) > 2000)
      .sort((a, b) => (a.price || 0) - (b.price || 0))
      .slice(0, 8);
  };

  if (loading && products.length === 0) {
    return <Loading message="Loading products..." />;
  }

  return (
    <div className="landing-page">
      <VirtualAssistant />
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Easy Buy</h1>
          <p className="hero-subtitle">Your Trusted Second Hand Marketplace</p>
          <p className="hero-description">
            Discover amazing deals on quality second-hand products. Buy and sell with confidence!
          </p>
          <div className="hero-buttons">
            {!isAuthenticated ? (
              <>
                <button className="btn-primary" onClick={() => navigate('/login')}>
                  Get Started
                </button>
                <button className="btn-secondary" onClick={() => navigate('/login')}>
                  Start Selling/Buying
                </button>
              </>
            ) : (
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Go to Dashboard
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="search-section">
        <div className="container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
      </section>

      {/* Latest Products */}
      <section className="products-section">
        <div className="container">
          <h2 className="section-title">Latest Products</h2>
          {loading ? (
            <Loading message="Loading products..." />
          ) : (
            <div className="products-grid">
              {getLatestProducts().map((product, index) => (
                <div key={product._id} className="product-card" style={{ '--index': index }}>
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    <div className="product-overlay">
                      <button 
                        className="btn-view" 
                        onClick={() => handleViewClick(product._id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">Rs. {product.price?.toLocaleString() || 'N/A'}</p>
                    <button 
                      className="btn-buy" 
                      onClick={() => handleBuyClick(product._id)}
                    >
                      {isAuthenticated && user?.role === 'buyer' ? 'Buy Now' : 'Login to Buy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Best Deals Section */}
      <section className="products-section best-deals">
        <div className="container">
          <h2 className="section-title">Best Deals</h2>
          {loading ? (
            <Loading message="Loading deals..." />
          ) : (
            <div className="products-grid">
              {getBestDeals().map((product, index) => (
                <div key={product._id} className="product-card" style={{ '--index': index }}>
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    <div className="product-overlay">
                      <button 
                        className="btn-view" 
                        onClick={() => handleViewClick(product._id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">Rs. {product.price?.toLocaleString() || 'N/A'}</p>
                    <button 
                      className="btn-buy" 
                      onClick={() => handleBuyClick(product._id)}
                    >
                      {isAuthenticated && user?.role === 'buyer' ? 'Buy Now' : 'Login to Buy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* All Products Section - Shows filtered results */}
      <section className="products-section">
        <div className="container">
          <h2 className="section-title">All Products ({products.length})</h2>
          {loading ? (
            <Loading message="Loading products..." />
          ) : products.length === 0 ? (
            <div className="no-products">
              <p>No products found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product, index) => (
                <div key={product._id} className="product-card" style={{ '--index': index }}>
                  <div className="product-image">
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    <div className="product-overlay">
                      <button 
                        className="btn-view" 
                        onClick={() => handleViewClick(product._id)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-title">{product.title}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">Rs. {product.price?.toLocaleString() || 'N/A'}</p>
                    <button 
                      className="btn-buy" 
                      onClick={() => handleBuyClick(product._id)}
                    >
                      {isAuthenticated && user?.role === 'buyer' ? 'Buy Now' : 'Login to Buy'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <h2>Ready to Start Buying or Selling?</h2>
            <p>Join Easy Buy today and discover amazing deals!</p>
            <div className="cta-buttons">
              <button className="btn-primary" onClick={() => navigate('/login')}>
                Login / Sign Up
              </button>
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default LandingPage;

