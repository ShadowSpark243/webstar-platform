import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import {
      MessageCircle, Send, Loader2, Clock, CheckCircle, XCircle,
      AlertCircle, Headphones, Users, Filter, RefreshCw, User
} from 'lucide-react';

const STATUS_CONFIG = {
      OPEN: { label: 'Open', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
      IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
      CLOSED: { label: 'Closed', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)' },
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

const AdminSupport = () => {
      const [tickets, setTickets] = useState([]);
      const [filter, setFilter] = useState('ALL');
      const [selectedTicket, setSelectedTicket] = useState(null);
      const [messages, setMessages] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [isSending, setIsSending] = useState(false);
      const [isUpdating, setIsUpdating] = useState(false);
      const [replyText, setReplyText] = useState('');
      const [error, setError] = useState('');
      const messagesEndRef = useRef(null);
      const pollRef = useRef(null);

      // ── Fetch All Tickets ─────────────────────────────────────────────────────
      const fetchTickets = useCallback(async () => {
            try {
                  const params = filter !== 'ALL' ? `?status=${filter}` : '';
                  const res = await api.get(`/chat/admin/tickets${params}`);
                  if (res.data.success) setTickets(res.data.tickets);
            } catch { /* silent */ }
            setIsLoading(false);
      }, [filter]);

      useEffect(() => { fetchTickets(); }, [fetchTickets]);

      // ── Fetch Messages for selected ticket ───────────────────────────────────
      const fetchMessages = useCallback(async (ticketId) => {
            try {
                  const res = await api.get(`/chat/admin/tickets/${ticketId}/messages`);
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
                  pollRef.current = setInterval(() => fetchMessages(selectedTicket.id), 8000);
            }
            return () => clearInterval(pollRef.current);
      }, [selectedTicket?.id, fetchMessages]);

      // Auto-scroll
      useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

      // ── Handlers ─────────────────────────────────────────────────────────────
      const handleSelectTicket = (ticket) => {
            setSelectedTicket(ticket);
            setReplyText('');
            setError('');
      };

      const handleReply = async (e) => {
            e.preventDefault();
            if (!replyText.trim() || isSending) return;
            setIsSending(true);
            setError('');
            try {
                  await api.post(`/chat/admin/tickets/${selectedTicket.id}/messages`, { message: replyText.trim() });
                  setReplyText('');
                  await fetchMessages(selectedTicket.id);
                  fetchTickets();
            } catch (err) {
                  setError(err.response?.data?.message || 'Failed to send reply.');
            }
            setIsSending(false);
      };

      const handleStatusChange = async (newStatus) => {
            if (isUpdating || selectedTicket.status === newStatus) return;
            setIsUpdating(true);
            try {
                  await api.put(`/chat/admin/tickets/${selectedTicket.id}/status`, { status: newStatus });
                  setSelectedTicket(prev => ({ ...prev, status: newStatus }));
                  fetchTickets();
            } catch (err) {
                  setError('Failed to update status.');
            }
            setIsUpdating(false);
      };

      const filteredTickets = filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter);

      const openCount = tickets.filter(t => t.status === 'OPEN').length;
      const inProgressCount = tickets.filter(t => t.status === 'IN_PROGRESS').length;

      return (
            <div>
                  <h1 className="admin-page-title">Support Center</h1>
                  <p className="admin-page-subtitle">Manage user support tickets and respond to queries.</p>

                  {/* Stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        {[
                              { label: 'Total Tickets', value: tickets.length, color: '#8b5cf6', icon: <MessageCircle size={20} /> },
                              { label: 'Open', value: openCount, color: '#f59e0b', icon: <Clock size={20} /> },
                              { label: 'In Progress', value: inProgressCount, color: '#3b82f6', icon: <RefreshCw size={20} /> },
                              { label: 'Closed', value: tickets.filter(t => t.status === 'CLOSED').length, color: '#6b7280', icon: <CheckCircle size={20} /> },
                        ].map(s => (
                              <div key={s.label} style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem', padding: '1rem 1.25rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ color: s.color, background: `${s.color}18`, padding: '0.5rem', borderRadius: '0.6rem', flexShrink: 0 }}>{s.icon}</div>
                                    <div>
                                          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{s.value}</div>
                                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{s.label}</div>
                                    </div>
                              </div>
                        ))}
                  </div>

                  {/* Main Layout */}
                  <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem', height: 'calc(100vh - 340px)', minHeight: '500px' }}>

                        {/* Left: Ticket List */}
                        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                              {/* Filter */}
                              <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'].map(f => (
                                          <button
                                                key={f}
                                                onClick={() => setFilter(f)}
                                                style={{
                                                      padding: '0.3rem 0.75rem',
                                                      borderRadius: '2rem',
                                                      border: '1px solid',
                                                      cursor: 'pointer',
                                                      fontSize: '0.78rem',
                                                      fontWeight: 600,
                                                      transition: 'all 0.15s',
                                                      background: filter === f ? (f === 'ALL' ? 'rgba(139,92,246,0.2)' : STATUS_CONFIG[f]?.bg || 'rgba(139,92,246,0.2)') : 'rgba(255,255,255,0.03)',
                                                      color: filter === f ? (f === 'ALL' ? '#8b5cf6' : STATUS_CONFIG[f]?.color || '#8b5cf6') : 'rgba(255,255,255,0.5)',
                                                      borderColor: filter === f ? (f === 'ALL' ? 'rgba(139,92,246,0.4)' : STATUS_CONFIG[f]?.border || 'rgba(139,92,246,0.4)') : 'rgba(255,255,255,0.08)',
                                                }}
                                          >
                                                {f === 'ALL' ? 'All' : f === 'IN_PROGRESS' ? 'In Progress' : f.charAt(0) + f.slice(1).toLowerCase()}
                                                {f !== 'ALL' && ` (${tickets.filter(t => t.status === f).length})`}
                                          </button>
                                    ))}
                              </div>

                              {/* List */}
                              <div style={{ flex: 1, overflowY: 'auto', padding: '0.4rem' }}>
                                    {isLoading ? (
                                          [1, 2, 3, 4].map(i => <div key={i} style={{ height: '72px', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem', marginBottom: '0.4rem', animation: 'pulse 1.5s ease-in-out infinite' }} />)
                                    ) : filteredTickets.length === 0 ? (
                                          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.3)' }}>
                                                <MessageCircle size={32} style={{ margin: '0 auto 0.75rem' }} />
                                                <p style={{ margin: 0, fontSize: '0.9rem' }}>No tickets in this category.</p>
                                          </div>
                                    ) : (
                                          filteredTickets.map(ticket => {
                                                const sc = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.OPEN;
                                                const isActive = selectedTicket?.id === ticket.id;
                                                const lastMsg = ticket.messages?.[0];
                                                return (
                                                      <button
                                                            key={ticket.id}
                                                            onClick={() => handleSelectTicket(ticket)}
                                                            style={{
                                                                  width: '100%', textAlign: 'left', background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
                                                                  border: `1px solid ${isActive ? 'rgba(59,130,246,0.25)' : 'transparent'}`,
                                                                  borderRadius: '0.85rem', padding: '0.85rem', cursor: 'pointer',
                                                                  transition: 'all 0.15s', marginBottom: '0.3rem', color: 'white',
                                                            }}
                                                            onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                                            onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                                                      >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                                                                  <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }} title={ticket.subject}>{ticket.subject}</span>
                                                                  <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '2rem', background: sc.bg, color: sc.color, fontWeight: 600, flexShrink: 0 }}>{sc.label}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                                                                  <User size={11} style={{ color: 'rgba(255,255,255,0.4)' }} />
                                                                  <span style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 500 }}>{ticket.user?.fullName}</span>
                                                                  <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>@{ticket.user?.username}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                                  <span style={{ fontSize: '0.77rem', color: 'rgba(255,255,255,0.35)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lastMsg ? lastMsg.message.slice(0, 48) + (lastMsg.message.length > 48 ? '…' : '') : 'No messages'}</span>
                                                                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', flexShrink: 0, marginLeft: '0.5rem' }}>{timeAgo(ticket.updatedAt)}</span>
                                                            </div>
                                                      </button>
                                                );
                                          })
                                    )}
                              </div>
                        </div>

                        {/* Right: Chat Thread */}
                        {selectedTicket ? (
                              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    {/* Header */}
                                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.15)', flexShrink: 0 }}>
                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                                                <div style={{ flex: 1 }}>
                                                      <h3 style={{ margin: '0 0 0.25rem', fontSize: '1rem', color: 'white', fontWeight: 700 }}>{selectedTicket.subject}</h3>
                                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', flexWrap: 'wrap' }}>
                                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={13} />{selectedTicket.user?.fullName} ({selectedTicket.user?.email})</span>
                                                            <span>Ticket #{selectedTicket.id}</span>
                                                            <span>{new Date(selectedTicket.createdAt).toLocaleDateString('en-IN')}</span>
                                                      </div>
                                                </div>
                                                {/* Status Control */}
                                                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                                                      {['OPEN', 'IN_PROGRESS', 'CLOSED'].map(s => {
                                                            const sc = STATUS_CONFIG[s];
                                                            const isActive = selectedTicket.status === s;
                                                            return (
                                                                  <button key={s} onClick={() => handleStatusChange(s)} disabled={isUpdating}
                                                                        style={{
                                                                              padding: '0.35rem 0.75rem', borderRadius: '2rem', border: '1px solid',
                                                                              cursor: isUpdating ? 'not-allowed' : 'pointer', fontSize: '0.75rem', fontWeight: 700,
                                                                              transition: 'all 0.15s', opacity: isUpdating ? 0.6 : 1,
                                                                              background: isActive ? sc.bg : 'rgba(255,255,255,0.03)',
                                                                              color: isActive ? sc.color : 'rgba(255,255,255,0.4)',
                                                                              borderColor: isActive ? sc.border : 'rgba(255,255,255,0.08)',
                                                                        }}
                                                                  >
                                                                        {isUpdating && isActive ? <><Loader2 size={12} style={{ display: 'inline', marginRight: '0.2rem' }} />...</> : (s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase())}
                                                                  </button>
                                                            );
                                                      })}
                                                </div>
                                          </div>
                                    </div>

                                    {/* Messages */}
                                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                          {messages.length === 0 ? (
                                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>
                                                      <Headphones size={32} /><p style={{ margin: 0, fontSize: '0.88rem' }}>No messages yet. Start the conversation.</p>
                                                </div>
                                          ) : messages.map(msg => {
                                                const isAdmin = msg.senderRole === 'ADMIN';
                                                return (
                                                      <div key={msg.id} style={{ display: 'flex', alignItems: 'flex-end', gap: '0.7rem', flexDirection: isAdmin ? 'row-reverse' : 'row', animation: 'fadeInUp 0.25s ease' }}>
                                                            <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, background: isAdmin ? 'linear-gradient(135deg, #8b5cf6, #3b82f6)' : 'linear-gradient(135deg, #10b981, #3b82f6)', color: 'white' }}>
                                                                  {isAdmin ? <Headphones size={14} /> : (selectedTicket.user?.fullName?.[0]?.toUpperCase() || 'U')}
                                                            </div>
                                                            <div style={{ maxWidth: '68%', padding: '0.7rem 1rem', borderRadius: '1rem', position: 'relative', borderBottomRightRadius: isAdmin ? '0.25rem' : '1rem', borderBottomLeftRadius: isAdmin ? '1rem' : '0.25rem', background: isAdmin ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${isAdmin ? 'rgba(139,92,246,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                                                                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: isAdmin ? '#8b5cf6' : '#10b981', marginBottom: '0.3rem' }}>{isAdmin ? '🛡️ Support Team' : selectedTicket.user?.fullName}</div>
                                                                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.55, wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                                                                  <span style={{ display: 'block', fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.3rem', textAlign: isAdmin ? 'left' : 'right' }}>{timeAgo(msg.createdAt)}</span>
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                          <div ref={messagesEndRef} />
                                    </div>

                                    {/* Reply Box */}
                                    {selectedTicket.status === 'CLOSED' ? (
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '1rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(107,114,128,0.08)', color: '#6b7280', fontSize: '0.85rem', flexShrink: 0 }}>
                                                <XCircle size={16} /> Ticket is closed.
                                          </div>
                                    ) : (
                                          <form onSubmit={handleReply} style={{ borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.1)', flexShrink: 0, padding: '0.75rem 1rem 0' }}>
                                                {error && (
                                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: '0.6rem', padding: '0.5rem 0.75rem', fontSize: '0.82rem', marginBottom: '0.5rem' }}>
                                                            <AlertCircle size={14} />{error}
                                                      </div>
                                                )}
                                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.6rem', background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.2)', borderRadius: '0.85rem', padding: '0.6rem 0.75rem', transition: 'border-color 0.2s' }}>
                                                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginBottom: '0.1rem' }}>
                                                            <Headphones size={12} style={{ color: 'white' }} />
                                                      </div>
                                                      <textarea
                                                            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: '0.9rem', lineHeight: 1.5, resize: 'none', maxHeight: '120px', overflowY: 'auto', fontFamily: 'inherit' }}
                                                            placeholder="Type your admin reply..."
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                            maxLength={2000}
                                                            rows={1}
                                                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleReply(e); } }}
                                                      />
                                                      <button type="submit" disabled={!replyText.trim() || isSending}
                                                            style={{ background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', border: 'none', borderRadius: '0.6rem', color: 'white', padding: '0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s', opacity: (!replyText.trim() || isSending) ? 0.4 : 1, flexShrink: 0 }}
                                                      >
                                                            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                      </button>
                                                </div>
                                                <div style={{ textAlign: 'right', fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)', padding: '0.2rem 0.5rem 0.5rem' }}>{replyText.length}/2000 · Enter to send</div>
                                          </form>
                                    )}
                              </div>
                        ) : (
                              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div style={{ textAlign: 'center', maxWidth: '300px', padding: '2rem', color: 'rgba(255,255,255,0.4)' }}>
                                          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem', color: '#8b5cf6' }}>
                                                <Headphones size={32} />
                                          </div>
                                          <h3 style={{ color: 'white', margin: '0 0 0.5rem', fontSize: '1.1rem' }}>Select a Ticket</h3>
                                          <p style={{ margin: 0, fontSize: '0.85rem', lineHeight: 1.6 }}>Choose a ticket from the list to view the conversation and reply.</p>
                                    </div>
                              </div>
                        )}
                  </div>
            </div>
      );
};

export default AdminSupport;
