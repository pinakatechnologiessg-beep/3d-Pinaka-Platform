import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { API_BASE_URL } from '../api/config';
import { getImageUrl, PLACEHOLDER_SVG } from '../utils/imageUtils';

const BlogDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchBlog = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/blogs/${id}`);
                if (res.ok) {
                    setBlog(await res.json());
                } else {
                    navigate('/');
                }
            } catch (err) {
                console.error("Error fetching blog:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id, navigate]);

    if (loading) {
        return (
            <div style={{ height: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--light-bg)' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '16px' }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading blog...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (!blog) return null;

    return (
        <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <button 
                    onClick={() => navigate('/')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', marginBottom: '30px', fontSize: '1rem', fontWeight: 600 }}
                >
                    <ArrowLeft weight="bold" /> Back to Home
                </button>

                <div style={{ background: '#fff', borderRadius: '20px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
                    {blog.thumbnailImage && (
                        <div style={{ width: '100%', maxHeight: '400px', overflow: 'hidden' }}>
                            <img 
                                src={getImageUrl(blog.thumbnailImage)} 
                                alt={blog.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        </div>
                    )}

                    <div style={{ padding: '40px' }}>
                        <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '15px' }}>
                            By {blog.author} • {new Date(blog.createdAt).toLocaleDateString()}
                        </div>
                        
                        <h1 style={{ fontSize: '2.5rem', color: 'var(--text-dark)', marginBottom: '30px', lineHeight: 1.2 }}>
                            {blog.title}
                        </h1>

                        <div style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>
                            {blog.content}
                        </div>

                        {blog.extraImages && blog.extraImages.length > 0 && (
                            <div style={{ marginTop: '40px' }}>
                                <h3 style={{ marginBottom: '20px', color: 'var(--text-dark)' }}>Gallery</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                                    {blog.extraImages.map((img, idx) => (
                                        <div key={idx} style={{ borderRadius: '12px', overflow: 'hidden', height: '150px', background: 'var(--light-bg)' }}>
                                            <img src={getImageUrl(img)} alt={`Extra ${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogDetail;
