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
            <div
                  onClick={onClose}
                  style={{
                        position: 'fixed', inset: 0,
                        background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
                        display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
                        zIndex: 10000, padding: '0',
                        animation: 'fadeIn 0.2s ease'
                  }}
            >
                  <style>{`
                        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                        @keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }
                        @media (min-width: 640px) {
                              .tx-modal-container { 
                                    align-items: center !important; 
                              }
                              .tx-modal-card {
                                    border-radius: 1rem !important;
                                    max-height: 90vh !important;
                                    margin: 1rem !important;
                              }
                        }
                  `}</style>

                  <div
                        className="tx-modal-container"
                        onClick={onClose}
                        style={{
                              position: 'fixed', inset: 0,
                              display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
                              padding: '0'
                        }}
                  >
                        <div
                              className="tx-modal-card"
                              onClick={(e) => e.stopPropagation()}
                              style={{
                                    width: '100%', maxWidth: '460px',
                                    background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
                                    border: '1px solid rgba(255,255,255,0.08)',
                                    borderRadius: '1.25rem 1.25rem 0 0',
                                    overflow: 'hidden',
                                    animation: 'slideUp 0.3s ease',
                                    maxHeight: '92vh',
                                    overflowY: 'auto'
                              }}
                        >
                              {/* Colored accent bar */}
                              <div style={{
                                    height: '3px', width: '100%',
                                    background: isRejected ? '#ef4444' : (isPositive ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f87171, #ef4444)')
                              }} />

                              {/* Drag Handle (mobile indicator) */}
                              <div style={{ display: 'flex', justifyContent: 'center', paddingTop: '0.75rem' }}>
                                    <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
                              </div>

                              {/* Header */}
                              <div style={{
                                    padding: '0.75rem 1.25rem 1rem', display: 'flex',
                                    justifyContent: 'space-between', alignItems: 'flex-start'
                              }}>
                                    <div>
                                          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'white', letterSpacing: '-0.01em' }}>Transaction Details</h2>
                                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }}>TX-{String(transaction.id).padStart(6, '0')}</span>
                                    </div>
                                    <button
                                          onClick={onClose}
                                          style={{
                                                background: 'rgba(255,255,255,0.05)', border: 'none',
                                                color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
                                                padding: '0.4rem', borderRadius: '0.5rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                transition: 'background 0.2s'
                                          }}
                                    >
                                          <X size={18} />
                                    </button>
                              </div>

                              {/* Amount Hero */}
                              <div style={{
                                    margin: '0 1.25rem', padding: '1.25rem 1rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    border: '1px solid rgba(255,255,255,0.06)',
                                    borderRadius: '0.75rem', textAlign: 'center'
                              }}>
                                    <div style={{
                                          fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)',
                                          textTransform: 'uppercase', letterSpacing: '2px',
                                          marginBottom: '0.5rem', fontWeight: 600
                                    }}>
                                          {typeLabels[transaction.type] || transaction.type}
                                    </div>

                                    <div style={{
                                          fontSize: 'clamp(1.75rem, 6vw, 2.25rem)', fontWeight: 800,
                                          color: isRejected ? '#6b7280' : (isPositive ? '#10b981' : '#f87171'),
                                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                                          textDecoration: isRejected ? 'line-through' : 'none',
                                          lineHeight: 1.2
                                    }}>
                                          {isPositive ? <ArrowDownToLine size={22} style={{ flexShrink: 0 }} /> : <ArrowUpRight size={22} style={{ flexShrink: 0 }} />}
                                          <span>{isRejected ? '' : (isPositive ? '+' : '-')}₹{Math.abs(transaction.amount).toLocaleString('en-IN')}</span>
                                    </div>

                                    <div style={{
                                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                          marginTop: '0.75rem', background: status.bg,
                                          color: status.color, padding: '0.25rem 0.65rem',
                                          borderRadius: '1rem', fontSize: '0.72rem', fontWeight: 600
                                    }}>
                                          {status.icon} {status.label}
                                    </div>
                              </div>

                              {/* Detail Rows */}
                              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0' }}>
                                    {transaction.status === 'REJECTED' && transaction.rejectionReason && (
                                          <DetailRow icon={<XCircle size={14} color="#ef4444" />} label={<span style={{ color: '#ef4444' }}>Rejection Note</span>} value={<span style={{ color: '#fca5a5' }}>{transaction.rejectionReason}</span>} />
                                    )}
                                    <DetailRow icon={<FileText size={14} />} label="Description" value={transaction.description || '—'} />
                                    <DetailRow icon={<Clock size={14} />} label="Timestamp" value={new Date(transaction.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })} />
                                    {transaction.bankReference && (
                                          <DetailRow icon={<Hash size={14} />} label="Bank UTR" value={transaction.bankReference} highlight />
                                    )}
                                    {transaction.bankAccountInfo && (
                                          <DetailRow icon={<Landmark size={14} />} label="Bank Info" value={transaction.bankAccountInfo} />
                                    )}
                              </div>

                              {/* Admin: Inspect User */}
                              {onInspectUser && transaction.user && (
                                    <div style={{ padding: '0 1.25rem 1.25rem' }}>
                                          <div style={{
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                background: 'rgba(139, 92, 246, 0.06)',
                                                border: '1px solid rgba(139, 92, 246, 0.15)',
                                                padding: '0.875rem 1rem', borderRadius: '0.75rem',
                                                flexWrap: 'wrap', gap: '0.75rem'
                                          }}>
                                                <div style={{ minWidth: 0 }}>
                                                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c4b5fd', fontSize: '0.7rem', marginBottom: '0.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                                            <User size={12} /> Associated User
                                                      </div>
                                                      <div style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {transaction.user.fullName}
                                                      </div>
                                                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                            {transaction.user.username ? `@${transaction.user.username}` : ''}{transaction.user.username && transaction.user.email ? ' · ' : ''}{transaction.user.email || ''}
                                                      </div>
                                                </div>
                                                <button
                                                      onClick={() => { onClose(); onInspectUser(transaction.userId); }}
                                                      style={{
                                                            padding: '0.5rem 0.875rem', fontSize: '0.78rem',
                                                            border: '1px solid rgba(139, 92, 246, 0.4)', color: '#a78bfa',
                                                            background: 'rgba(139, 92, 246, 0.08)', borderRadius: '0.5rem',
                                                            cursor: 'pointer', fontWeight: 600,
                                                            display: 'flex', alignItems: 'center', gap: '0.35rem',
                                                            whiteSpace: 'nowrap', flexShrink: 0,
                                                            transition: 'all 0.2s'
                                                      }}
                                                >
                                                      <ExternalLink size={13} /> Inspect Profile
                                                </button>
                                          </div>
                                    </div>
                              )}
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
