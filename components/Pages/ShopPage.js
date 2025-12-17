import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Loading from '../Loading/Loading';
import Footer from '../Footer/Footer';
import './Pages.css';

const ShopPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/products');
      const allProducts = response.data.data || [];
      setProducts(allProducts);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(allProducts.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBestDeals = () => {
    return products
      .filter(p => p.status === 'available')
      .sort((a, b) => (a.price || 0) - (b.price || 0))
      .slice(0, 12);
  };

  const getNewArrivals = () => {
    return products
      .filter(p => p.status === 'available')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);
  };

  if (loading) {
    return <Loading message="Loading shop..." />;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button onClick={() => navigate(-1)} className="back-btn">← Back</button>
        <h1>🛍️ Shop</h1>
        <p>Browse our amazing collection of products</p>
      </div>

      <div className="page-tabs">
        <button 
          className={activeTab === 'browse' ? 'active' : ''} 
          onClick={() => setActiveTab('browse')}
        >
          Browse Products
        </button>
        <button 
          className={activeTab === 'categories' ? 'active' : ''} 
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
        <button 
          className={activeTab === 'deals' ? 'active' : ''} 
          onClick={() => setActiveTab('deals')}
        >
          Best Deals
        </button>
        <button 
          className={activeTab === 'new' ? 'active' : ''} 
          onClick={() => setActiveTab('new')}
        >
          New Arrivals
        </button>
      </div>

      <div className="page-content">
        {activeTab === 'browse' && (
          <div className="products-section">
            <h2>All Products ({products.filter(p => p.status === 'available').length})</h2>
            <div className="products-grid">
              {products
                .filter(p => p.status === 'available')
                .map(product => (
                  <div key={product._id} className="product-card" onClick={() => navigate(`/buyer/dashboard`)}>
                    {product.images && product.images.length > 0 ? (
                      <img src={product.images[0]} alt={product.title} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                    <div className="product-info">
                      <h3>{product.title}</h3>
                      <p className="price">Rs. {product.price?.toLocaleString()}</p>
                      <p className="category">{product.category}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="categories-section">
            <h2>Product Categories</h2>
            <div className="categories-grid">
              {categories.map(category => {
                const categoryProducts = products.filter(p => p.category === category && p.status === 'available');
                return (
                  <div key={category} className="category-card" onClick={() => navigate(`/buyer/dashboard`)}>
                    <h3>{category}</h3>
                    <p>{categoryProducts.length} products available</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'deals' && (
          <div className="products-section">
            <h2>Best Deals</h2>
            <p className="section-description">Find the best prices on quality products</p>
            <div className="products-grid">
              {getBestDeals().map(product => (
                <div key={product._id} className="product-card" onClick={() => navigate(`/buyer/dashboard`)}>
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <p className="price">Rs. {product.price?.toLocaleString()}</p>
                    <p className="category">{product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'new' && (
          <div className="products-section">
            <h2>New Arrivals</h2>
            <p className="section-description">Check out our latest products</p>
            <div className="products-grid">
              {getNewArrivals().map(product => (
                <div key={product._id} className="product-card" onClick={() => navigate(`/buyer/dashboard`)}>
                  {product.images && product.images.length > 0 ? (
                    <img src={product.images[0]} alt={product.title} />
                  ) : (
                    <div className="no-image">No Image</div>
                  )}
                  <div className="product-info">
                    <h3>{product.title}</h3>
                    <p className="price">Rs. {product.price?.toLocaleString()}</p>
                    <p className="category">{product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer userRole={user?.role} />
    </div>
  );
};

export default ShopPage;

