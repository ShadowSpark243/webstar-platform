import React, { useState, useEffect } from 'react';
import {
      X, User, ShieldCheck, Ban, Wallet, Network,
      CreditCard, Clock, CheckCircle, FileText, ArrowDownToLine, ArrowUpRight, Users, Loader2, TrendingUp
} from 'lucide-react';
import api from '../utils/api';

const UserDetailsModal = ({ userId, onClose, onUpdate }) => {
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
      const [actionLoading, setActionLoading] = useState(false);
      const [activeTab, setActiveTab] = useState('OVERVIEW'); // OVERVIEW, PORTFOLIO, LEDGER

      const fetchUser = async () => {
            try {
                  setLoading(true);
                  const res = await api.get(`/admin/users/${userId}`);
                  if (res.data.success) {
                        setUser(res.data.user);
                  }
            } catch (err) {
                  console.error("Failed to fetch user details:", err);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            if (userId) {
                  fetchUser();
            }
      }, [userId]);

      const handleStatusToggle = async () => {
            const newStatus = user.status === 'ACTIVE' ? 'BANNED' : 'ACTIVE';
            if (!window.confirm(`Are you sure you want to change this user's status to ${newStatus}?`)) return;

            try {
                  setActionLoading(true);
                  await api.put(`/admin/users/${user.id}/status`, { status: newStatus });
                  fetchUser();
                  if (onUpdate) onUpdate();
            } catch (err) {
                  alert("Failed to update status");
            } finally {
                  setActionLoading(false);
            }
      };

      const handleKycReview = async (docId, status) => {
            let rejectionReason = null;
            if (status === 'REJECTED') {
                  rejectionReason = window.prompt("Reason for rejecting this KYC document:");
                  if (rejectionReason === null) return;
                  if (!rejectionReason.trim()) return alert("Rejection reason is required.");
            } else {
                  if (!window.confirm(`Are you sure you want to ${status} this KYC document?`)) return;
            }

            try {
                  setActionLoading(true);
                  await api.put('/admin/kyc/review', { docId, status, rejectionReason });
                  fetchUser();
                  if (onUpdate) onUpdate();
            } catch (err) {
                  alert("Failed to process KYC review");
            } finally {
                  setActionLoading(false);
            }
      };

      const handleDepositReview = async (transactionId, status) => {
            let rejectionReason = null;
            if (status === 'REJECTED') {
                  rejectionReason = window.prompt("Reason for rejecting this deposit:");
                  if (rejectionReason === null) return;
                  if (!rejectionReason.trim()) return alert("Rejection reason is required.");
            } else {
                  if (!window.confirm(`Are you sure you want to ${status} this transaction?`)) return;
            }

            try {
                  setActionLoading(true);
                  await api.put('/admin/deposits/review', { transactionId, status, rejectionReason });
                  fetchUser();
                  if (onUpdate) onUpdate();
            } catch (err) {
                  alert("Failed to process deposit review");
            } finally {
                  setActionLoading(false);
            }
      };

      if (!userId) return null;

      return (
            <div className="global-modal-overlay">
                  <div className="dashboard-card glass-panel global-modal-container">
                        {/* Close Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', zIndex: 10 }}>
                              <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User className="text-primary" /> User Inspection
                              </h2>
                              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                    <X size={24} />
                              </button>
                        </div>

                        {loading ? (
                              <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading User Data...</div>
                        ) : user ? (
                              <div style={{ padding: '0 2rem 2rem 2rem' }}>
                                    {/* Tab Navigation */}
                                    <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem', position: 'sticky', top: '73px', background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)', zIndex: 9 }}>
                                          {['OVERVIEW', 'PORTFOLIO', 'LEDGER'].map(tab => (
                                                <button
                                                      key={tab}
                                                      onClick={() => setActiveTab(tab)}
                                                      style={{
                                                            padding: '1rem 0',
                                                            background: 'none',
                                                            border: 'none',
                                                            color: activeTab === tab ? '#3b82f6' : 'rgba(255,255,255,0.5)',
                                                            fontWeight: 600,
                                                            fontSize: '0.9rem',
                                                            cursor: 'pointer',
                                                            position: 'relative',
                                                            borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                                                            transition: 'all 0.2s ease'
                                                      }}
                                                >
                                                      {tab}
                                                </button>
                                          ))}
                                    </div>

                                    {activeTab === 'OVERVIEW' && (
                                          <>

                                                {/* Top Profile Strip */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                                                      <div>
                                                            <h1 style={{ fontSize: '1.8rem', margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                  {user.fullName}
                                                                  <span style={{ fontSize: '1rem', color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '0.25rem' }}>
                                                                        @{user.username}
                                                                  </span>
                                                            </h1>
                                                            <div style={{ display: 'flex', gap: '1rem', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                                                  <span>{user.email}</span>
                                                                  <span>•</span>
                                                                  <span>{user.phone}</span>
                                                            </div>
                                                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: user.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : user.status === 'INACTIVE' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: user.status === 'ACTIVE' ? '#10b981' : user.status === 'INACTIVE' ? '#f59e0b' : '#ef4444' }}>
                                                                        {user.status === 'ACTIVE' ? 'ACCOUNT ACTIVE' : user.status === 'INACTIVE' ? 'ACCOUNT INACTIVE' : 'ACCOUNT BANNED'}
                                                                  </span>
                                                                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600, background: user.kycStatus === 'VERIFIED' ? 'rgba(16, 185, 129, 0.2)' : user.kycStatus === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: user.kycStatus === 'VERIFIED' ? '#10b981' : user.kycStatus === 'PENDING' ? '#f59e0b' : '#ef4444' }}>
                                                                        KYC: {user.kycStatus}
                                                                  </span>
                                                            </div>
                                                      </div>

                                                      {/* Action Buttons */}
                                                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button onClick={handleStatusToggle} disabled={actionLoading} className="btn" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', display: 'flex', gap: '0.5rem', alignItems: 'center', background: user.status === 'ACTIVE' ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: user.status === 'ACTIVE' ? '#ef4444' : '#10b981', border: `1px solid ${user.status === 'ACTIVE' ? 'rgba(239,68,68,0.3)' : 'rgba(16,185,129,0.3)'}` }}>
                                                                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : (user.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />)}
                                                                  {actionLoading ? 'Updating...' : (user.status === 'ACTIVE' ? 'Ban User' : user.status === 'INACTIVE' ? 'Activate User' : 'Unban User')}
                                                            </button>
                                                      </div>
                                                </div>

                                                {/* Detailed Account Intelligence */}
                                                <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '0.75rem', marginBottom: '2rem' }}>
                                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', fontSize: '0.85rem' }}>
                                                            <div>
                                                                  <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.25rem' }}>Account Role</span>
                                                                  <span style={{ color: user.role === 'ADMIN' ? '#8b5cf6' : 'white', fontWeight: 500 }}>{user.role}</span>
                                                            </div>
                                                            <div>
                                                                  <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.25rem' }}>Referral Code</span>
                                                                  <span style={{ color: '#4ade80', fontWeight: 600, userSelect: 'all' }}>{user.referralCode}</span>
                                                            </div>
                                                            <div>
                                                                  <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.25rem' }}>Referred By</span>
                                                                  <span style={{ color: 'white', fontWeight: 500 }}>{user.referredBy ? `${user.referredBy.fullName} (@${user.referredBy.username})` : 'Organic (None)'}</span>
                                                            </div>
                                                            <div>
                                                                  <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.25rem' }}>Account Rank</span>
                                                                  <span style={{ color: 'white', fontWeight: 500 }}>{user.rank}</span>
                                                            </div>
                                                            <div>
                                                                  <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.25rem' }}>Joined Date</span>
                                                                  <span style={{ color: 'white', fontWeight: 500 }}>{new Date(user.createdAt).toLocaleString('en-IN')}</span>
                                                            </div>
                                                            <div>
                                                                  <span style={{ color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: '0.25rem' }}>Last Update</span>
                                                                  <span style={{ color: 'white', fontWeight: 500 }}>{new Date(user.updatedAt).toLocaleString('en-IN')}</span>
                                                            </div>
                                                      </div>
                                                </div>

                                                {/* Financial Stats Grid */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                                                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '0.75rem' }}>
                                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Wallet size={16} /> Wallet Balance</div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#3b82f6' }}>₹{user.walletBalance?.toLocaleString('en-IN') || 0}</div>
                                                      </div>
                                                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '0.75rem' }}>
                                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CreditCard size={16} /> Total Invested</div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>₹{user.totalInvested?.toLocaleString('en-IN') || 0}</div>
                                                      </div>
                                                      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '0.75rem' }}>
                                                            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Network size={16} /> Team Volume</div>
                                                            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: '#10b981' }}>₹{user.teamVolume?.toLocaleString('en-IN') || 0}</div>
                                                      </div>
                                                </div>

                                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '2rem 0' }} />

                                                {/* Details Sections Grid */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>

                                                      {/* KYC Documents Panel */}
                                                      <div>
                                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ShieldCheck className="text-primary" size={20} /> Identity Documents</h3>
                                                            {user.kycDocuments?.length > 0 ? (
                                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                                        {user.kycDocuments.map(doc => (
                                                                              <div key={doc.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                                                          <span style={{ fontWeight: 600, color: 'white' }}>{doc.documentType}</span>
                                                                                          <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '0.2rem', background: doc.status === 'VERIFIED' ? 'rgba(16, 185, 129, 0.2)' : doc.status === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: doc.status === 'VERIFIED' ? '#10b981' : doc.status === 'PENDING' ? '#f59e0b' : '#ef4444' }}>{doc.status}</span>
                                                                                    </div>
                                                                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '1rem' }}>ID: {doc.documentNumber}</div>

                                                                                    {doc.presignedUrl && (
                                                                                          <a href={doc.presignedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'block', textAlign: 'center', marginBottom: '1rem', padding: '0.4rem', fontSize: '0.8rem', borderColor: 'rgba(255,255,255,0.2)', color: 'white', textDecoration: 'none', background: 'rgba(255,255,255,0.05)' }}>
                                                                                                <ArrowUpRight size={14} style={{ display: 'inline', marginRight: '0.2rem', verticalAlign: 'middle' }} /> View Document Image
                                                                                          </a>
                                                                                    )}

                                                                                    {doc.status === 'PENDING' && (
                                                                                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                                                <button onClick={() => handleKycReview(doc.id, 'VERIFIED')} disabled={actionLoading} className="btn btn-primary" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', background: '#10b981', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                                                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : 'Approve'}
                                                                                                </button>
                                                                                                <button onClick={() => handleKycReview(doc.id, 'REJECTED')} disabled={actionLoading} className="btn btn-outline" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                                                                                      {actionLoading ? <Loader2 size={14} className="animate-spin" /> : 'Reject'}
                                                                                                </button>
                                                                                          </div>
                                                                                    )}
                                                                              </div>
                                                                        ))}
                                                                  </div>
                                                            ) : (
                                                                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                                                                        No KYC Documents uploaded.
                                                                  </div>
                                                            )}
                                                      </div>

                                                      {/* Network Connectivity Panel */}
                                                      <div>
                                                            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Network className="text-secondary" size={20} /> Network Connectivity</h3>

                                                            {/* Upline Section */}
                                                            <div style={{ marginBottom: '1.5rem' }}>
                                                                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Referred By (Upline)</div>
                                                                  {user.inviter ? (
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(139, 92, 246, 0.1)', border: '1px solid rgba(139, 92, 246, 0.2)', padding: '0.75rem 1rem', borderRadius: '0.5rem' }}>
                                                                              <span style={{ fontWeight: 600, color: '#c4b5fd', fontSize: '0.9rem' }}>{user.inviter}</span>
                                                                              <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '1rem', background: '#8b5cf6', color: 'white', fontWeight: 600 }}>Sponsor</span>
                                                                        </div>
                                                                  ) : (
                                                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                                                              Organic Sign Up (No Referrer)
                                                                        </div>
                                                                  )}
                                                            </div>

                                                            {/* Downline Section */}
                                                            <div>
                                                                  <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', justifyContent: 'space-between' }}>
                                                                        <span>Direct Referrals (Downline)</span>
                                                                        <span style={{ color: 'white', fontWeight: 600 }}>{user.referrals?.length || 0} Total</span>
                                                                  </div>
                                                                  {user.referrals?.length > 0 ? (
                                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                                                                              {user.referrals.map(ref => (
                                                                                    <div key={ref.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem 1rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                                                <span style={{ fontWeight: 500, fontSize: '0.9rem', color: 'white' }}>{ref.fullName}</span>
                                                                                                <span style={{ fontSize: '0.75rem', color: ref.status === 'ACTIVE' ? '#10b981' : 'rgba(255,255,255,0.4)' }}>Status: {ref.status}</span>
                                                                                          </div>
                                                                                          <div style={{ textAlign: 'right' }}>
                                                                                                <div style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 600 }}>₹{ref.teamVolume?.toLocaleString()}</div>
                                                                                                <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Volume</div>
                                                                                          </div>
                                                                                    </div>
                                                                              ))}
                                                                        </div>
                                                                  ) : (
                                                                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                                                              No active referrals yet.
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      </div>

                                                </div>

                                          </>
                                    )}

                                    {activeTab === 'PORTFOLIO' && (
                                          <div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                      <h3 style={{ fontSize: '1.1rem', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}><TrendingUp className="text-primary" size={20} /> Investment Portfolio</h3>
                                                      <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>Unique Projects: <span style={{ color: 'white', fontWeight: 600 }}>{user.uniqueProjectsCount || 0}</span></div>
                                                </div>

                                                {user.investments?.length > 0 ? (
                                                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                                            {user.investments.map(inv => (
                                                                  <div key={inv.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', padding: '1.25rem', borderRadius: '0.75rem' }}>
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                                                                              <div>
                                                                                    <div style={{ fontWeight: 600, color: 'white' }}>{inv.project?.title}</div>
                                                                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{inv.project?.genre}</div>
                                                                              </div>
                                                                              <span style={{ fontSize: '0.7rem', height: 'fit-content', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', background: inv.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: inv.status === 'ACTIVE' ? '#10b981' : '#f59e0b', fontWeight: 600 }}>{inv.status}</span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1rem' }}>
                                                                              <div>
                                                                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.2rem' }}>Capital</div>
                                                                                    <div style={{ fontWeight: 600, color: 'white' }}>₹{inv.amount.toLocaleString()}</div>
                                                                              </div>
                                                                              <div>
                                                                                    <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.2rem' }}>Expected ROI</div>
                                                                                    <div style={{ fontWeight: 600, color: '#3b82f6' }}>₹{inv.expectedReturn.toLocaleString()}</div>
                                                                              </div>
                                                                        </div>
                                                                        <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.75rem' }}>
                                                                              Date: {new Date(inv.createdAt).toLocaleDateString()}
                                                                        </div>
                                                                  </div>
                                                            ))}
                                                      </div>
                                                ) : (
                                                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '3rem', borderRadius: '0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
                                                            No active investments found.
                                                      </div>
                                                )}
                                          </div>
                                    )}

                                    {activeTab === 'LEDGER' && (
                                          <div>
                                                <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FileText className="text-purple-400" size={20} /> Transaction History</h3>
                                                {user.transactions?.length > 0 ? (
                                                      <div style={{ overflowX: 'auto' }}>
                                                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                                                  <thead>
                                                                        <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                                              <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Type</th>
                                                                              <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Amount</th>
                                                                              <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Status</th>
                                                                              <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Date</th>
                                                                              <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Action</th>
                                                                        </tr>
                                                                  </thead>
                                                                  <tbody>
                                                                        {user.transactions.map(tx => (
                                                                              <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                                    <td style={{ padding: '0.75rem' }}>{tx.type}</td>
                                                                                    <td style={{ padding: '0.75rem', fontWeight: 600, color: ['DEPOSIT', 'COMMISSION'].includes(tx.type) ? '#10b981' : '#ef4444' }}>
                                                                                          {['DEPOSIT', 'COMMISSION'].includes(tx.type) ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem' }}>
                                                                                          <span style={{ fontSize: '0.75rem', padding: '0.1rem 0.4rem', borderRadius: '0.2rem', background: tx.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.2)' : tx.status === 'PENDING' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(239, 68, 68, 0.2)', color: tx.status === 'APPROVED' ? '#10b981' : tx.status === 'PENDING' ? '#f59e0b' : '#ef4444' }}>{tx.status}</span>
                                                                                    </td>
                                                                                    <td style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                                                    <td style={{ padding: '0.75rem' }}>
                                                                                          {tx.type === 'DEPOSIT' && tx.status === 'PENDING' && (
                                                                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                                                                      <button onClick={() => handleDepositReview(tx.id, 'APPROVED')} disabled={actionLoading} title="Approve" style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: 0 }}>
                                                                                                            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                                                                      </button>
                                                                                                      <button onClick={() => handleDepositReview(tx.id, 'REJECTED')} disabled={actionLoading} title="Reject" style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>
                                                                                                            {actionLoading ? <Loader2 size={18} className="animate-spin" /> : <X size={18} />}
                                                                                                      </button>
                                                                                                </div>
                                                                                          )}
                                                                                    </td>
                                                                              </tr>
                                                                        ))}
                                                                  </tbody>
                                                            </table>
                                                      </div>
                                                ) : (
                                                      <div style={{ background: 'rgba(0,0,0,0.2)', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
                                                            No transaction history for this user.
                                                      </div>
                                                )}
                                          </div>
                                    )}

                              </div>
                        ) : (
                              <div style={{ padding: '3rem', textAlign: 'center', color: '#ef4444' }}>User not found.</div>
                        )}
                  </div>
            </div>
      );
};

export default UserDetailsModal;
