import React, { useState, useEffect } from 'react';
import { X } from '@phosphor-icons/react';
import { API_BASE_URL } from '../api/config';

const PopupModal = () => {
    const [popup, setPopup] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchPopup = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/popup`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.isActive && (data.image || data.useTemplate)) {
                        setPopup(data);
                        // Show after a small delay
                        setTimeout(() => setIsVisible(true), 1200);
                    }
                }
            } catch (err) {
                console.error("Popup fetch error:", err);
            }
        };
        fetchPopup();
    }, []);

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!popup || !isVisible) return null;

    return (
        <div 
            onClick={handleClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(0,0,0,0.7)',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(5px)',
                animation: 'fadeIn 0.3s ease',
                cursor: 'pointer'
            }}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: 'var(--colorful-bg)',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    maxWidth: '600px',
                    width: '90%',
                    position: 'relative',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                    animation: 'scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    cursor: 'default'
                }}
            >
                <button 
                    onClick={handleClose}
                    style={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        background: 'rgba(255,255,255,0.8)',
                        border: 'none',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 10,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    <X size={20} weight="bold" />
                </button>

                {popup.useTemplate ? (
                    <div style={{ 
                        background: popup.templateImage ? 'transparent' : (popup.templateData?.color || '#ef4444'), 
                        backgroundImage: popup.templateImage ? `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${popup.templateImage.startsWith('http') ? popup.templateImage : API_BASE_URL + popup.templateImage})` : 'none',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        color: 'white', 
                        padding: '3rem 2rem', 
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '500px'
                    }}>
                        <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '4px', marginBottom: '20px', opacity: 0.9, textShadow: '0 2px 4px rgba(0,0,0,0.3)', color: popup.templateData?.subtitleColor || 'white' }}>
                            {popup.templateType === 'sale' ? 'FLASH SALE' : popup.templateType === 'arrival' ? 'NEW IN' : 'CLEARANCE'}
                        </div>
                        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1, textShadow: '0 2px 10px rgba(0,0,0,0.3)', color: popup.templateData?.titleColor || 'white' }}>
                            {popup.templateData?.title}
                        </h2>
                        <p style={{ fontSize: '1.2rem', fontWeight: 500, marginBottom: '40px', opacity: 0.9, textShadow: '0 2px 4px rgba(0,0,0,0.3)', color: popup.templateData?.subtitleColor || 'white' }}>
                            {popup.templateData?.subtitle}
                        </p>
                        {popup.templateData?.code && (
                            <div style={{ 
                                padding: '8px 25px', 
                                borderRadius: '4px', 
                                fontSize: '1.1rem', 
                                fontWeight: 800,
                                background: popup.templateData?.codeBgColor || 'var(--secondary)',
                                color: popup.templateData?.codeColor || 'white',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                letterSpacing: '1px'
                            }}>
                                {popup.templateData.code}
                            </div>
                        )}
                        {popup.link && (
                            <a 
                                href={popup.link} 
                                className="btn btn-primary" 
                                style={{ 
                                    marginTop: '25px', 
                                    background: 'var(--colorful-bg)', 
                                    color: popup.templateData?.color || '#ef4444', 
                                    padding: '12px 35px', 
                                    fontWeight: 700,
                                    borderRadius: '30px',
                                    border: 'none',
                                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)'
                                }}
                            >
                                Shop Now
                            </a>
                        )}
                    </div>
                ) : (
                    <a href={popup.link || '#'} onClick={(e) => !popup.link && e.preventDefault()} style={{ display: 'block' }}>
                        <img 
                            src={popup.image.startsWith('http') ? popup.image : `${API_BASE_URL}${popup.image}`} 
                            alt="Promotion" 
                            style={{ width: '100%', height: 'auto', display: 'block' }} 
                        />
                    </a>
                )}
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { opacity: 0; transform: scale(0.8) translateY(20px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PopupModal;
