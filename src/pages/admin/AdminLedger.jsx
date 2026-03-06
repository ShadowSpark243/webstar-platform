import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Search, User, ArrowDownToLine, ArrowUpRight, Activity, Wallet, Briefcase, Network, Filter, Loader2, CheckCircle, XCircle } from 'lucide-react';
import UserDetailsModal from '../../components/UserDetailsModal';
import TransactionDetailsModal from '../../components/TransactionDetailsModal';

const AdminLedger = () => {
      const [pendingDeposits, setPendingDeposits] = useState([]);
      const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
      const [transactions, setTransactions] = useState([]);
      const [loading, setLoading] = useState(true);
      const [loadingHistory, setLoadingHistory] = useState(true);

      const [searchQuery, setSearchQuery] = useState('');
      const [withdrawalSearchQuery, setWithdrawalSearchQuery] = useState('');
      const [txSearchQuery, setTxSearchQuery] = useState('');
      const [txTypeFilter, setTxTypeFilter] = useState('ALL');
      const [txStatusFilter, setTxStatusFilter] = useState('ALL');
      const [selectedUserId, setSelectedUserId] = useState(null);
      const [selectedTransaction, setSelectedTransaction] = useState(null);

      const [confirmModal, setConfirmModal] = useState({ isOpen: false, transactionId: null, type: 'DEPOSIT', status: null, isLoading: false, rejectionReason: '' });

      const fetchData = async () => {
            setLoading(true);
            try {
                  const [depRes, withRes, txRes] = await Promise.all([
                        api.get('/admin/deposits'),
                        api.get('/admin/withdrawals'),
                        api.get('/admin/transactions')
                  ]);
                  setPendingDeposits(depRes.data.deposits || []);
                  setPendingWithdrawals(withRes.data.withdrawals || []);
                  setTransactions(txRes.data.transactions || []);
            } catch (error) {
                  console.error("Failed to fetch ledger data", error);
            } finally {
                  setLoading(false);
                  setLoadingHistory(false);
            }
      };

      useEffect(() => {
            fetchData();
      }, []);

      const handleReviewClick = (transactionId, type, status, e) => {
            if (e) e.stopPropagation();
            setConfirmModal({ isOpen: true, transactionId, type, status, isLoading: false, rejectionReason: '' });
      };

      const executeReview = async () => {
            const { transactionId, type, status, rejectionReason } = confirmModal;

            if (status === 'REJECTED' && (!rejectionReason || !rejectionReason.trim())) {
                  alert("Please provide a reason for rejection.");
                  return;
            }

            setConfirmModal(prev => ({ ...prev, isLoading: true }));
            try {
                  const endpoint = type === 'DEPOSIT' ? '/admin/deposits/review' : '/admin/withdrawals/review';
                  await api.put(endpoint, { transactionId, status, rejectionReason });
                  setConfirmModal({ isOpen: false, transactionId: null, type: 'DEPOSIT', status: null, isLoading: false, rejectionReason: '' });
                  fetchData();
            } catch (error) {
                  alert("Failed to process request: " + (error.response?.data?.message || error.message));
                  setConfirmModal(prev => ({ ...prev, isLoading: false }));
            }
      };

      const filteredDeposits = pendingDeposits.filter(d =>
            (d.user?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.user?.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (d.bankReference || '').toLowerCase().includes(searchQuery.toLowerCase())
      );

      const filteredWithdrawals = pendingWithdrawals.filter(w =>
            (w.user?.fullName || '').toLowerCase().includes(withdrawalSearchQuery.toLowerCase()) ||
            (w.user?.email || '').toLowerCase().includes(withdrawalSearchQuery.toLowerCase())
      );

      const filteredTransactions = transactions.filter(t => {
            const matchesSearch = (t.description || '').toLowerCase().includes(txSearchQuery.toLowerCase()) ||
                  (t.user?.fullName || '').toLowerCase().includes(txSearchQuery.toLowerCase());

            if (!matchesSearch) return false;

            const matchesType = txTypeFilter === 'ALL' || t.type === txTypeFilter;
            const matchesStatus = txStatusFilter === 'ALL' || t.status === txStatusFilter;

            return matchesType && matchesStatus;
      });

      // Stats calculation
      const stats = {
            totalCollected: transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'APPROVED').reduce((sum, t) => sum + t.amount, 0),
            totalInvested: transactions.filter(t => t.type === 'INVESTMENT').reduce((sum, t) => sum + t.amount, 0),
            totalWithdrawals: transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'APPROVED').reduce((sum, t) => sum + t.amount, 0),
            totalLiabilities: transactions.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING').reduce((sum, t) => sum + t.amount, 0),
      };

      if (loading && transactions.length === 0) return (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
                  <Loader2 size={48} className="animate-spin" style={{ color: '#8b5cf6', margin: '0 auto 1.5rem auto' }} />
                  <p style={{ color: 'rgba(255,255,255,0.5)' }}>Accessing global ledger records...</p>
            </div>
      );

      return (
            <div className="fade-in">
                  <header style={{ marginBottom: '2rem' }}>
                        <h1 className="admin-page-title">Global Ledger</h1>
                        <p className="admin-page-subtitle">Platform-wide financial tracking and operational approvals.</p>
                  </header>

                  {/* Financial Stats Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(16, 185, 129, 0.2)', background: 'rgba(16, 185, 129, 0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(16, 185, 129, 0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Asset Inflow</span>
                                    <ArrowDownToLine size={20} style={{ color: '#10b981' }} />
                              </div>
                              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>₹{(stats.totalCollected).toLocaleString('en-IN')}</div>
                              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>Total Cleared Deposits</div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(59, 130, 246, 0.2)', background: 'rgba(59, 130, 246, 0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(59, 130, 246, 0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Capital</span>
                                    <Briefcase size={20} style={{ color: '#3b82f6' }} />
                              </div>
                              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>₹{(stats.totalInvested).toLocaleString('en-IN')}</div>
                              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.5rem' }}>Total Platform Contributions</div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1.25rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <span style={{ fontSize: '0.8rem', color: 'rgba(239, 68, 68, 0.8)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capital Outflow</span>
                                    <ArrowUpRight size={20} style={{ color: '#ef4444' }} />
                              </div>
                              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>₹{(stats.totalWithdrawals).toLocaleString('en-IN')}</div>
                              <div style={{ fontSize: '0.8rem', color: 'rgba(239, 68, 68, 0.6)', marginTop: '0.5rem' }}>Incl. ₹{stats.totalLiabilities.toLocaleString('en-IN')} Pending</div>
                        </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
                        {/* Deposit Verifications */}
                        <section>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                                          <ArrowDownToLine size={22} style={{ color: '#10b981' }} /> Deposit Verify Queue <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>({pendingDeposits.length})</span>
                                    </h2>
                                    <div className="search-wrapper">
                                          <Search size={18} className="search-icon" />
                                          <input type="text" placeholder="Search UTR or User..." className="admin-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                    </div>
                              </div>
                              <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                                          <table className="admin-table">
                                                <thead>
                                                      <tr>
                                                            <th>User Profile</th>
                                                            <th>Bank Reference (UTR)</th>
                                                            <th>Amount</th>
                                                            <th style={{ textAlign: 'right' }}>Management</th>
                                                      </tr>
                                                </thead>
                                                <tbody>
                                                      {filteredDeposits.length === 0 ? (
                                                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No pending verifications found.</td></tr>
                                                      ) : (
                                                            filteredDeposits.map(dep => (
                                                                  <tr key={dep.id} className="clickable-row">
                                                                        <td onClick={() => setSelectedUserId(dep.userId)}>
                                                                              <div style={{ fontWeight: 600, color: 'white' }}>{dep.user?.fullName}</div>
                                                                              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{dep.user?.email}</div>
                                                                        </td>
                                                                        <td>
                                                                              <div style={{ color: '#3b82f6', fontWeight: 600, letterSpacing: '0.5px' }}>{dep.bankReference}</div>
                                                                              {dep.receiptUrl && (
                                                                                    <a href={dep.receiptUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '0.2rem', textDecoration: 'none' }}>
                                                                                          <Eye size={12} /> View Document
                                                                                    </a>
                                                                              )}
                                                                        </td>
                                                                        <td>
                                                                              <div style={{ color: '#10b981', fontWeight: 800, fontSize: '1.1rem' }}>₹{dep.amount.toLocaleString('en-IN')}</div>
                                                                        </td>
                                                                        <td style={{ textAlign: 'right' }}>
                                                                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                                    <button onClick={(e) => handleReviewClick(dep.id, 'DEPOSIT', 'APPROVED', e)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Credit</button>
                                                                                    <button onClick={(e) => handleReviewClick(dep.id, 'DEPOSIT', 'REJECTED', e)} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Reject</button>
                                                                              </div>
                                                                        </td>
                                                                  </tr>
                                                            ))
                                                      )}
                                                </tbody>
                                          </table>
                                    </div>
                              </div>
                        </section>

                        {/* Withdrawal Requests */}
                        <section>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                                          <ArrowUpRight size={22} style={{ color: '#ef4444' }} /> Payout Requests <span style={{ color: 'rgba(255,255,255,0.2)', fontWeight: 400 }}>({pendingWithdrawals.length})</span>
                                    </h2>
                                    <div className="search-wrapper">
                                          <Search size={18} className="search-icon" />
                                          <input type="text" placeholder="Search user..." className="admin-search-input" value={withdrawalSearchQuery} onChange={(e) => setWithdrawalSearchQuery(e.target.value)} />
                                    </div>
                              </div>
                              <div className="glass-panel" style={{ padding: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem' }}>
                                    <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                                          <table className="admin-table">
                                                <thead>
                                                      <tr>
                                                            <th>User Profile</th>
                                                            <th>Settlement Method</th>
                                                            <th>Amount</th>
                                                            <th style={{ textAlign: 'right' }}>Management</th>
                                                      </tr>
                                                </thead>
                                                <tbody>
                                                      {filteredWithdrawals.length === 0 ? (
                                                            <tr><td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No payout requests currently.</td></tr>
                                                      ) : (
                                                            filteredWithdrawals.map(withd => (
                                                                  <tr key={withd.id} className="clickable-row">
                                                                        <td onClick={() => setSelectedUserId(withd.userId)}>
                                                                              <div style={{ fontWeight: 600, color: 'white' }}>{withd.user?.fullName}</div>
                                                                              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{withd.user?.email}</div>
                                                                        </td>
                                                                        <td>
                                                                              <div style={{ color: 'white', fontSize: '0.9rem', fontWeight: 500 }}>{withd.bankName}</div>
                                                                              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{withd.accountNumber} • {withd.ifscCode}</div>
                                                                              {withd.upiId && <div style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '0.1rem' }}>UPI: {withd.upiId}</div>}
                                                                        </td>
                                                                        <td>
                                                                              <div style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.1rem' }}>₹{withd.amount.toLocaleString('en-IN')}</div>
                                                                        </td>
                                                                        <td style={{ textAlign: 'right' }}>
                                                                              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                                                    <button onClick={(e) => handleReviewClick(withd.id, 'WITHDRAWAL', 'APPROVED', e)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Disburse</button>
                                                                                    <button onClick={(e) => handleReviewClick(withd.id, 'WITHDRAWAL', 'REJECTED', e)} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.5rem 1rem', borderRadius: '0.5rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>Reject</button>
                                                                              </div>
                                                                        </td>
                                                                  </tr>
                                                            ))
                                                      )}
                                                </tbody>
                                          </table>
                                    </div>
                              </div>
                        </section>

                        {/* Global Transaction Ledger */}
                        <section style={{ marginBottom: '2rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                    <h2 style={{ fontSize: '1.25rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', margin: 0 }}>
                                          <Activity size={22} style={{ color: '#8b5cf6' }} /> Operational Ledger
                                    </h2>
                                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                                          <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.2rem', borderRadius: '0.75rem', display: 'flex' }}>
                                                <select value={txTypeFilter} onChange={(e) => setTxTypeFilter(e.target.value)} style={{ background: 'transparent', color: 'rgba(255,255,255,0.7)', border: 'none', padding: '0.4rem 0.8rem', outline: 'none', fontSize: '0.85rem' }}>
                                                      <option value="ALL">All Types</option>
                                                      <option value="DEPOSIT">Deposits</option>
                                                      <option value="WITHDRAWAL">Withdrawals</option>
                                                      <option value="INVESTMENT">Contributions</option>
                                                      <option value="RETURN">Revenue Share</option>
                                                      <option value="COMMISSION">Network Commission</option>
                                                </select>
                                          </div>
                                          <div className="search-wrapper">
                                                <Search size={18} className="search-icon" />
                                                <input type="text" placeholder="Search history..." className="admin-search-input" value={txSearchQuery} onChange={(e) => setTxSearchQuery(e.target.value)} />
                                          </div>
                                    </div>
                              </div>
                              <div className="glass-panel" style={{ padding: 0, borderRadius: '1rem', overflow: 'hidden' }}>
                                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                                          {filteredTransactions.length === 0 ? (
                                                <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>The ledger is currently clear.</div>
                                          ) : (
                                                filteredTransactions.map(tx => (
                                                      <div key={tx.id} onClick={() => setSelectedTransaction(tx)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', transition: 'all 0.2s' }} className="clickable-row">
                                                            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                                                                  <div style={{
                                                                        width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        background: ['DEPOSIT', 'RETURN', 'COMMISSION'].includes(tx.type) ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                                        color: ['DEPOSIT', 'RETURN', 'COMMISSION'].includes(tx.type) ? '#10b981' : '#ef4444'
                                                                  }}>
                                                                        {['DEPOSIT', 'RETURN', 'COMMISSION'].includes(tx.type) ? <ArrowDownToLine size={20} /> : <ArrowUpRight size={20} />}
                                                                  </div>
                                                                  <div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                                              <span style={{ fontWeight: 600, color: 'white' }}>{tx.description}</span>
                                                                              <span className={`badge ${tx.status === 'APPROVED' ? 'badge-success' : tx.status === 'PENDING' ? 'badge-warning' : 'badge-danger'}`} style={{ fontSize: '0.65rem' }}>{tx.status}</span>
                                                                        </div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>
                                                                              {new Date(tx.createdAt).toLocaleString()} • {tx.user?.fullName}
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                            <div style={{ textAlign: 'right' }}>
                                                                  <div style={{
                                                                        fontWeight: 800, fontSize: '1.1rem',
                                                                        color: tx.status === 'REJECTED' ? '#475569' : (['DEPOSIT', 'RETURN', 'COMMISSION'].includes(tx.type) ? '#10b981' : '#ef4444'),
                                                                        textDecoration: tx.status === 'REJECTED' ? 'line-through' : 'none'
                                                                  }}>
                                                                        {['DEPOSIT', 'RETURN', 'COMMISSION'].includes(tx.type) ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN')}
                                                                  </div>
                                                            </div>
                                                      </div>
                                                ))
                                          )}
                                    </div>
                              </div>
                        </section>
                  </div>

                  {/* Confirmation Modal */}
                  {confirmModal.isOpen && (
                        <div onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} className="sidebar-overlay" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
                              <div onClick={e => e.stopPropagation()} style={{ background: '#121826', borderRadius: '1.5rem', width: '100%', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                    <div style={{ height: '4px', background: confirmModal.status === 'APPROVED' ? '#10b981' : '#ef4444' }} />
                                    <div style={{ padding: '2rem' }}>
                                          <h3 style={{ margin: '0 0 1rem 0', color: 'white' }}>Confirm {confirmModal.type} {confirmModal.status}</h3>
                                          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                                Are you sure you want to <strong>{confirmModal.status}</strong> this {confirmModal.type.toLowerCase()}? This action is immutable and will be logged in the audit trail.
                                          </p>

                                          {confirmModal.status === 'REJECTED' && (
                                                <div style={{ marginBottom: '1.5rem' }}>
                                                      <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Reason for Rejection *</label>
                                                      <textarea
                                                            value={confirmModal.rejectionReason}
                                                            onChange={e => setConfirmModal({ ...confirmModal, rejectionReason: e.target.value })}
                                                            style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem', color: 'white', outline: 'none', resize: 'none', minHeight: '80px' }}
                                                      />
                                                </div>
                                          )}

                                          <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
                                                <button onClick={executeReview} disabled={confirmModal.isLoading} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', background: confirmModal.status === 'APPROVED' ? '#10b981' : '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                      {confirmModal.isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Confirm'}
                                                </button>
                                          </div>
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
