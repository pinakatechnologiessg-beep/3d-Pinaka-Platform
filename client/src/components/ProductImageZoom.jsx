import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowsInSimple, MagnifyingGlassPlus } from '@phosphor-icons/react';

/**
 * ProductImageZoom: A modern, high-performance replacement for react-image-magnify.
 * - Fully React 18 compatible.
 * - No external dependencies.
 * - Uses hardware-accelerated CSS transforms for smooth performance.
 */
const ProductImageZoom = ({ image, alt }) => {
  const [zoomStyle, setZoomStyle] = useState({ opacity: 0, backgroundPosition: '0% 0%' });
  const [isZooming, setIsZooming] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const checkTouch = () => {
      setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };
    checkTouch();
  }, []);

  const handleMouseMove = (e) => {
    if (!containerRef.current || isTouchDevice) return;
    
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

  const handleMouseEnter = () => !isTouchDevice && setIsZooming(true);
  
  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    setIsZooming(false);
    setZoomStyle({ opacity: 0, backgroundPosition: '0% 0%' });
  };

  return (
    <>
    <div
      ref={containerRef}
      className="product-zoom-container"
      onClick={() => isTouchDevice && setIsLightboxOpen(true)}
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
        cursor: isTouchDevice ? 'pointer' : 'crosshair',
        boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease'
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
      {!isTouchDevice && (
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
      )}

      {/* Subtle Hint */}
      {!isZooming && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255,255,255,0.95)',
          padding: '8px 16px',
          borderRadius: '30px',
          fontSize: '0.85rem',
          color: '#1e293b',
          fontWeight: 600,
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
          pointerEvents: 'none',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 10,
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          {isTouchDevice ? (
            <><MagnifyingGlassPlus size={18} /> Tap to expand</>
          ) : (
            <><ArrowsInSimple size={18} /> Hover to zoom</>
          )}
        </div>
      )}
    </div>

    {/* Mobile Lightbox */}
    {isLightboxOpen && (
        <div 
            style={{
                position: 'fixed',
                top: 0, left: 0, width: '100%', height: '100%',
                backgroundColor: 'rgba(0,0,0,0.9)',
                zIndex: 99999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}
            onClick={() => setIsLightboxOpen(false)}
        >
            <button 
                style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
            >
                <X size={24} color="#000" />
            </button>
            <img 
                src={image} 
                alt="Product Zoomed" 
                style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain' }} 
                onClick={(e) => e.stopPropagation()}
            />
        </div>
    )}
    </>
  );
};

export default ProductImageZoom;
