import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Users, Search } from 'lucide-react';
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
                  setUserList(res.data.users);
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
            u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(u.id).includes(searchQuery)
      );

      return (
            <div>
                  <h1 className="admin-page-title">User Directory</h1>
                  <p className="admin-page-subtitle">Deep management and status tracking for all registered users.</p>

                  <div className="dashboard-card glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                              <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Users size={20} className="text-secondary" /> Registered Accounts ({userList.length})
                              </h2>
                              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', minWidth: '250px' }}>
                                    <Search size={16} className="text-muted" />
                                    <input
                                          type="text"
                                          placeholder="Search by name, email, or ID..."
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                                    />
                              </div>
                        </div>

                        {loading ? (
                              <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading Directory...</div>
                        ) : (
                              <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', display: 'block', WebkitOverflowScrolling: 'touch' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                          <thead>
                                                <tr style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>User ID / Registration</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Identity</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Network Trace</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Account Status</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>KYC Status</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Wallet Balance</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {filteredUsers.length === 0 ? (
                                                      <tr><td colSpan="6" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>No records found matching your query.</td></tr>
                                                ) : filteredUsers.map((u) => (
                                                      <tr
                                                            key={u.id}
                                                            onClick={() => setSelectedUserId(u.id)}
                                                            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s', background: 'transparent' }}
                                                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.03)', transform: 'translateY(-1px)' })}
                                                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'transparent', transform: 'none' })}
                                                      >
                                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                  <div style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '0.9rem' }}>{String(u.id).padStart(5, '0')}</div>
                                                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                  <div style={{ fontWeight: 600, color: 'white' }}>{u.fullName}</div>
                                                                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>{u.email}</div>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                  <div style={{ color: '#4ade80', fontWeight: 600, fontSize: '0.85rem', letterSpacing: '0.05em' }}>{u.referralCode}</div>
                                                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>Inviter: {u.inviter ? <span style={{ color: '#c4b5fd' }}>{u.inviter}</span> : 'Organic'}</div>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                  <span style={{ padding: '0.25rem 0.6rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: u.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.15)' : u.status === 'INACTIVE' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: u.status === 'ACTIVE' ? '#10b981' : u.status === 'INACTIVE' ? '#f59e0b' : '#ef4444' }}>
                                                                        {u.status}
                                                                  </span>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: u.kycStatus === 'VERIFIED' ? '#10b981' : u.kycStatus === 'PENDING' ? '#f59e0b' : '#ef4444' }}>
                                                                        {u.kycStatus}
                                                                  </span>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#3b82f6', textAlign: 'right', fontSize: '1.1rem' }}>
                                                                  ₹{(u.walletBalance || 0).toLocaleString('en-IN')}
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>
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
