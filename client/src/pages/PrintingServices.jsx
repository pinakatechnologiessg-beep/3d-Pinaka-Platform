import React, { useState, useRef } from 'react';
import { UploadSimple, Cube, CheckCircle, Warning, Clock, CurrencyInr, Info, WhatsappLogo } from '@phosphor-icons/react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const PrintingServices = () => {
    const [file, setFile] = useState(null);
    const [quality, setQuality] = useState('0.2');
    const [material, setMaterial] = useState('PLA');
    const [infill, setInfill] = useState('20');
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState(null);
    const [rotationX, setRotationX] = useState(0);
    const [rotationY, setRotationY] = useState(0);
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
            const formData = new FormData();
            formData.append('file', file);
            formData.append('material', material);
            formData.append('quality', quality);
            formData.append('infill', infill);
            formData.append('rotationX', rotationX);
            formData.append('rotationY', rotationY);

            const response = await axios.post(`${API_BASE_URL}/api/calculate/calculate-price`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
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
                <div className="step-bar-container" style={{ opacity: 0.8 }}>
                    <div className={`step-item ${file ? 'active' : ''}`} style={{ textAlign: 'center', minWidth: '80px' }}>
                        <div style={{ fontWeight: 600, color: file ? 'var(--primary)' : '#94a3b8' }}>1. Upload</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{file ? 'Uploaded' : 'Pending'}</span>
                    </div>
                    <div className="step-divider" style={{ color: '#cbd5e1', paddingTop: '10px' }}>————</div>
                    <div className="step-item" style={{ textAlign: 'center', minWidth: '80px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-dark)' }}>2. Settings</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{quality}mm | {material}</span>
                    </div>
                    <div className="step-divider" style={{ color: '#cbd5e1', paddingTop: '10px' }}>————</div>
                    <div className="step-item" style={{ textAlign: 'center', minWidth: '80px' }}>
                        <div style={{ fontWeight: 600, color: result ? 'var(--primary)' : '#94a3b8' }}>3. Price</div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{result ? `₹${result.price}` : 'Pending'}</span>
                    </div>
                </div>

                <div className="calculator-main-grid">
                    
                    {/* Left Side: Upload */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <div 
                            style={{ 
                                border: '2px dashed #e2e8f0', 
                                padding: '3rem 1.5rem', 
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
                                <div style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '1rem', 
                                    background: '#f8fafc', 
                                    padding: '1rem', 
                                    borderRadius: '12px', 
                                    border: '1px solid #e2e8f0',
                                    textAlign: 'left'
                                }}>
                                    <div style={{ 
                                        width: '48px', 
                                        height: '48px', 
                                        background: 'white', 
                                        borderRadius: '8px', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                                    }}>
                                        <Cube size={28} weight="fill" color="var(--primary)" />
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <h5 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-dark)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</h5>
                                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{(file.size / 1024 / 1024).toFixed(2)} MB • {file.name.split('.').pop().toUpperCase()} File</p>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); fileInputRef.current.click(); }}
                                        style={{ 
                                            background: 'white', 
                                            border: '1px solid #e2e8f0', 
                                            padding: '5px 12px', 
                                            borderRadius: '6px', 
                                            fontSize: '0.75rem', 
                                            fontWeight: 600, 
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseOver={(e) => e.target.style.background = '#f1f5f9'}
                                        onMouseOut={(e) => e.target.style.background = 'white'}
                                    >
                                        Change
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <UploadSimple size={50} weight="light" color="#94a3b8" />
                                    <h4 style={{ marginTop: '1rem', marginBottom: '8px' }}>Upload your 3D file</h4>
                                    <button className="btn btn-primary" style={{ marginTop: '0.5rem', padding: '10px 20px' }}>Choose 3D File</button>
                                    <p style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>(.stl, .obj, .glb, .step, .stp)</p>
                                </div>
                            )}
                        </div>
                        
                        {error && (
                            <div style={{ marginTop: '1.5rem', color: '#ef4444', background: '#fef2f2', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', border: '1px solid #fee2e2' }}>
                                <Warning size={18} weight="bold" style={{ verticalAlign: 'middle', marginRight: '6px' }} />
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Options & Price */}
                    <div style={{ background: 'white', padding: '1.5rem 1.5rem', borderRadius: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                        <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.8rem' }}>Choose Settings</h3>
                        
                        {/* Quality Select */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px', display: 'block' }}>Printer Quality</label>
                            <div className="options-selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                                {[
                                    { id: '0.2', label: 'Standard', sub: '0.20 mm' },
                                    { id: '0.15', label: 'Medium', sub: '0.15 mm' },
                                    { id: '0.1', label: 'High', sub: '0.10 mm' }
                                ].map((opt) => (
                                    <div 
                                        key={opt.id}
                                        onClick={() => setQuality(opt.id)}
                                        style={{ 
                                            padding: '10px 8px', 
                                            borderRadius: '8px', 
                                            border: '1px solid',
                                            borderColor: quality === opt.id ? 'var(--primary)' : '#e2e8f0',
                                            background: quality === opt.id ? '#f0f9ff' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{opt.label}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{opt.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Material Select */}
                        <div style={{ marginBottom: '2rem' }}>
                            <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px', display: 'block' }}>Filament Material</label>
                            <div className="material-selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.8rem' }}>
                                {[
                                    { id: 'PLA', label: 'PLA', sub: 'Standard' },
                                    { id: 'ABS', label: 'ABS', sub: 'Durable' },
                                    { id: 'PETG', label: 'PETG', sub: 'Balanced' },
                                    { id: 'Resin', label: 'Resin', sub: 'High Detail' },
                                    { id: 'TPU', label: 'TPU', sub: 'Flexible' }
                                ].map((opt) => (
                                    <div 
                                        key={opt.id}
                                        onClick={() => setMaterial(opt.id)}
                                        style={{ 
                                            padding: '10px 8px', 
                                            borderRadius: '8px', 
                                            border: '1px solid',
                                            borderColor: material === opt.id ? 'var(--primary)' : '#e2e8f0',
                                            background: material === opt.id ? '#f0f9ff' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{opt.id}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{opt.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Infill Select */}
                        <div style={{ marginBottom: '2.5rem' }}>
                            <label style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '10px', display: 'block' }}>Infill Standards</label>
                            <div className="options-selection-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
                                {[
                                    { id: '20', label: '10 - 30%', sub: 'Standard' },
                                    { id: '40', label: '31 - 50%', sub: 'Medium' },
                                    { id: '65', label: '51 - 80%', sub: 'Strong' }
                                ].map((opt) => (
                                    <div 
                                        key={opt.id}
                                        onClick={() => setInfill(opt.id)}
                                        style={{ 
                                            padding: '10px 8px', 
                                            borderRadius: '8px', 
                                            border: '1px solid',
                                            borderColor: infill === opt.id ? 'var(--primary)' : '#e2e8f0',
                                            background: infill === opt.id ? '#f0f9ff' : 'white',
                                            cursor: 'pointer',
                                            textAlign: 'center',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{opt.label}</div>
                                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>{opt.sub}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Rotation Controls */}
                        <div style={{ marginBottom: '2.5rem', background: '#f8fafc', padding: '1.5rem', borderRadius: '15px', border: '1px solid #e2e8f0' }}>
                            <label style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '1.5rem', display: 'block' }}>Rotation</label>
                            
                            {/* X Axis */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>X Axis</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setRotationX(prev => Math.max(-180, prev - 90))} style={{ padding: '4px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>-90°</button>
                                        <button onClick={() => setRotationX(prev => Math.min(180, prev + 90))} style={{ padding: '4px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>+90°</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <input 
                                        type="range" 
                                        min="-180" 
                                        max="180" 
                                        value={rotationX} 
                                        onChange={(e) => setRotationX(parseInt(e.target.value))}
                                        style={{ flex: 1, accentColor: 'var(--primary)', height: '6px', borderRadius: '3px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>{rotationX}°</span>
                                </div>
                            </div>

                            {/* Y Axis */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>Y Axis</span>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => setRotationY(prev => Math.max(-180, prev - 90))} style={{ padding: '4px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>-90°</button>
                                        <button onClick={() => setRotationY(prev => Math.min(180, prev + 90))} style={{ padding: '4px 10px', border: '1px solid #cbd5e1', borderRadius: '4px', background: 'white', fontSize: '0.75rem', cursor: 'pointer' }}>+90°</button>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <input 
                                        type="range" 
                                        min="-180" 
                                        max="180" 
                                        value={rotationY} 
                                        onChange={(e) => setRotationY(parseInt(e.target.value))}
                                        style={{ flex: 1, accentColor: 'var(--primary)', height: '6px', borderRadius: '3px', cursor: 'pointer' }}
                                    />
                                    <span style={{ fontSize: '0.85rem', fontWeight: 700, minWidth: '40px', textAlign: 'right' }}>{rotationY}°</span>
                                </div>
                            </div>
                        </div>

                        {/* Result Display */}
                        {result ? (
                            <div style={{ background: '#1e293b', color: 'white', padding: '1.5rem', borderRadius: '15px', marginBottom: '2rem', animation: 'fadeIn 0.5s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '1rem' }}>Estimations:</span>
                                    <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary)' }}>₹{result.price}</span>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Material</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>₹{result.breakdown.materialCost}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>Processing</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>₹{(parseFloat(result.breakdown.machineCost) + parseFloat(result.breakdown.laborCost)).toFixed(2)}</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ fontSize: '0.65rem', opacity: 0.6 }}>GST (18%)</div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>₹{result.breakdown.tax}</div>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <button 
                            className="btn btn-primary" 
                            style={{ width: '100%', padding: '1rem', fontSize: '1rem', fontWeight: 700 }}
                            onClick={calculatePrice}
                            disabled={calculating}
                        >
                            {calculating ? 'Calculating...' : 'Calculate Price'}
                        </button>
                        
                        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                            <a href={`https://wa.me/918299475268?text=Hello, I want to print a 3D model: ${file ? file.name : ''}`} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.9rem' }}>
                                For Bulk Orders - Click Here
                            </a>
                        </div>
                    </div>
                </div>

                {/* Policies Section */}
                <div style={{ marginTop: '5rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '15px' }}>Unboxing, Warranty & Service Policy</h2>
                        <div style={{ width: '80px', height: '4px', background: 'var(--primary)', margin: '0 auto', borderRadius: '2px' }}></div>
                    </div>
                    
                    <div className="policy-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '3rem' }}>
                        {/* Card 1 */}
                        <div className="policy-card" style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ width: '45px', height: '45px', background: '#e0f2fe', borderRadius: '12px' }}></div>
                            <h4 style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: '1.3' }}>Unboxing Video Requirement</h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>Customers are strongly advised to record a complete and continuous unboxing video immediately upon receiving the product.</p>
                            <div style={{ fontSize: '0.85rem' }}>
                                <strong style={{ display: 'block', marginBottom: '8px' }}>Mandatory in case of:</strong>
                                <ul style={{ listStyle: 'none', padding: 0, color: '#64748b', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                                    <li>▢ Transit damage</li>
                                    <li>▢ Missing parts</li>
                                    <li>▢ Incorrect product delivery</li>
                                </ul>
                            </div>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>The unboxing video helps us validate claims and obtain approval from the manufacturer, ensuring faster resolution.</p>
                        </div>

                        {/* Card 2 */}
                        <div className="policy-card" style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ width: '45px', height: '45px', background: '#e0f2fe', borderRadius: '12px' }}></div>
                            <h4 style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: '1.3' }}>Original Packaging Mandatory</h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>For any under-warranty repair or in-house service, the product <strong>must</strong> be shipped only in its original packaging.</p>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>Includes all foam, supports, and protective materials provided at delivery.</p>
                        </div>

                        {/* Card 3 */}
                        <div className="policy-card" style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ width: '45px', height: '45px', background: '#e0f2fe', borderRadius: '12px' }}></div>
                            <h4 style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: '1.3' }}>Warranty Limitation</h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>Without original packaging, the following may apply:</p>
                            <ul style={{ listStyle: 'none', padding: 0, color: '#64748b', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.85rem' }}>
                                <li>▢ Warranty may be void</li>
                                <li>▢ Transit damage not covered</li>
                            </ul>
                            <p style={{ fontSize: '0.85rem', color: '#ef4444', lineHeight: '1.6', marginTop: 'auto' }}>
                                3Idea Technology Ltd. is not responsible for transit-related damages in these cases.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="policy-card" style={{ background: 'white', padding: '2rem', borderRadius: '20px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                            <div style={{ width: '45px', height: '45px', background: '#e0f2fe', borderRadius: '12px' }}></div>
                            <h4 style={{ fontWeight: 800, fontSize: '1.1rem', lineHeight: '1.3' }}>Transportation Responsibility</h4>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>The customer is solely responsible for ensuring the product is properly packed and safely shipped.</p>
                            <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: '1.6' }}>Follow manufacturer guidelines to prevent damage during transit.</p>
                        </div>
                    </div>

                    {/* Important Note Banner */}
                    <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1.5rem 2rem', borderRadius: '15px' }}>
                        <h5 style={{ fontWeight: 800, fontSize: '1.2rem', marginBottom: '8px', color: '#1e293b' }}>Important Note:</h5>
                        <p style={{ fontSize: '0.85rem', color: '#4b5563', lineHeight: '1.5' }}>
                            Failure to comply with the above guidelines may result in rejection of warranty claims or chargeable repairs. Please ensure all safety protocols are followed.
                        </p>
                    </div>
                </div>
            </div>

            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default PrintingServices;
