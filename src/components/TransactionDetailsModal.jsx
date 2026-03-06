import React from 'react';
import { X, ArrowDownToLine, ArrowUpRight, User, Hash, Clock, Landmark, FileText, CheckCircle, Clock3, XCircle, ExternalLink } from 'lucide-react';

const TransactionDetailsModal = ({ transaction, onClose, onInspectUser }) => {
      if (!transaction) return null;

      const isPositive = ['DEPOSIT', 'COMMISSION'].includes(transaction.type);
      const isRejected = transaction.status === 'REJECTED';

      const statusConfig = {
            APPROVED: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: <CheckCircle size={14} />, label: 'Approved' },
            PENDING: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: <Clock3 size={14} />, label: 'Pending' },
            REJECTED: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: <XCircle size={14} />, label: 'Rejected' }
      };

      const status = statusConfig[transaction.status] || statusConfig.PENDING;

      const typeLabels = {
            DEPOSIT: 'Deposit',
            WITHDRAWAL: 'Withdrawal',
            INVESTMENT: 'Investment',
            COMMISSION: 'Commission',
            REFUND: 'Refund'
      };

      return (
            <div className="modal-overlay" onClick={onClose}>
                  <style>{`
                        .modal-overlay {
                              position: fixed;
                              inset: 0;
                              background: rgba(0, 0, 0, 0.8);
                              backdrop-filter: blur(12px);
                              display: flex;
                              justify-content: center;
                              align-items: center;
                              z-index: 10000;
                              padding: 1.5rem;
                              animation: fadeIn 0.3s ease-out;
                        }

                        .tx-modal-card {
                              width: 100%;
                              max-width: 480px;
                              background: rgba(15, 23, 42, 0.9);
                              border: 1px solid rgba(255, 255, 255, 0.1);
                              border-radius: 2rem;
                              overflow: hidden;
                              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                              animation: modalScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
                        }

                        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                        @keyframes modalScale { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }

                        .tx-hero-section {
                              padding: 2.5rem 1.5rem;
                              text-align: center;
                              background: linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, transparent 100%);
                              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                              position: relative;
                        }

                        .tx-type-chip {
                              display: inline-block;
                              padding: 0.5rem 1rem;
                              border-radius: 2rem;
                              font-size: 0.75rem;
                              font-weight: 800;
                              text-transform: uppercase;
                              letter-spacing: 0.1em;
                              margin-bottom: 1rem;
                              background: rgba(255, 255, 255, 0.05);
                              color: rgba(255, 255, 255, 0.5);
                        }

                        .tx-amount-large {
                              font-size: 3rem;
                              font-weight: 900;
                              margin-bottom: 1rem;
                              display: flex;
                              align-items: center;
                              justify-content: center;
                              gap: 0.75rem;
                              letter-spacing: -0.02em;
                        }

                        .tx-status-pill {
                              display: inline-flex;
                              align-items: center;
                              gap: 0.5rem;
                              padding: 0.6rem 1.25rem;
                              border-radius: 3rem;
                              font-size: 0.85rem;
                              font-weight: 700;
                        }

                        .tx-details-grid {
                              padding: 1.5rem;
                              display: flex;
                              flex-direction: column;
                              gap: 1.25rem;
                        }

                        .detail-item {
                              display: flex;
                              flex-direction: column;
                              gap: 0.4rem;
                        }

                        .detail-label {
                              font-size: 0.7rem;
                              color: rgba(255, 255, 255, 0.35);
                              text-transform: uppercase;
                              font-weight: 700;
                              letter-spacing: 0.05em;
                              display: flex;
                              align-items: center;
                              gap: 0.4rem;
                        }

                        .detail-value {
                              font-size: 1rem;
                              color: white;
                              font-weight: 600;
                              line-height: 1.5;
                        }

                        .ref-box {
                              padding: 0.75rem 1rem;
                              background: rgba(0, 0, 0, 0.3);
                              border-radius: 1rem;
                              border: 1px solid rgba(255, 255, 255, 0.05);
                              font-family: 'JetBrains Mono', monospace;
                              color: #60a5fa;
                              word-break: break-all;
                        }

                        .user-card-mini {
                              margin: 1.5rem;
                              padding: 1.25rem;
                              background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
                              border-radius: 1.5rem;
                              border: 1px solid rgba(139, 92, 246, 0.2);
                              display: flex;
                              align-items: center;
                              justify-content: space-between;
                              gap: 1rem;
                        }

                        @media (max-width: 480px) {
                              .modal-overlay { padding: 1rem; }
                              .tx-amount-large { font-size: 2.25rem; }
                        }
                  `}</style>

                  <div className="tx-modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="tx-hero-section">
                              <button onClick={onClose} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.05)', border: 'none', color: 'white', padding: '0.5rem', borderRadius: '50%', cursor: 'pointer' }}>
                                    <X size={20} />
                              </button>

                              <div className="tx-type-chip">
                                    {typeLabels[transaction.type] || transaction.type}
                              </div>

                              <div className="tx-amount-large" style={{ color: isRejected ? '#64748b' : (isPositive ? '#10b981' : '#ef4444'), textDecoration: isRejected ? 'line-through' : 'none' }}>
                                    {isPositive ? <ArrowDownToLine size={32} /> : <ArrowUpRight size={32} />}
                                    <span>{isRejected ? '' : (isPositive ? '+' : '-')}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}</span>
                              </div>

                              <div className="tx-status-pill" style={{ background: status.bg, color: status.color }}>
                                    {status.icon} {status.label}
                              </div>
                        </div>

                        <div className="tx-details-grid">
                              {transaction.status === 'REJECTED' && transaction.rejectionReason && (
                                    <div className="detail-item">
                                          <div className="detail-label"><XCircle size={14} color="#ef4444" /> Rejection Note</div>
                                          <div className="detail-value" style={{ color: '#fca5a5' }}>{transaction.rejectionReason}</div>
                                    </div>
                              )}

                              <div className="detail-item">
                                    <div className="detail-label"><FileText size={14} /> Description</div>
                                    <div className="detail-value">{transaction.description || 'No description provided'}</div>
                              </div>

                              <div className="detail-item">
                                    <div className="detail-label"><Clock size={14} /> Timestamp</div>
                                    <div className="detail-value">{new Date(transaction.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                              </div>

                              {transaction.bankReference && (
                                    <div className="detail-item">
                                          <div className="detail-label"><Hash size={14} /> Bank Reference (UTR)</div>
                                          <div className="ref-box">{transaction.bankReference}</div>
                                    </div>
                              )}

                              {transaction.receiptUrl && (
                                    <div className="detail-item">
                                          <div className="detail-label"><FileText size={14} /> Payment Receipt</div>
                                          <a href={transaction.receiptUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: 700, textDecoration: 'none', background: 'rgba(59, 130, 246, 0.1)', padding: '0.75rem 1rem', borderRadius: '1rem', width: 'fit-content' }}>
                                                View Receipt <ExternalLink size={14} />
                                          </a>
                                    </div>
                              )}
                        </div>

                        {onInspectUser && transaction.user && (
                              <div className="user-card-mini">
                                    <div>
                                          <div className="detail-label" style={{ color: '#818cf8' }}><User size={12} /> Contributor</div>
                                          <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', margin: '0.2rem 0' }}>{transaction.user.fullName}</div>
                                          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{transaction.user.email}</div>
                                    </div>
                                    <button onClick={() => { onClose(); onInspectUser(transaction.userId); }} style={{ padding: '0.6rem 1rem', background: '#4f46e5', border: 'none', color: 'white', borderRadius: '0.75rem', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)' }}>
                                          Inspect
                                    </button>
                              </div>
                        )}

                        <div style={{ padding: '0 1.5rem 2rem' }}>
                              <button onClick={onClose} style={{ width: '100%', padding: '1rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '1rem' }}>
                                    Dismiss
                              </button>
                        </div>
                  </div>
            </div>
      );
};

const DetailRow = ({ icon, label, value, highlight }) => (
      <div style={{
            display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
            padding: '0.65rem 0',
            borderBottom: '1px solid rgba(255,255,255,0.04)'
      }}>
            <div style={{
                  color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem',
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  minWidth: '95px', flexShrink: 0, paddingTop: '1px'
            }}>
                  {icon} <span>{label}</span>
            </div>
            <div style={{
                  color: highlight ? '#60a5fa' : 'rgba(255,255,255,0.85)',
                  fontSize: '0.85rem', lineHeight: 1.45,
                  fontFamily: highlight ? 'monospace' : 'inherit',
                  letterSpacing: highlight ? '0.5px' : 'normal',
                  wordBreak: 'break-word'
            }}>
                  {value}
            </div>
      </div>
);

export default TransactionDetailsModal;
