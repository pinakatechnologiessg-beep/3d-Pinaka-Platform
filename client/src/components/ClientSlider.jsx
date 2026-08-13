import React from 'react';
import './ClientSlider.css';

const CLIENTS = [
  { 
    name: 'Arducam', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Arducam_logo.svg/200px-Arducam_logo.svg.png',
    fallback: 'https://ui-avatars.com/api/?name=Arducam&background=fff&color=333&bold=true&font-size=0.4'
  },
  { 
    name: 'Realtek', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Realtek_logo.svg/320px-Realtek_logo.svg.png',
    fallback: 'https://ui-avatars.com/api/?name=Realtek&background=fff&color=333&bold=true&font-size=0.4'
  },
  { 
    name: 'LattePanda', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/LattePanda_Logo.png/320px-LattePanda_Logo.png',
    fallback: 'https://ui-avatars.com/api/?name=LattePanda&background=fff&color=333&bold=true&font-size=0.4'
  },
  { 
    name: 'BOSCH', 
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Bosch-Logo.svg/320px-Bosch-Logo.svg.png',
    fallback: 'https://ui-avatars.com/api/?name=BOSCH&background=fff&color=333&bold=true&font-size=0.4'
  },
  { 
    name: 'ATOMSTACK', 
    logo: 'https://cdn.shopify.com/s/files/1/0586/3889/3228/files/atomstack-logo_300x.png',
    fallback: 'https://ui-avatars.com/api/?name=ATOMSTACK&background=fff&color=333&bold=true&font-size=0.4'
  }
];

// Duplicate for marquee
const SLIDER_CLIENTS = [...CLIENTS, ...CLIENTS, ...CLIENTS];

const ClientSlider = () => {
  return (
    <section className="client-slider-section">
      <div className="client-slider-container">
        <h2 className="client-slider-title">Our Clients</h2>
        <div className="marquee-wrapper">
          <div className="marquee-content">
            {SLIDER_CLIENTS.map((client, idx) => (
              <div key={idx} className="client-card">
                <img 
                  src={client.logo} 
                  alt={client.name}
                  className="client-logo"
                  onError={(e) => {
                    e.target.onerror = null; 
                    e.target.src = client.fallback;
                  }}
                />
                <span className="client-name">{client.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClientSlider;
