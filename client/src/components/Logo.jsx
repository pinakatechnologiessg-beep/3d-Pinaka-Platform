import React from 'react';

const Logo = ({ height = 55, className = "", variant = "light", style = {} }) => {
  return (
    <img 
      src="/logo-pinaka.png" 
      alt="3D Pinaka Logo" 
      height={height} 
      className={`logo-img ${className}`}
      style={{ ...style, objectFit: 'contain' }}
    />
  );
};

export default Logo;
