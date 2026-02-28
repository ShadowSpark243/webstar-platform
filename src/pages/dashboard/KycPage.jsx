import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Upload, CheckCircle, Clock, ShieldCheck, Check, X, AlertOctagon, Loader2 } from 'lucide-react';
import './Dashboard.css';



const KycPage = () => {
      const { user, setUser } = useAuth();
      const [documentType, setDocumentType] = useState('AADHAR');
      const [documentNumber, setDocumentNumber] = useState('');
      const [isUploading, setIsUploading] = useState(false);
      const [uploadedFile, setUploadedFile] = useState(null);
      const [showReKyc, setShowReKyc] = useState(false);

      const handleFileChange = (e) => {
            if (e.target.files[0]) {
                  setUploadedFile(e.target.files[0]);
            }
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setIsUploading(true);

            try {
                  const formData = new FormData();
                  formData.append('documentType', documentType);
                  formData.append('documentNumber', documentNumber);
                  formData.append('documentImage', uploadedFile);

                  const res = await api.post('/wallet/kyc/submit', formData, {
                        headers: {
                              'Content-Type': 'multipart/form-data'
                        }
                  });

                  if (res.data.success) {
                        setUser(res.data.user);
                        setShowReKyc(false);
                        setUploadedFile(null);
                        setDocumentNumber('');
                        alert("KYC Submitted successfully! It is now Pending admin review.");
                  }
            } catch (err) {
                  alert('KYC Submission Failed: ' + (err.response?.data?.message || err.message));
            } finally {
                  setIsUploading(false);
            }
      };

      const showUploadForm = user?.kycStatus === 'UNVERIFIED' || showReKyc;

      return (
            <div className="dashboard-page">
                  <header className="page-header">
                        <div>
                              <h1 className="page-title">KYC & Verification</h1>
                              <p className="page-subtitle">Verify your identity to unlock all platform features.</p>
                        </div>
                  </header>

                  <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '2rem' }}>

                        {/* Upload Section */}
                        {showUploadForm && (
                              <div className="dashboard-card glass-panel" style={{ gridColumn: '1 / -1', maxWidth: '800px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                          <h2 className="card-title" style={{ margin: 0 }}>{showReKyc ? 'Re-submit Documents' : 'Upload Documents'}</h2>
                                          {showReKyc && (
                                                <button onClick={() => setShowReKyc(false)} className="btn btn-outline" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem', color: '#94a3b8', borderColor: 'rgba(255,255,255,0.2)' }}>
                                                      Cancel
                                                </button>
                                          )}
                                    </div>

                                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                          <div className="form-group">
                                                <label>Document Type</label>
                                                <select
                                                      className="dashboard-input"
                                                      value={documentType}
                                                      onChange={(e) => setDocumentType(e.target.value)}
                                                      style={{
                                                            width: '100%',
                                                            padding: '0.875rem 1rem',
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            color: 'white',
                                                            borderRadius: '0.75rem'
                                                      }}
                                                >
                                                      <option value="AADHAR" style={{ color: 'black' }}>Aadhar Card</option>
                                                      <option value="PAN" style={{ color: 'black' }}>PAN Card</option>
                                                      <option value="PASSPORT" style={{ color: 'black' }}>Passport</option>
                                                </select>
                                          </div>

                                          <div className="form-group">
                                                <label>Document Number</label>
                                                <input
                                                      type="text"
                                                      required
                                                      placeholder="Enter your document number"
                                                      className="dashboard-input"
                                                      value={documentNumber}
                                                      onChange={(e) => setDocumentNumber(e.target.value)}
                                                      style={{
                                                            width: '100%',
                                                            padding: '0.875rem 1rem',
                                                            background: 'rgba(255, 255, 255, 0.05)',
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                            color: 'white',
                                                            borderRadius: '0.75rem'
                                                      }}
                                                />
                                          </div>

                                          <div className="form-group">
                                                <label>Upload Image</label>
                                                <div
                                                      className="upload-area"
                                                      style={{
                                                            border: '2px dashed rgba(255, 255, 255, 0.2)',
                                                            borderRadius: '0.75rem',
                                                            padding: '2rem',
                                                            textAlign: 'center',
                                                            cursor: 'pointer',
                                                            position: 'relative'
                                                      }}
                                                >
                                                      <input
                                                            type="file"
                                                            accept="image/*,.pdf"
                                                            onChange={handleFileChange}
                                                            required
                                                            style={{
                                                                  position: 'absolute',
                                                                  top: 0, left: 0, width: '100%', height: '100%',
                                                                  opacity: 0, cursor: 'pointer'
                                                            }}
                                                      />
                                                      <Upload size={32} className="text-muted" style={{ margin: '0 auto 1rem auto' }} />
                                                      {uploadedFile ? (
                                                            <p style={{ color: '#3b82f6', fontWeight: 500 }}>{uploadedFile.name}</p>
                                                      ) : (
                                                            <>
                                                                  <p style={{ color: 'white' }}>Click to upload or drag and drop</p>
                                                                  <p style={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.8rem', marginTop: '0.5rem' }}>PNG, JPG or PDF (Max 5MB)</p>
                                                            </>
                                                      )}
                                                </div>
                                          </div>

                                          <button type="submit" className="btn btn-primary" disabled={isUploading || !uploadedFile} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                {isUploading ? <><Loader2 size={18} className="animate-spin" /> Uploading...</> : (showReKyc ? 'Re-submit Documents' : 'Submit Documents')}
                                          </button>
                                    </form>
                              </div>
                        )}

                        {/* Status Section */}
                        <div className="dashboard-card glass-panel" style={{ gridColumn: '1 / -1', maxWidth: '800px' }}>
                              <h2 className="card-title">Verification Status</h2>

                              {user?.kycStatus === 'UNVERIFIED' && (
                                    <div className="status-display" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '0.75rem' }}>
                                          <div className="stat-icon-wrapper purple"><Upload size={24} /></div>
                                          <div>
                                                <h4 style={{ margin: '0 0 0.25rem 0' }}>Not Submitted</h4>
                                                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.9rem' }}>Please upload your documents above to complete verification.</p>
                                          </div>
                                    </div>
                              )}

                              {user?.kycStatus === 'PENDING' && (
                                    <div className="status-display" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b' }}><Clock size={24} /></div>
                                          <div>
                                                <h4 style={{ margin: '0 0 0.25rem 0', color: '#f59e0b' }}>Verification Pending</h4>
                                                <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Your documents are under review. This usually takes 24-48 hours.</p>
                                          </div>
                                    </div>
                              )}

                              {user?.kycStatus === 'VERIFIED' && (
                                    <div>
                                          <div className="status-display" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                                                <div className="stat-icon-wrapper accent"><CheckCircle size={24} /></div>
                                                <div style={{ flex: 1 }}>
                                                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#10b981' }}>Verified Successfully</h4>
                                                      <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Your identity has been verified. You have full access to the platform.</p>
                                                </div>
                                          </div>
                                          {!showReKyc && (
                                                <button onClick={() => setShowReKyc(true)} className="btn btn-outline" style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', fontSize: '0.85rem', color: '#94a3b8', borderColor: 'rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.03)' }}>
                                                      <ShieldCheck size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} /> Re-submit KYC Documents
                                                </button>
                                          )}
                                    </div>
                              )}

                              {user?.kycStatus === 'REJECTED' && (
                                    <div>
                                          <div className="status-display" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                                <div className="stat-icon-wrapper" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}><AlertOctagon size={24} /></div>
                                                <div style={{ flex: 1 }}>
                                                      <h4 style={{ margin: '0 0 0.25rem 0', color: '#ef4444' }}>Verification Rejected</h4>
                                                      <p style={{ margin: 0, color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.9rem' }}>Your documents were rejected. Please re-submit with clearer documents.</p>
                                                      {user?.kycDocuments?.rejectionReason && (
                                                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.15)', borderLeft: '3px solid #ef4444', borderRadius: '0 0.5rem 0.5rem 0', color: '#fca5a5', fontSize: '0.85rem' }}>
                                                                  <strong>Admin Note:</strong> {user.kycDocuments.rejectionReason}
                                                            </div>
                                                      )}
                                                </div>
                                          </div>
                                          {!showReKyc && (
                                                <button onClick={() => setShowReKyc(true)} className="btn btn-primary" style={{ marginTop: '1rem', padding: '0.6rem 1.5rem', fontSize: '0.9rem', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', border: 'none' }}>
                                                      <Upload size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.4rem' }} /> Re-submit KYC Documents
                                                </button>
                                          )}
                                    </div>
                              )}
                        </div>

                  </div>
            </div>
      );
};

export default KycPage;
