import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import {
      ShieldAlert,
      Search,
      Users
} from 'lucide-react';
import UserDetailsModal from '../../components/UserDetailsModal';
import './Dashboard.css';

const AdminPanel = () => {
      const { user } = useAuth();
      const [activeTab, setActiveTab] = useState('USERS');
      const [selectedUserId, setSelectedUserId] = useState(null);

      // States for Live Data
      const [globalStats, setGlobalStats] = useState({ users: {}, funding: {} });
      const [userList, setUserList] = useState([]);

      // UI States
      const [loading, setLoading] = useState(false);
      const [searchQuery, setSearchQuery] = useState('');

      // Inject Funds Form
      const [targetUserId, setTargetUserId] = useState('');
      const [depositAmount, setDepositAmount] = useState('100000');

      // Make sure only admins see this
      if (user?.role !== 'ADMIN') return <div style={{ padding: '3rem', color: 'white' }}>Unauthorized: Admin Access Required.</div>;

      const fetchAdminData = async () => {
            setLoading(true);
            try {
                  // Fetch Global Stats always
                  const statsRes = await api.get('/admin/stats');
                  setGlobalStats(statsRes.data);

                  if (activeTab === 'USERS') {
                        const res = await api.get('/admin/users');
                        setUserList(res.data.users);
                  }
            } catch (error) {
                  console.error("Failed to fetch admin data:", error);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchAdminData();
            // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [activeTab]);



      const handleMockDeposit = async (e) => {
            e.preventDefault();
            try {
                  const amt = parseFloat(depositAmount);
                  const target = targetUserId || user.id; // Target self if empty
                  await api.put(`/admin/users/${target}/wallet`, {
                        newBalance: amt,
                        reason: 'God-Mode Direct Injection'
                  });
                  alert(`Successfully injected ₹${amt.toLocaleString('en-IN')} into user ${target}!`);
            } catch (error) {
                  alert('Failed to inject funds. ' + (error.response?.data?.message || ''));
            }
      };

      return (
            <div className="dashboard-page">
                  <header className="page-header" style={{ marginBottom: '1.5rem' }}>
                        <div>
                              <h1 className="page-title text-purple-400" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <ShieldAlert /> Admin Control Center
                              </h1>
                              <p className="page-subtitle">Platform overview and user oversight</p>
                        </div>
                        {/* Global Tracker Widgets */}
                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>User Limit (10k)</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3b82f6' }}>
                                          {globalStats.users.total || 0} / 10,000 <span style={{ fontSize: '0.8rem', color: '#10b981', marginLeft: '0.5rem' }}>{globalStats.users.remaining || 10000} Slots Left</span>
                                    </div>
                              </div>
                              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: '1.5rem' }}>
                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase' }}>Total Deposited</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>
                                          ₹{(globalStats.funding.totalDeposited || 0).toLocaleString('en-IN')}
                                    </div>
                              </div>
                        </div>
                  </header>

                  {/* Admin Navigation Tabs */}
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', overflowX: 'auto' }}>
                        <button onClick={() => setActiveTab('USERS')} className={`btn ${activeTab === 'USERS' ? 'btn-primary' : 'btn-outline'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}>
                              <Users size={18} /> User Management
                        </button>
                        <button onClick={() => setActiveTab('GOD_MODE')} className={`btn ${activeTab === 'GOD_MODE' ? 'btn-primary' : 'btn-outline'}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap', borderColor: '#8b5cf6', color: activeTab === 'GOD_MODE' ? 'white' : '#8b5cf6', background: activeTab === 'GOD_MODE' ? '#8b5cf6' : 'transparent' }}>
                              <ShieldAlert size={18} /> Inject Funds
                        </button>
                  </div>

                  {loading && <div style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '1rem' }}>Loading live database feeds...</div>}

                  {/* Tab Contents */}
                  {activeTab === 'USERS' && (
                        <div className="dashboard-card glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 className="card-title" style={{ margin: 0 }}>Registered Users</h2>
                                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                                          <Search size={16} className="text-muted" />
                                          <input
                                                type="text"
                                                placeholder="Search users..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none' }}
                                          />
                                    </div>
                              </div>
                              <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', display: 'block', WebkitOverflowScrolling: 'touch' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                          <thead>
                                                <tr style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>User ID</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Name & Email</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Status</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>KYC</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Wallet Balance</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {userList.filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()) || String(u.id).includes(searchQuery)).length === 0 ? <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No users found.</td></tr> : userList.filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()) || String(u.id).includes(searchQuery)).map((u) => (
                                                      <tr
                                                            key={u.id}
                                                            onClick={() => setSelectedUserId(u.id)}
                                                            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                      >
                                                            <td style={{ padding: '1rem 1.5rem', color: '#3b82f6', fontWeight: 500 }}>{String(u.id).padStart(5, '0')}</td>
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                  <div style={{ fontWeight: 600 }}>{u.fullName}</div>
                                                                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{u.email}</div>
                                                            </td>
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                  <span className={`status-badge ${u.status === 'ACTIVE' ? 'active' : 'inactive'}`}>{u.status}</span>
                                                            </td>
                                                            <td style={{ padding: '1rem 1.5rem' }}>
                                                                  <span style={{ color: u.kycStatus === 'VERIFIED' ? '#10b981' : u.kycStatus === 'PENDING' ? '#f59e0b' : '#ef4444', fontSize: '0.85rem', fontWeight: 600 }}>{u.kycStatus}</span>
                                                            </td>
                                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: '#10b981' }}>₹{(u.walletBalance || 0).toLocaleString('en-IN')}</td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>
                        </div>
                  )}



                  {
                        activeTab === 'GOD_MODE' && (
                              <div className="dashboard-card glass-panel" style={{ border: '1px solid rgba(139, 92, 246, 0.3)', background: 'rgba(139, 92, 246, 0.05)', maxWidth: '600px' }}>
                                    <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <ShieldAlert className="text-purple-400" /> Demo Wallet Injection
                                    </h2>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem' }}>
                                          This tool bypasses the deposit queue. Funds will instantly OVERWRITE the target user's wallet. Leave user ID empty to target yourself.
                                    </p>

                                    <form onSubmit={handleMockDeposit} style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
                                          <div className="form-group" style={{ flex: 1 }}>
                                                <label>Target User ID (Optional)</label>
                                                <input
                                                      type="text"
                                                      className="dashboard-input"
                                                      placeholder={user.id}
                                                      value={targetUserId}
                                                      onChange={(e) => setTargetUserId(e.target.value)}
                                                      style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '0.5rem' }}
                                                />
                                          </div>
                                          <div className="form-group" style={{ flex: 1 }}>
                                                <label>New Wallet Balance (₹)</label>
                                                <input
                                                      type="number"
                                                      className="dashboard-input"
                                                      value={depositAmount}
                                                      onChange={(e) => setDepositAmount(e.target.value)}
                                                      style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '0.5rem' }}
                                                />
                                          </div>
                                          <button type="submit" className="btn btn-primary" style={{ padding: '0.875rem 1.5rem', alignSelf: 'flex-start' }}>Execute God Mode Override</button>
                                    </form>
                              </div>
                        )
                  }

                  {/* Unified User Details Modal */}
                  {
                        selectedUserId && (
                              <UserDetailsModal
                                    userId={selectedUserId}
                                    onClose={() => setSelectedUserId(null)}
                                    onUpdate={fetchAdminData}
                              />
                        )
                  }
            </div >
      );
};

export default AdminPanel;
