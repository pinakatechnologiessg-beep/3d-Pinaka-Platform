import React, { useState, useRef } from 'react';
import { UploadSimple, Cube, CheckCircle, Warning, Clock, CurrencyInr, Info, WhatsappLogo } from '@phosphor-icons/react';
import axios from 'axios';

const PrintingServices = () => {
    const [file, setFile] = useState(null);
    const [quality, setQuality] = useState('0.2');
    const [material, setMaterial] = useState('PLA');
    const [infill, setInfill] = useState('20');
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const ext = selectedFile.name.split('.').pop().toLowerCase();
            if (['stl', 'obj', 'step', 'stp', 'glb'].includes(ext)) {
                setFile(selectedFile);
                setError(null);
            } else {
                setError('Invalid file format. Please upload .stl, .obj, .step, or .stp');
            }
        }
    };

    const calculatePrice = async () => {
        if (!file) {
            setError('Please upload a 3D file first.');
            return;
        }

        setCalculating(true);
        setResult(null);
        setError(null);

        try {
            // Since we are doing a light-weight calculation, we only send the parameters
            const response = await axios.post('/api/calculate/calculate-price', {
                material,
                quality,
                infill
            });
            setResult(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to calculate price. Please try again.');
        } finally {
            setCalculating(false);
        }
    };

    return (
        <main className="printing-services-page" style={{ padding: '4rem 0', background: 'var(--light-bg)', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '10px' }}>Let's Print Something Amazing For You</h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Instant pricing for professional 3D printing services</p>
                </div>

                {/* Step Progress Bar */}
                <div className="step-bar" style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '4rem', opacity: 0.8 }}>
                    <div className={`step-item ${file ? 'active' : ''}`} style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, color: file ? 'var(--primary)' : '#94a3b8' }}>1. Upload STL</div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{file ? file.name.substring(0, 15) + '...' : 'Not uploaded'}</span>
                    </div>
                    <div style={{ color: '#cbd5e1', paddingTop: '10px' }}>————</div>
                    <div className="step-item" style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>2. Settings</div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{quality}mm | {material}</span>
                    </div>
                    <div style={{ color: '#cbd5e1', paddingTop: '10px' }}>————</div>
                    <div className="step-item" style={{ textAlign: 'center' }}>
                        <div style={{ fontWeight: 600, color: result ? 'var(--primary)' : '#94a3b8' }}>3. Price</div>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{result ? `₹${result.price}` : 'Pending'}</span>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem', alignItems: 'start' }}>
                    
                    {/* Left Side: Upload */}
                    <div style={{ background: 'white', padding: '2rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <div 
                            style={{ 
                                border: '2px dashed #e2e8f0', 
                                padding: '4rem 2rem', 
                                borderRadius: '15px', 
                                cursor: 'pointer',
                                background: '#f8fafc',
                                transition: 'all 0.2s ease'
                            }}
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                style={{ display: 'none' }} 
                                onChange={handleFileChange}
                                accept=".stl,.obj,.step,.stp,.glb"
                            />
                            {file ? (
                                <div>
                                    <CheckCircle size={60} weight="fill" color="var(--success)" />
                                    <h4 style={{ marginTop: '1rem', marginBottom: '8px' }}>{file.name}</h4>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    <button className="btn btn-secondary" style={{ marginTop: '1rem', padding: '8px 20px' }}>Change File</button>
                                </div>
                            ) : (
                                <div>
                                    <UploadSimple size={60} weight="light" color="#94a3b8" />
                                    <h4 style={{ marginTop: '1rem', marginBottom: '8px' }}>Upload your 3D file</h4>
                                    <button className="btn btn-primary" style={{ marginTop: '1rem' }}>Choose 3D File</button>
                                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>(.stl, .obj, .ply, .glb, .step, .stp)</p>
                                </div>
                            )}
                        </div>
                        
                        {error && (
                            <div style={{ marginTop: '1.5rem', color: '#ef4444', background: '#fef2f2', padding: '12px', borderRadius: '8px', fontSize: '0.9rem', border: '1px solid #fee2e2' }}>
                                <Warning size={20} weight="bold" style={{ verticalAlign: 'middle', marginRight: '8px' }} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Options & Price */}
                    <div style={{ background: 'white', padding: '2.5rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginBottom: '2rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>Choose Settings</h3>
                        
                        {/* Quality Select */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', display: 'block' }}>Printer Quality</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {[
                                    { id: '0.2', label: 'Standard', sub: '0.20 mm' },
                                    { id: '0.15', label: 'Medium', sub: '0.15 mm' },
                                    { id: '0.1', label: 'High', sub: '0.10 mm' }
                                ].map((opt) => (
                                    <div 
                                        key={opt.id}
                                        onClick={() => setQuality(opt.id)}
                                        style={{ 
                                            padding: '12px', 
                                            borderRadius: '10px', 
                                            border: '1px solid',
                                            borderColor: quality === opt.id ? 'var(--primary)' : '#e2e8f0',
                                            background: quality === opt.id ? '#f0f9ff' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.label}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{opt.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Material Select */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', display: 'block' }}>Filament Material</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
                                {[
                                    { id: 'PLA', label: 'PLA', sub: 'Standard' },
                                    { id: 'ABS', label: 'ABS', sub: 'Durable' },
                                    { id: 'PETG', label: 'PETG', sub: 'Balanced' },
                                    { id: 'TPU', label: 'TPU', sub: 'Flexible' }
                                ].map((opt) => (
                                    <div 
                                        key={opt.id}
                                        onClick={() => setMaterial(opt.id)}
                                        style={{ 
                                            padding: '12px', 
                                            borderRadius: '10px', 
                                            border: '1px solid',
                                            borderColor: material === opt.id ? 'var(--primary)' : '#e2e8f0',
                                            background: material === opt.id ? '#f0f9ff' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.id}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{opt.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Infill Select */}
                        <div style={{ marginBottom: '3rem' }}>
                            <label style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '12px', display: 'block' }}>Infill Standards</label>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                {[
                                    { id: '20', label: '10 - 30%', sub: 'Standard' },
                                    { id: '40', label: '31 - 50%', sub: 'Medium' },
                                    { id: '65', label: '51 - 80%', sub: 'Strong' }
                                ].map((opt) => (
                                    <div 
                                        key={opt.id}
                                        onClick={() => setInfill(opt.id)}
                                        style={{ 
                                            padding: '12px', 
                                            borderRadius: '10px', 
                                            border: '1px solid',
                                            borderColor: infill === opt.id ? 'var(--primary)' : '#e2e8f0',
                                            background: infill === opt.id ? '#f0f9ff' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{opt.label}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{opt.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Result Display */}
                        {result ? (
                            <div style={{ background: 'var(--dark-bg)', color: 'white', padding: '2rem', borderRadius: '15px', marginBottom: '2rem', animation: 'fadeIn 0.5s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '1.1rem' }}>Estimated Price:</span>
                                    <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{result.price}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Material</div>
                                        <div style={{ fontWeight: 600 }}>₹{result.breakdown.materialCost}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Processing</div>
                                        <div style={{ fontWeight: 600 }}>₹{result.breakdown.laborCost}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Handling</div>
                                        <div style={{ fontWeight: 600 }}>₹{result.breakdown.baseProfit}</div>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', fontWeight: 700 }}
                            onClick={calculatePrice}
                            disabled={calculating}
                        >
                            {calculating ? 'Calculating...' : 'Calculate Price'}
                        </button>
                        
                        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                            <a href={`https://wa.me/918299475268?text=Hello, I want to print a 3D model: ${file ? file.name : ''}`} className="btn btn-secondary" style={{ width: '100%' }}>
                                For Bulk Orders - Click Here
                            </a>
                        </div>
                    </div>
                </div>

                {/* Policies Section */}
                <div style={{ marginTop: '5rem', textAlign: 'center' }}>
                    <h2 style={{ marginBottom: '3rem' }}>Unboxing, Warranty & Service Policy</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2rem' }}>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                            <div style={{ background: '#f0f9ff', color: 'var(--primary)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Clock size={32} />
                            </div>
                            <h4>Fast Turnaround</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Parts are usually shipped within 48-72 hours of order confirmation.</p>
                        </div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                            <div style={{ background: '#f0fdf4', color: '#10b981', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <CheckCircle size={32} />
                            </div>
                            <h4>Quality Control</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Every part undergoes rigorous inspection before being securely packed.</p>
                        </div>
                        <div style={{ background: 'white', padding: '2rem', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                            <div style={{ background: '#fdf2f2', color: '#ef4444', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                                <Info size={32} />
                            </div>
                            <h4>Secure Shipping</h4>
                            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>We use premium protective packaging to ensure safe transit of your parts.</p>
                        </div>
                    </div>
                </div>
            </div>

            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default PrintingServices;
