import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Users, Search, ChevronRight, UserCheck, ShieldCheck, Mail, Calendar, Wallet } from 'lucide-react';
import UserDetailsModal from '../../components/UserDetailsModal';

const AdminUsers = () => {
      const [userList, setUserList] = useState([]);
      const [loading, setLoading] = useState(true);
      const [searchQuery, setSearchQuery] = useState('');
      const [selectedUserId, setSelectedUserId] = useState(null);

      const fetchUsers = async () => {
            setLoading(true);
            try {
                  const res = await api.get('/admin/users');
                  setUserList(res.data.users || []);
            } catch (error) {
                  console.error("Failed to fetch user directory:", error);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchUsers();
      }, []);

      const filteredUsers = userList.filter(u =>
            (u.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(u.id).includes(searchQuery)
      );

      const getStatusBadge = (status) => {
            switch (status) {
                  case 'ACTIVE': return 'badge-success';
                  case 'INACTIVE': return 'badge-warning';
                  case 'BANNED': return 'badge-danger';
                  default: return 'badge-primary';
            }
      };

      const getKycBadge = (status) => {
            switch (status) {
                  case 'VERIFIED': return 'badge-success';
                  case 'PENDING': return 'badge-warning';
                  case 'REJECTED': return 'badge-danger';
                  default: return 'badge-primary';
            }
      };

      return (
            <div className="fade-in">
                  <header style={{ marginBottom: '2rem' }}>
                        <h1 className="admin-page-title">User Directory</h1>
                        <p className="admin-page-subtitle">Deep management and status tracking for all registered users.</p>
                  </header>

                  <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.1rem', color: 'white' }}>
                                    <Users size={20} style={{ color: '#8b5cf6' }} /> Accounts <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>({userList.length})</span>
                              </h2>
                              <div className="search-wrapper">
                                    <Search size={18} className="search-icon" />
                                    <input
                                          type="text"
                                          placeholder="Search name, email or ID..."
                                          className="admin-search-input"
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                              </div>
                        </div>

                        {loading ? (
                              <div style={{ padding: '4rem', textAlign: 'center' }}>
                                    <div className="animate-spin" style={{ display: 'inline-block', width: '2rem', height: '2rem', border: '3px solid rgba(139, 92, 246, 0.2)', borderTopColor: '#8b5cf6', borderRadius: '50%' }}></div>
                                    <p style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Accessing directory database...</p>
                              </div>
                        ) : (
                              <>
                                    {/* Desktop Table */}
                                    <div className="table-container mobile-hide" style={{ border: 'none', borderRadius: 0 }}>
                                          <table className="admin-table">
                                                <thead>
                                                      <tr>
                                                            <th>User Profile</th>
                                                            <th>Contact & ID</th>
                                                            <th>Network Path</th>
                                                            <th>Status</th>
                                                            <th>Verification</th>
                                                            <th style={{ textAlign: 'right' }}>Capitalization</th>
                                                      </tr>
                                                </thead>
                                                <tbody>
                                                      {filteredUsers.length === 0 ? (
                                                            <tr>
                                                                  <td colSpan="6" style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                                                        No user records aligned with "{searchQuery}"
                                                                  </td>
                                                            </tr>
                                                      ) : (
                                                            filteredUsers.map((u) => (
                                                                  <tr key={u.id} className="clickable-row" onClick={() => setSelectedUserId(u.id)}>
                                                                        <td>
                                                                              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', fontWeight: 700, fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)' }}>
                                                                                          {(u.fullName || 'U').charAt(0)}
                                                                                    </div>
                                                                                    <div>
                                                                                          <div style={{ fontWeight: 600, color: 'white' }}>{u.fullName}</div>
                                                                                          <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                                                <Calendar size={12} /> Joined {new Date(u.createdAt).toLocaleDateString()}
                                                                                          </div>
                                                                                    </div>
                                                                              </div>
                                                                        </td>
                                                                        <td>
                                                                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                                                                    <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                                          <Mail size={12} style={{ color: '#3b82f6' }} /> {u.email}
                                                                                    </div>
                                                                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>UID: {String(u.id).padStart(6, '0')}</div>
                                                                              </div>
                                                                        </td>
                                                                        <td>
                                                                              <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.05em' }}>{u.referralCode}</div>
                                                                              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.1rem' }}>
                                                                                    Lead: {u.inviter ? <span style={{ color: '#c4b5fd' }}>{u.inviter}</span> : 'Direct'}
                                                                              </div>
                                                                        </td>
                                                                        <td>
                                                                              <span className={`badge ${getStatusBadge(u.status)}`}>{u.status}</span>
                                                                        </td>
                                                                        <td>
                                                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                    <ShieldCheck size={14} style={{ color: u.kycStatus === 'VERIFIED' ? '#10b981' : 'rgba(255,255,255,0.2)' }} />
                                                                                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: u.kycStatus === 'VERIFIED' ? '#10b981' : u.kycStatus === 'PENDING' ? '#f59e0b' : '#ef4444' }}>
                                                                                          {u.kycStatus}
                                                                                    </span>
                                                                              </div>
                                                                        </td>
                                                                        <td style={{ textAlign: 'right' }}>
                                                                              <div style={{ color: '#3b82f6', fontWeight: 800, fontSize: '1.1rem' }}>
                                                                                    ₹{(u.walletBalance || 0).toLocaleString('en-IN')}
                                                                              </div>
                                                                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>Current Liquidity</div>
                                                                        </td>
                                                                  </tr>
                                                            ))
                                                      )}
                                                </tbody>
                                          </table>
                                    </div>

                                    {/* Mobile Card List */}
                                    <div className="mobile-show" style={{ padding: '1rem' }}>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {filteredUsers.length === 0 ? (
                                                      <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No users found.</div>
                                                ) : (
                                                      filteredUsers.map((u) => (
                                                            <div
                                                                  key={u.id}
                                                                  onClick={() => setSelectedUserId(u.id)}
                                                                  style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem' }}
                                                            >
                                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                                                              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700 }}>
                                                                                    {(u.fullName || 'U').charAt(0)}
                                                                              </div>
                                                                              <div>
                                                                                    <div style={{ fontWeight: 600, color: 'white' }}>{u.fullName}</div>
                                                                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>UID: {String(u.id).padStart(6, '0')}</div>
                                                                              </div>
                                                                        </div>
                                                                        <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />
                                                                  </div>

                                                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '0.75rem' }}>
                                                                        <div>
                                                                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Status</div>
                                                                              <span className={`badge ${getStatusBadge(u.status)}`} style={{ fontSize: '0.65rem' }}>{u.status}</span>
                                                                        </div>
                                                                        <div style={{ textAlign: 'right' }}>
                                                                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Liquidity</div>
                                                                              <div style={{ color: '#3b82f6', fontWeight: 700 }}>₹{(u.walletBalance || 0).toLocaleString('en-IN')}</div>
                                                                        </div>
                                                                        <div>
                                                                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>KYC</div>
                                                                              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: u.kycStatus === 'VERIFIED' ? '#10b981' : '#f59e0b' }}>{u.kycStatus}</div>
                                                                        </div>
                                                                        <div style={{ textAlign: 'right' }}>
                                                                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Joined</div>
                                                                              <div style={{ fontSize: '0.85rem', color: 'white' }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      ))
                                                )}
                                          </div>
                                    </div>
                              </>
                        )}
                  </div>

                  {selectedUserId && (
                        <UserDetailsModal
                              userId={selectedUserId}
                              onClose={() => setSelectedUserId(null)}
                              onUpdate={fetchUsers}
                        />
                  )}
            </div>
      );
};

export default AdminUsers;
