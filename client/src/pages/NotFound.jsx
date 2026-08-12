import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound = () => {
    return (
        <main className="not-found-page" style={{ padding: '100px 20px', textAlign: 'center', minHeight: '60vh' }}>
            <SEO title="Page Not Found" noindex={true} />
            <div className="container">
                <h1 style={{ fontSize: '4rem', color: 'var(--primary)', marginBottom: '20px' }}>404</h1>
                <h2 style={{ marginBottom: '20px' }}>Oops! Page Not Found</h2>
                <p style={{ marginBottom: '30px', color: '#666' }}>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p>
                <Link to="/" className="btn btn-primary" style={{ display: 'inline-block', padding: '12px 30px', background: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: '5px' }}>
                    Go to Homepage
                </Link>
            </div>
        </main>
    );
};

export default NotFound;
