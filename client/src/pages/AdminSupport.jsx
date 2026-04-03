import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { Calendar, ChatCircleDots, PaperPlaneTilt, CaretRight, Info, CheckCircle, WarningCircle, ArrowLeft, User, ShieldCheck, FunnelSimple, ArrowsClockwise } from '@phosphor-icons/react';

const AdminSupport = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();

    const fetchAllTickets = async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        try {
            const response = await fetch(`${API_BASE_URL}/api/support`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setTickets(data);
                if (selectedTicket) {
                    const updated = data.find(t => t._id === selectedTicket._id);
                    if (updated) setSelectedTicket(updated);
                }
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllTickets();
    }, []);

    const updateTicketStatus = async (id, newStatus) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/support/${id}/status`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });
            if (response.ok) fetchAllTickets();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    const handleSendReply = async (e) => {
        e.preventDefault();
        if (!reply.trim()) return;
        setSendingReply(true);

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${API_BASE_URL}/api/support/${selectedTicket._id}/reply`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ message: reply })
            });

            if (response.ok) {
                setReply('');
                fetchAllTickets();
            }
        } catch (error) {
            console.error("Error sending reply:", error);
        } finally {
            setSendingReply(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'New': return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' }; // blue
            case 'Pending': return { bg: '#fffbeb', text: '#b45309', border: '#fde68a' }; // yellow
            case 'Resolved': return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' }; // green
            default: return { bg: '#f9fafb', text: '#4b5563', border: '#e5e7eb' };
        }
    };

    const filteredTickets = tickets.filter(t => filter === 'All' || t.status === filter);

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading admin support panel...</div>;

    return (
        <main className="admin-support-page" style={{ background: '#f4f7fa', padding: '2rem 0', minHeight: '100vh' }}>
            <div className="container-fluid" style={{ padding: '0 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <button 
                            onClick={() => navigate('/admin')}
                            style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontWeight: 600 }}
                        >
                            <ArrowLeft size={20} /> Dashboard
                        </button>
                        <div>
                            <h1 style={{ fontSize: '2rem', color: '#1e293b', fontWeight: 'bold' }}>Support Dashboard</h1>
                            <p style={{ color: '#64748b' }}>Manage all customer support queries from one place.</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value)}
                            style={{ 
                                padding: '10px 15px', 
                                borderRadius: '8px', 
                                border: '1px solid #e2e8f0', 
                                background: 'white',
                                outline: 'none',
                                fontWeight: 500
                            }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="New">New</option>
                            <option value="Pending">Pending</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                        <button onClick={fetchAllTickets} className="btn-refresh" style={{ background: 'white', border: '1px solid #e2e8f0', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                            <ArrowsClockwise size={20} color="#64748b" />
                        </button>
                    </div>
                </div>

                <div className="admin-support-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1fr) 2fr', gap: '2rem' }}>
                    {/* Sidebar: Ticket List */}
                    <div className="ticket-list-sidebar" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'calc(100vh - 180px)', overflowY: 'auto' }}>
                        {filteredTickets.length === 0 ? (
                            <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
                                <ChatCircleDots size={48} style={{ marginBottom: '1rem' }} />
                                <p>No tickets found in this category.</p>
                            </div>
                        ) : (
                            filteredTickets.map(ticket => {
                                const style = getStatusColor(ticket.status);
                                const isSelected = selectedTicket?._id === ticket._id;
                                return (
                                    <div 
                                        key={ticket._id} 
                                        onClick={() => setSelectedTicket(ticket)}
                                        style={{ 
                                            padding: '1.25rem', 
                                            borderBottom: '1px solid #f1f5f9', 
                                            cursor: 'pointer', 
                                            transition: 'all 0.2s',
                                            background: isSelected ? '#eff6ff' : 'white',
                                            borderLeft: `4px solid ${isSelected ? 'var(--primary)' : 'transparent'}`
                                        }}
                                        className="admin-ticket-item"
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>#{ticket._id.slice(-6).toUpperCase()}</span>
                                            <span style={{ 
                                                padding: '2px 8px', 
                                                borderRadius: '4px', 
                                                fontSize: '0.7rem', 
                                                fontWeight: 700,
                                                background: style.bg,
                                                color: style.text
                                            }}>{ticket.status}</span>
                                        </div>
                                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ticket.subject}</h4>
                                        <p style={{ fontSize: '0.8rem', color: '#64748b' }}>{ticket.name} • {new Date(ticket.createdAt).toLocaleDateString()}</p>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Content: Ticket Detail & Chat */}
                    <div className="ticket-detail-content">
                        {!selectedTicket ? (
                            <div style={{ background: 'white', borderRadius: '12px', border: '1px dashed #e2e8f0', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                                <ChatCircleDots size={80} style={{ marginBottom: '1.5rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.5rem', fontWeight: 500 }}>Select a ticket to view conversation</h3>
                            </div>
                        ) : (
                            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                                {/* Header */}
                                <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.5rem' }}>
                                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{selectedTicket.subject}</h2>
                                            <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>#{selectedTicket._id}</span>
                                        </div>
                                        <div style={{ display: 'flex', gap: '1.5rem', color: '#64748b', fontSize: '0.9rem' }}>
                                            <span><strong>User:</strong> {selectedTicket.name} ({selectedTicket.email})</span>
                                            <span><strong>Date:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {['New', 'Pending', 'Resolved'].map(s => (
                                            <button 
                                                key={s}
                                                onClick={() => updateTicketStatus(selectedTicket._id, s)}
                                                style={{ 
                                                    padding: '8px 16px', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.85rem', 
                                                    fontWeight: 600,
                                                    cursor: 'pointer',
                                                    background: selectedTicket.status === s ? getStatusColor(s).bg : '#f8fafc',
                                                    color: selectedTicket.status === s ? getStatusColor(s).text : '#64748b',
                                                    border: `1px solid ${selectedTicket.status === s ? getStatusColor(s).border : '#e2e8f0'}`
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Chat Area */}
                                <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                                    {/* Original Message */}
                                    <div style={{ marginBottom: '2rem' }}>
                                        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#64748b', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                                {selectedTicket.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '0 12px 12px 12px', flex: 1, border: '1px solid #f1f5f9' }}>
                                                <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem', color: '#1e293b' }}>{selectedTicket.name} (Client)</div>
                                                <div style={{ lineHeight: 1.6, color: '#334155' }}>{selectedTicket.message}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Thread replies */}
                                    {selectedTicket.replies.map((reply, idx) => (
                                        <div key={idx} style={{ marginBottom: '2rem', display: 'flex', flexDirection: reply.sender === 'admin' ? 'row-reverse' : 'row', gap: '12px' }}>
                                            <div style={{ 
                                                width: '32px', height: '32px', borderRadius: '50%', 
                                                background: reply.sender === 'admin' ? '#0ea5e9' : '#64748b', 
                                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' 
                                            }}>
                                                {reply.sender === 'admin' ? <ShieldCheck size={20} /> : selectedTicket.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div style={{ 
                                                background: reply.sender === 'admin' ? '#f0f9ff' : '#f8fafc', 
                                                padding: '1.25rem', 
                                                borderRadius: reply.sender === 'admin' ? '12px 0 12px 12px' : '0 12px 12px 12px', 
                                                maxWidth: '80%',
                                                border: `1px solid ${reply.sender === 'admin' ? '#e0f2fe' : '#f1f5f9'}`,
                                                textAlign: reply.sender === 'admin' ? 'right' : 'left'
                                            }}>
                                                <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '0.9rem', color: '#1e293b' }}>
                                                    {reply.sender === 'admin' ? 'Support Team (Admin)' : selectedTicket.name}
                                                </div>
                                                <div style={{ lineHeight: 1.6, color: '#334155' }}>{reply.message}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '8px' }}>
                                                    {new Date(reply.date).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Reply Area */}
                                <div style={{ padding: '1.5rem', borderTop: '1px solid #f1f5f9', background: 'white' }}>
                                    <form onSubmit={handleSendReply} style={{ position: 'relative' }}>
                                        <textarea 
                                            value={reply}
                                            onChange={(e) => setReply(e.target.value)}
                                            placeholder="Write your response to the customer..."
                                            rows="4"
                                            style={{ 
                                                width: '100%', 
                                                padding: '1rem', 
                                                paddingRight: '60px',
                                                borderRadius: '12px', 
                                                border: '1px solid #e2e8f0', 
                                                outline: 'none', 
                                                resize: 'none',
                                                fontSize: '0.95rem'
                                            }}
                                        ></textarea>
                                        <button 
                                            type="submit" 
                                            disabled={sendingReply || !reply.trim()}
                                            style={{ 
                                                position: 'absolute', 
                                                right: '15px', 
                                                bottom: '15px', 
                                                width: '45px', 
                                                height: '45px', 
                                                borderRadius: '50%', 
                                                background: '#0ea5e9', 
                                                color: 'white', 
                                                border: 'none', 
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 4px 10px rgba(14, 165, 233, 0.3)',
                                                opacity: sendingReply || !reply.trim() ? 0.5 : 1
                                            }}
                                        >
                                            <PaperPlaneTilt size={24} weight="fill" />
                                        </button>
                                    </form>
                                    <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Press Enter to send (Shift + Enter for new line)</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .admin-ticket-item:hover { background: #f8fafc !important; }
                textarea:focus { border-color: #3b82f6 !important; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
                @media (max-width: 1024px) {
                    .admin-support-grid { grid-template-columns: 1fr !important; }
                    .ticket-list-sidebar { height: 300px !important; }
                }
            `}</style>
        </main>
    );
};

export default AdminSupport;
