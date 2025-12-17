import React, { useState, useRef, useEffect } from 'react';
import './Product360Viewer.css';

const Product360Viewer = ({ images, productTitle }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const containerRef = useRef(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const autoRotateIntervalRef = useRef(null);

  useEffect(() => {
    if (autoRotate && images && images.length > 0) {
      autoRotateIntervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 1000);
    } else {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
      }
    }
    return () => {
      if (autoRotateIntervalRef.current) {
        clearInterval(autoRotateIntervalRef.current);
      }
    };
  }, [autoRotate, images]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setAutoRotate(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startX;
    const sensitivity = 5;
    const newIndex = Math.round(currentIndex + deltaX / sensitivity);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setAutoRotate(false);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const deltaX = e.touches[0].clientX - startX;
    const sensitivity = 5;
    const newIndex = Math.round(currentIndex + deltaX / sensitivity);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      setCurrentIndex(newIndex);
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const nextImage = () => {
    const maxImages = Math.min(images.length, 5);
    setCurrentIndex((prev) => (prev + 1) % maxImages);
  };

  const prevImage = () => {
    const maxImages = Math.min(images.length, 5);
    setCurrentIndex((prev) => (prev - 1 + maxImages) % maxImages);
  };

  if (!images || images.length === 0) {
    return <div className="no-images">No images available</div>;
  }

  // Limit to 5 images max
  const displayImages = images.slice(0, 5);
  const maxIndex = Math.min(currentIndex, displayImages.length - 1);

  return (
    <div className="product-360-viewer">
      <div className="viewer-header">
        <h3>{productTitle}</h3>
        <div className="viewer-controls">
          <button
            className={`control-btn ${autoRotate ? 'active' : ''}`}
            onClick={() => setAutoRotate(!autoRotate)}
            title="Auto Rotate"
          >
            {autoRotate ? '⏸' : '▶'}
          </button>
        </div>
      </div>
      
      <div
        className="viewer-container"
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={displayImages[maxIndex]}
          alt={`${productTitle} - View ${maxIndex + 1}`}
          className="product-360-image"
        />
        
        {displayImages.length > 1 && (
          <>
            <button className="nav-btn prev-btn" onClick={prevImage}>
              ‹
            </button>
            <button className="nav-btn next-btn" onClick={nextImage}>
              ›
            </button>
          </>
        )}
        
        <div className="viewer-overlay">
          <p>← Drag or swipe to view →</p>
        </div>
      </div>
      
      {displayImages.length > 1 && (
        <div className="image-thumbnails">
          {displayImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Thumbnail ${index + 1}`}
              className={`thumbnail ${index === maxIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
      
      <div className="image-counter">
        {maxIndex + 1} / {displayImages.length}
        {images.length > 5 && <span className="images-limit-badge"> (Max 5 shown)</span>}
      </div>
    </div>
  );
};

export default Product360Viewer;
