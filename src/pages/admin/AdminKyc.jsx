import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShieldCheck, Search, FileText, User, Loader2 } from 'lucide-react';
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
                  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: '1 1 300px' }}>
                              <h1 className="admin-page-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}><ShieldCheck size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: '#10b981' }} /> Verification Queue</h1>
                              <p className="admin-page-subtitle" style={{ marginBottom: 0, fontSize: '0.85rem' }}>Review identity submissions.</p>
                        </div>
                        {activeTab === 'ALL' && (
                              <div style={{ position: 'relative', width: '100%', maxWidth: '300px', flex: '1 1 200px' }}>
                                    <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                    <input
                                          type="text"
                                          placeholder="Search database..."
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.5rem', outline: 'none', fontSize: '0.85rem' }}
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
                        <div style={{ width: '100%', maxWidth: '100%', display: 'block' }}>
                              {activeTab === 'ALL' ? (
                                    <>
                                          {/* Desktop Table View */}
                                          <div className="mobile-hide">
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
                                          </div>

                                          {/* Mobile Card View */}
                                          <div className="mobile-show">
                                                <div className="admin-card-list">
                                                      {filteredUsers.length === 0 ? (
                                                            <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>No users found.</div>
                                                      ) : filteredUsers.map((usr) => (
                                                            <div key={usr.id} className="admin-card" onClick={() => setSelectedUserId(usr.id)}>
                                                                  <div className="admin-card-row">
                                                                        <div>
                                                                              <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>{usr.fullName}</div>
                                                                              <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>@{usr.username || String(usr.id).padStart(5, '0')}</div>
                                                                        </div>
                                                                        <div style={{ textAlign: 'right' }}>
                                                                              <div className="admin-card-label">Status</div>
                                                                              <div style={{
                                                                                    marginTop: '0.2rem',
                                                                                    fontSize: '0.8rem',
                                                                                    fontWeight: 700,
                                                                                    color: usr.kycStatus === 'VERIFIED' ? '#10b981' : usr.kycStatus === 'PENDING' ? '#f59e0b' : '#ef4444'
                                                                              }}>{usr.kycStatus}</div>
                                                                        </div>
                                                                  </div>
                                                                  <div className="admin-card-row" style={{ marginTop: '0.4rem', paddingTop: '0.6rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                              {usr.email}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textAlign: 'right', minWidth: 'fit-content' }}>
                                                                              {new Date(usr.createdAt).toLocaleDateString()}
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          </div>
                                    </>
                              ) : (
                                    <>
                                          {/* Desktop Table View */}
                                          <div className="mobile-hide">
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
                                                                        </td>
                                                                        <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 500, color: '#e2e8f0' }}>
                                                                                    <FileText size={16} className="text-purple-400" />
                                                                                    {doc.documentType}
                                                                              </div>
                                                                              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>
                                                                                    ID: {doc.documentNumber}
                                                                              </div>
                                                                        </td>
                                                                        <td style={{ padding: '1.25rem 1.5rem', color: '#e2e8f0' }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                                                                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                                    <button onClick={(e) => handleKycReview(doc.id, 'VERIFIED', doc.fullName || doc.user?.fullName || 'this user', e)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#10b981', border: 'none' }}>Approve</button>
                                                                                    <button onClick={(e) => handleKycReview(doc.id, 'REJECTED', doc.fullName || doc.user?.fullName || 'this user', e)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', color: '#ef4444', borderColor: '#ef4444', background: 'transparent' }}>Reject</button>
                                                                              </div>
                                                                        </td>
                                                                  </tr>
                                                            ))}
                                                      </tbody>
                                                </table>
                                          </div>

                                          {/* Mobile Card View for Pending Queue */}
                                          <div className="mobile-show">
                                                <div className="admin-card-list">
                                                      {pendingDocs.length === 0 ? (
                                                            <div style={{ padding: '3rem', textAlign: 'center', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '0.75rem' }}>
                                                                  ✓ Queue is empty.
                                                            </div>
                                                      ) : pendingDocs.map((doc) => (
                                                            <div key={doc.id} className="admin-card" onClick={() => setSelectedUserId(doc.userId)}>
                                                                  <div className="admin-card-row">
                                                                        <div>
                                                                              <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem' }}>{doc.fullName || doc.user?.fullName}</div>
                                                                              <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>@{doc.username || doc.user?.username}</div>
                                                                        </div>
                                                                        <div style={{ textAlign: 'right' }}>
                                                                              <div className="admin-card-label">Document</div>
                                                                              <div style={{ fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 600, marginTop: '0.2rem' }}>{doc.documentType}</div>
                                                                        </div>
                                                                  </div>

                                                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.4rem' }}>
                                                                        ID: <span style={{ color: 'white' }}>{doc.documentNumber}</span>
                                                                  </div>

                                                                  {doc.presignedUrl && (
                                                                        <a href={doc.presignedUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.4rem', display: 'inline-block', fontWeight: 600 }}>
                                                                              View Document ↗
                                                                        </a>
                                                                  )}

                                                                  <div className="admin-card-row" style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', gap: '0.5rem' }}>
                                                                        <button
                                                                              onClick={(e) => handleKycReview(doc.id, 'VERIFIED', doc.fullName || doc.user?.fullName || 'this user', e)}
                                                                              style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', background: '#10b981', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.8rem' }}
                                                                        >
                                                                              Approve
                                                                        </button>
                                                                        <button
                                                                              onClick={(e) => handleKycReview(doc.id, 'REJECTED', doc.fullName || doc.user?.fullName || 'this user', e)}
                                                                              style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', fontWeight: 700, fontSize: '0.8rem' }}
                                                                        >
                                                                              Reject
                                                                        </button>
                                                                  </div>
                                                            </div>
                                                      ))}
                                                </div>
                                          </div>
                                    </>
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
                                                            opacity: processing ? 0.6 : 1,
                                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                                      }}
                                                >
                                                      {processing ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : `Confirm ${confirmModal.status === 'VERIFIED' ? 'Approve' : 'Reject'}`}
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
