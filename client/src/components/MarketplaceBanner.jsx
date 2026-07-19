import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../api/config';

const MarketplaceBanner = () => {
  const [links, setLinks] = useState({ amazon: '', flipkart: '', indiamart: '' });

  useEffect(() => {
      fetch(`${API_BASE_URL}/api/marketplaces`)
          .then(res => res.json())
          .then(data => {
              if (data) {
                  setLinks({
                      amazon: data.amazon || '',
                      flipkart: data.flipkart || '',
                      indiamart: data.indiamart || ''
                  });
              }
          })
          .catch(err => console.error("Failed to fetch marketplace links:", err));
  }, []);

  // Render banner unconditionally so buttons are always visible

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '3rem 1rem',
      background: 'var(--light-bg)',
      marginTop: 'auto'
    }}>
      <div style={{ 
          width: '100%', 
          maxWidth: '600px', 
          border: '2px dashed var(--primary)', 
          borderRadius: '16px',
          overflow: 'hidden',
          background: '#fff',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)'
      }}>
          {/* Header */}
          <div style={{
              background: 'var(--primary)',
              color: '#ffffff',
              padding: '16px',
              textAlign: 'center',
              fontWeight: 800,
              fontSize: '1.25rem',
              letterSpacing: '0.5px'
          }}>
              Online Stores
          </div>
          
          {/* Store Links */}
          <div style={{
              padding: '24px 20px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '15px',
              flexWrap: 'wrap'
          }}>
              {/* Amazon */}
              <a href={links.amazon || '#'} target={links.amazon ? "_blank" : "_self"} rel="noopener noreferrer" style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  color: '#0f1111',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  flex: '1 1 auto',
                  minWidth: '130px',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={(e) => !links.amazon && e.preventDefault()}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
              >
                  amazon
              </a>

              {/* Flipkart */}
              <a href={links.flipkart || '#'} target={links.flipkart ? "_blank" : "_self"} rel="noopener noreferrer" style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  color: '#2874f0',
                  fontWeight: 800,
                  fontStyle: 'italic',
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  flex: '1 1 auto',
                  minWidth: '130px',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={(e) => !links.flipkart && e.preventDefault()}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
              >
                  Flipkart
              </a>

              {/* IndiaMart */}
              <a href={links.indiamart || '#'} target={links.indiamart ? "_blank" : "_self"} rel="noopener noreferrer" style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  color: '#cc0000',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                  flex: '1 1 auto',
                  minWidth: '130px',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={(e) => !links.indiamart && e.preventDefault()}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.05)'; }}
              >
                  IndiaMART
              </a>
          </div>
      </div>
    </div>
  );
};

export default MarketplaceBanner;
