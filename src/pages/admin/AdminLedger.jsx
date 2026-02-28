import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, User, ArrowDownToLine, ArrowUpRight, Activity, Wallet, Briefcase, Network } from 'lucide-react';
import UserDetailsModal from '../../components/UserDetailsModal';
import TransactionDetailsModal from '../../components/TransactionDetailsModal';

const AdminLedger = () => {
      const [pendingDeposits, setPendingDeposits] = useState([]);
      const [transactions, setTransactions] = useState([]);
      const [loading, setLoading] = useState(true);
      const [loadingHistory, setLoadingHistory] = useState(true);

      const [searchQuery, setSearchQuery] = useState('');
      const [txSearchQuery, setTxSearchQuery] = useState('');
      const [activeTab, setActiveTab] = useState('ALL');
      const [selectedUserId, setSelectedUserId] = useState(null);
      const [selectedTransaction, setSelectedTransaction] = useState(null);

      const fetchDeposits = async () => {
            try {
                  const res = await api.get('/admin/deposits');
                  setPendingDeposits(res.data.deposits);
            } catch (error) {
                  console.error("Failed to fetch pending deposits", error);
            }
      };

      const fetchTransactions = async () => {
            setLoadingHistory(true);
            try {
                  const res = await api.get('/admin/transactions');
                  setTransactions(res.data.transactions);
            } catch (error) {
                  console.error("Failed to fetch global transactions", error);
            } finally {
                  setLoadingHistory(false);
            }
      };

      const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchDeposits(), fetchTransactions()]);
            setLoading(false);
      };

      useEffect(() => {
            fetchData();
      }, []);

      const [confirmModal, setConfirmModal] = useState({ isOpen: false, depositId: null, status: null, isLoading: false, rejectionReason: '' });

      const handleReviewClick = (depositId, status) => {
            setConfirmModal({ isOpen: true, depositId, status, isLoading: false, rejectionReason: '' });
      };

      const executeReview = async () => {
            const { depositId, status, rejectionReason } = confirmModal;

            if (status === 'REJECTED' && (!rejectionReason || !rejectionReason.trim())) {
                  alert("Please provide a reason for rejection.");
                  return;
            }

            setConfirmModal(prev => ({ ...prev, isLoading: true }));
            try {
                  const res = await api.put('/admin/deposits/review', { transactionId: parseInt(depositId), status, rejectionReason });
                  if (res.data.success) {
                        alert(`Success: Deposit has been ${status === 'APPROVED' ? 'Approved' : 'Rejected'} and the database is updated.`);
                        setConfirmModal({ isOpen: false, depositId: null, status: null, isLoading: false, rejectionReason: '' });
                        fetchData(); // Refresh both deposits and ledger
                  }
            } catch (error) {
                  alert("Failed to process deposit: " + (error.response?.data?.message || 'Unknown error'));
                  setConfirmModal(prev => ({ ...prev, isLoading: false }));
            }
      };

      const filteredDeposits = pendingDeposits.filter(d =>
            (d.user?.fullName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            (d.user?.email || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
            (d.bankReference || '').toLowerCase().includes((searchQuery || '').toLowerCase())
      );

      const filteredTransactions = transactions.filter(t => {
            const matchesSearch = (t.description || '').toLowerCase().includes((txSearchQuery || '').toLowerCase()) ||
                  (t.user?.fullName || '').toLowerCase().includes((txSearchQuery || '').toLowerCase()) ||
                  (t.user?.email || '').toLowerCase().includes((txSearchQuery || '').toLowerCase());

            if (!matchesSearch) return false;

            if (activeTab === 'DEPOSITS') return t.type === 'DEPOSIT';
            if (activeTab === 'COMMISSIONS') return t.type === 'COMMISSION';
            if (activeTab === 'INVESTMENTS') return t.type === 'INVESTMENT';

            return true;
      });

      // High-Level Financial Metrics
      const totalCollected = transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'APPROVED').reduce((sum, t) => sum + t.amount, 0);
      const totalInvested = transactions.filter(t => t.type === 'INVESTMENT').reduce((sum, t) => sum + t.amount, 0);
      const totalCommissionsPaid = transactions.filter(t => t.type === 'COMMISSION').reduce((sum, t) => sum + t.amount, 0);
      const totalWithdrawals = transactions.filter(t => t.type === 'WITHDRAWAL' && (t.status === 'APPROVED' || t.status === 'PENDING')).reduce((sum, t) => sum + t.amount, 0);

      return (
            <div>
                  <h1 className="admin-page-title">Global Ledger</h1>
                  <p className="admin-page-subtitle" style={{ marginBottom: '2rem' }}>Platform-wide financial tracking and deposit approvals.</p>

                  {/* Financial Overview Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                        {/* Collected Capital */}
                        <div className="dashboard-card glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #10b981' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Collected</h3>
                                    <div style={{ padding: '0.5rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.5rem' }}>
                                          <Wallet size={18} className="text-green-400" />
                                    </div>
                              </div>
                              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>₹{totalCollected.toLocaleString('en-IN')}</div>
                        </div>

                        {/* Active Investments */}
                        <div className="dashboard-card glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #3b82f6' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Active Investments</h3>
                                    <div style={{ padding: '0.5rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.5rem' }}>
                                          <Briefcase size={18} className="text-blue-400" />
                                    </div>
                              </div>
                              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>₹{totalInvested.toLocaleString('en-IN')}</div>
                        </div>

                        {/* Network Commissions */}
                        <div className="dashboard-card glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #8b5cf6' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Commissions Paid</h3>
                                    <div style={{ padding: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.5rem' }}>
                                          <Network size={18} style={{ color: '#c4b5fd' }} />
                                    </div>
                              </div>
                              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>₹{totalCommissionsPaid.toLocaleString('en-IN')}</div>
                        </div>

                        {/* Capital Withdrawals */}
                        <div className="dashboard-card glass-panel" style={{ padding: '1.5rem', borderLeft: '4px solid #ef4444' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Total Withdrawals</h3>
                                    <div style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '0.5rem' }}>
                                          <ArrowUpRight size={18} className="text-red-400" />
                                    </div>
                              </div>
                              <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white' }}>₹{totalWithdrawals.toLocaleString('en-IN')}</div>
                        </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>

                        {/* Pending Deposits Queue */}
                        <div className="dashboard-card glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(16, 185, 129, 0.05)' }}>
                                    <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <ArrowDownToLine className="text-green-400" size={20} /> Deposit Verifications Queue
                                    </h2>
                                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', minWidth: '250px' }}>
                                          <Search size={16} className="text-muted" />
                                          <input
                                                type="text"
                                                placeholder="Search UTR, name, or email..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                                          />
                                    </div>
                              </div>
                              {loading ? (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading deposits...</div>
                              ) : (
                                    <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', display: 'block', WebkitOverflowScrolling: 'touch' }}>
                                          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                                <thead>
                                                      <tr style={{ background: 'rgba(0,0,0,0.2)', color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>User Identity</th>
                                                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Bank Reference (UTR)</th>
                                                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Requested Capital</th>
                                                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Proof</th>
                                                            <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                                                      </tr>
                                                </thead>
                                                <tbody>
                                                      {filteredDeposits.length === 0 ? (
                                                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)' }}>No pending deposit requests found in the queue.</td></tr>
                                                      ) : filteredDeposits.map((dep) => (
                                                            <tr
                                                                  key={dep.id}
                                                                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }}
                                                                  onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(16, 185, 129, 0.05)' })}
                                                                  onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'transparent' })}
                                                            >
                                                                  <td style={{ padding: '1.25rem 1.5rem' }} onClick={() => setSelectedTransaction(dep)}>
                                                                        <div style={{ fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.4rem' }}><User size={14} className="text-blue-400" /> {dep.user?.fullName}</div>
                                                                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.2rem' }}>{dep.user?.email}</div>
                                                                  </td>
                                                                  <td style={{ padding: '1.25rem 1.5rem', color: '#3b82f6', letterSpacing: '1px', fontSize: '0.9rem', fontWeight: 500 }} onClick={() => setSelectedTransaction(dep)}>{dep.bankReference}</td>
                                                                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 700, color: '#10b981', fontSize: '1.1rem' }} onClick={() => setSelectedTransaction(dep)}>₹{dep.amount?.toLocaleString('en-IN')}</td>
                                                                  <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                        {dep.receiptUrl ? (
                                                                              <a
                                                                                    href={dep.receiptUrl}
                                                                                    target="_blank"
                                                                                    rel="noopener noreferrer"
                                                                                    style={{ fontSize: '0.8rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.3rem', textDecoration: 'none' }}
                                                                                    onClick={(e) => e.stopPropagation()}
                                                                              >
                                                                                    <ArrowUpRight size={14} /> View Receipt
                                                                              </a>
                                                                        ) : (
                                                                              <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)' }}>No Proof</span>
                                                                        )}
                                                                  </td>
                                                                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right' }}>
                                                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                              <button onClick={(e) => { e.stopPropagation(); handleReviewClick(dep.id, 'APPROVED') }} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', background: '#10b981', border: 'none' }}>Credit Funds</button>
                                                                              <button onClick={(e) => { e.stopPropagation(); handleReviewClick(dep.id, 'REJECTED') }} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderColor: '#ef4444', color: '#ef4444' }}>Reject</button>
                                                                        </div>
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                </tbody>
                                          </table>
                                    </div>
                              )}
                        </div>

                        {/* Complete Transaction History */}
                        <div className="dashboard-card glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Activity size={20} className="text-secondary" /> Operational Ledger
                                          </h2>
                                          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.6rem 1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', border: '1px solid rgba(255,255,255,0.1)', minWidth: '250px' }}>
                                                      <Search size={16} className="text-muted" />
                                                      <input
                                                            type="text"
                                                            placeholder="Search ledger..."
                                                            value={txSearchQuery}
                                                            onChange={(e) => setTxSearchQuery(e.target.value)}
                                                            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', width: '100%' }}
                                                      />
                                                </div>
                                          </div>
                                    </div>

                                    {/* Operational Tabs & Stats */}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.3rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                {['ALL', 'DEPOSITS', 'COMMISSIONS', 'INVESTMENTS'].map(tab => (
                                                      <button
                                                            key={tab}
                                                            onClick={() => setActiveTab(tab)}
                                                            style={{
                                                                  padding: '0.5rem 1.25rem',
                                                                  background: activeTab === tab ? '#8b5cf6' : 'transparent',
                                                                  color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.5)',
                                                                  border: 'none',
                                                                  borderRadius: '0.3rem',
                                                                  fontSize: '0.85rem',
                                                                  fontWeight: 600,
                                                                  cursor: 'pointer',
                                                                  transition: 'all 0.2s'
                                                            }}
                                                      >
                                                            {tab === 'ALL' ? 'All Transactions' : tab.charAt(0) + tab.slice(1).toLowerCase()}
                                                      </button>
                                                ))}
                                          </div>

                                          <div style={{ display: 'flex', gap: '2rem' }}>
                                                <div style={{ textAlign: 'right' }}>
                                                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Total Deposits</div>
                                                      <div style={{ color: '#10b981', fontWeight: 600, fontSize: '1rem' }}>₹{totalCollected.toLocaleString('en-IN')}</div>
                                                </div>
                                                <div style={{ textAlign: 'right' }}>
                                                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Commissions Volume</div>
                                                      <div style={{ color: '#8b5cf6', fontWeight: 600, fontSize: '1rem' }}>₹{totalCommissionsPaid.toLocaleString('en-IN')}</div>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                              {loadingHistory ? (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading ledger history...</div>
                              ) : filteredTransactions.length > 0 ? (
                                    <div className="transaction-list" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                          {filteredTransactions.map(tx => (
                                                <div
                                                      key={tx.id}
                                                      className="transaction-item"
                                                      onClick={() => setSelectedTransaction(tx)}
                                                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'background 0.2s' }}
                                                      onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.02)' })}
                                                      onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'transparent' })}
                                                >
                                                      <div className="tx-info" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                                            <div style={{ background: ['DEPOSIT', 'COMMISSION'].includes(tx.type) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: ['DEPOSIT', 'COMMISSION'].includes(tx.type) ? '#10b981' : '#ef4444', padding: '0.75rem', borderRadius: '50%' }}>
                                                                  {['DEPOSIT', 'COMMISSION'].includes(tx.type) ? <ArrowDownToLine size={20} /> : <ArrowUpRight size={20} />}
                                                            </div>
                                                            <div>
                                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        <p className="tx-desc" style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: 'white' }}>{tx.description || tx.type}</p>
                                                                        <span style={{
                                                                              fontSize: '0.7rem', padding: '0.1rem 0.4rem', borderRadius: '0.5rem', fontWeight: 600,
                                                                              background: tx.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.1)' : tx.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                              color: tx.status === 'APPROVED' ? '#10b981' : tx.status === 'PENDING' ? '#f59e0b' : '#ef4444'
                                                                        }}>{tx.status}</span>
                                                                  </div>
                                                                  <p className="tx-date" style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                                                                        {new Date(tx.createdAt).toLocaleString()} {tx.user ? `• ${tx.user.fullName} (${tx.user.email})` : ''}
                                                                  </p>
                                                            </div>
                                                      </div>
                                                      <div className="tx-amount" style={{
                                                            fontWeight: 700,
                                                            fontSize: '1.1rem',
                                                            color: tx.status === 'REJECTED' ? '#9ca3af' : (['DEPOSIT', 'COMMISSION'].includes(tx.type) ? '#10b981' : '#ef4444'),
                                                            textDecoration: tx.status === 'REJECTED' ? 'line-through' : 'none'
                                                      }}>
                                                            {tx.status === 'REJECTED' ? '' : (['DEPOSIT', 'COMMISSION'].includes(tx.type) ? '+' : '-')}₹{tx.amount.toLocaleString('en-IN')}
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              ) : (
                                    <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', background: 'rgba(0,0,0,0.2)' }}>
                                          System ledger is empty or search yielded no results.
                                    </div>
                              )}
                        </div>

                  </div>

                  {confirmModal.isOpen && (
                        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <div className="dashboard-card glass-panel" style={{ width: '90%', maxWidth: '400px', padding: '2rem', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>Confirm {confirmModal.status === 'APPROVED' ? 'Approval' : 'Rejection'}</h3>
                                    <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                                          Are you sure you want to <strong>{confirmModal.status}</strong> this transaction? This action will securely update the user's wallet database and process all internal network aggregates natively.
                                    </p>

                                    {confirmModal.status === 'REJECTED' && (
                                          <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>Reason for Rejection *</label>
                                                <textarea
                                                      placeholder="e.g. Invalid UTR, Name mismatch..."
                                                      style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.5rem', minHeight: '80px', resize: 'vertical' }}
                                                      value={confirmModal.rejectionReason || ''}
                                                      onChange={(e) => setConfirmModal({ ...confirmModal, rejectionReason: e.target.value })}
                                                />
                                          </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                          <button
                                                onClick={() => setConfirmModal({ isOpen: false, depositId: null, status: null, isLoading: false, rejectionReason: '' })}
                                                className="btn btn-outline"
                                                style={{ padding: '0.75rem 1.5rem', flex: 1 }}
                                                disabled={confirmModal.isLoading}
                                          >
                                                Cancel
                                          </button>
                                          <button
                                                onClick={executeReview}
                                                className="btn btn-primary"
                                                style={{ padding: '0.75rem 1.5rem', flex: 1, background: confirmModal.status === 'APPROVED' ? '#10b981' : '#ef4444', border: 'none' }}
                                                disabled={confirmModal.isLoading}
                                          >
                                                {confirmModal.isLoading ? 'Processing...' : `Confirm ${confirmModal.status}`}
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}

                  {selectedTransaction && (
                        <TransactionDetailsModal
                              transaction={selectedTransaction}
                              onClose={() => setSelectedTransaction(null)}
                              onInspectUser={(userId) => setSelectedUserId(userId)}
                        />
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

export default AdminLedger;
