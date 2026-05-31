import React, { useState, useRef, useEffect } from 'react';
import { X, ArrowsInSimple, MagnifyingGlassPlus, CaretLeft, CaretRight } from '@phosphor-icons/react';

const ProductImageZoom = ({ image, alt, allImages = [] }) => {
  // Build full image list: main image + additional images (deduplicated)
  const imageList = [image, ...allImages.filter(img => img !== image)].filter(Boolean);

  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ opacity: 0, backgroundPosition: '0% 0%' });
  const [isZooming, setIsZooming] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef(null);
  const touchStartX = useRef(null);
  const lightboxTouchStartX = useRef(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  // Sync activeIndex when parent changes the main image prop
  useEffect(() => {
    const idx = imageList.indexOf(image);
    if (idx !== -1) setActiveIndex(idx);
  }, [image]);

  const currentImage = imageList[activeIndex] || image;

  const goNext = () => setActiveIndex(i => (i + 1) % imageList.length);
  const goPrev = () => setActiveIndex(i => (i - 1 + imageList.length) % imageList.length);

  // Swipe support on main image
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
    touchStartX.current = null;
  };

  // Lightbox swipe
  const handleLightboxTouchStart = (e) => { lightboxTouchStartX.current = e.touches[0].clientX; };
  const handleLightboxTouchEnd = (e) => {
    if (lightboxTouchStartX.current === null) return;
    const diff = lightboxTouchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      diff > 0
        ? setLightboxIndex(i => (i + 1) % imageList.length)
        : setLightboxIndex(i => (i - 1 + imageList.length) % imageList.length);
    }
    lightboxTouchStartX.current = null;
  };

  const handleMouseMove = (e) => {
    if (!containerRef.current || isTouchDevice) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      opacity: 1,
      backgroundPosition: `${x}% ${y}%`,
      backgroundImage: `url(${currentImage})`,
      backgroundSize: `${width * 2.5}px ${height * 2.5}px`,
      backgroundRepeat: 'no-repeat'
    });
  };

  const handleMouseEnter = () => !isTouchDevice && setIsZooming(true);
  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    setIsZooming(false);
    setZoomStyle({ opacity: 0, backgroundPosition: '0% 0%' });
  };

  const openLightbox = () => {
    setLightboxIndex(activeIndex);
    setIsLightboxOpen(true);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="product-zoom-container"
        onClick={() => isTouchDevice && openLightbox()}
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
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={currentImage}
          alt={alt || "Product View"}
          onError={(e) => (e.target.src = "/placeholder.png")}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            padding: '20px',
            transition: 'opacity 0.3s ease',
            opacity: isZooming ? 0.3 : 1,
          }}
        />

        {/* Zoom overlay (desktop only) */}
        {!isTouchDevice && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            pointerEvents: 'none', transition: 'opacity 0.2s ease', zIndex: 5, ...zoomStyle
          }} />
        )}

        {/* Desktop prev/next arrows (only if multiple images) */}
        {!isTouchDevice && imageList.length > 1 && (
          <>
            <button onClick={(e) => { e.stopPropagation(); goPrev(); }} style={arrowStyle('left')}>
              <CaretLeft size={18} weight="bold" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); goNext(); }} style={arrowStyle('right')}>
              <CaretRight size={18} weight="bold" />
            </button>
          </>
        )}

        {/* Hint label */}
        {!isZooming && (
          <div style={{
            position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
            backgroundColor: 'rgba(255,255,255,0.95)', padding: '8px 16px', borderRadius: '30px',
            fontSize: '0.85rem', color: '#1e293b', fontWeight: 600,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', pointerEvents: 'none',
            backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', gap: '8px',
            zIndex: 10, border: '1px solid rgba(0,0,0,0.05)'
          }}>
            {isTouchDevice
              ? <><MagnifyingGlassPlus size={18} /> Tap to expand</>
              : <><ArrowsInSimple size={18} /> Hover to zoom</>
            }
          </div>
        )}

        {/* Dot indicators */}
        {imageList.length > 1 && (
          <div style={{
            position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '5px', zIndex: 10
          }}>
            {imageList.map((_, i) => (
              <div key={i} style={{
                width: i === activeIndex ? '18px' : '6px', height: '6px',
                borderRadius: '3px', background: i === activeIndex ? '#2563eb' : 'rgba(0,0,0,0.25)',
                transition: 'all 0.3s ease'
              }} />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox with swipe support */}
      {isLightboxOpen && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
            backgroundColor: 'rgba(0,0,0,0.92)', zIndex: 99999,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}
          onClick={() => setIsLightboxOpen(false)}
          onTouchStart={handleLightboxTouchStart}
          onTouchEnd={handleLightboxTouchEnd}
        >
          <button
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
            onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(false); }}
          >
            <X size={24} color="#000" />
          </button>

          {imageList.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i - 1 + imageList.length) % imageList.length); }} style={lightboxArrowStyle('left')}>
                <CaretLeft size={22} weight="bold" color="white" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => (i + 1) % imageList.length); }} style={lightboxArrowStyle('right')}>
                <CaretRight size={22} weight="bold" color="white" />
              </button>
            </>
          )}

          <img
            src={imageList[lightboxIndex]}
            alt="Product Zoomed"
            style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', borderRadius: '8px' }}
            onClick={(e) => e.stopPropagation()}
            onError={(e) => (e.target.src = "/placeholder.png")}
          />

          {/* Lightbox dots */}
          {imageList.length > 1 && (
            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
              {imageList.map((_, i) => (
                <div key={i} onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }} style={{
                  width: i === lightboxIndex ? '20px' : '8px', height: '8px',
                  borderRadius: '4px', background: i === lightboxIndex ? '#00e5ff' : 'rgba(255,255,255,0.4)',
                  cursor: 'pointer', transition: 'all 0.3s ease'
                }} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

const arrowStyle = (side) => ({
  position: 'absolute', [side]: '10px', top: '50%', transform: 'translateY(-50%)',
  background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: '50%',
  width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
});

const lightboxArrowStyle = (side) => ({
  position: 'absolute', [side]: '15px', top: '50%', transform: 'translateY(-50%)',
  background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '50%', width: '44px', height: '44px', display: 'flex',
  alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10
});

export default ProductImageZoom;
