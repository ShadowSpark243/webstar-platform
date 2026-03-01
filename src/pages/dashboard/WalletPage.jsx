import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Wallet as WalletIcon, ArrowDownToLine, Landmark, ArrowUpRight, User, Search, Loader2, Filter, Copy, Check } from 'lucide-react';
import UserDetailsModal from '../../components/UserDetailsModal';
import TransactionDetailsModal from '../../components/TransactionDetailsModal';
import qrImage from '../../assets/Webfilms1.jpeg';
import './Dashboard.css';

const WalletPage = () => {
      const { user } = useAuth();
      const [depositAmount, setDepositAmount] = useState('');
      const [utrNumber, setUtrNumber] = useState('');
      const [receiptFile, setReceiptFile] = useState(null);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [copiedText, setCopiedText] = useState('');

      // Live Database State
      const [transactions, setTransactions] = useState([]);
      const [loadingHistory, setLoadingHistory] = useState(true);

      // Admin State
      const [depositQueue, setDepositQueue] = useState([]);
      const [selectedUserId, setSelectedUserId] = useState(null);
      const [searchQuery, setSearchQuery] = useState('');
      const [txSearchQuery, setTxSearchQuery] = useState('');
      const [txTypeFilter, setTxTypeFilter] = useState('ALL');
      const [txStatusFilter, setTxStatusFilter] = useState('ALL');
      const [selectedTransaction, setSelectedTransaction] = useState(null);

      // Deposit Review State
      const [depositConfirmModal, setDepositConfirmModal] = useState(null); // { transactionId, status, amount, userName }
      const [depositRejectionReason, setDepositRejectionReason] = useState('');
      const [processingReview, setProcessingReview] = useState(false);

      const fetchData = async () => {
            setLoadingHistory(true);
            try {
                  const historyUrl = user?.role === 'ADMIN' ? '/admin/transactions' : '/wallet/history';
                  const res = await api.get(historyUrl);

                  if (res.data.success) {
                        setTransactions(user?.role === 'ADMIN' ? res.data.transactions : res.data.history);
                  }

                  if (user?.role === 'ADMIN') {
                        const adminRes = await api.get('/admin/deposits');
                        if (adminRes.data.success) {
                              setDepositQueue(adminRes.data.deposits);
                        }
                  }
            } catch (error) {
                  console.error('Failed to fetch wallet data:', error);
            } finally {
                  setLoadingHistory(false);
            }
      };

      useEffect(() => {
            fetchData();
      }, [user?.role]);

      const handleReviewDepositClick = (dep, status, e) => {
            e.stopPropagation();
            setDepositConfirmModal({ transactionId: dep.id, status, amount: dep.amount, userName: dep.user.fullName });
            setDepositRejectionReason('');
      };

      const executeDepositReview = async () => {
            if (!depositConfirmModal) return;
            if (depositConfirmModal.status === 'REJECTED' && !depositRejectionReason.trim()) {
                  alert("Please provide a reason for rejection.");
                  return;
            }
            setProcessingReview(true);
            try {
                  await api.put('/admin/deposits/review', {
                        transactionId: depositConfirmModal.transactionId,
                        status: depositConfirmModal.status,
                        rejectionReason: depositRejectionReason
                  });
                  setDepositConfirmModal(null);
                  setDepositRejectionReason('');
                  fetchData();
            } catch (error) {
                  alert('Failed to process deposit review: ' + (error.response?.data?.message || error.message));
            } finally {
                  setProcessingReview(false);
            }
      };

      const handleDeposit = async (e) => {
            e.preventDefault();
            setIsSubmitting(true);

            try {
                  const amount = parseFloat(depositAmount);
                  const formData = new FormData();
                  formData.append('amount', amount);
                  formData.append('utrNumber', utrNumber);
                  if (receiptFile) {
                        formData.append('receiptImage', receiptFile);
                  }

                  await api.post('/wallet/deposit', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                  });

                  setDepositAmount('');
                  setUtrNumber('');
                  setReceiptFile(null);
                  alert(`Deposit request for ₹${amount.toLocaleString('en-IN')} submitted successfully! An admin will verify the receipt and credit your account shortly.`);
                  fetchData(); // Refresh history
            } catch (error) {
                  alert('Deposit request failed: ' + (error.response?.data?.message || error.message));
            } finally {
                  setIsSubmitting(false);
            }
      };

      const filteredDeposits = depositQueue.filter(dep =>
            dep.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dep.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dep.bankReference.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const filteredTransactions = transactions.filter(tx => {
            if (txTypeFilter !== 'ALL' && tx.type !== txTypeFilter) return false;
            if (txStatusFilter !== 'ALL' && tx.status !== txStatusFilter) return false;

            if (!txSearchQuery) return true;
            const lowerQ = txSearchQuery.toLowerCase();
            const matchTx = tx.description?.toLowerCase().includes(lowerQ) || tx.status?.toLowerCase().includes(lowerQ);
            const matchUser = tx.user && (
                  tx.user.fullName?.toLowerCase().includes(lowerQ) ||
                  tx.user.email?.toLowerCase().includes(lowerQ) ||
                  tx.user.username?.toLowerCase().includes(lowerQ)
            );
            return matchTx || matchUser;
      });

      return (
            <div className="dashboard-page">
                  <header className="page-header">
                        <div>
                              <h1 className="page-title">{user?.role === 'ADMIN' ? 'Wallet' : 'My Wallet'}</h1>
                              <p className="page-subtitle">{user?.role === 'ADMIN' ? 'Manage system funds and manual deposits.' : 'Manage your funds and make manual deposits.'}</p>
                        </div>
                  </header>

                  {/* Current Balance Card */}
                  <div className="stat-card glass-panel" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                              <span className="stat-title">Current Balance</span>
                              <h3 className="stat-value" style={{ fontSize: '2.5rem', marginTop: '0.5rem' }}>
                                    ₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}
                              </h3>
                        </div>
                        <div className="stat-icon-wrapper primary" style={{ padding: '1rem' }}>
                              <WalletIcon size={48} />
                        </div>
                  </div>

                  <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                        {/* Standard Users see the forms */}
                        {user?.role !== 'ADMIN' && (
                              <>
                                    {/* Payment Options Section */}
                                    <div className="dashboard-card glass-panel" style={{ gridColumn: '1 / -1' }}>
                                          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Landmark className="text-primary" /> Payment Methods
                                          </h2>
                                          <p className="text-muted" style={{ marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                                Transfer the amount via QR Code or Bank Transfer, then submit a deposit request with your UTR/Reference number.
                                          </p>

                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                                {/* Left: QR Code (UPI) */}
                                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            Scanner / UPI
                                                      </h3>
                                                      <div style={{ background: 'white', padding: '0.75rem', borderRadius: '1rem', marginBottom: '1rem', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)' }}>
                                                            <img src={qrImage} alt="Payment QR Code" style={{ width: '180px', height: '180px', objectFit: 'contain', display: 'block' }} />
                                                      </div>
                                                      <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '0.6rem 1rem', borderRadius: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            <span style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: 600 }}>UPI: webfilms@kotak</span>
                                                            <button
                                                                  onClick={() => {
                                                                        navigator.clipboard.writeText('webfilms@kotak');
                                                                        setCopiedText('upi');
                                                                        setTimeout(() => setCopiedText(''), 2000);
                                                                  }}
                                                                  style={{ background: 'transparent', border: 'none', color: copiedText === 'upi' ? '#10b981' : 'rgba(255,255,255,0.6)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                                                                  title="Copy UPI ID"
                                                            >
                                                                  {copiedText === 'upi' ? <Check size={14} /> : <Copy size={14} />}
                                                            </button>
                                                      </div>
                                                </div>

                                                {/* Right: Bank Details */}
                                                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
                                                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            Direct Bank Transfer
                                                      </h3>
                                                      <div>
                                                            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>Bank Name</span>
                                                            <p style={{ margin: 0, fontWeight: 500, color: 'white' }}>KOTAK MAHINDRA BANK</p>
                                                      </div>
                                                      <div>
                                                            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)' }}>Account Name</span>
                                                            <p style={{ margin: 0, fontWeight: 500, color: 'white' }}>ITRAM MANAGEMENT LLP</p>
                                                      </div>
                                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}>
                                                            <div>
                                                                  <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', display: 'block', marginBottom: '0.2rem' }}>Account Number</span>
                                                                  <p style={{ margin: 0, fontWeight: 700, color: '#3b82f6', letterSpacing: '1px' }}>1249346867</p>
                                                            </div>
                                                            <button
                                                                  onClick={() => {
                                                                        navigator.clipboard.writeText('1249346867');
                                                                        setCopiedText('acc');
                                                                        setTimeout(() => setCopiedText(''), 2000);
                                                                  }}
                                                                  style={{ background: 'transparent', border: 'none', color: copiedText === 'acc' ? '#10b981' : 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '0.5rem' }}
                                                            >
                                                                  {copiedText === 'acc' ? <Check size={16} /> : <Copy size={16} />}
                                                            </button>
                                                      </div>
                                                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)', padding: '0.5rem 0.75rem', borderRadius: '0.5rem' }}>
                                                            <div>
                                                                  <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', display: 'block', marginBottom: '0.2rem' }}>IFSC Code</span>
                                                                  <p style={{ margin: 0, fontWeight: 600, color: 'white' }}>KKBK0001487</p>
                                                            </div>
                                                            <button
                                                                  onClick={() => {
                                                                        navigator.clipboard.writeText('KKBK0001487');
                                                                        setCopiedText('ifsc');
                                                                        setTimeout(() => setCopiedText(''), 2000);
                                                                  }}
                                                                  style={{ background: 'transparent', border: 'none', color: copiedText === 'ifsc' ? '#10b981' : 'rgba(255,255,255,0.6)', cursor: 'pointer', padding: '0.5rem' }}
                                                            >
                                                                  {copiedText === 'ifsc' ? <Check size={16} /> : <Copy size={16} />}
                                                            </button>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>

                                    {/* Deposit Form */}
                                    <div className="dashboard-card glass-panel">
                                          <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <ArrowDownToLine className="text-green-400" /> Submit Deposit Request
                                          </h2>

                                          <form onSubmit={handleDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <div className="form-group">
                                                      <label>Amount Transferred (₹)</label>
                                                      <input
                                                            type="number"
                                                            required
                                                            min="1000"
                                                            placeholder="E.g. 100000"
                                                            className="dashboard-input"
                                                            value={depositAmount}
                                                            onChange={(e) => setDepositAmount(e.target.value)}
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
                                                      <label>UTR / Transaction Reference Number</label>
                                                      <input
                                                            type="text"
                                                            required
                                                            placeholder="E.g. UPI1234567890"
                                                            className="dashboard-input"
                                                            value={utrNumber}
                                                            onChange={(e) => setUtrNumber(e.target.value)}
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
                                                      <label>Payment Receipt / Screenshot</label>
                                                      <input
                                                            type="file"
                                                            required
                                                            accept="image/*,.pdf"
                                                            onChange={(e) => setReceiptFile(e.target.files[0])}
                                                            style={{
                                                                  width: '100%',
                                                                  padding: '0.875rem 1rem',
                                                                  background: 'rgba(255, 255, 255, 0.05)',
                                                                  border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                  color: 'white',
                                                                  borderRadius: '0.75rem'
                                                            }}
                                                      />
                                                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>
                                                            Upload a screenshot of your payment confirmation for faster verification.
                                                      </p>
                                                </div>

                                                <button type="submit" className="btn btn-primary" disabled={isSubmitting || !depositAmount || !utrNumber || !receiptFile}>
                                                      {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Submit Request'}
                                                </button>
                                          </form>
                                    </div>
                              </>
                        )}
                  </div>

                  {/* Admin Pending Manual Deposits */}
                  {user?.role === 'ADMIN' && (
                        <div className="dashboard-card glass-panel" style={{ padding: 0, overflow: 'hidden', marginTop: '2rem' }}>
                              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h2 className="card-title" style={{ margin: 0 }}>Pending Manual Deposits (Admin view)</h2>
                                    <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
                                          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                          <input
                                                type="text"
                                                placeholder="Search by name, email or UTR..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="dashboard-input"
                                                style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '2rem' }}
                                          />
                                    </div>
                              </div>
                              <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', display: 'block', WebkitOverflowScrolling: 'touch' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                          <thead>
                                                <tr style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>User info</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Bank UTR / Reference</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Amount (₹)</th>
                                                      <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Action</th>
                                                </tr>
                                          </thead>
                                          <tbody>
                                                {filteredDeposits.length === 0 ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No pending deposit requests found.</td></tr> : filteredDeposits.map((dep) => (
                                                      <tr
                                                            key={dep.id}
                                                            style={{ borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                                                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                      >
                                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 500 }} onClick={() => setSelectedUserId(dep.userId)}>
                                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6' }}><User size={16} /> {dep.user.fullName}</div>
                                                                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginLeft: '1.5rem' }}>{dep.user.email}</span>
                                                            </td>
                                                            <td style={{ padding: '1rem 1.5rem', color: '#3b82f6', letterSpacing: '1px', fontSize: '0.9rem' }} onClick={() => setSelectedUserId(dep.userId)}>
                                                                  {dep.bankReference}
                                                                  {dep.receiptUrl && (
                                                                        <div style={{ marginTop: '0.3rem' }}>
                                                                              <a href={dep.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                                                                    <ArrowUpRight size={12} /> View Receipt
                                                                              </a>
                                                                        </div>
                                                                  )}
                                                            </td>
                                                            <td style={{ padding: '1rem 1.5rem', fontWeight: 700 }} onClick={() => setSelectedUserId(dep.userId)}>₹{dep.amount.toLocaleString('en-IN')}</td>
                                                            <td style={{ padding: '1rem 1.5rem', display: 'flex', gap: '0.5rem' }}>
                                                                  <button onClick={(e) => handleReviewDepositClick(dep, 'APPROVED', e)} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>Verify & Credit</button>
                                                                  <button onClick={(e) => handleReviewDepositClick(dep, 'REJECTED', e)} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}>Reject</button>
                                                            </td>
                                                      </tr>
                                                ))}
                                          </tbody>
                                    </table>
                              </div>
                        </div>
                  )}

                  {/* Deposit Review Confirmation Modal */}
                  {depositConfirmModal && (
                        <div
                              onClick={() => setDepositConfirmModal(null)}
                              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000, padding: '1rem' }}
                        >
                              <div
                                    onClick={(e) => e.stopPropagation()}
                                    style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #111 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', width: '100%', maxWidth: '420px', overflow: 'hidden', animation: 'fadeIn 0.2s ease' }}
                              >
                                    <div style={{ height: '3px', background: depositConfirmModal.status === 'APPROVED' ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f87171, #ef4444)' }} />
                                    <div style={{ padding: '1.5rem' }}>
                                          <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>
                                                {depositConfirmModal.status === 'APPROVED' ? '✅ Verify Content Deposit' : '❌ Reject Deposit'}
                                          </h3>
                                          <p style={{ margin: '0 0 1.5rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>
                                                Are you sure you want to <strong style={{ color: depositConfirmModal.status === 'APPROVED' ? '#10b981' : '#ef4444' }}>{depositConfirmModal.status === 'APPROVED' ? 'approve' : 'reject'}</strong> a deposit of <strong style={{ color: 'white' }}>₹{depositConfirmModal.amount.toLocaleString('en-IN')}</strong> for <strong style={{ color: 'white' }}>{depositConfirmModal.userName}</strong>?
                                                {depositConfirmModal.status === 'APPROVED' ? ' This will instantly credit their wallet.' : ' This will mark the transaction as rejected.'}
                                          </p>

                                          {depositConfirmModal.status === 'REJECTED' && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Reason for Rejection *</label>
                                                      <textarea
                                                            placeholder="State the reason (e.g., Invalid UTR, Name Mismatch)"
                                                            value={depositRejectionReason}
                                                            onChange={(e) => setDepositRejectionReason(e.target.value)}
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
                                                      onClick={() => setDepositConfirmModal(null)}
                                                      disabled={processingReview}
                                                      style={{ padding: '0.6rem 1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
                                                >
                                                      Cancel
                                                </button>
                                                <button
                                                      onClick={executeDepositReview}
                                                      disabled={processingReview}
                                                      style={{
                                                            padding: '0.6rem 1.25rem',
                                                            background: depositConfirmModal.status === 'APPROVED' ? '#10b981' : '#ef4444',
                                                            border: 'none', color: 'white', borderRadius: '0.5rem',
                                                            cursor: processingReview ? 'not-allowed' : 'pointer',
                                                            fontWeight: 600, fontSize: '0.85rem',
                                                            opacity: processingReview ? 0.6 : 1,
                                                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                                                      }}
                                                >
                                                      {processingReview ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : `Confirm ${depositConfirmModal.status === 'APPROVED' ? 'Approve' : 'Reject'}`}
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* Transaction History */}
                  <div className="dashboard-card glass-panel" style={{ marginTop: '2rem', padding: 0 }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }} className="wallet-header-flex">
                              <h2 className="card-title" style={{ margin: 0, fontSize: '1.1rem' }}>Transaction Ledger</h2>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', flex: '1 1 300px', justifyContent: 'flex-end' }} className="wallet-actions-flex">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', flex: '1 1 auto', maxWidth: '100%' }}>
                                          <Filter size={16} style={{ color: 'rgba(255,255,255,0.5)', marginLeft: '0.5rem' }} />
                                          <select
                                                value={txTypeFilter}
                                                onChange={(e) => setTxTypeFilter(e.target.value)}
                                                style={{ padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.8rem', cursor: 'pointer', flex: 1, minWidth: '80px' }}
                                          >
                                                <option value="ALL" style={{ background: '#1a1a2e' }}>All Types</option>
                                                <option value="DEPOSIT" style={{ background: '#1a1a2e' }}>Deposit</option>
                                                <option value="WITHDRAWAL" style={{ background: '#1a1a2e' }}>Withdrawal</option>
                                                <option value="INVESTMENT" style={{ background: '#1a1a2e' }}>Investment</option>
                                                <option value="RETURN" style={{ background: '#1a1a2e' }}>ROI Return</option>
                                                <option value="COMMISSION" style={{ background: '#1a1a2e' }}>Commission</option>
                                                <option value="BONUS" style={{ background: '#1a1a2e' }}>Bonus</option>
                                          </select>

                                          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.2)' }}></div>

                                          <select
                                                value={txStatusFilter}
                                                onChange={(e) => setTxStatusFilter(e.target.value)}
                                                style={{ padding: '0.4rem 0.5rem', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.8rem', cursor: 'pointer', flex: 1, minWidth: '80px' }}
                                          >
                                                <option value="ALL" style={{ background: '#1a1a2e' }}>All Status</option>
                                                <option value="APPROVED" style={{ background: '#1a1a2e' }}>Approved / Success</option>
                                                <option value="PENDING" style={{ background: '#1a1a2e' }}>Pending</option>
                                                <option value="REJECTED" style={{ background: '#1a1a2e' }}>Rejected</option>
                                          </select>
                                    </div>

                                    <div style={{ position: 'relative', maxWidth: '100%', width: '100%', flex: '1 1 200px' }}>
                                          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                          <input
                                                type="text"
                                                placeholder="Search transactions..."
                                                value={txSearchQuery}
                                                onChange={(e) => setTxSearchQuery(e.target.value)}
                                                className="dashboard-input"
                                                style={{ width: '100%', padding: '0.6rem 1rem 0.6rem 2.22rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '2rem', fontSize: '0.85rem' }}
                                          />
                                    </div>
                              </div>
                        </div>

                        {loadingHistory ? (
                              <div style={{ color: 'rgba(255,255,255,0.5)', padding: '2rem', textAlign: 'center' }}>Loading history...</div>
                        ) : filteredTransactions.length > 0 ? (
                              <div className="transaction-list">
                                    {filteredTransactions.map(tx => (
                                          <div
                                                key={tx.id}
                                                className="transaction-item"
                                                onClick={() => setSelectedTransaction(tx)}
                                                style={{
                                                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                      padding: '0.875rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                      cursor: 'pointer', transition: 'background 0.15s', gap: '0.75rem'
                                                }}
                                          >
                                                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center', minWidth: 0, flex: 1 }}>
                                                      <div style={{
                                                            background: tx.status === 'REJECTED' ? 'rgba(255, 255, 255, 0.05)' : (['DEPOSIT', 'COMMISSION'].includes(tx.type) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'),
                                                            color: tx.status === 'REJECTED' ? '#9ca3af' : (['DEPOSIT', 'COMMISSION'].includes(tx.type) ? '#10b981' : '#ef4444'),
                                                            padding: '0.55rem', borderRadius: '50%', flexShrink: 0
                                                      }}>
                                                            {['DEPOSIT', 'COMMISSION'].includes(tx.type) ? <ArrowDownToLine size={18} /> : <ArrowUpRight size={18} />}
                                                      </div>
                                                      <div style={{ minWidth: 0, flex: 1 }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                                                                  <span style={{
                                                                        fontWeight: 600, fontSize: '0.88rem',
                                                                        color: tx.status === 'REJECTED' ? '#9ca3af' : 'white',
                                                                        textDecoration: tx.status === 'REJECTED' ? 'line-through' : 'none',
                                                                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                                                                        maxWidth: '180px'
                                                                  }}>
                                                                        {tx.description || tx.type}
                                                                  </span>
                                                                  <span style={{
                                                                        fontSize: '0.65rem', padding: '0.1rem 0.4rem',
                                                                        borderRadius: '0.75rem', fontWeight: 600, flexShrink: 0,
                                                                        background: tx.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : tx.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                                                        color: tx.status === 'APPROVED' ? '#10b981' : tx.status === 'PENDING' ? '#f59e0b' : '#ef4444'
                                                                  }}>
                                                                        {tx.status}
                                                                  </span>
                                                            </div>
                                                            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>
                                                                  {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                            </p>
                                                      </div>
                                                </div>
                                                <div style={{
                                                      color: tx.status === 'REJECTED' ? '#6b7280' : (['DEPOSIT', 'COMMISSION'].includes(tx.type) ? '#10b981' : '#f87171'),
                                                      fontWeight: 700, fontSize: 'clamp(0.85rem, 3vw, 1rem)',
                                                      textDecoration: tx.status === 'REJECTED' ? 'line-through' : 'none',
                                                      whiteSpace: 'nowrap', flexShrink: 0, textAlign: 'right'
                                                }}>
                                                      {tx.status === 'REJECTED' ? '' : (['DEPOSIT', 'COMMISSION'].includes(tx.type) ? '+' : '-')}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                                </div>
                                          </div>
                                    ))}
                              </div>
                        ) : (
                              <div className="empty-state" style={{ padding: '3rem', textAlign: 'center' }}>
                                    <WalletIcon size={48} className="text-muted mb-4" style={{ margin: '0 auto 1rem auto' }} />
                                    <p style={{ color: 'rgba(255,255,255,0.6)' }}>No transactions found.</p>
                              </div>
                        )}
                  </div>

                  {/* Transaction Details Modal */}
                  {selectedTransaction && (
                        <TransactionDetailsModal
                              transaction={selectedTransaction}
                              onClose={() => setSelectedTransaction(null)}
                              onInspectUser={user?.role === 'ADMIN' ? (userId) => setSelectedUserId(userId) : undefined}
                        />
                  )}

                  {/* Unified User Details Modal (Admin Only) */}
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

export default WalletPage;
