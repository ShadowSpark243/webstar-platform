import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { ShieldAlert, Zap, AlertTriangle } from 'lucide-react';

const AdminSettings = () => {
      const { user } = useAuth();
      const [targetUserId, setTargetUserId] = useState('');
      const [depositAmount, setDepositAmount] = useState('100000');
      const [isProcessing, setIsProcessing] = useState(false);

      const handleMockDeposit = async (e) => {
            e.preventDefault();
            const amt = parseFloat(depositAmount);
            if (amt <= 0 || isNaN(amt)) {
                  alert("Please enter a valid amount greater than 0.");
                  return;
            }

            if (!window.confirm(`WARNING: You are about to instantly inject ₹${amt.toLocaleString('en-IN')} into the system. This bypasses all standard queues and transaction logs. Are you sure you want to proceed?`)) {
                  return;
            }

            setIsProcessing(true);
            try {
                  const target = targetUserId || user.id; // Target self if empty
                  await api.put(`/admin/users/${target}/wallet`, {
                        newBalance: amt,
                        reason: 'God-Mode Direct Injection'
                  });
                  alert(`Successfully injected ₹${amt.toLocaleString('en-IN')} into user ${target}!`);
                  setTargetUserId('');
                  setDepositAmount('');
            } catch (error) {
                  alert('God-Mode Injection Failed: ' + (error.response?.data?.message || error.message));
            } finally {
                  setIsProcessing(false);
            }
      };

      return (
            <div>
                  <h1 className="admin-page-title">System Directives</h1>
                  <p className="admin-page-subtitle">Dangerous operations, wallet injections, and platform settings.</p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                        {/* God Mode Wallet Injection Card */}
                        <div className="dashboard-card glass-panel" style={{ border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)', position: 'relative', overflow: 'hidden' }}>

                              <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.05, color: '#ef4444' }}>
                                    <Zap size={150} />
                              </div>

                              <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f87171' }}>
                                    <ShieldAlert /> God-Mode Wallet Injection
                              </h2>
                              <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                    <AlertTriangle className="text-red-400" size={24} style={{ flexShrink: 0 }} />
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#fca5a5', lineHeight: '1.5' }}>
                                          This tool forcibly overrides a user's wallet state, completely bypassing the manual verification queue. Funds injected here will instantly become completely active liquidity. Leave the Target User ID empty to inject funds into your own Administrator wallet.
                                    </p>
                              </div>

                              <form onSubmit={handleMockDeposit} style={{ display: 'flex', gap: '1.5rem', flexDirection: 'column', position: 'relative', zIndex: 10 }}>
                                    <div className="form-group">
                                          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Target User ID (Optional)</label>
                                          <input
                                                type="text"
                                                className="dashboard-input"
                                                placeholder={`Default: Your ID (${String(user?.id).padStart(5, '0')})`}
                                                value={targetUserId}
                                                onChange={(e) => setTargetUserId(e.target.value)}
                                                style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.2s' }}
                                                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                          />
                                    </div>
                                    <div className="form-group">
                                          <label style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>New Absolute Wallet Balance (₹)</label>
                                          <input
                                                type="number"
                                                required
                                                className="dashboard-input"
                                                placeholder="E.g. 1000000"
                                                value={depositAmount}
                                                onChange={(e) => setDepositAmount(e.target.value)}
                                                style={{ width: '100%', padding: '0.875rem 1rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', borderRadius: '0.5rem', outline: 'none', transition: 'border-color 0.2s', fontSize: '1.2rem', fontWeight: 600, letterSpacing: '1px' }}
                                                onFocus={(e) => e.target.style.borderColor = '#ef4444'}
                                                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                                          />
                                    </div>
                                    <button
                                          type="submit"
                                          className="btn"
                                          disabled={isProcessing}
                                          style={{
                                                padding: '1rem',
                                                alignSelf: 'flex-start',
                                                background: isProcessing ? '#7f1d1d' : '#ef4444',
                                                color: 'white',
                                                border: 'none',
                                                fontWeight: 700,
                                                letterSpacing: '0.05em',
                                                cursor: isProcessing ? 'not-allowed' : 'pointer'
                                          }}
                                    >
                                          {isProcessing ? 'Executing Protocol...' : 'Execute God-Mode Override'}
                                    </button>
                              </form>
                        </div>

                        {/* Future Server Settings Dummy Card */}
                        <div className="dashboard-card glass-panel" style={{ border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                              <ShieldAlert size={48} className="text-muted" style={{ marginBottom: '1rem', opacity: 0.5 }} />
                              <h3 style={{ color: 'rgba(255,255,255,0.7)', margin: '0 0 0.5rem 0' }}>Global System Directives</h3>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', maxWidth: '300px' }}>Platform toggles (Maintenance Mode, Registration Locks, Payment Gateways) will be mapped here in a future update.</p>
                        </div>
                  </div>
            </div>
      );
};

export default AdminSettings;
