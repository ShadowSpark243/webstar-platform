import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
      MessageCircle, Plus, Send, Loader2, Clock, CheckCircle,
      XCircle, AlertCircle, ChevronRight, ArrowLeft, Headphones, Lock
} from 'lucide-react';
import './SupportPage.css';

const STATUS_CONFIG = {
      OPEN: { label: 'Open', color: '#10b981', bg: 'rgba(16,185,129,0.12)', icon: <MessageCircle size={12} /> },
      IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', icon: <Clock size={12} /> },
      CLOSED: { label: 'Closed', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', icon: <CheckCircle size={12} /> },
};

const timeAgo = (dateStr) => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return 'just now';
      if (m < 60) return `${m}m ago`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h ago`;
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const SupportPage = () => {
      const { user } = useAuth();
      const [tickets, setTickets] = useState([]);
      const [selectedTicket, setSelectedTicket] = useState(null);
      const [messages, setMessages] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [isSending, setIsSending] = useState(false);
      const [msgText, setMsgText] = useState('');
      const [showNewTicket, setShowNewTicket] = useState(false);
      const [newSubject, setNewSubject] = useState('');
      const [newMessage, setNewMessage] = useState('');
      const [isCreating, setIsCreating] = useState(false);
      const [error, setError] = useState('');
      const messagesEndRef = useRef(null);
      const pollRef = useRef(null);

      // ── Fetch Tickets ──────────────────────────────────────────────────────────
      const fetchTickets = useCallback(async () => {
            try {
                  const res = await api.get('/chat/tickets');
                  if (res.data.success) setTickets(res.data.tickets);
            } catch { /* silent */ }
            setIsLoading(false);
      }, []);

      useEffect(() => { fetchTickets(); }, [fetchTickets]);

      // ── Fetch Messages & Poll ─────────────────────────────────────────────────
      const fetchMessages = useCallback(async (ticketId) => {
            try {
                  const res = await api.get(`/chat/tickets/${ticketId}/messages`);
                  if (res.data.success) {
                        setSelectedTicket(res.data.ticket);
                        setMessages(res.data.ticket.messages);
                  }
            } catch { /* silent */ }
      }, []);

      useEffect(() => {
            if (!selectedTicket) { clearInterval(pollRef.current); return; }
            fetchMessages(selectedTicket.id);
            if (selectedTicket.status !== 'CLOSED') {
                  pollRef.current = setInterval(() => fetchMessages(selectedTicket.id), 5000);
            }
            return () => clearInterval(pollRef.current);
      }, [selectedTicket?.id, fetchMessages]);

      // Auto-scroll
      useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

      // ── Handlers ───────────────────────────────────────────────────────────────
      const handleSelectTicket = (ticket) => {
            setSelectedTicket(ticket);
            setMsgText('');
            setError('');
      };

      const handleBack = () => {
            setSelectedTicket(null);
            clearInterval(pollRef.current);
            fetchTickets();
      };

      const handleSend = async (e) => {
            e.preventDefault();
            if (!msgText.trim() || isSending) return;
            if (selectedTicket.status === 'CLOSED') return;
            setIsSending(true);
            setError('');
            try {
                  await api.post(`/chat/tickets/${selectedTicket.id}/messages`, { message: msgText.trim() });
                  setMsgText('');
                  await fetchMessages(selectedTicket.id);
            } catch (err) {
                  setError(err.response?.data?.message || 'Failed to send message.');
            }
            setIsSending(false);
      };

      const handleCreateTicket = async (e) => {
            e.preventDefault();
            if (!newSubject.trim() || !newMessage.trim()) return;
            setIsCreating(true);
            setError('');
            try {
                  const res = await api.post('/chat/tickets', { subject: newSubject.trim(), message: newMessage.trim() });
                  if (res.data.success) {
                        setShowNewTicket(false);
                        setNewSubject('');
                        setNewMessage('');
                        await fetchTickets();
                        setSelectedTicket(res.data.ticket);
                  }
            } catch (err) {
                  setError(err.response?.data?.message || 'Failed to create ticket.');
            }
            setIsCreating(false);
      };

      // ── Render ─────────────────────────────────────────────────────────────────
      return (
            <div className="dashboard-page">
                  <header className="page-header">
                        <div>
                              <h1 className="page-title">Support Center</h1>
                              <p className="page-subtitle">Get help from our team. We typically respond within 24 hours.</p>
                        </div>
                        {!selectedTicket && (
                              <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.25rem' }} onClick={() => { setShowNewTicket(true); setError(''); }}>
                                    <Plus size={18} /> New Ticket
                              </button>
                        )}
                  </header>

                  {/* ── New Ticket Modal ── */}
                  {showNewTicket && (
                        <div className="sp-modal-overlay" onClick={() => setShowNewTicket(false)}>
                              <div className="sp-modal glass-panel" onClick={(e) => e.stopPropagation()}>
                                    <div className="sp-modal-accent" />
                                    <div style={{ padding: '1.5rem 2rem' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                                <Headphones className="text-primary" size={22} />
                                                <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Open a Support Ticket</h2>
                                          </div>
                                          {error && <div className="sp-error"><AlertCircle size={16} />{error}</div>}
                                          <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                <div>
                                                      <label className="sp-label">Subject</label>
                                                      <input
                                                            className="sp-input"
                                                            placeholder="Brief description of your issue..."
                                                            maxLength={150}
                                                            value={newSubject}
                                                            onChange={(e) => setNewSubject(e.target.value)}
                                                            required
                                                            autoFocus
                                                      />
                                                </div>
                                                <div>
                                                      <label className="sp-label">Message</label>
                                                      <textarea
                                                            className="sp-input"
                                                            placeholder="Describe your issue in detail..."
                                                            rows={5}
                                                            maxLength={2000}
                                                            value={newMessage}
                                                            onChange={(e) => setNewMessage(e.target.value)}
                                                            required
                                                            style={{ resize: 'vertical', minHeight: '120px' }}
                                                      />
                                                      <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.25rem' }}>{newMessage.length}/2000</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                      <button type="button" className="btn btn-outline" style={{ padding: '0.6rem 1.2rem', color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.15)' }} onClick={() => setShowNewTicket(false)}>Cancel</button>
                                                      <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 1.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }} disabled={isCreating}>
                                                            {isCreating ? <><Loader2 size={16} className="animate-spin" /> Creating...</> : <><Send size={16} /> Submit Ticket</>}
                                                      </button>
                                                </div>
                                          </form>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* ── Main Chat Layout ── */}
                  <div className="sp-layout">
                        {/* Left: Ticket List */}
                        <div className={`sp-sidebar ${selectedTicket ? 'sp-sidebar--hidden-mobile' : ''}`}>
                              <div className="sp-sidebar-header">
                                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Your Tickets</span>
                                    <span className="sp-count-badge">{tickets.length}</span>
                              </div>

                              {isLoading ? (
                                    <div className="sp-loading">{[1, 2, 3].map(i => <div key={i} className="sp-skel" />)}</div>
                              ) : tickets.length === 0 ? (
                                    <div className="sp-empty">
                                          <MessageCircle size={36} style={{ color: 'rgba(255,255,255,0.15)', marginBottom: '1rem' }} />
                                          <p>No tickets yet.</p>
                                          <span>Click "New Ticket" to get started.</span>
                                    </div>
                              ) : (
                                    <div className="sp-ticket-list">
                                          {tickets.map(ticket => {
                                                const sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                                                const lastMsg = ticket.messages?.[0];
                                                const isActive = selectedTicket?.id === ticket.id;
                                                return (
                                                      <button key={ticket.id} className={`sp-ticket-item ${isActive ? 'sp-ticket-item--active' : ''}`} onClick={() => handleSelectTicket(ticket)}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                                                                  <span className="sp-ticket-subject" title={ticket.subject}>{ticket.subject}</span>
                                                                  <span className="sp-status-badge" style={{ background: sc.bg, color: sc.color, flexShrink: 0 }}>
                                                                        {sc.icon} {sc.label}
                                                                  </span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                  <span className="sp-ticket-preview">{lastMsg ? lastMsg.message.slice(0, 55) + (lastMsg.message.length > 55 ? '…' : '') : 'No messages yet'}</span>
                                                                  <span className="sp-ticket-time">{timeAgo(ticket.updatedAt)}</span>
                                                            </div>
                                                      </button>
                                                );
                                          })}
                                    </div>
                              )}
                        </div>

                        {/* Right: Chat Thread */}
                        {selectedTicket ? (
                              <div className="sp-chat">
                                    {/* Chat Header */}
                                    <div className="sp-chat-header">
                                          <button className="sp-back-btn" onClick={handleBack}><ArrowLeft size={18} /></button>
                                          <div style={{ flex: 1 }}>
                                                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: 'white' }}>{selectedTicket.subject}</h3>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.2rem' }}>
                                                      {(() => { const sc = STATUS_CONFIG[selectedTicket.status] || STATUS_CONFIG.OPEN; return <span className="sp-status-badge" style={{ background: sc.bg, color: sc.color, fontSize: '0.7rem' }}>{sc.icon}{sc.label}</span>; })()}
                                                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>Ticket #{selectedTicket.id}</span>
                                                </div>
                                          </div>
                                          {selectedTicket.status === 'CLOSED' && (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#6b7280' }}>
                                                      <Lock size={14} /> Closed
                                                </div>
                                          )}
                                    </div>

                                    {/* Messages */}
                                    <div className="sp-messages">
                                          {messages.length === 0 ? (
                                                <div className="sp-msg-empty"><Headphones size={32} /><p>Your ticket has been created. Our team will respond shortly.</p></div>
                                          ) : (
                                                messages.map(msg => {
                                                      const isMe = msg.senderRole === 'USER';
                                                      return (
                                                            <div key={msg.id} className={`sp-msg ${isMe ? 'sp-msg--user' : 'sp-msg--admin'}`}>
                                                                  {!isMe && (
                                                                        <div className="sp-msg-avatar admin">
                                                                              <Headphones size={14} />
                                                                        </div>
                                                                  )}
                                                                  <div className={`sp-bubble ${isMe ? 'sp-bubble--user' : 'sp-bubble--admin'}`}>
                                                                        {!isMe && <div className="sp-msg-sender">Support Team</div>}
                                                                        <p>{msg.message}</p>
                                                                        <span className="sp-msg-time">{timeAgo(msg.createdAt)}</span>
                                                                  </div>
                                                                  {isMe && (
                                                                        <div className="sp-msg-avatar user">
                                                                              {user?.fullName?.[0]?.toUpperCase() || 'U'}
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      );
                                                })
                                          )}
                                          <div ref={messagesEndRef} />
                                    </div>

                                    {/* Compose Box */}
                                    {selectedTicket.status === 'CLOSED' ? (
                                          <div className="sp-closed-bar">
                                                <XCircle size={16} />
                                                <span>This ticket is closed. Open a new ticket if you need further assistance.</span>
                                          </div>
                                    ) : (
                                          <form className="sp-compose" onSubmit={handleSend}>
                                                {error && <div className="sp-error" style={{ margin: '0 1rem 0.5rem' }}><AlertCircle size={14} />{error}</div>}
                                                <div className="sp-compose-inner">
                                                      <textarea
                                                            className="sp-compose-input"
                                                            placeholder="Type your message..."
                                                            value={msgText}
                                                            onChange={(e) => setMsgText(e.target.value)}
                                                            maxLength={2000}
                                                            rows={1}
                                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                                                      />
                                                      <button type="submit" className="sp-send-btn" disabled={!msgText.trim() || isSending}>
                                                            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                      </button>
                                                </div>
                                                <div style={{ textAlign: 'right', fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', padding: '0.25rem 1rem 0.5rem' }}>
                                                      {msgText.length}/2000 · Enter to send · Shift+Enter for new line
                                                </div>
                                          </form>
                                    )}
                              </div>
                        ) : (
                              <div className="sp-chat-placeholder">
                                    <div className="sp-placeholder-inner">
                                          <div className="sp-placeholder-icon"><MessageCircle size={40} /></div>
                                          <h3>Select a Ticket</h3>
                                          <p>Choose a ticket from the list or create a new one to start chatting with our support team.</p>
                                          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }} onClick={() => setShowNewTicket(true)}>
                                                <Plus size={16} /> New Ticket
                                          </button>
                                    </div>
                              </div>
                        )}
                  </div>
            </div>
      );
};

export default SupportPage;
