import React from 'react';
import { X, ArrowDownToLine, ArrowUpRight, User, Hash, Clock, Landmark, FileText, CheckCircle, Clock3, XCircle, ExternalLink, IndianRupee, History, ShieldCheck, Tag } from 'lucide-react';

const TransactionDetailsModal = ({ transaction, onClose, onInspectUser }) => {
      if (!transaction) return null;

      const isPositive = ['DEPOSIT', 'COMMISSION', 'DAILY_ROI', 'BONUS', 'RETURN', 'REFUND'].includes(transaction.type);
      const isRejected = transaction.status === 'REJECTED';

      const statusConfig = {
            APPROVED: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: <CheckCircle size={14} />, label: 'Approved' },
            PENDING: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: <Clock3 size={14} />, label: 'Pending Verification' },
            REJECTED: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', icon: <XCircle size={14} />, label: 'Rejected' }
      };

      const typeLabels = {
            DEPOSIT: 'Wallet Deposit',
            WITHDRAWAL: 'Funds Withdrawal',
            INVESTMENT: 'Project Contribution',
            COMMISSION: 'Referral Commission',
            RETURN: 'Revenue Share',
            REFUND: 'Project Refund',
            DAILY_ROI: 'Daily Revenue Share',
            BONUS: 'Platform Bonus'
      };

      const status = statusConfig[transaction.status] || statusConfig.PENDING;

      return (
            <div className="tx-modal-overlay" onClick={onClose}>
                  <style>{`
                        .tx-modal-overlay {
                              position: fixed;
                              inset: 0;
                              background: rgba(4, 7, 12, 0.9);
                              backdrop-filter: blur(16px);
                              display: flex;
                              justify-content: center;
                              align-items: center;
                              z-index: 99999;
                              padding: 1rem;
                              animation: txFadeIn 0.3s ease-out;
                        }

                        .tx-card-v2 {
                              width: 100%;
                              max-width: 440px;
                              background: #0d1117;
                              border: 1px solid rgba(255, 255, 255, 0.08);
                              border-radius: 2rem;
                              overflow: hidden;
                              box-shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05);
                              animation: txSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                              position: relative;
                        }

                        @keyframes txFadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes txSlideUp { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

                        .tx-header-v2 {
                              padding: 2rem 1.5rem;
                              text-align: center;
                              background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
                              position: relative;
                              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        }

                        .tx-close-btn {
                              position: absolute;
                              top: 1.25rem;
                              right: 1.25rem;
                              width: 36px;
                              height: 36px;
                              border-radius: 50%;
                              background: rgba(255, 255, 255, 0.05);
                              border: 1px solid rgba(255, 255, 255, 0.1);
                              color: white;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              cursor: pointer;
                              transition: all 0.2s;
                              z-index: 10;
                        }

                        .tx-close-btn:hover { background: rgba(239, 68, 68, 0.2); border-color: rgba(239, 68, 68, 0.4); color: #ef4444; }

                        .tx-icon-accent {
                              width: 64px;
                              height: 64px;
                              border-radius: 1.5rem;
                              margin: 0 auto 1.5rem;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              background: rgba(255, 255, 255, 0.03);
                              border: 1px solid rgba(255, 255, 255, 0.1);
                              color: #60a5fa;
                              box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
                        }

                        .tx-amount-v2 {
                              font-size: 2.75rem;
                              font-weight: 900;
                              margin-bottom: 0.5rem;
                              color: white;
                              letter-spacing: -0.04em;
                              font-family: 'Inter', system-ui, sans-serif;
                        }

                        .tx-status-v2 {
                              display: inline-flex;
                              align-items: center;
                              gap: 0.5rem;
                              padding: 0.5rem 1rem;
                              border-radius: 2rem;
                              font-size: 0.75rem;
                              font-weight: 700;
                              text-transform: uppercase;
                              letter-spacing: 0.05em;
                        }

                        .tx-body-v2 {
                              padding: 1.5rem;
                              display: flex;
                              flex-direction: column;
                              gap: 1.5rem;
                        }

                        .tx-info-grid {
                              display: grid;
                              grid-template-columns: 1fr 1fr;
                              gap: 1rem;
                              padding: 1.25rem;
                              background: rgba(255, 255, 255, 0.02);
                              border-radius: 1.5rem;
                              border: 1px solid rgba(255, 255, 255, 0.05);
                        }

                        .tx-info-item { display: flex; flex-direction: column; gap: 0.35rem; }
                        .tx-info-label { font-size: 0.65rem; font-weight: 700; color: rgba(255, 255, 255, 0.3); text-transform: uppercase; letter-spacing: 0.05em; display: flex; align-items: center; gap: 0.4rem; }
                        .tx-info-value { font-size: 0.9rem; font-weight: 600; color: white; }

                        .tx-desc-box {
                              padding: 1.25rem;
                              background: rgba(59, 130, 246, 0.05);
                              border-radius: 1.25rem;
                              border: 1px solid rgba(59, 130, 246, 0.1);
                        }
                        
                        .tx-desc-text { font-size: 0.9rem; color: #94a3b8; line-height: 1.5; font-weight: 500; }

                        .tx-footer-v2 {
                              padding: 0 1.5rem 2rem;
                              display: flex;
                              flex-direction: column;
                              gap: 0.75rem;
                        }

                        .btn-tx-action {
                              width: 100%;
                              padding: 1rem;
                              border-radius: 1.25rem;
                              font-weight: 700;
                              font-size: 0.95rem;
                              cursor: pointer;
                              transition: all 0.2s;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              gap: 0.6rem;
                        }

                        .btn-tx-primary { background: #3b82f6; color: white; border: none; box-shadow: 0 10px 20px -5px rgba(59, 130, 246, 0.4); }
                        .btn-tx-primary:hover { background: #2563eb; transform: translateY(-2px); }
                        
                        .btn-tx-secondary { background: rgba(255, 255, 255, 0.05); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1); }
                        .btn-tx-secondary:hover { background: rgba(255, 255, 255, 0.08); color: white; }

                  `}</style>

                  <div className="tx-card-v2" onClick={(e) => e.stopPropagation()}>
                        <button className="tx-close-btn" onClick={onClose}><X size={18} /></button>

                        <div className="tx-header-v2">
                              <div className="tx-icon-accent" style={{ color: isRejected ? '#ef4444' : (isPositive ? '#10b981' : '#3b82f6') }}>
                                    {isPositive ? <ArrowDownToLine size={28} /> : <ArrowUpRight size={28} />}
                              </div>
                              <div className="tx-amount-v2" style={{ color: isRejected ? '#64748b' : (isPositive ? '#10b981' : '#fff'), textDecoration: isRejected ? 'line-through' : 'none' }}>
                                    {isPositive ? '+' : '-'}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}
                              </div>
                              <div className="tx-status-v2" style={{ background: status.bg, color: status.color }}>
                                    {status.icon} {status.label}
                              </div>
                        </div>

                        <div className="tx-body-v2">
                              <div className="tx-info-grid">
                                    <div className="tx-info-item">
                                          <div className="tx-info-label"><Tag size={12} /> Type</div>
                                          <div className="tx-info-value">{typeLabels[transaction.type] || transaction.type}</div>
                                    </div>
                                    <div className="tx-info-item">
                                          <div className="tx-info-label"><Clock size={12} /> Date</div>
                                          <div className="tx-info-value">{new Date(transaction.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    </div>
                                    <div className="tx-info-item">
                                          <div className="tx-info-label"><History size={12} /> Time</div>
                                          <div className="tx-info-value">{new Date(transaction.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                    <div className="tx-info-item" style={{ gridColumn: 'span 2' }}>
                                          <div className="tx-info-label"><Hash size={12} /> Transaction ID</div>
                                          <div className="tx-info-value" style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: '#60a5fa' }}>{transaction.id}</div>
                                    </div>
                              </div>

                              <div className="tx-desc-box">
                                    <div className="tx-info-label" style={{ marginBottom: '0.5rem' }}><FileText size={12} /> Description</div>
                                    <p className="tx-desc-text">{transaction.description || `No additional details for this ${transaction.type.toLowerCase()}.`}</p>
                              </div>

                              {isRejected && transaction.rejectionReason && (
                                    <div className="tx-desc-box" style={{ background: 'rgba(239, 68, 68, 0.05)', borderColor: 'rgba(239, 68, 68, 0.1)' }}>
                                          <div className="tx-info-label" style={{ color: '#ef4444', marginBottom: '0.5rem' }}><XCircle size={12} /> Rejection Reason</div>
                                          <p className="tx-desc-text" style={{ color: '#fca5a5' }}>{transaction.rejectionReason}</p>
                                    </div>
                              )}

                              {transaction.bankReference && (
                                    <div className="tx-desc-box" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                                          <div className="tx-info-label" style={{ marginBottom: '0.5rem' }}><Landmark size={12} /> Bank Reference (UTR)</div>
                                          <div style={{ fontFamily: 'monospace', color: '#60a5fa', fontWeight: 700 }}>{transaction.bankReference}</div>
                                    </div>
                              )}
                        </div>

                        {onInspectUser && transaction.user && (
                              <div style={{ padding: '0 1.5rem 1.5rem' }}>
                                    <div style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)', padding: '1.25rem', borderRadius: '1.5rem', border: '1px solid rgba(139, 92, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                          <div style={{ minWidth: 0 }}>
                                                <div className="tx-info-label" style={{ color: '#818cf8' }}><User size={12} /> Contributor</div>
                                                <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', margin: '0.2rem 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{transaction.user.fullName}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{transaction.user.email}</div>
                                          </div>
                                          <button 
                                                onClick={() => { onClose(); onInspectUser(transaction.userId); }}
                                                style={{ background: '#4f46e5', border: 'none', color: 'white', padding: '0.6rem 1rem', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem', flexShrink: 0 }}
                                          >
                                                Inspect
                                          </button>
                                    </div>
                              </div>
                        )}

                        <div className="tx-footer-v2">
                              {transaction.receiptUrl && (
                                    <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer" className="btn-tx-action btn-tx-primary">
                                          <ExternalLink size={18} /> View Payment Receipt
                                    </a>
                              )}
                              <button onClick={onClose} className="btn-tx-action btn-tx-secondary">
                                    Dismiss Details
                              </button>
                        </div>
                  </div>
            </div>
      );
};

export default TransactionDetailsModal;
