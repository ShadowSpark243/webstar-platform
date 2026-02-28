import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShieldCheck, Search, FileText, User } from 'lucide-react';
import UserDetailsModal from '../../components/UserDetailsModal';

const AdminKyc = () => {
      const [userList, setUserList] = useState([]);
      const [kycDocs, setKycDocs] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [selectedUserId, setSelectedUserId] = useState(null);
      const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' or 'ALL'
      const [searchQuery, setSearchQuery] = useState('');
      const [confirmModal, setConfirmModal] = useState(null); // { docId, status, userName }
      const [rejectionReason, setRejectionReason] = useState('');
      const [processing, setProcessing] = useState(false);

      const fetchData = async () => {
            try {
                  const [usersRes, kycRes] = await Promise.all([
                        api.get('/admin/users'),
                        api.get('/admin/kyc')
                  ]);
                  if (usersRes.data.success) setUserList(usersRes.data.users);
                  if (kycRes.data.success) setKycDocs(kycRes.data.documents);
            } catch (err) {
                  console.error('Failed to fetch admin KYC data:', err);
            } finally {
                  setIsLoading(false);
            }
      };

      useEffect(() => {
            fetchData();
      }, []);

      const filteredUsers = userList.filter(u =>
            (u.fullName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            (u.username || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            (u.email || '').toLowerCase().includes((searchQuery || '').toLowerCase())
      );

      const pendingDocs = kycDocs.filter(doc => doc.status === 'PENDING');

      const handleKycReview = (docId, status, userName, e) => {
            e.stopPropagation();
            setConfirmModal({ docId, status, userName });
            setRejectionReason('');
      };

      const executeKycReview = async () => {
            if (!confirmModal) return;
            if (confirmModal.status === 'REJECTED' && !rejectionReason.trim()) {
                  alert("Please provide a reason for rejection.");
                  return;
            }
            setProcessing(true);
            try {
                  await api.put('/admin/kyc/review', { docId: confirmModal.docId, status: confirmModal.status, rejectionReason });
                  setConfirmModal(null);
                  setRejectionReason('');
                  fetchData();
            } catch (err) {
                  alert("Failed to process KYC review: " + (err?.response?.data?.message || err.message));
            } finally {
                  setProcessing(false);
            }
      };

      if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Syncing verification databases...</div>;

      return (
            <div>
                  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                        <div>
                              <h1 className="admin-page-title"><ShieldCheck size={32} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: '#10b981' }} /> Verification Queue</h1>
                              <p className="admin-page-subtitle" style={{ marginBottom: 0 }}>Review and manage user identity document submissions.</p>
                        </div>
                        {activeTab === 'ALL' && (
                              <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                    <input
                                          type="text"
                                          placeholder="Search user database..."
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.5rem', outline: 'none' }}
                                    />
                              </div>
                        )}
                  </header>

                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
                        <button
                              onClick={() => setActiveTab('PENDING')}
                              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'PENDING' ? '#3b82f6' : 'transparent', color: activeTab === 'PENDING' ? 'white' : '#94a3b8' }}
                        >
                              Pending Approvals ({pendingDocs.length})
                        </button>
                        <button
                              onClick={() => setActiveTab('ALL')}
                              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.2s', background: activeTab === 'ALL' ? '#3b82f6' : 'transparent', color: activeTab === 'ALL' ? 'white' : '#94a3b8' }}
                        >
                              Global User Database
                        </button>
                  </div>

                  <div className="dashboard-card glass-panel" style={{ padding: 0, overflowX: 'auto', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', display: 'block', WebkitOverflowScrolling: 'touch' }}>
                              {activeTab === 'ALL' ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                          <thead>
                                                <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                      <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>User</th>
                                                      <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Contact</th>
                                                      <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Joined</th>
                                                      <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>KYC Status</th>
                                                      <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', textAlign: 'right' }}>Action</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {filteredUsers.length === 0 ? (
                                                      <tr>
                                                            <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                                                  No users found matching your search.
                                                            </td>
                                                      </tr>
                                                ) : filteredUsers.map((usr) => (
                                                      <tr
                                                            key={usr.id}
                                                            onClick={() => setSelectedUserId(usr.id)}
                                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                                                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.03)' })}
                                                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'transparent' })}
                                                      >
                                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                  <div style={{ fontWeight: 600, color: 'white' }}>{usr.fullName}</div>
                                                                  <div style={{ fontSize: '0.8rem', color: '#8b5cf6', marginTop: '0.2rem' }}>@{usr.username || String(usr.id).padStart(5, '0')}</div>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                  <div style={{ color: 'white' }}>{usr.email}</div>
                                                                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{usr.phone || 'N/A'}</div>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem', color: '#e2e8f0' }}>{new Date(usr.createdAt).toLocaleDateString()}</td>
                                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                  <span style={{
                                                                        padding: '0.25rem 0.6rem',
                                                                        borderRadius: '1rem',
                                                                        fontSize: '0.8rem',
                                                                        fontWeight: 600,
                                                                        background: usr.kycStatus === 'VERIFIED' ? 'rgba(16, 185, 129, 0.15)'
                                                                              : usr.kycStatus === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)'
                                                                                    : usr.kycStatus === 'PENDING' ? 'rgba(245, 158, 11, 0.15)'
                                                                                          : 'rgba(255, 255, 255, 0.05)',
                                                                        color: usr.kycStatus === 'VERIFIED' ? '#10b981'
                                                                              : usr.kycStatus === 'REJECTED' ? '#ef4444'
                                                                                    : usr.kycStatus === 'PENDING' ? '#f59e0b'
                                                                                          : 'gray'
                                                                  }}>
                                                                        {usr.kycStatus}
                                                                  </span>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontSize: '0.9rem', fontWeight: 500 }}>
                                                                        <User size={16} /> Inspect
                                                                  </div>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              ) : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                          <thead>
                                                <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                      <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>User</th>
                                                      <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Document</th>
                                                      <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Submitted On</th>
                                                      <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', textAlign: 'right' }}>Action</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {pendingDocs.length === 0 ? (
                                                      <tr>
                                                            <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(16, 185, 129, 0.7)' }}>
                                                                  ✓ The KYC Pending Queue is entirely clear.
                                                            </td>
                                                      </tr>
                                                ) : pendingDocs.map((doc) => (
                                                      <tr
                                                            key={doc.id}
                                                            onClick={() => setSelectedUserId(doc.userId)}
                                                            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                                                            onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.03)' })}
                                                            onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'transparent' })}
                                                      >
                                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                  <div style={{ fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        {doc.fullName || doc.user?.fullName}
                                                                  </div>
                                                                  <div style={{ fontSize: '0.85rem', color: '#8b5cf6', marginTop: '0.2rem', fontWeight: 500 }}>
                                                                        @{doc.username || doc.user?.username}
                                                                  </div>
                                                                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.3rem' }}>
                                                                        {doc.email || doc.user?.email}
                                                                  </div>
                                                                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.1rem' }}>
                                                                        {doc.phone || doc.user?.phone || 'No Phone Hook'}
                                                                  </div>
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: '#e2e8f0' }}>
                                                                        <FileText size={16} className="text-purple-400" />
                                                                        {doc.documentType}
                                                                  </div>
                                                                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem', letterSpacing: '0.5px' }}>
                                                                        ID: {doc.documentNumber}
                                                                  </div>
                                                                  {doc.presignedUrl && (
                                                                        <a href={doc.presignedUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.3rem', display: 'inline-block', textDecoration: 'underline' }}>
                                                                              View Document ↗
                                                                        </a>
                                                                  )}
                                                            </td>
                                                            <td style={{ padding: '1.25rem 1.5rem', color: '#e2e8f0' }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                        <button onClick={(e) => handleKycReview(doc.id, 'VERIFIED', doc.fullName || doc.user?.fullName || 'this user', e)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#10b981', border: 'none' }}>Approve</button>
                                                                        <button onClick={(e) => handleKycReview(doc.id, 'REJECTED', doc.fullName || doc.user?.fullName || 'this user', e)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444', background: 'transparent' }}>Reject</button>
                                                                        <button onClick={(e) => { e.stopPropagation(); setSelectedUserId(doc.userId); }} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#3b82f6', borderColor: '#3b82f6', background: 'transparent', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Search size={14} /> Inspect</button>
                                                                  </div>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              )}
                        </div>
                  </div>

                  {/* KYC Review Confirmation Modal */}
                  {confirmModal && (
                        <div
                              onClick={() => setConfirmModal(null)}
                              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '1rem' }}
                        >
                              <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #111 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', width: '100%', maxWidth: '420px', overflow: 'hidden', animation: 'fadeIn 0.2s ease' }}
                              >
                                    <div style={{ height: '3px', background: confirmModal.status === 'VERIFIED' ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f87171, #ef4444)' }} />
                                    <div style={{ padding: '1.5rem' }}>
                                          <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>
                                                {confirmModal.status === 'VERIFIED' ? '✅ Approve KYC' : '❌ Reject KYC'}
                                          </h3>
                                          <p style={{ margin: '0 0 1.5rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                                Are you sure you want to <strong style={{ color: confirmModal.status === 'VERIFIED' ? '#10b981' : '#ef4444' }}>{confirmModal.status === 'VERIFIED' ? 'approve' : 'reject'}</strong> the KYC documents for <strong style={{ color: 'white' }}>{confirmModal.userName}</strong>?
                                                {confirmModal.status === 'VERIFIED' ? ' This will verify their identity and allow them to participate.' : ' This will reject their documents and they will need to resubmit.'}
                                          </p>

                                          {confirmModal.status === 'REJECTED' && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Reason for Rejection *</label>
                                                      <textarea
                                                            placeholder="State the reason clearly so the user knows how to fix it."
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            rows="3"
                                                            style={{
                                                                  width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)',
                                                                  color: 'white', borderRadius: '0.5rem', outline: 'none', resize: 'vertical', fontFamily: 'inherit', fontSize: '0.9rem'
                                                            }}
                                                      />
                                                </div>
                                          )}

                                          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                                                <button
                                                      onClick={() => setConfirmModal(null)}
                                                      disabled={processing}
                                                      style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                                                >
                                                      Cancel
                                                </button>
                                                <button
                                                      onClick={executeKycReview}
                                                      disabled={processing}
                                                      style={{
                                                            padding: '0.6rem 1.25rem',
                                                            background: confirmModal.status === 'VERIFIED' ? '#10b981' : '#ef4444',
                                                            border: 'none', color: 'white', borderRadius: '0.5rem',
                                                            cursor: processing ? 'not-allowed' : 'pointer',
                                                            fontWeight: 600, fontSize: '0.85rem',
                                                            opacity: processing ? 0.6 : 1
                                                      }}
                                                >
                                                      {processing ? 'Processing...' : `Confirm ${confirmModal.status === 'VERIFIED' ? 'Approve' : 'Reject'}`}
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* Unified User Details Modal */}
                  {selectedUserId && (
                        <UserDetailsModal
                              userId={selectedUserId}
                              onClose={() => setSelectedUserId(null)}
                              onUpdate={fetchData}
                        />
                  )}
            </div>
      );
};

export default AdminKyc;
