import React from 'react';

const Logo = ({ height = 55, className = "", variant = "light", style = {} }) => {
  const isDark = variant === "dark";
  const textColor = isDark ? "#ffffff" : "#000000";
  
  return (
    <svg 
      width="auto" 
      height={height} 
      viewBox="0 0 850 210" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={`logo-img ${className}`}
      style={style}
    >
      {/* Gradients */}
      <defs>
        <linearGradient id="swirlGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      {/* Stylized 'C' / Swirl / Orbit */}
      <path 
        d="M130 180 C 60 180, 20 120, 20 80 C 20 30, 70 10, 120 10" 
        stroke="url(#swirlGradient)" 
        strokeWidth="15" 
        strokeLinecap="round" 
        fill="none"
      />
      <path 
        d="M140 10 C 210 10, 250 60, 250 100" 
        stroke="url(#swirlGradient)" 
        strokeWidth="15" 
        strokeLinecap="round" 
        fill="none"
      />

      {/* Nozzle at the top */}
      <rect x="123" y="2" width="24" height="28" rx="2" fill="#475569" />
      <path d="M123 30 L147 30 L135 48 Z" fill="#f59e0b" />
      <path d="M135 48 Q155 70, 125 75" stroke="#f59e0b" strokeWidth="4" fill="none" />

      {/* 3D Cube (simplified isometric) - Enlarged */}
      <g transform="translate(90, 70)">
        <path d="M0 20 L35 0 L70 20 L70 60 L35 80 L0 60 Z" fill="#1e293b" />
        <path d="M0 20 L35 40 L70 20" stroke="rgba(255,255,255,0.3)" fill="none" strokeWidth="2" />
        <path d="M35 40 L35 80" stroke="rgba(255,255,255,0.3)" fill="none" strokeWidth="2" />
        <text x="12" y="55" fill="#00e5ff" fontSize="32" fontWeight="900" style={{ fontFamily: 'Arial Black, sans-serif' }}>3D</text>
      </g>

      {/* Hand at the bottom */}
      <path 
        d="M90 180 Q120 135, 170 160 Q210 175, 240 150 L255 165 Q220 200, 150 205 Q95 205, 85 180" 
        fill="#fbbf24" 
      />
      <path d="M175 168 L195 158" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
      <path d="M185 178 L205 168" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />

      {/* Brand Name Text */}
      <text x="280" y="115" fill="#00e5ff" fontSize="82" fontWeight="900" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '-2px' }}>
        PINAKA
      </text>

      {/* Tagline */}
      <text x="285" y="160" fill={textColor} fontSize="20" fontWeight="700" style={{ fontFamily: 'Inter, sans-serif', letterSpacing: '2px' }}>
        GET WHAT YOU EXPECT
      </text>
    </svg>
  );
};

export default Logo;
