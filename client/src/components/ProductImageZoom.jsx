import React, { useState, useRef } from 'react';

/**
 * ProductImageZoom: A modern, high-performance replacement for react-image-magnify.
 * - Fully React 18 compatible.
 * - No external dependencies.
 * - Uses hardware-accelerated CSS transforms for smooth performance.
 */
const ProductImageZoom = ({ image, alt }) => {
  const [zoomStyle, setZoomStyle] = useState({ opacity: 0, backgroundPosition: '0% 0%' });
  const [isZooming, setIsZooming] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    
    // Calculate mouse position relative to image in percentage
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomStyle({
      opacity: 1,
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${image})`,
      backgroundSize: `${width * 2.5}px ${height * 2.5}px`, // 2.5x Zoom factor
      backgroundRepeat: 'no-repeat'
    });
  };

  const handleMouseEnter = () => setIsZooming(true);
  
  const handleMouseLeave = () => {
    setIsZooming(false);
    setZoomStyle({ opacity: 0, backgroundPosition: '0% 0%' });
  };

  return (
    <div
      ref={containerRef}
      className="product-zoom-container"
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        maxWidth: '500px',
        aspectRatio: '1/1',
        overflow: 'hidden',
        backgroundColor: '#fff',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        cursor: 'crosshair',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Main Base Image */}
      <img
        src={image}
        alt={alt || "Product View"}
        onError={(e) => (e.target.src = "/placeholder.png")}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          padding: '20px',
          transition: 'opacity 0.3s ease',
          opacity: isZooming ? 0.3 : 1, // Dim the base image to highlight the zoom lens
        }}
      />
      
      {/* Zoom Overlay (The 'Magnifier' lens effect) */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none', // Allow mouse events to pass to container
          transition: 'opacity 0.2s ease',
          zIndex: 5,
          ...zoomStyle
        }}
      />

      {/* Subtle Hint */}
      {!isZooming && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: '6px 14px',
          borderRadius: '30px',
          fontSize: '0.8rem',
          color: '#1e293b',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          Hover to zoom
        </div>
      )}
    </div>
  );
};

export default ProductImageZoom;
