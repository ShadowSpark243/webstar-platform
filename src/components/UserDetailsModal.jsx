import React, { useState, useEffect } from 'react';
import {
      X, User, ShieldCheck, Ban, Wallet, Network,
      CreditCard, Clock, CheckCircle, FileText, ArrowDownToLine, ArrowUpRight, Users, Loader2, TrendingUp
} from 'lucide-react';
import api from '../utils/api';
import './UserDetailsModal.css';

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
                  <div className="user-modal-container">
                        {/* Close Header */}
                        <div className="user-modal-header">
                              <h2 className="user-modal-title">
                                    <User className="text-primary" size={24} /> User Inspection
                              </h2>
                              <button onClick={onClose} className="user-modal-close">
                                    <X size={20} />
                              </button>
                        </div>

                        {loading ? (
                              <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                    <Loader2 size={32} className="animate-spin text-primary mx-auto mb-4" />
                                    Loading Intelligence File...
                              </div>
                        ) : user ? (
                              <div className="user-modal-body">
                                    {/* Tab Navigation */}
                                    <div className="user-modal-tabs">
                                          {['OVERVIEW', 'PORTFOLIO', 'LEDGER'].map(tab => (
                                                <button
                                                      key={tab}
                                                      onClick={() => setActiveTab(tab)}
                                                      className={`user-modal-tab ${activeTab === tab ? 'active' : ''}`}
                                                >
                                                      {tab}
                                                </button>
                                          ))}
                                    </div>

                                    {activeTab === 'OVERVIEW' && (
                                          <>
                                                {/* Top Profile Strip */}
                                                <div className="user-modal-overview-strip">
                                                      <div>
                                                            <h1 className="user-name-tag">
                                                                  {user.fullName}
                                                                  <span className="user-username-badge">@{user.username}</span>
                                                            </h1>
                                                            <div className="user-contact-info">
                                                                  <span>{user.email}</span>
                                                                  <span className="dot">•</span>
                                                                  <span>{user.phone || 'No Phone provided'}</span>
                                                            </div>
                                                            <div className="user-status-badges">
                                                                  <span className={`status-badge ${user.status?.toLowerCase()}`}>
                                                                        {user.status === 'ACTIVE' ? 'ACCOUNT ACTIVE' : user.status === 'INACTIVE' ? 'ACCOUNT INACTIVE' : 'ACCOUNT BANNED'}
                                                                  </span>
                                                                  <span className={`status-badge ${user.kycStatus?.toLowerCase()}`}>
                                                                        KYC {user.kycStatus}
                                                                  </span>
                                                            </div>
                                                      </div>

                                                      {/* Action Buttons */}
                                                      <div className="user-actions">
                                                            <button
                                                                  onClick={handleStatusToggle}
                                                                  disabled={actionLoading}
                                                                  className="btn"
                                                                  style={{
                                                                        background: user.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                                                                        color: user.status === 'ACTIVE' ? '#ef4444' : '#10b981',
                                                                        borderColor: user.status === 'ACTIVE' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
                                                                  }}
                                                            >
                                                                  {actionLoading ? <Loader2 size={16} className="animate-spin" /> : (user.status === 'ACTIVE' ? <Ban size={16} /> : <CheckCircle size={16} />)}
                                                                  {actionLoading ? 'Updating...' : (user.status === 'ACTIVE' ? 'Ban User' : user.status === 'INACTIVE' ? 'Activate User' : 'Unban User')}
                                                            </button>
                                                      </div>
                                                </div>

                                                {/* Detailed Account Intelligence */}
                                                <div className="user-info-grid">
                                                      <div className="info-item">
                                                            <span className="info-label">Account Role</span>
                                                            <span className={`info-value ${user.role === 'ADMIN' ? 'admin-role' : ''}`}>{user.role}</span>
                                                      </div>
                                                      <div className="info-item">
                                                            <span className="info-label">Referral Code</span>
                                                            <span className="info-value highlight" style={{ userSelect: 'all' }}>{user.referralCode}</span>
                                                      </div>
                                                      <div className="info-item">
                                                            <span className="info-label">Referred By</span>
                                                            <span className="info-value">{user.referredBy ? `${user.referredBy.fullName} (@${user.referredBy.username})` : 'Organic (None)'}</span>
                                                      </div>
                                                      <div className="info-item">
                                                            <span className="info-label">Account Rank</span>
                                                            <span className="info-value">{user.rank}</span>
                                                      </div>
                                                      <div className="info-item">
                                                            <span className="info-label">Joined Date</span>
                                                            <span className="info-value">{new Date(user.createdAt).toLocaleString('en-IN')}</span>
                                                      </div>
                                                      <div className="info-item">
                                                            <span className="info-label">Last Update</span>
                                                            <span className="info-value">{new Date(user.updatedAt).toLocaleString('en-IN')}</span>
                                                      </div>
                                                </div>

                                                {/* Financial Stats Grid */}
                                                <div className="user-finance-grid">
                                                      <div className="finance-card balance">
                                                            <div className="finance-label"><Wallet size={16} /> Wallet Balance</div>
                                                            <div className="finance-value">₹{user.walletBalance?.toLocaleString('en-IN') || 0}</div>
                                                      </div>
                                                      <div className="finance-card invested">
                                                            <div className="finance-label"><CreditCard size={16} /> Total Invested</div>
                                                            <div className="finance-value">₹{user.totalInvested?.toLocaleString('en-IN') || 0}</div>
                                                      </div>
                                                      <div className="finance-card volume">
                                                            <div className="finance-label"><Network size={16} /> Team Volume</div>
                                                            <div className="finance-value">₹{user.teamVolume?.toLocaleString('en-IN') || 0}</div>
                                                      </div>
                                                </div>

                                                {/* Details Sections Grid (2 Col) */}
                                                <div className="user-details-2col">

                                                      {/* KYC Documents Panel */}
                                                      <div>
                                                            <h3 className="section-title"><ShieldCheck className="text-secondary" /> Identity Documents</h3>
                                                            {user.kycDocuments?.length > 0 ? (
                                                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        {user.kycDocuments.map(doc => (
                                                                              <div key={doc.id} className="doc-card">
                                                                                    <div className="doc-card-header">
                                                                                          <span className="doc-type">{doc.documentType}</span>
                                                                                          <span className={`status-badge ${doc.status?.toLowerCase()}`}>{doc.status}</span>
                                                                                    </div>
                                                                                    <div className="doc-id">ID: {doc.documentNumber}</div>

                                                                                    {doc.presignedUrl && (
                                                                                          <a href={doc.presignedUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', padding: '0.5rem', fontSize: '0.85rem' }}>
                                                                                                <ArrowUpRight size={16} style={{ marginRight: '0.4rem' }} /> View Document Image
                                                                                          </a>
                                                                                    )}

                                                                                    {doc.status === 'PENDING' && (
                                                                                          <div className="doc-btn-group">
                                                                                                <button onClick={() => handleKycReview(doc.id, 'VERIFIED')} disabled={actionLoading} className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981' }}>
                                                                                                      {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Approve'}
                                                                                                </button>
                                                                                                <button onClick={() => handleKycReview(doc.id, 'REJECTED')} disabled={actionLoading} className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                                                                                                      {actionLoading ? <Loader2 size={16} className="animate-spin" /> : 'Reject'}
                                                                                                </button>
                                                                                          </div>
                                                                                    )}
                                                                              </div>
                                                                        ))}
                                                                  </div>
                                                            ) : (
                                                                  <div className="user-empty-state">
                                                                        No KYC Documents uploaded.
                                                                  </div>
                                                            )}
                                                      </div>

                                                      {/* Network Connectivity Panel */}
                                                      <div>
                                                            <h3 className="section-title"><Network className="text-primary" /> Network Connectivity</h3>

                                                            {/* Upline Section */}
                                                            <div style={{ marginBottom: '1.5rem' }}>
                                                                  <div className="info-label" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginBottom: '0.5rem', textTransform: 'uppercase', fontWeight: 600 }}>Referred By (Upline)</div>
                                                                  {user.inviter ? (
                                                                        <div className="network-card network-upline">
                                                                              <span className="upline-name">{user.inviter}</span>
                                                                              <span className="status-badge" style={{ background: '#8b5cf6', color: 'white' }}>Sponsor</span>
                                                                        </div>
                                                                  ) : (
                                                                        <div className="user-empty-state" style={{ padding: '1.5rem 1rem' }}>
                                                                              Organic Sign Up (No Referrer)
                                                                        </div>
                                                                  )}
                                                            </div>

                                                            {/* Downline Section */}
                                                            <div>
                                                                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                                        <span className="info-label" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 600 }}>Direct Referrals (Downline)</span>
                                                                        <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>{user.referrals?.length || 0} Total</span>
                                                                  </div>

                                                                  {user.referrals?.length > 0 ? (
                                                                        <div style={{ maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }} className="user-modal-body"> {/* Using the scrollbar hidden class */}
                                                                              {user.referrals.map(ref => (
                                                                                    <div key={ref.id} className="network-card">
                                                                                          <div>
                                                                                                <div className="network-downline-name">{ref.fullName}</div>
                                                                                                <div style={{ fontSize: '0.75rem', color: ref.status === 'ACTIVE' ? '#10b981' : 'rgba(255,255,255,0.4)' }}>Status: {ref.status}</div>
                                                                                          </div>
                                                                                          <div className="network-volume">
                                                                                                <div className="network-volume-val">₹{ref.teamVolume?.toLocaleString()}</div>
                                                                                                <div className="network-volume-lbl">Volume</div>
                                                                                          </div>
                                                                                    </div>
                                                                              ))}
                                                                        </div>
                                                                  ) : (
                                                                        <div className="user-empty-state" style={{ padding: '2rem 1rem' }}>
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
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                                      <h3 className="section-title" style={{ margin: 0 }}><TrendingUp className="text-secondary" /> Investment Portfolio</h3>
                                                      <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                                                            Unique Projects: <span style={{ color: 'white', fontWeight: 700, marginLeft: '0.4rem' }}>{user.uniqueProjectsCount || 0}</span>
                                                      </div>
                                                </div>

                                                {user.investments?.length > 0 ? (
                                                      <div className="user-portfolio-grid">
                                                            {user.investments.map(inv => (
                                                                  <div key={inv.id} className="portfolio-card">
                                                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'flex-start' }}>
                                                                              <div>
                                                                                    <div style={{ fontWeight: 700, color: 'white', fontSize: '1.05rem', marginBottom: '0.2rem' }}>{inv.project?.title}</div>
                                                                                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{inv.project?.genre}</div>
                                                                              </div>
                                                                              <span className={`status-badge ${inv.status?.toLowerCase()}`}>{inv.status}</span>
                                                                        </div>
                                                                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.25rem' }}>
                                                                              <div style={{ flex: 1 }}>
                                                                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capital</div>
                                                                                    <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>₹{inv.amount.toLocaleString('en-IN')}</div>
                                                                              </div>
                                                                              <div style={{ flex: 1 }}>
                                                                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expected ROI</div>
                                                                                    <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: '1.1rem' }}>₹{inv.expectedReturn.toLocaleString('en-IN')}</div>
                                                                              </div>
                                                                        </div>
                                                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                                              <Clock size={14} /> Invested on {new Date(inv.createdAt).toLocaleDateString()}
                                                                        </div>
                                                                  </div>
                                                            ))}
                                                      </div>
                                                ) : (
                                                      <div className="user-empty-state">
                                                            No active investments found.
                                                      </div>
                                                )}
                                          </div>
                                    )}

                                    {activeTab === 'LEDGER' && (
                                          <div>
                                                <h3 className="section-title"><FileText className="text-primary" /> Transaction History</h3>
                                                {user.transactions?.length > 0 ? (
                                                      <div className="user-ledger-container">
                                                            <table className="user-ledger-table">
                                                                  <thead>
                                                                        <tr>
                                                                              <th>Type</th>
                                                                              <th>Amount</th>
                                                                              <th>Status</th>
                                                                              <th>Date</th>
                                                                              <th>Action</th>
                                                                        </tr>
                                                                  </thead>
                                                                  <tbody>
                                                                        {user.transactions.map(tx => (
                                                                              <tr key={tx.id}>
                                                                                    <td>{tx.type}</td>
                                                                                    <td className={`ledger-amt ${['DEPOSIT', 'COMMISSION'].includes(tx.type) ? 'positive' : 'negative'}`}>
                                                                                          {['DEPOSIT', 'COMMISSION'].includes(tx.type) ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                                                                    </td>
                                                                                    <td>
                                                                                          <span className={`status-badge ${tx.status?.toLowerCase()}`}>{tx.status}</span>
                                                                                    </td>
                                                                                    <td style={{ color: 'rgba(255,255,255,0.5)' }}>{new Date(tx.createdAt).toLocaleDateString()}</td>
                                                                                    <td>
                                                                                          {tx.type === 'DEPOSIT' && tx.status === 'PENDING' ? (
                                                                                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                                                                      <button onClick={() => handleDepositReview(tx.id, 'APPROVED')} disabled={actionLoading} title="Approve" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10b981', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.4rem' }}>
                                                                                                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                                                                      </button>
                                                                                                      <button onClick={() => handleDepositReview(tx.id, 'REJECTED')} disabled={actionLoading} title="Reject" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', cursor: 'pointer', padding: '0.4rem', borderRadius: '0.4rem' }}>
                                                                                                            {actionLoading ? <Loader2 size={16} className="animate-spin" /> : <X size={16} />}
                                                                                                      </button>
                                                                                                </div>
                                                                                          ) : (
                                                                                                <div style={{ color: 'rgba(255,255,255,0.2)' }}>-</div>
                                                                                          )}
                                                                                    </td>
                                                                              </tr>
                                                                        ))}
                                                                  </tbody>
                                                            </table>
                                                      </div>
                                                ) : (
                                                      <div className="user-empty-state">
                                                            No transaction history for this user.
                                                      </div>
                                                )}
                                          </div>
                                    )}

                              </div>
                        ) : (
                              <div style={{ padding: '4rem', textAlign: 'center', color: '#ef4444' }}>
                                    User intelligence file could not be retrieved.
                              </div>
                        )}
                  </div>
            </div>
      );
};

export default UserDetailsModal;
