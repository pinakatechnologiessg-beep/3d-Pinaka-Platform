import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../api/config';
import { Calendar, ChatCircleDots, PaperPlaneTilt, CaretRight, Info, CheckCircle, WarningCircle, ArrowLeft, User, ShieldCheck } from '@phosphor-icons/react';

const MyTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reply, setReply] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const navigate = useNavigate();

    const fetchTickets = async () => {
        const token = localStorage.getItem('token');
        if (!token) return navigate('/login');

        try {
            const response = await fetch(`${API_BASE_URL}/api/support/my-tickets`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (response.ok) {
                setTickets(data);
                // Highlight: If a ticket was previously selected, update its data
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
        fetchTickets();
    }, []);

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
                fetchTickets();
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

    if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}>Loading tickets...</div>;

    return (
        <main className="tickets-page" style={{ background: 'var(--light-bg)', padding: '4rem 0', minHeight: '100vh' }}>
            <div className="container">
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '2.5rem' }}>
                    <button 
                        onClick={() => selectedTicket ? setSelectedTicket(null) : navigate('/account')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)' }}
                    >
                        <ArrowLeft size={20} /> Back to {selectedTicket ? 'Ticket List' : 'Account'}
                    </button>
                    <h1 style={{ fontSize: '2rem', color: 'var(--text-dark)' }}>
                        {selectedTicket ? 'Ticket Details' : 'Support Tickets'}
                    </h1>
                </div>

                <div className="tickets-layout" style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    {!selectedTicket ? (
                        <>
                            {tickets.length === 0 ? (
                                <div style={{ 
                                    gridColumn: '1 / -1', 
                                    padding: '4rem', 
                                    background: 'var(--white)', 
                                    borderRadius: '12px', 
                                    textAlign: 'center',
                                    border: '1px dashed var(--border-color)'
                                }}>
                                    <ChatCircleDots size={60} color="#cbd5e1" style={{ marginBottom: '1.5rem' }} />
                                    <h3 style={{ marginBottom: '0.5rem' }}>No Tickets Found</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Need help? Create a new support ticket and we'll assist you.</p>
                                    <button onClick={() => navigate('/support')} className="btn btn-primary">Create New Ticket</button>
                                </div>
                            ) : (
                                tickets.map(ticket => {
                                    const style = getStatusColor(ticket.status);
                                    return (
                                        <div 
                                            key={ticket._id} 
                                            onClick={() => setSelectedTicket(ticket)}
                                            style={{ 
                                                background: 'var(--white)', 
                                                padding: '1.5rem', 
                                                borderRadius: '12px', 
                                                border: `1px solid var(--border-color)`, 
                                                cursor: 'pointer', 
                                                transition: 'all 0.2s',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
                                            }}
                                            className="ticket-card"
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: '6px', 
                                                    fontSize: '0.75rem', 
                                                    fontWeight: 600,
                                                    background: style.bg,
                                                    color: style.text,
                                                    border: `1px solid ${style.border}`
                                                }}>
                                                    {ticket.status.toUpperCase()}
                                                </span>
                                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                                    <Calendar size={14} />
                                                    {new Date(ticket.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ticket.subject}</h3>
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1.25rem' }}>
                                                {ticket.message}
                                            </p>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
                                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                                    {ticket.replies.length} {ticket.replies.length === 1 ? 'Reply' : 'Replies'}
                                                </span>
                                                <span style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    View Details <CaretRight size={14} />
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </>
                    ) : (
                        <div className="ticket-detail-view" style={{ background: 'var(--white)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.05)' }}>
                            <div style={{ padding: '2rem', background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ 
                                        padding: '4px 12px', 
                                        borderRadius: '8px', 
                                        fontSize: '0.85rem', 
                                        fontWeight: 600,
                                        background: getStatusColor(selectedTicket.status).bg,
                                        color: getStatusColor(selectedTicket.status).text,
                                        border: `1px solid ${getStatusColor(selectedTicket.status).border}`
                                    }}>
                                        {selectedTicket.status}
                                    </span>
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                        Ticket ID: #{selectedTicket._id.slice(-6).toUpperCase()}
                                    </span>
                                </div>
                                <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{selectedTicket.subject}</h2>
                                <p style={{ color: 'var(--text-muted)' }}>Created on {new Date(selectedTicket.createdAt).toLocaleDateString()} at {new Date(selectedTicket.createdAt).toLocaleTimeString()}</p>
                            </div>

                            <div style={{ padding: '2.5rem', maxHeight: '600px', overflowY: 'auto' }}>
                                {/* Original Message */}
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '2rem' }}>
                                    <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <User size={20} weight="fill" />
                                    </div>
                                    <div style={{ background: '#f1f5f9', padding: '1.25rem', borderRadius: '0 12px 12px 12px', maxWidth: '80%' }}>
                                        <div style={{ fontWeight: 600, marginBottom: '4px', fontSize: '0.9rem' }}>You (Original Request)</div>
                                        <div style={{ lineHeight: 1.6, color: 'var(--text-dark)' }}>{selectedTicket.message}</div>
                                    </div>
                                </div>

                                {/* Thread */}
                                        {selectedTicket.replies.map((reply, index) => (
                                            <div 
                                                key={index} 
                                                style={{ 
                                                    display: 'flex', 
                                                    flexDirection: reply.sender === 'user' ? 'row' : 'row-reverse',
                                                    gap: '12px', 
                                                    marginBottom: '2rem',
                                                    alignItems: 'flex-end',
                                                    justifyContent: reply.sender === 'user' ? 'flex-start' : 'flex-end'
                                                }}
                                            >
                                                <div style={{ 
                                                    flexShrink: 0, 
                                                    width: '36px', 
                                                    height: '36px', 
                                                    borderRadius: '50%', 
                                                    background: reply.sender === 'user' ? 'var(--primary)' : '#3b82f6', 
                                                    color: 'white', 
                                                    display: 'flex', 
                                                    alignItems: 'center', 
                                                    justifyContent: 'center',
                                                    fontSize: '0.9rem',
                                                    fontWeight: 600,
                                                    marginBottom: '4px'
                                                }}>
                                                    {reply.sender === 'user' ? <User size={20} weight="fill" /> : <ShieldCheck size={20} weight="fill" />}
                                                </div>
                                                <div className="chat-bubble" style={{ 
                                                    background: reply.sender === 'user' ? 'white' : '#2563eb', 
                                                    padding: '1rem 1.25rem', 
                                                    borderRadius: reply.sender === 'user' ? '20px 20px 20px 4px' : '20px 20px 4px 20px', 
                                                    maxWidth: '80%',
                                                    border: reply.sender === 'user' ? '1px solid #e2e8f0' : 'none',
                                                    textAlign: 'left',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                                                    overflowWrap: 'break-word',
                                                    wordBreak: 'break-word',
                                                    color: reply.sender === 'user' ? '#1e293b' : 'white'
                                                }}>
                                                    <div style={{ fontWeight: 700, marginBottom: '6px', fontSize: '0.8rem', opacity: 0.9 }}>
                                                        {reply.sender === 'admin' ? 'Support Team' : 'You'}
                                                    </div>
                                                    <div style={{ lineHeight: 1.5, fontSize: '0.95rem' }}>{reply.message}</div>
                                                    <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '8px', textAlign: reply.sender === 'user' ? 'left' : 'right' }}>
                                                        {new Date(reply.date).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                            </div>

                            <div style={{ padding: '2rem', borderTop: '1px solid var(--border-color)', background: '#fff' }}>
                                <form onSubmit={handleSendReply} style={{ position: 'relative' }}>
                                    <textarea 
                                        value={reply}
                                        onChange={(e) => setReply(e.target.value)}
                                        placeholder="Type your message here..."
                                        rows="3"
                                        style={{ 
                                            width: '100%', 
                                            padding: '1rem 4rem 1rem 1rem', 
                                            borderRadius: '12px', 
                                            border: '1px solid var(--border-color)', 
                                            outline: 'none', 
                                            resize: 'none',
                                            fontSize: '1rem'
                                        }}
                                    ></textarea>
                                    <button 
                                        type="submit" 
                                        disabled={sendingReply || !reply.trim()}
                                        style={{ 
                                            position: 'absolute', 
                                            right: '12px', 
                                            bottom: '12px', 
                                            width: '40px', 
                                            height: '40px', 
                                            borderRadius: '50%', 
                                            background: 'var(--primary)', 
                                            color: 'white', 
                                            border: 'none', 
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 10px rgba(37, 99, 235, 0.3)',
                                            opacity: sendingReply || !reply.trim() ? 0.5 : 1
                                        }}
                                    >
                                        <PaperPlaneTilt size={20} weight="fill" />
                                    </button>
                                </form>
                                <p className="hide-mobile" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.8rem', textAlign: 'right' }}>
                                    Press Enter to send (Shift + Enter for new line)
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .ticket-card:hover { border-color: var(--primary) !important; transform: translateY(-4px); box-shadow: 0 12px 24px rgba(0,0,0,0.1); }
                textarea:focus { border-color: var(--primary) !important; }
                @media (max-width: 768px) {
                    .hide-mobile { display: none !important; }
                }
            `}</style>
        </main>
    );
};

export default MyTickets;
