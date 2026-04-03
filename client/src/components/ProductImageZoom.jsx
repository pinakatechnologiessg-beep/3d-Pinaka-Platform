import React, { useState } from 'react';

const ProductImageZoom = ({ image, alt }) => {
  const [zoomStyle, setZoomStyle] = useState({ transform: "scale(1)", transformOrigin: "center" });
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();

    // Calculate mouse position relative to the image as a percentage
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: "scale(2.5)", // Professional high-level zoom
    });
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({ transform: "scale(1)", transformOrigin: "center" });
  };

  return (
    <div
      className="product-inline-zoom-wrapper"
      style={{
        width: "100%",
        maxWidth: "500px",
        aspectRatio: "1/1",
        overflow: "hidden",
        border: "1px solid #f1f5f9",
        borderRadius: "12px",
        cursor: "zoom-in",
        backgroundColor: "#fff",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsZoomed(true)}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={image}
        alt={alt || "product"}
        onError={(e) => { 
          e.target.onerror = null; 
          e.target.src = 'https://res.cloudinary.com/dbv5unrxu/image/upload/v1712160000/placeholder_3d_m0h6uv.png'; 
        }}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          padding: "20px",
          transition: isZoomed ? "transform 0.1s ease-out" : "transform 0.5s ease",
          ...zoomStyle
        }}
      />
      
      {/* Subtle hint text for UX */}
      {!isZoomed && (
        <div style={{
          position: 'absolute',
          bottom: '15px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(255,255,255,0.8)',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.75rem',
          color: '#64748b',
          fontWeight: 600,
          pointerEvents: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          Hover to zoom
        </div>
      )}
    </div>
  );
};

export default ProductImageZoom;
