import React from 'react';
import { X, ArrowDownToLine, ArrowUpRight, Hash, Clock, FileText, CheckCircle, Clock3, XCircle, ExternalLink, Tag } from 'lucide-react';

const TransactionDetailsModal = ({ transaction, onClose, onInspectUser }) => {
      if (!transaction) return null;

      const isPositive = ['DEPOSIT', 'COMMISSION', 'DAILY_ROI', 'BONUS', 'RETURN', 'REFUND'].includes(transaction.type);
      const isRejected = transaction.status === 'REJECTED';
      const showStatus = !['DAILY_ROI', 'RETURN', 'INVESTMENT'].includes(transaction.type);

      const statusConfig = {
            APPROVED: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: <CheckCircle size={12} />, label: 'Approved' },
            PENDING: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: <Clock3 size={12} />, label: 'Pending' },
            REJECTED: { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.12)', icon: <XCircle size={12} />, label: 'Rejected' }
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

      const status = statusConfig[transaction?.status] || statusConfig.PENDING;

      const handleClose = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
      };

      return (
            <div className="txm-overlay" onClick={handleClose}>
                  <style>{`
                        .txm-overlay {
                              position: fixed;
                              inset: 0;
                              background: rgba(0, 0, 0, 0.6);
                              backdrop-filter: blur(8px);
                              display: flex;
                              align-items: flex-end;
                              justify-content: center;
                              z-index: 99999;
                              padding: 0;
                              animation: txmFadeIn 0.25s ease-out;
                        }
                        @keyframes txmFadeIn { from { opacity: 0; } to { opacity: 1; } }

                        .txm-sheet {
                              width: 100%;
                              max-width: 520px;
                              max-height: 75vh;
                              background: linear-gradient(180deg, rgba(15, 23, 42, 0.98) 0%, rgba(10, 15, 30, 0.99) 100%);
                              border: 1px solid rgba(255, 255, 255, 0.08);
                              border-bottom: none;
                              border-radius: 1.5rem 1.5rem 0 0;
                              overflow-y: auto;
                              animation: txmSlideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                              position: relative;
                        }
                        @keyframes txmSlideUp {
                              from { transform: translateY(100%); }
                              to { transform: translateY(0); }
                        }

                        .txm-handle {
                              width: 36px;
                              height: 4px;
                              border-radius: 4px;
                              background: rgba(255,255,255,0.2);
                              margin: 0.75rem auto 0;
                        }

                        .txm-close {
                              position: absolute;
                              top: 0.75rem;
                              right: 1rem;
                              width: 32px;
                              height: 32px;
                              border-radius: 50%;
                              background: rgba(255,255,255,0.08);
                              border: 1px solid rgba(255,255,255,0.1);
                              color: rgba(255,255,255,0.6);
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              cursor: pointer;
                              transition: all 0.2s;
                              z-index: 10;
                        }
                        .txm-close:hover {
                              background: rgba(239, 68, 68, 0.2);
                              border-color: rgba(239, 68, 68, 0.4);
                              color: #ef4444;
                        }

                        .txm-hero {
                              padding: 1.25rem 1.5rem 1rem;
                              text-align: center;
                        }

                        .txm-icon {
                              width: 48px;
                              height: 48px;
                              border-radius: 1rem;
                              margin: 0 auto 0.75rem;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              background: ${isPositive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'};
                              border: 1px solid ${isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'};
                              color: ${isPositive ? '#10b981' : '#ef4444'};
                        }

                        .txm-amount {
                              font-size: 2rem;
                              font-weight: 900;
                              color: ${isRejected ? '#94a3b8' : (isPositive ? '#10b981' : '#ef4444')};
                              letter-spacing: -0.03em;
                              margin-bottom: 0.5rem;
                              text-decoration: ${isRejected ? 'line-through' : 'none'};
                              font-family: 'Inter', system-ui, sans-serif;
                        }

                        .txm-status {
                              display: inline-flex;
                              align-items: center;
                              gap: 0.4rem;
                              padding: 0.35rem 0.85rem;
                              border-radius: 2rem;
                              background: ${status.bg};
                              color: ${status.color};
                              font-size: 0.7rem;
                              font-weight: 700;
                              text-transform: uppercase;
                              letter-spacing: 0.06em;
                        }

                        .txm-body {
                              padding: 0 1.25rem 1.25rem;
                              display: flex;
                              flex-direction: column;
                              gap: 0.75rem;
                        }

                        .txm-grid {
                              display: grid;
                              grid-template-columns: 1fr 1fr;
                              gap: 0.6rem;
                        }

                        .txm-field {
                              padding: 0.75rem;
                              background: rgba(255,255,255,0.03);
                              border-radius: 0.85rem;
                              border: 1px solid rgba(255,255,255,0.05);
                        }
                        .txm-field.full { grid-column: span 2; }

                        .txm-field-label {
                              font-size: 0.6rem;
                              font-weight: 700;
                              color: rgba(255,255,255,0.35);
                              text-transform: uppercase;
                              letter-spacing: 0.08em;
                              margin-bottom: 0.3rem;
                              display: flex;
                              align-items: center;
                              gap: 0.35rem;
                        }

                        .txm-field-value {
                              font-size: 0.85rem;
                              font-weight: 600;
                              color: white;
                        }

                        .txm-desc-box {
                              padding: 0.85rem;
                              background: rgba(59,130,246,0.05);
                              border-radius: 0.85rem;
                              border: 1px solid rgba(59,130,246,0.1);
                        }

                        .txm-reject-box {
                              padding: 0.85rem;
                              background: rgba(239,68,68,0.05);
                              border-radius: 0.85rem;
                              border: 1px solid rgba(239,68,68,0.1);
                        }

                        .txm-actions {
                              display: flex;
                              flex-direction: column;
                              gap: 0.5rem;
                              padding-top: 0.25rem;
                        }

                        .txm-btn {
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              gap: 0.5rem;
                              padding: 0.75rem;
                              border-radius: 0.85rem;
                              font-weight: 700;
                              font-size: 0.85rem;
                              cursor: pointer;
                              transition: all 0.2s;
                              text-decoration: none;
                              border: none;
                        }
                        .txm-btn.primary {
                              background: linear-gradient(135deg, #3b82f6, #2563eb);
                              color: white;
                              box-shadow: 0 6px 16px rgba(37,99,235,0.35);
                        }
                        .txm-btn.primary:hover {
                              transform: translateY(-1px);
                              box-shadow: 0 8px 20px rgba(37,99,235,0.45);
                        }
                        .txm-btn.secondary {
                              background: rgba(255,255,255,0.05);
                              color: rgba(255,255,255,0.6);
                              border: 1px solid rgba(255,255,255,0.08);
                        }
                        .txm-btn.secondary:hover {
                              background: rgba(255,255,255,0.08);
                              color: white;
                        }

                        @media (min-width: 640px) {
                              .txm-overlay {
                                    align-items: center;
                                    padding: 1rem;
                              }
                              .txm-sheet {
                                    border-radius: 1.25rem;
                                    border-bottom: 1px solid rgba(255,255,255,0.08);
                                    max-height: 80vh;
                              }
                              .txm-handle { display: none; }
                        }

                        @media (max-width: 480px) {
                              .txm-grid { grid-template-columns: 1fr; }
                              .txm-field.full { grid-column: span 1; }
                              .txm-amount { font-size: 1.75rem; }
                        }
                  `}</style>

                  <div className="txm-sheet" onClick={(e) => e.stopPropagation()}>
                        <div className="txm-handle"></div>
                        <button className="txm-close" onClick={handleClose}><X size={16} /></button>

                        <div className="txm-hero">
                              <div className="txm-icon">
                                    {isPositive ? <ArrowDownToLine size={22} /> : <ArrowUpRight size={22} />}
                              </div>
                              <div className="txm-amount">
                                    {isPositive ? '+' : '-'}₹{Math.abs(transaction?.amount || 0).toLocaleString('en-IN')}
                              </div>
                              {showStatus && (
                                    <div className="txm-status">{status.icon} {status.label}</div>
                              )}
                        </div>

                        <div className="txm-body">
                              <div className="txm-grid">
                                    <div className="txm-field">
                                          <div className="txm-field-label"><Tag size={10} /> Type</div>
                                          <div className="txm-field-value">{typeLabels[transaction?.type] || transaction?.type}</div>
                                    </div>
                                    <div className="txm-field">
                                          <div className="txm-field-label"><Clock size={10} /> Date</div>
                                          <div className="txm-field-value">{new Date(transaction?.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                    </div>
                                    {transaction?.bankReference && (
                                          <div className="txm-field full">
                                                <div className="txm-field-label"><Hash size={10} /> UTR / Reference</div>
                                                <div className="txm-field-value" style={{ color: '#60a5fa', fontFamily: 'monospace', fontSize: '0.8rem' }}>{transaction.bankReference}</div>
                                          </div>
                                    )}
                              </div>

                              {transaction?.description && (
                                    <div className="txm-desc-box">
                                          <div className="txm-field-label" style={{ color: '#60a5fa' }}><FileText size={10} /> Details</div>
                                          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: '0.25rem 0 0' }}>
                                                {transaction.description}
                                          </p>
                                    </div>
                              )}

                              {isRejected && transaction?.rejectionReason && (
                                    <div className="txm-reject-box">
                                          <div className="txm-field-label" style={{ color: '#ef4444' }}><XCircle size={10} /> Rejection Reason</div>
                                          <p style={{ fontSize: '0.8rem', color: '#fca5a5', lineHeight: 1.4, margin: '0.25rem 0 0' }}>{transaction.rejectionReason}</p>
                                    </div>
                              )}

                              <div className="txm-actions">
                                    {transaction?.receiptUrl && (
                                          <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer" className="txm-btn primary">
                                                <ExternalLink size={15} /> View Receipt
                                          </a>
                                    )}
                                    {onInspectUser && transaction?.userId && (
                                          <button onClick={() => { onInspectUser(transaction.userId); onClose(); }} className="txm-btn secondary">
                                                View User
                                          </button>
                                    )}
                                    <button onClick={handleClose} className="txm-btn secondary">
                                          Dismiss
                                    </button>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default TransactionDetailsModal;
