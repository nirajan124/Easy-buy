import React, { useState, useRef, useEffect } from 'react';
import './ImageViewer360.css';

const ImageViewer360 = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [rotation, setRotation] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    if (images && images.length > 0) {
      setCurrentIndex(0);
    }
  }, [images]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setStartX(e.clientX || e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const currentX = e.clientX || (e.touches && e.touches[0]?.clientX);
    if (!currentX) return;
    
    const deltaX = currentX - startX;
    const rotationAmount = (deltaX / 10) % 360;
    setRotation(rotationAmount);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const nextImage = () => {
    if (images && images.length > 0) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
      setRotation(0);
    }
  };

  const prevImage = () => {
    if (images && images.length > 0) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      setRotation(0);
    }
  };

  if (!images || images.length === 0) {
    return <div className="no-image-360">No images available</div>;
  }

  return (
    <div 
      className="image-viewer-360"
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
    >
      <div 
        className="image-container-360"
        style={{ transform: `rotateY(${rotation}deg)` }}
      >
        <img 
          src={images[currentIndex]} 
          alt={`View ${currentIndex + 1}`}
          draggable={false}
        />
      </div>
      {images.length > 1 && (
        <>
          <button className="nav-btn nav-prev" onClick={prevImage}>‹</button>
          <button className="nav-btn nav-next" onClick={nextImage}>›</button>
          <div className="image-counter">
            {currentIndex + 1} / {images.length}
          </div>
        </>
      )}
      <div className="drag-hint">← Drag to rotate →</div>
    </div>
  );
};

export default ImageViewer360;
