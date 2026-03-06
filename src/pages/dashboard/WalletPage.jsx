import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Wallet as WalletIcon, ArrowDownToLine, Landmark, ArrowUpRight, User, Search, Loader2, Filter, Copy, Check, TrendingUp, ShieldCheck, Film, Sparkles, Zap, AlertOctagon, CheckCircle, Upload, CheckCircle2 } from 'lucide-react';
import UserDetailsModal from '../../components/UserDetailsModal';
import TransactionDetailsModal from '../../components/TransactionDetailsModal';
import qrImage from '../../assets/Webfilms1.jpeg';
import './Dashboard.css';
import './WalletPage.css';

const WalletPage = () => {
      const { user } = useAuth();
      const [depositAmount, setDepositAmount] = useState('');
      const [utrNumber, setUtrNumber] = useState('');
      const [receiptFile, setReceiptFile] = useState(null);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [copiedText, setCopiedText] = useState('');
      const [activeTab, setActiveTab] = useState('DEPOSIT'); // 'DEPOSIT' or 'WITHDRAW'

      // Withdrawal Form State
      const [withdrawAmount, setWithdrawAmount] = useState('');
      const [bankName, setBankName] = useState('');
      const [accountNumber, setAccountNumber] = useState('');
      const [ifscCode, setIfscCode] = useState('');
      const [upiId, setUpiId] = useState('');
      const [balances, setBalances] = useState({ wallet: 0, income: 0 });
      const [portfolio, setPortfolio] = useState({ totalInvestedAmount: 0, estimatedProfit: 0, activeInvestments: 0 });
      const [todayEarnings, setTodayEarnings] = useState(0);
      const [triggeringROI, setTriggeringROI] = useState(false);
      const [withdrawSource, setWithdrawSource] = useState('income');


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
                  const historyUrl = user?.role === 'ADMIN' ? '/admin/transactions' : '/wallet/dashboard';
                  const res = await api.get(historyUrl);

                  if (res.data.success) {
                        setTransactions(user?.role === 'ADMIN' ? res.data.transactions : res.data.recentTransactions || res.data.history);
                        if (res.data.balances) {
                              setBalances(res.data.balances);
                        }
                        if (res.data.portfolio) {
                              setPortfolio(res.data.portfolio);
                        }
                        if (res.data.todayEarnings !== undefined) {
                              setTodayEarnings(res.data.todayEarnings);
                        }
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

      const handleWithdraw = async (e) => {
            e.preventDefault();
            if (user?.kycStatus !== 'VERIFIED') {
                  alert("KYC verification is required for withdrawals. Please complete your KYC first.");
                  return;
            }

            const selectedBalance = withdrawSource === 'roi' ? (balances.roi || 0) : (balances.income || 0);
            if (parseFloat(withdrawAmount) > selectedBalance) {
                  alert(`Insufficient ${withdrawSource === 'roi' ? 'Revenue Share' : 'Income'} Wallet Balance.`);
                  return;
            }

            setIsSubmitting(true);
            try {
                  const amount = parseFloat(withdrawAmount);
                  await api.post('/wallet/withdraw', {
                        amount,
                        bankName,
                        accountNumber,
                        ifscCode,
                        upiId,
                        source: withdrawSource
                  });

                  setWithdrawAmount('');
                  setBankName('');
                  setAccountNumber('');
                  setIfscCode('');
                  setUpiId('');
                  alert(`Withdrawal request for ₹${amount.toLocaleString('en-IN')} submitted successfully. It will be processed after admin review.`);
                  fetchData();
            } catch (error) {
                  alert('Withdrawal request failed: ' + (error.response?.data?.message || error.message));
            } finally {
                  setIsSubmitting(false);
            }
      };

      const handleExportCSV = async () => {
            try {
                  const response = await api.get('/export/transactions', { responseType: 'blob' });
                  const url = window.URL.createObjectURL(new Blob([response.data]));
                  const link = document.createElement('a');
                  link.href = url;
                  link.setAttribute('download', `transactions_${user.username}_${new Date().toISOString().split('T')[0]}.csv`);
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
            } catch (error) {
                  alert('Export failed: ' + (error.response?.data?.message || error.message));
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

                  {/* Balance Cards */}
                  <div className="balance-grid">
                        <div className="balance-card glass-panel main-wallet">
                              <div className="balance-info">
                                    <span className="balance-label">Wallet Balance</span>
                                    <h3 className="balance-value">
                                          ₹{((user?.role === 'ADMIN' ? user?.walletBalance : balances.wallet) || 0).toLocaleString('en-IN')}
                                    </h3>
                              </div>
                              <div className="balance-icon icon-wrapper primary">
                                    <WalletIcon size={32} />
                              </div>
                        </div>

                        {user?.role !== 'ADMIN' && (
                              <div className="balance-card glass-panel income-wallet">
                                    <div className="balance-info">
                                          <span className="balance-label" style={{ color: '#10b981' }}>Income Wallet</span>
                                          <h3 className="balance-value" style={{ color: '#10b981' }}>
                                                ₹{(balances.income || 0).toLocaleString('en-IN')}
                                          </h3>
                                    </div>
                                    <div className="balance-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                                          <TrendingUp size={32} />
                                    </div>
                              </div>
                        )}

                        {user?.role !== 'ADMIN' && (
                              <div className="balance-card glass-panel roi-wallet">
                                    <div className="balance-info">
                                          <span className="balance-label" style={{ color: '#f59e0b' }}>Revenue Share Wallet</span>
                                          <h3 className="balance-value" style={{ color: '#fbbf24' }}>
                                                ₹{(balances.roi || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                          </h3>
                                    </div>
                                    <div className="balance-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                                          <Sparkles size={32} />
                                    </div>
                              </div>
                        )}

                        <div className="balance-card glass-panel net-worth">
                              <div className="balance-info">
                                    <span className="balance-label" style={{ color: '#60a5fa' }}>Total Assets (Net Worth)</span>
                                    <h3 className="balance-value" style={{ color: '#60a5fa' }}>
                                          ₹{((user?.role === 'ADMIN' ? (user?.walletBalance || 0) : (balances.wallet || 0)) + (balances.income || 0) + (balances.roi || 0) + (portfolio.totalInvestedAmount || 0)).toLocaleString('en-IN')}
                                    </h3>
                              </div>
                              <div className="balance-icon" style={{ background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa' }}>
                                    <ShieldCheck size={32} />
                              </div>
                        </div>

                        {user?.role !== 'ADMIN' && (
                              <>
                                    <div className="balance-card glass-panel">
                                          <div className="balance-info">
                                                <span className="balance-label" style={{ color: '#34d399' }}>Total Contributed</span>
                                                <h3 className="balance-value" style={{ color: '#34d399' }}>
                                                      ₹{(portfolio.totalInvestedAmount || 0).toLocaleString('en-IN')}
                                                </h3>
                                          </div>
                                          <div className="balance-icon" style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399' }}>
                                                <Film size={32} />
                                          </div>
                                    </div>

                                    <div className="balance-card glass-panel">
                                          <div className="balance-info">
                                                <span className="balance-label" style={{ color: '#fbbf24' }}>Est. Revenue Share</span>
                                                <h3 className="balance-value" style={{ color: '#fbbf24' }}>
                                                      ₹{(portfolio.estimatedProfit || 0).toLocaleString('en-IN')}
                                                </h3>
                                          </div>
                                          <div className="balance-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                                                <TrendingUp size={32} />
                                          </div>
                                    </div>
                              </>
                        )}
                  </div>

                  <div className="dashboard-grid">
                        {/* Tab Content */}
                        {user?.role !== 'ADMIN' && (
                              <div className="tab-container-full">
                                    {/* Tabs */}
                                    <div className="form-tabs glass-panel">
                                          <button
                                                onClick={() => setActiveTab('DEPOSIT')}
                                                className={`tab-btn ${activeTab === 'DEPOSIT' ? 'active' : 'inactive'}`}
                                          >
                                                <ArrowDownToLine size={20} /> Add Funds
                                          </button>
                                          <button
                                                onClick={() => setActiveTab('WITHDRAW')}
                                                className={`tab-btn ${activeTab === 'WITHDRAW' ? 'active' : 'inactive'}`}
                                          >
                                                <ArrowUpRight size={20} /> Withdraw
                                          </button>
                                    </div>

                                    {activeTab === 'DEPOSIT' ? (
                                          <div className="side-by-side-layout">
                                                {/* Left: Payment Methods */}
                                                <div className="layout-column glass-panel">
                                                      <div className="column-header">
                                                            <Landmark className="text-primary" size={24} />
                                                            <h2 className="card-title">Payment Methods</h2>
                                                      </div>
                                                      <p className="column-desc">
                                                            Transfer funds via QR or Bank, then submit your request with the Reference number.
                                                      </p>

                                                      <div className="methods-stack">
                                                            {/* QR Section */}
                                                            <div className="method-box-compact glass-panel">
                                                                  <h3 className="method-title">Scan & Pay (UPI)</h3>
                                                                  <div className="qr-wrapper-small">
                                                                        <img src={qrImage} alt="Deposit QR" className="qr-img-small" />
                                                                  </div>
                                                                  <div className="upi-info-pill" onClick={() => {
                                                                        navigator.clipboard.writeText('webfilms@kotak');
                                                                        setCopiedText('upi');
                                                                        setTimeout(() => setCopiedText(''), 2000);
                                                                  }}>
                                                                        <span className="upi-id">webfilms@kotak</span>
                                                                        {copiedText === 'upi' ? <Check size={14} /> : <Copy size={14} />}
                                                                  </div>
                                                            </div>

                                                            {/* Bank Details Section */}
                                                            <div className="method-box-compact glass-panel">
                                                                  <h3 className="method-title">Bank Transfer</h3>
                                                                  <div className="bank-details-list">
                                                                        <div className="bank-row">
                                                                              <span className="label">Bank</span>
                                                                              <span className="value">KOTAK MAHINDRA BANK</span>
                                                                        </div>
                                                                        <div className="bank-row">
                                                                              <span className="label">Account Name</span>
                                                                              <span className="value">ITRAM MANAGEMENT LLP</span>
                                                                        </div>
                                                                        <div className="bank-row copyable" onClick={() => {
                                                                              navigator.clipboard.writeText('1249346867');
                                                                              setCopiedText('acc');
                                                                              setTimeout(() => setCopiedText(''), 2000);
                                                                        }}>
                                                                              <span className="label">Acc Number</span>
                                                                              <span className="value highlight">1249346867</span>
                                                                              {copiedText === 'acc' ? <Check size={14} /> : <Copy size={14} />}
                                                                        </div>
                                                                        <div className="bank-row copyable" onClick={() => {
                                                                              navigator.clipboard.writeText('KKBK0001487');
                                                                              setCopiedText('ifsc');
                                                                              setTimeout(() => setCopiedText(''), 2000);
                                                                        }}>
                                                                              <span className="label">IFSC Code</span>
                                                                              <span className="value">KKBK0001487</span>
                                                                              {copiedText === 'ifsc' ? <Check size={14} /> : <Copy size={14} />}
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                </div>

                                                {/* Right: Deposit Form */}
                                                <div className="layout-column glass-panel">
                                                      <div className="column-header">
                                                            <ArrowDownToLine className="text-green-400" size={24} />
                                                            <h2 className="card-title">Submit Request</h2>
                                                      </div>
                                                      <p className="column-desc">Enter your transaction details for verification.</p>

                                                      <form onSubmit={handleDeposit} className="premium-form">
                                                            <div className="form-group-floating">
                                                                  <label>Amount (₹)</label>
                                                                  <input
                                                                        type="number"
                                                                        required
                                                                        min="1000"
                                                                        placeholder="Enter amount"
                                                                        className="premium-input"
                                                                        value={depositAmount}
                                                                        onChange={(e) => setDepositAmount(e.target.value)}
                                                                  />
                                                            </div>

                                                            <div className="form-group-floating">
                                                                  <label>Reference (UTR) Number</label>
                                                                  <input
                                                                        type="text"
                                                                        required
                                                                        placeholder="Enter 12-digit UTR"
                                                                        className="premium-input"
                                                                        value={utrNumber}
                                                                        onChange={(e) => setUtrNumber(e.target.value)}
                                                                  />
                                                            </div>

                                                            <div className="form-group-floating">
                                                                  <label>Transfer Receipt</label>
                                                                  <div className="file-upload-zone">
                                                                        <input
                                                                              type="file"
                                                                              required
                                                                              accept="image/*,.pdf"
                                                                              onChange={(e) => setReceiptFile(e.target.files[0])}
                                                                        />
                                                                        {receiptFile ? (
                                                                              <div className="file-selected"><Check size={16} /> {receiptFile.name}</div>
                                                                        ) : (
                                                                              <div className="file-placeholder"><Upload size={20} /> Click to upload screenshot</div>
                                                                        )}
                                                                  </div>
                                                            </div>

                                                            <button type="submit" className="btn-premium primary" disabled={isSubmitting || !depositAmount || !utrNumber || !receiptFile}>
                                                                  {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Submit Deposit Request'}
                                                            </button>
                                                      </form>
                                                </div>
                                          </div>
                                    ) : (
                                          <div className="side-by-side-layout">
                                                {/* Left: Withdrawal Details */}
                                                <div className="layout-column glass-panel">
                                                      <div className="column-header">
                                                            <ArrowUpRight className="text-red-400" size={24} />
                                                            <h2 className="card-title">Withdrawal Details</h2>
                                                      </div>
                                                      <p className="column-desc">Select your balance source and view your available funds.</p>

                                                      {user?.kycStatus !== 'VERIFIED' ? (
                                                            <div className="kyc-warning-box">
                                                                  <AlertOctagon size={48} />
                                                                  <h3>KYC Required</h3>
                                                                  <p>Complete identity verification to enable withdrawals.</p>
                                                                  <button className="btn-premium secondary" onClick={() => window.location.href = '/dashboard/kyc'}>Verify KYC Now</button>
                                                            </div>
                                                      ) : (
                                                            <div className="source-grid">
                                                                  <div
                                                                        className={`source-card-premium income ${withdrawSource === 'income' ? 'active' : ''}`}
                                                                        onClick={() => setWithdrawSource('income')}
                                                                  >
                                                                        <div className="label">Income Wallet</div>
                                                                        <div className="amount">₹{(balances.income || 0).toLocaleString('en-IN')}</div>
                                                                        <div className="check-icon">{withdrawSource === 'income' && <CheckCircle size={20} />}</div>
                                                                  </div>
                                                                  <div
                                                                        className={`source-card-premium roi ${withdrawSource === 'roi' ? 'active' : ''}`}
                                                                        onClick={() => setWithdrawSource('roi')}
                                                                  >
                                                                        <div className="label">Revenue Share</div>
                                                                        <div className="amount">₹{(balances.roi || 0).toLocaleString('en-IN')}</div>
                                                                        <div className="check-icon">{withdrawSource === 'roi' && <CheckCircle size={20} />}</div>
                                                                  </div>
                                                            </div>
                                                      )}
                                                </div>

                                                {/* Right: Withdrawal Form */}
                                                <div className="layout-column glass-panel">
                                                      <div className="column-header">
                                                            <Landmark className="text-primary" size={24} />
                                                            <h2 className="card-title">Bank Information</h2>
                                                      </div>

                                                      {user?.kycStatus === 'VERIFIED' && (
                                                            <form onSubmit={handleWithdraw} className="premium-form">
                                                                  <div className="form-group-floating">
                                                                        <label>Withdraw Amount (₹)</label>
                                                                        <input
                                                                              type="number"
                                                                              required
                                                                              min="1000"
                                                                              placeholder="Min ₹1,000"
                                                                              className="premium-input"
                                                                              value={withdrawAmount}
                                                                              onChange={(e) => setWithdrawAmount(e.target.value)}
                                                                        />
                                                                  </div>

                                                                  <div className="form-row">
                                                                        <div className="form-group-floating">
                                                                              <label>Bank Name</label>
                                                                              <input type="text" placeholder="e.g. HDFC" value={bankName} onChange={(e) => setBankName(e.target.value)} className="premium-input" />
                                                                        </div>
                                                                        <div className="form-group-floating">
                                                                              <label>IFSC Code</label>
                                                                              <input type="text" placeholder="IFSC" value={ifscCode} onChange={(e) => setIfscCode(e.target.value)} className="premium-input" />
                                                                        </div>
                                                                  </div>

                                                                  <div className="form-group-floating">
                                                                        <label>Account Number</label>
                                                                        <input type="text" placeholder="Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className="premium-input" />
                                                                  </div>

                                                                  <div className="form-group-floating">
                                                                        <label>UPI ID (Optional)</label>
                                                                        <input type="text" placeholder="user@okaxis" value={upiId} onChange={(e) => setUpiId(e.target.value)} className="premium-input" />
                                                                  </div>

                                                                  <button type="submit" className="btn-premium primary" style={{ marginTop: '0.5rem' }} disabled={isSubmitting || !withdrawAmount}>
                                                                        {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : 'Request Withdrawal'}
                                                                  </button>
                                                            </form>
                                                      )}
                                                </div>
                                          </div>
                                    )}
                              </div>
                        )}
                  </div>

                  {/* Transaction History */}
                  <div className="dashboard-card glass-panel" style={{ marginTop: '2rem', padding: 0 }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }} className="wallet-header-flex">
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
                                    <h2 className="card-title" style={{ margin: 0, fontSize: '1.1rem' }}>Transaction Ledger</h2>
                                    <button
                                          onClick={handleExportCSV}
                                          style={{
                                                display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(59, 130, 246, 0.1)',
                                                border: '1px solid rgba(59, 130, 246, 0.2)', color: '#60a5fa', padding: '0.4rem 0.8rem',
                                                borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer'
                                          }}
                                    >
                                          <ArrowDownToLine size={14} /> Export CSV
                                    </button>
                              </div>

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
                                                <option value="INVESTMENT" style={{ background: '#1a1a2e' }}>Contribution</option>
                                                <option value="RETURN" style={{ background: '#1a1a2e' }}>Rev. Share</option>
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
                                          >
                                                <div className="tx-main-info">
                                                      <div className={`tx-icon-boxed ${tx.status === 'REJECTED' ? 'rejected' : (['DEPOSIT', 'COMMISSION', 'DAILY_ROI', 'BONUS'].includes(tx.type) ? 'incoming' : 'outgoing')}`}>
                                                            {['DEPOSIT', 'COMMISSION', 'DAILY_ROI', 'BONUS'].includes(tx.type) ? <ArrowDownToLine size={18} /> : <ArrowUpRight size={18} />}
                                                      </div>
                                                      <div className="tx-details">
                                                            <div className="tx-header">
                                                                  <span className={`tx-desc ${tx.status === 'REJECTED' ? 'line-through' : ''}`}>
                                                                        {tx.description || tx.type}
                                                                  </span>
                                                                  <span className={`status-badge status-${tx.status.toLowerCase()}`}>
                                                                        {tx.status}
                                                                  </span>
                                                            </div>
                                                            <p className="tx-date">
                                                                  {new Date(tx.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                            </p>
                                                      </div>
                                                </div>
                                                <div className={`tx-amount ${tx.status === 'REJECTED' ? 'rejected' : (['DEPOSIT', 'COMMISSION', 'DAILY_ROI', 'BONUS'].includes(tx.type) ? 'positive' : 'negative')}`}>
                                                      {tx.status === 'REJECTED' ? '' : (['DEPOSIT', 'COMMISSION', 'DAILY_ROI', 'BONUS'].includes(tx.type) ? '+' : '-')}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
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
