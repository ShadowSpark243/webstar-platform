import React, { useState, useEffect, useRef, useCallback } from 'react';
import api from '../../utils/api';
import {
      MessageCircle, Send, Loader2, Clock, CheckCircle, XCircle,
      AlertCircle, Headphones, Users, Filter, RefreshCw, User, ChevronLeft, Search
} from 'lucide-react';

const STATUS_CONFIG = {
      OPEN: { label: 'Open', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
      IN_PROGRESS: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.3)' },
      CLOSED: { label: 'Closed', color: '#6b7280', bg: 'rgba(107,114,128,0.12)', border: 'rgba(107,114,128,0.3)' },
};

const timeAgo = (dateStr) => {
      const diff = Date.now() - new Date(dateStr).getTime();
      const m = Math.floor(diff / 60000);
      if (m < 1) return 'now';
      if (m < 60) return `${m}m`;
      const h = Math.floor(m / 60);
      if (h < 24) return `${h}h`;
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
      const [searchQuery, setSearchQuery] = useState('');
      const messagesEndRef = useRef(null);
      const pollRef = useRef(null);

      const fetchTickets = useCallback(async () => {
            try {
                  const params = filter !== 'ALL' ? `?status=${filter}` : '';
                  const res = await api.get(`/chat/admin/tickets${params}`);
                  if (res.data.success) setTickets(res.data.tickets || []);
            } catch { /* silent */ }
            setIsLoading(false);
      }, [filter]);

      useEffect(() => { fetchTickets(); }, [fetchTickets]);

      const fetchMessages = useCallback(async (ticketId) => {
            try {
                  const res = await api.get(`/chat/admin/tickets/${ticketId}/messages`);
                  if (res.data.success) {
                        setSelectedTicket(res.data.ticket);
                        setMessages(res.data.ticket.messages || []);
                  }
            } catch { /* silent */ }
      }, []);

      useEffect(() => {
            if (!selectedTicket) { clearInterval(pollRef.current); return; }
            fetchMessages(selectedTicket.id);
            if (selectedTicket.status !== 'CLOSED') {
                  pollRef.current = setInterval(() => fetchMessages(selectedTicket.id), 10000);
            }
            return () => clearInterval(pollRef.current);
      }, [selectedTicket?.id, fetchMessages]);

      useEffect(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

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
                  setError(err.response?.data?.message || 'Failed to send.');
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
                  setError('Failed to update.');
            }
            setIsUpdating(false);
      };

      const filteredTickets = (filter === 'ALL' ? tickets : tickets.filter(t => t.status === filter))
            .filter(t => t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || t.user?.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

      return (
            <div className="fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
                  <header style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
                        <h1 className="admin-page-title">Support Desk</h1>
                        <p className="admin-page-subtitle">Platform integrity and user relay system.</p>
                  </header>

                  <div style={{ flex: 1, display: 'grid', gridTemplateColumns: selectedTicket ? '320px 1fr' : '1fr', gap: '1.5rem', overflow: 'hidden' }}>

                        {/* Ticket Sidebar */}
                        <div className={`glass-panel ${(selectedTicket && window.innerWidth < 1024) ? 'mobile-hide' : ''}`} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                              <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div className="search-wrapper" style={{ marginBottom: '1rem' }}>
                                          <Search size={16} className="search-icon" />
                                          <input type="text" placeholder="Filter tickets..." className="admin-search-input" style={{ width: '100%' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }} className="no-scrollbar">
                                          {['ALL', 'OPEN', 'IN_PROGRESS', 'CLOSED'].map(f => (
                                                <button
                                                      key={f}
                                                      onClick={() => setFilter(f)}
                                                      style={{ padding: '0.3rem 0.7rem', borderRadius: '0.5rem', background: filter === f ? 'rgba(139, 92, 246, 0.15)' : 'rgba(255,255,255,0.05)', color: filter === f ? '#a78bfa' : 'rgba(255,255,255,0.4)', border: 'none', fontSize: '0.7rem', fontWeight: 800, cursor: 'pointer', whiteSpace: 'nowrap' }}
                                                >
                                                      {f === 'IN_PROGRESS' ? 'Active' : f.charAt(0) + f.slice(1).toLowerCase()}
                                                </button>
                                          ))}
                                    </div>
                              </div>

                              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }} className="no-scrollbar">
                                    {isLoading ? (
                                          <div style={{ padding: '2rem', textAlign: 'center' }}><Loader2 size={24} className="animate-spin" style={{ color: 'rgba(255,255,255,0.2)' }} /></div>
                                    ) : filteredTickets.length === 0 ? (
                                          <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '0.8rem' }}>No matching streams.</div>
                                    ) : (
                                          filteredTickets.map(t => {
                                                const isActive = selectedTicket?.id === t.id;
                                                const sc = STATUS_CONFIG[t.status];
                                                return (
                                                      <div
                                                            key={t.id}
                                                            onClick={() => setSelectedTicket(t)}
                                                            style={{ padding: '1rem', borderRadius: '0.85rem', background: isActive ? 'rgba(139, 92, 246, 0.1)' : 'transparent', border: isActive ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid transparent', cursor: 'pointer', marginBottom: '0.5rem', transition: 'all 0.2s' }}
                                                      >
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                                  <span style={{ fontWeight: 800, color: 'white', fontSize: '0.85rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</span>
                                                                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: sc.color, marginTop: '4px' }} />
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>@{t.user?.username}</span>
                                                                  <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.2)' }}>{timeAgo(t.updatedAt)}</span>
                                                            </div>
                                                      </div>
                                                );
                                          })
                                    )}
                              </div>
                        </div>

                        {/* Chat Interface */}
                        {selectedTicket ? (
                              <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
                                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.1)' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                {window.innerWidth < 1024 && <button onClick={() => setSelectedTicket(null)} style={{ background: 'transparent', border: 'none', color: 'white' }}><ChevronLeft size={20} /></button>}
                                                <div>
                                                      <div style={{ fontWeight: 800, color: 'white' }}>{selectedTicket.subject}</div>
                                                      <div style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 600 }}>Thread for {selectedTicket.user?.fullName}</div>
                                                </div>
                                          </div>
                                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {['OPEN', 'IN_PROGRESS', 'CLOSED'].map(s => (
                                                      <button
                                                            key={s}
                                                            onClick={() => handleStatusChange(s)}
                                                            disabled={isUpdating}
                                                            style={{ padding: '0.35rem 0.6rem', borderRadius: '0.4rem', background: selectedTicket.status === s ? STATUS_CONFIG[s].bg : 'rgba(255,255,255,0.05)', color: selectedTicket.status === s ? STATUS_CONFIG[s].color : 'rgba(255,255,255,0.3)', border: 'none', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer' }}
                                                      >
                                                            {s === 'IN_PROGRESS' ? 'Active' : s.charAt(0) + s.slice(1).toLowerCase()}
                                                      </button>
                                                ))}
                                          </div>
                                    </div>

                                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="no-scrollbar">
                                          {messages.map((m, i) => {
                                                const isAdmin = m.senderRole === 'ADMIN';
                                                return (
                                                      <div key={i} style={{ alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                                                            <div style={{ background: isAdmin ? 'rgba(139, 92, 246, 0.1)' : 'rgba(255,255,255,0.03)', padding: '0.75rem 1rem', borderRadius: '1rem', border: isAdmin ? '1px solid rgba(139, 92, 246, 0.2)' : '1px solid rgba(255,255,255,0.05)', borderBottomRightRadius: isAdmin ? '0.2rem' : '1rem', borderBottomLeftRadius: isAdmin ? '1rem' : '0.2rem' }}>
                                                                  <div style={{ fontSize: '0.85rem', color: 'white', lineHeight: 1.5 }}>{m.message}</div>
                                                                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.4rem', textAlign: isAdmin ? 'right' : 'left' }}>{timeAgo(m.createdAt)}</div>
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                          <div ref={messagesEndRef} />
                                    </div>

                                    {selectedTicket.status !== 'CLOSED' ? (
                                          <form onSubmit={handleReply} style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.1)' }}>
                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                      <input
                                                            className="admin-search-input"
                                                            style={{ flex: 1, paddingLeft: '1rem' }}
                                                            placeholder="Dispatch reply..."
                                                            value={replyText}
                                                            onChange={e => setReplyText(e.target.value)}
                                                      />
                                                      <button type="submit" disabled={isSending || !replyText.trim()} style={{ padding: '0.75rem', borderRadius: '0.75rem', background: '#8b5cf6', color: 'white', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                                      </button>
                                                </div>
                                          </form>
                                    ) : (
                                          <div style={{ padding: '1.25rem', textAlign: 'center', background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', fontSize: '0.8rem', fontWeight: 700 }}>This transmission is archived.</div>
                                    )}
                              </div>
                        ) : (
                              <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
                                    <div style={{ textAlign: 'center' }}>
                                          <Headphones size={48} style={{ margin: '0 auto 1rem auto', color: '#8b5cf6' }} />
                                          <p>Establish a ticket link to begin.</p>
                                    </div>
                              </div>
                        )}

                  </div>
            </div>
      );
};

export default AdminSupport;
