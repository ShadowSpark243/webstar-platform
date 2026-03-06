import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShieldCheck, Search, FileText, User, Loader2, CheckCircle, XCircle, Eye, ChevronRight } from 'lucide-react';
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
      const [viewingDocument, setViewingDocument] = useState(null);

      const fetchData = async () => {
            try {
                  const [usersRes, kycRes] = await Promise.all([
                        api.get('/admin/users'),
                        api.get('/admin/kyc')
                  ]);
                  if (usersRes.data.success) setUserList(usersRes.data.users || []);
                  if (kycRes.data.success) setKycDocs(kycRes.data.documents || []);
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
            (u.email || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            String(u.id).includes(searchQuery)
      );

      const pendingDocs = kycDocs.filter(doc => doc.status === 'PENDING');

      const handleKycReview = (docId, status, userName, e) => {
            if (e) e.stopPropagation();
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
                  setViewingDocument(null);
                  fetchData();
            } catch (err) {
                  alert("Failed to process KYC review: " + (err?.response?.data?.message || err.message));
            } finally {
                  setProcessing(false);
            }
      };

      if (isLoading) return (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
                  <Loader2 size={48} className="animate-spin" style={{ color: '#8b5cf6', margin: '0 auto 1.5rem auto' }} />
                  <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Synchronizing verification databases...</p>
            </div>
      );

      return (
            <div className="fade-in">
                  <header style={{ marginBottom: '2rem' }}>
                        <h1 className="admin-page-title">Verification Center</h1>
                        <p className="admin-page-subtitle">Review and manage platform identity submissions.</p>
                  </header>

                  <div className="tab-switcher" style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }}>
                        <button
                              onClick={() => setActiveTab('PENDING')}
                              className={`tab-btn ${activeTab === 'PENDING' ? 'active' : ''}`}
                              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'PENDING' ? '#8b5cf6' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                        >
                              Pending Queue <span style={{ background: 'rgba(0,0,0,0.2)', padding: '0.1rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.75rem' }}>{pendingDocs.length}</span>
                        </button>
                        <button
                              onClick={() => setActiveTab('ALL')}
                              className={`tab-btn ${activeTab === 'ALL' ? 'active' : ''}`}
                              style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'ALL' ? '#3b82f6' : 'transparent', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                        >
                              User Database
                        </button>
                  </div>

                  {activeTab === 'ALL' && (
                        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                              <div className="search-wrapper">
                                    <Search size={18} className="search-icon" />
                                    <input
                                          type="text"
                                          placeholder="Search database..."
                                          className="admin-search-input"
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                              </div>
                        </div>
                  )}

                  <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                        {activeTab === 'PENDING' ? (
                              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                                    <table className="admin-table">
                                          <thead>
                                                <tr>
                                                      <th>Identity Profile</th>
                                                      <th>Document Type</th>
                                                      <th>Submission</th>
                                                      <th style={{ textAlign: 'right' }}>Management</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {pendingDocs.length === 0 ? (
                                                      <tr>
                                                            <td colSpan="4" style={{ padding: '5rem', textAlign: 'center' }}>
                                                                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: '#10b981' }}>
                                                                        <CheckCircle size={32} />
                                                                  </div>
                                                                  <h3 style={{ color: 'white', margin: '0 0 0.5rem 0' }}>Queue Cleared</h3>
                                                                  <p style={{ color: 'rgba(255,255,255,0.4)', margin: 0 }}>All KYC submissions have been processed.</p>
                                                            </td>
                                                      </tr>
                                                ) : (
                                                      pendingDocs.map((doc) => (
                                                            <tr key={doc.id} className="clickable-row">
                                                                  <td onClick={() => setSelectedUserId(doc.userId)}>
                                                                        <div style={{ fontWeight: 600, color: 'white' }}>{doc.fullName || doc.user?.fullName}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#8b5cf6', marginTop: '0.2rem' }}>@{doc.username || doc.user?.username || String(doc.userId).padStart(5, '0')}</div>
                                                                  </td>
                                                                  <td>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'white', fontWeight: 500 }}>
                                                                              <FileText size={16} style={{ color: '#c4b5fd' }} /> {doc.documentType}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>ID: {doc.documentNumber}</div>
                                                                  </td>
                                                                  <td>
                                                                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{new Date(doc.createdAt).toLocaleDateString()}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>{new Date(doc.createdAt).toLocaleTimeString()}</div>
                                                                  </td>
                                                                  <td style={{ textAlign: 'right' }}>
                                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                              {(doc.presignedUrl || doc.documentUrl) && (
                                                                                    <button
                                                                                          onClick={(e) => { e.stopPropagation(); setViewingDocument(doc); }}
                                                                                          style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', color: '#3b82f6', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}
                                                                                    >
                                                                                          <Eye size={14} style={{ display: 'inline', marginRight: '4px' }} /> View
                                                                                    </button>
                                                                              )}
                                                                              <button
                                                                                    onClick={(e) => handleKycReview(doc.id, 'VERIFIED', doc.fullName || doc.user?.fullName, e)}
                                                                                    style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                                                                              >
                                                                                    Approve
                                                                              </button>
                                                                              <button
                                                                                    onClick={(e) => handleKycReview(doc.id, 'REJECTED', doc.fullName || doc.user?.fullName, e)}
                                                                                    style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}
                                                                              >
                                                                                    Reject
                                                                              </button>
                                                                        </div>
                                                                  </td>
                                                            </tr>
                                                      ))
                                                )}
                                          </tbody>
                                    </table>
                              </div>
                        ) : (
                              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                                    <table className="admin-table">
                                          <thead>
                                                <tr>
                                                      <th>Profile</th>
                                                      <th>Contact Info</th>
                                                      <th>Registration</th>
                                                      <th>KYC Status</th>
                                                      <th style={{ textAlign: 'right' }}>Management</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {filteredUsers.length === 0 ? (
                                                      <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No users found.</td></tr>
                                                ) : (
                                                      filteredUsers.map((usr) => (
                                                            <tr key={usr.id} className="clickable-row" onClick={() => setSelectedUserId(usr.id)}>
                                                                  <td>
                                                                        <div style={{ fontWeight: 600, color: 'white' }}>{usr.fullName}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>@{usr.username || String(usr.id).padStart(5, '0')}</div>
                                                                  </td>
                                                                  <td>
                                                                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{usr.email}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{usr.phone || 'No phone'}</div>
                                                                  </td>
                                                                  <td>
                                                                        <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>{new Date(usr.createdAt).toLocaleDateString()}</div>
                                                                  </td>
                                                                  <td>
                                                                        <span className={`badge ${usr.kycStatus === 'VERIFIED' ? 'badge-success' : usr.kycStatus === 'PENDING' ? 'badge-warning' : usr.kycStatus === 'REJECTED' ? 'badge-danger' : 'badge-primary'}`}>
                                                                              {usr.kycStatus}
                                                                        </span>
                                                                  </td>
                                                                  <td style={{ textAlign: 'right' }}>
                                                                        <div style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.85rem' }}>Inspect Profile</div>
                                                                  </td>
                                                            </tr>
                                                      ))
                                                )}
                                          </tbody>
                                    </table>
                              </div>
                        )}
                  </div>

                  {/* Mobile Card List (Pending only for focus) */}
                  <div className="mobile-show" style={{ padding: '1rem' }}>
                        {activeTab === 'PENDING' && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {pendingDocs.length === 0 ? (
                                          <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '1rem', color: '#10b981' }}>✓ Queue Clear</div>
                                    ) : (
                                          pendingDocs.map((doc) => (
                                                <div key={doc.id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                                            <div>
                                                                  <div style={{ fontWeight: 600, color: 'white' }}>{doc.fullName || doc.user?.fullName}</div>
                                                                  <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>ID: {doc.documentNumber}</div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                  <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Type</div>
                                                                  <div style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>{doc.documentType}</div>
                                                            </div>
                                                      </div>
                                                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                                            <button onClick={() => setViewingDocument(doc)} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'none', fontWeight: 700, fontSize: '0.8rem' }}>View</button>
                                                            <button onClick={() => handleKycReview(doc.id, 'VERIFIED', doc.fullName || doc.user?.fullName)} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', background: '#10b981', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.8rem' }}>Approve</button>
                                                            <button onClick={() => handleKycReview(doc.id, 'REJECTED', doc.fullName || doc.user?.fullName)} style={{ flex: 1, padding: '0.6rem', borderRadius: '0.5rem', background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, fontSize: '0.8rem' }}>Reject</button>
                                                      </div>
                                                </div>
                                          ))
                                    )}
                              </div>
                        )}
                  </div>

                  {/* Modals same as before but premium */}
                  {confirmModal && (
                        <div onClick={() => setConfirmModal(null)} className="sidebar-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                              <div onClick={(e) => e.stopPropagation()} style={{ background: '#121826', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.25rem', width: '100%', maxWidth: '450px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
                                    <div style={{ height: '4px', background: confirmModal.status === 'VERIFIED' ? '#10b981' : '#ef4444' }} />
                                    <div style={{ padding: '2rem' }}>
                                          <h3 style={{ margin: '0 0 1rem 0', color: 'white', fontSize: '1.25rem' }}>{confirmModal.status === 'VERIFIED' ? 'Approve Verification?' : 'Reject Verification?'}</h3>
                                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                                Are you sure you want to {confirmModal.status === 'VERIFIED' ? 'APPROVE' : 'REJECT'} <strong>{confirmModal.userName}</strong>? This action will be logged.
                                          </p>

                                          {confirmModal.status === 'REJECTED' && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>Reason for rejection</label>
                                                      <textarea
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            placeholder="State clearly why it was rejected..."
                                                            style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem', borderRadius: '0.5rem', minHeight: '100px', outline: 'none' }}
                                                      />
                                                </div>
                                          )}

                                          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                                <button onClick={() => setConfirmModal(null)} style={{ padding: '0.6rem 1.25rem', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.6rem', cursor: 'pointer' }}>Cancel</button>
                                                <button
                                                      onClick={executeKycReview}
                                                      disabled={processing}
                                                      style={{ padding: '0.6rem 1.25rem', background: confirmModal.status === 'VERIFIED' ? '#10b981' : '#ef4444', color: 'white', border: 'none', borderRadius: '0.6rem', cursor: 'pointer', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                >
                                                      {processing ? <Loader2 size={16} className="animate-spin" /> : 'Confirm Action'}
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}

                  {viewingDocument && (
                        <div onClick={() => setViewingDocument(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 11000, display: 'flex', flexDirection: 'column' }}>
                              <div onClick={e => e.stopPropagation()} style={{ padding: '1.5rem', background: '#0b0f19', borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ color: 'white' }}>
                                          <h4 style={{ margin: 0 }}>{viewingDocument.fullName || viewingDocument.user?.fullName}</h4>
                                          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{viewingDocument.documentType} | {viewingDocument.documentNumber}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                          <button onClick={() => handleKycReview(viewingDocument.id, 'VERIFIED', viewingDocument.fullName || viewingDocument.user?.fullName)} style={{ padding: '0.5rem 1.25rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>Approve</button>
                                          <button onClick={() => handleKycReview(viewingDocument.id, 'REJECTED', viewingDocument.fullName || viewingDocument.user?.fullName)} style={{ padding: '0.5rem 1.25rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: 700, cursor: 'pointer' }}>Reject</button>
                                          <button onClick={() => setViewingDocument(null)} style={{ padding: '0.5rem', color: 'white', background: 'transparent', border: 'none', fontSize: '1.5rem', marginLeft: '1rem' }}>×</button>
                                    </div>
                              </div>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                                    <img src={viewingDocument.presignedUrl || viewingDocument.documentUrl} alt="KYC" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '0.5rem', boxShadow: '0 0 50px rgba(0,0,0,0.5)' }} />
                              </div>
                        </div>
                  )}

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
