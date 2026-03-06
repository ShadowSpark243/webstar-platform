import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { ShieldAlert, Zap, AlertTriangle, Cpu, Terminal, Lock, Globe, Database, Settings2, Loader2, RefreshCw } from 'lucide-react';

const AdminSettings = () => {
      const { user } = useAuth();
      const [targetUserId, setTargetUserId] = useState('');
      const [depositAmount, setDepositAmount] = useState('100000');
      const [isProcessing, setIsProcessing] = useState(false);
      const [maintenanceMode, setMaintenanceMode] = useState(false);
      const [loadingSettings, setLoadingSettings] = useState(true);

      const fetchSettings = async () => {
            try {
                  const res = await api.get('/admin/settings');
                  if (res.data.success) {
                        setMaintenanceMode(res.data.settings.maintenanceMode);
                  }
            } catch (err) {
                  console.error('Failed to fetch settings');
            } finally {
                  setLoadingSettings(false);
            }
      };

      useEffect(() => {
            fetchSettings();
      }, []);

      const handleToggleMaintenance = async () => {
            if (!window.confirm(`Are you sure you want to ${maintenanceMode ? 'DISABLE' : 'ENABLE'} Maintenance Mode? This affects all platform traffic.`)) return;
            try {
                  const res = await api.put('/admin/settings', { maintenanceMode: !maintenanceMode });
                  if (res.data.success) {
                        setMaintenanceMode(!maintenanceMode);
                        alert(`Maintenance mode is now ${!maintenanceMode ? 'ACTIVE' : 'INACTIVE'}`);
                  }
            } catch (err) {
                  alert('Action failed');
            }
      };

      const handleMockDeposit = async (e) => {
            e.preventDefault();
            const amt = parseFloat(depositAmount);
            if (amt <= 0 || isNaN(amt)) return alert("Invalid amount");

            if (!window.confirm(`DANGER: You are about to inject ₹${amt.toLocaleString()} directly into core liquidity. This action is immutable. Proceed?`)) return;

            setIsProcessing(true);
            try {
                  const target = targetUserId || user.id;
                  await api.put(`/admin/users/${target}/wallet`, {
                        newBalance: amt,
                        reason: 'Master Override Injection'
                  });
                  alert(`Successfully injected ₹${amt.toLocaleString()} into account ${target}`);
                  setTargetUserId('');
                  setDepositAmount('100000');
            } catch (error) {
                  alert('Override Failed: ' + (error.response?.data?.message || 'Unauthorized Protocol'));
            } finally {
                  setIsProcessing(false);
            }
      };

      return (
            <div className="fade-in">
                  <header style={{ marginBottom: '2rem' }}>
                        <h1 className="admin-page-title">System Directives</h1>
                        <p className="admin-page-subtitle">Core platform overrides and security protocols.</p>
                  </header>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>

                        {/* God-Mode Injection */}
                        <div className="glass-panel" style={{ padding: '2rem', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.02)', position: 'relative', overflow: 'hidden' }}>
                              <div style={{ position: 'absolute', top: '-20px', right: '-20px', color: '#ef4444', opacity: 0.05 }}><Cpu size={120} /></div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#ef4444', marginBottom: '1.5rem' }}>
                                    <ShieldAlert size={28} />
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Master Override</h2>
                              </div>

                              <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                                    <AlertTriangle size={24} style={{ flexShrink: 0, color: '#ef4444' }} />
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>
                                          God-mode injection bypasses all verification layers. Funds are minted directly into the target ledger.
                                    </p>
                              </div>

                              <form onSubmit={handleMockDeposit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                    <div className="form-group">
                                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Target Protocol ID</label>
                                          <input
                                                type="text"
                                                className="admin-search-input"
                                                style={{ width: '100%', paddingLeft: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}
                                                placeholder={`Self (${user?.id})`}
                                                value={targetUserId}
                                                onChange={e => setTargetUserId(e.target.value)}
                                          />
                                    </div>
                                    <div className="form-group">
                                          <label style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'block' }}>Mint Amount (₹)</label>
                                          <input
                                                type="number"
                                                className="admin-search-input"
                                                style={{ width: '100%', paddingLeft: '1rem', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1.25rem', fontWeight: 800, color: '#ef4444' }}
                                                value={depositAmount}
                                                onChange={e => setDepositAmount(e.target.value)}
                                          />
                                    </div>
                                    <button
                                          type="submit"
                                          disabled={isProcessing}
                                          style={{ width: '100%', padding: '1rem', borderRadius: '0.75rem', background: '#ef4444', color: 'white', border: 'none', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)' }}
                                    >
                                          {isProcessing ? <><Loader2 size={18} className="animate-spin" /> Executing...</> : <><Zap size={18} /> Execute Override</>}
                                    </button>
                              </form>
                        </div>

                        {/* Global Controls */}
                        <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#8b5cf6' }}>
                                    <Settings2 size={28} />
                                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform State</h2>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                          <div style={{ padding: '0.75rem', background: maintenanceMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem', color: maintenanceMode ? '#f59e0b' : '#10b981' }}>
                                                <Lock size={24} />
                                          </div>
                                          <div>
                                                <div style={{ fontWeight: 700, color: 'white' }}>Maintenance Mode</div>
                                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{maintenanceMode ? 'Platform restricted to admins' : 'Platform live for all users'}</div>
                                          </div>
                                    </div>
                                    <button
                                          onClick={handleToggleMaintenance}
                                          disabled={loadingSettings}
                                          style={{ padding: '0.5rem 1rem', borderRadius: '0.50rem', background: maintenanceMode ? '#f59e0b' : 'rgba(255,255,255,0.05)', color: maintenanceMode ? 'white' : 'rgba(255,255,255,0.6)', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer' }}
                                    >
                                          {loadingSettings ? <RefreshCw size={14} className="animate-spin" /> : maintenanceMode ? 'Disable' : 'Enable'}
                                    </button>
                              </div>

                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', background: 'rgba(255,255,255,0.02)', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', opacity: 0.5 }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                          <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.75rem', color: '#3b82f6' }}>
                                                <Globe size={24} />
                                          </div>
                                          <div>
                                                <div style={{ fontWeight: 700, color: 'white' }}>Public Registrations</div>
                                                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Enabled (Immutable in this build)</div>
                                          </div>
                                    </div>
                                    <div style={{ width: '40px', height: '20px', background: '#3b82f6', borderRadius: '20px', position: 'relative' }}>
                                          <div style={{ width: '16px', height: '16px', background: 'white', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }} />
                                    </div>
                              </div>

                              <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '0.75rem', border: '1px dashed rgba(139, 92, 246, 0.3)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <Terminal size={18} style={{ color: '#8b5cf6' }} />
                                    <span style={{ fontSize: '0.75rem', color: '#a78bfa', fontWeight: 600 }}>System Integrity: Nominal</span>
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default AdminSettings;
