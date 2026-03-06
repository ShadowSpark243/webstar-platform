import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShieldAlert, Users, TrendingUp, CreditCard, Activity, BarChart2, LineChart as LineChartIcon, ShieldCheck, Settings, Bell, Clock, Info, Shield, HardDrive, RefreshCw, Wallet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './AdminOverview.css';

const AdminOverview = () => {
      const [globalStats, setGlobalStats] = useState({ users: {}, funding: {}, analytics: { fundingData: [], userGrowthData: [] } });
      const [adminLogs, setAdminLogs] = useState([]);
      const [maintenanceMode, setMaintenanceMode] = useState(false);
      const [loading, setLoading] = useState(true);
      const [actionLoading, setActionLoading] = useState(false);
      const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' or 'security'

      const fetchData = async () => {
            setLoading(true);
            try {
                  const [statsRes, logsRes, maintRes] = await Promise.all([
                        api.get('/admin/stats'),
                        api.get('/admin/logs'),
                        api.get('/admin/maintenance')
                  ]);
                  setGlobalStats(statsRes.data);
                  setAdminLogs(logsRes.data.logs || []);
                  setMaintenanceMode(maintRes.data.maintenance);
            } catch (error) {
                  console.error("Failed to fetch admin data:", error);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchData();
      }, []);

      const handleToggleMaintenance = async () => {
            if (!window.confirm(`Are you sure you want to ${maintenanceMode ? 'DISABLE' : 'ENABLE'} Maintenance Mode? ${maintenanceMode ? '' : 'This will block user access to the platform.'}`)) return;

            setActionLoading(true);
            try {
                  const res = await api.post('/admin/maintenance/toggle', { enabled: !maintenanceMode });
                  if (res.data.success) {
                        setMaintenanceMode(!maintenanceMode);
                        fetchData(); // Refresh logs to show the toggle action
                  }
            } catch (error) {
                  alert("Failed to toggle maintenance mode");
            } finally {
                  setActionLoading(false);
            }
      };

      const getActionColor = (action) => {
            if (action.includes('APPROVED') || action.includes('ENABLE') || action.includes('CREATE')) return '#10b981';
            if (action.includes('REJECTED') || action.includes('DISABLE') || action.includes('DELETE') || action.includes('BANNED')) return '#ef4444';
            if (action.includes('UPDATE')) return '#3b82f6';
            return '#94a3b8';
      };

      return (
            <div className="admin-overview">
                  <header className="admin-header">
                        <div>
                              <h1 className="admin-page-title">Command Center</h1>
                              <p className="admin-page-subtitle">Global platform metrics and live platform governance.</p>
                        </div>
                        <div className="admin-header-actions">
                              <button
                                    onClick={fetchData}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem 1rem', borderRadius: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                              >
                                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Data
                              </button>
                              <div className="tab-switcher" style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button
                                          onClick={() => setActiveTab('metrics')}
                                          className={`tab-btn ${activeTab === 'metrics' ? 'active' : ''}`}
                                          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'metrics' ? '#3b82f6' : 'transparent', color: activeTab === 'metrics' ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                                    >
                                          <BarChart2 size={16} style={{ display: 'inline', marginRight: '6px' }} /> Metrics
                                    </button>
                                    <button
                                          onClick={() => setActiveTab('security')}
                                          className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
                                          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'security' ? '#8b5cf6' : 'transparent', color: activeTab === 'security' ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                                    >
                                          <ShieldCheck size={16} style={{ display: 'inline', marginRight: '6px' }} /> Governance
                                    </button>
                              </div>
                        </div>
                  </header>

                  {loading && !globalStats.users.total ? (
                        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
                              <Activity size={48} className="animate-spin" style={{ color: '#3b82f6', marginBottom: '1rem' }} />
                              <p style={{ color: 'rgba(255,255,255,0.6)', margin: 0 }}>Syncing live database feeds...</p>
                        </div>
                  ) : (
                        <>
                              {activeTab === 'metrics' && (
                                    <div className="fade-in">
                                          <div className="admin-stats-grid">
                                                {/* Registered Users Card */}
                                                <div className="stat-card">
                                                      <div className="stat-watermark" style={{ color: '#3b82f6' }}>
                                                            <Users size={120} />
                                                      </div>
                                                      <div className="stat-label">
                                                            <Users size={16} /> Total Registered Users
                                                      </div>
                                                      <div className="stat-value">
                                                            {globalStats.users?.total || 0}
                                                            <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500, marginLeft: '0.5rem' }}>/ 10k</span>
                                                      </div>
                                                      <div className="stat-progress-container">
                                                            <div className="stat-progress-bar" style={{ background: '#3b82f6', width: `${Math.min(100, ((globalStats.users?.total || 0) / 10000) * 100)}%` }}></div>
                                                      </div>
                                                </div>

                                                {/* Total Global Deposits Card */}
                                                <div className="stat-card">
                                                      <div className="stat-watermark" style={{ color: '#10b981' }}>
                                                            <TrendingUp size={120} />
                                                      </div>
                                                      <div className="stat-label">
                                                            <TrendingUp size={16} /> Platform Net Funds
                                                      </div>
                                                      <div className="stat-value" style={{ color: '#10b981' }}>
                                                            ₹{(globalStats.funding?.totalDeposited || 0).toLocaleString('en-IN')}
                                                      </div>
                                                </div>

                                                {/* Total Global Contributions Card */}
                                                <div className="stat-card">
                                                      <div className="stat-watermark" style={{ color: '#8b5cf6' }}>
                                                            <CreditCard size={120} />
                                                      </div>
                                                      <div className="stat-label">
                                                            <CreditCard size={16} /> Active Capital
                                                      </div>
                                                      <div className="stat-value" style={{ color: '#c4b5fd' }}>
                                                            ₹{(globalStats.funding?.totalInvested || 0).toLocaleString('en-IN')}
                                                      </div>
                                                </div>

                                                {/* Total User Wallet Balances */}
                                                <div className="stat-card" style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                                                      <div className="stat-label" style={{ color: 'rgba(59, 130, 246, 0.8)' }}>
                                                            <Wallet size={16} /> Total Wallets
                                                      </div>
                                                      <div className="stat-value" style={{ color: '#60a5fa' }}>
                                                            ₹{(globalStats.funding?.totalUserWallet || 0).toLocaleString('en-IN')}
                                                      </div>
                                                </div>

                                                {/* Total User Income Balances */}
                                                <div className="stat-card" style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                                      <div className="stat-label" style={{ color: 'rgba(16, 185, 129, 0.8)' }}>
                                                            <TrendingUp size={16} /> Total Income
                                                      </div>
                                                      <div className="stat-value" style={{ color: '#34d399' }}>
                                                            ₹{(globalStats.funding?.totalUserIncome || 0).toLocaleString('en-IN')}
                                                      </div>
                                                </div>

                                                {/* Total Platform Liability */}
                                                <div className="stat-card" style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                                                      <div className="stat-label" style={{ color: 'rgba(239, 68, 68, 0.8)' }}>
                                                            <ShieldAlert size={16} /> Platform Liability
                                                      </div>
                                                      <div className="stat-value" style={{ color: '#f87171' }}>
                                                            ₹{(globalStats.funding?.totalPlatformLiability || 0).toLocaleString('en-IN')}
                                                      </div>
                                                </div>
                                          </div>

                                          {/* Charts Grid */}
                                          <div className="admin-charts-grid">
                                                <div className="chart-panel">
                                                      <h3 className="chart-title" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <LineChartIcon size={18} className="text-green-400" /> Financial Velocity (6 Months)
                                                      </h3>
                                                      <div style={{ width: '100%', height: 300 }}>
                                                            <ResponsiveContainer>
                                                                  <LineChart data={globalStats.analytics?.fundingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                                                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                                                                        <Tooltip
                                                                              contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                                                                              itemStyle={{ color: 'white' }}
                                                                        />
                                                                        <Line type="monotone" dataKey="deposits" name="Deposits" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 6 }} />
                                                                        <Line type="monotone" dataKey="investments" name="Contributions" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
                                                                  </LineChart>
                                                            </ResponsiveContainer>
                                                      </div>
                                                </div>

                                                <div className="chart-panel">
                                                      <h3 className="chart-title" style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Users size={18} className="text-blue-400" /> User Acquisition (30 Days)
                                                      </h3>
                                                      <div style={{ width: '100%', height: 300 }}>
                                                            <ResponsiveContainer>
                                                                  <BarChart data={globalStats.analytics?.userGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                                                        <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                                                        <YAxis stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                                                                        <Tooltip
                                                                              cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                                                                              contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '0.5rem' }}
                                                                              itemStyle={{ color: '#3b82f6' }}
                                                                        />
                                                                        <Bar dataKey="users" name="New Registrations" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                                                  </BarChart>
                                                            </ResponsiveContainer>
                                                      </div>
                                                </div>
                                          </div>
                                    </div>
                              )}

                              {activeTab === 'security' && (
                                    <div className="governance-layout fade-in">
                                          {/* Audit Trail Log */}
                                          <div className="chart-panel audit-card">
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                      <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                                                            <Bell size={20} className="text-primary" /> Audit Trail
                                                      </h3>
                                                      <span className="badge-small">Live History</span>
                                                </div>

                                                <div className="audit-list custom-scrollbar">
                                                      {adminLogs.length === 0 ? (
                                                            <div className="empty-state" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No administrative actions recorded.</div>
                                                      ) : (
                                                            adminLogs.map(log => (
                                                                  <div key={log.id} className="audit-item">
                                                                        <div className="audit-icon" style={{ background: `${getActionColor(log.action)}15`, color: getActionColor(log.action), border: `1px solid ${getActionColor(log.action)}30` }}>
                                                                              <Shield size={20} />
                                                                        </div>
                                                                        <div style={{ flex: 1 }}>
                                                                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem', gap: '0.5rem' }}>
                                                                                    <span style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{log.action.replace(/_/g, ' ')}</span>
                                                                                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
                                                                                          <Clock size={10} /> {new Date(log.createdAt).toLocaleTimeString()}
                                                                                    </span>
                                                                              </div>
                                                                              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                                                                    <span className="tag-indicator" style={{ background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.7rem', color: '#8b5cf6' }}>{log.targetType} #{log.targetId}</span>
                                                                                    {log.details && <span>• {log.details}</span>}
                                                                              </div>
                                                                        </div>
                                                                  </div>
                                                            ))
                                                      )}
                                                </div>
                                          </div>

                                          {/* System Status Controls */}
                                          <div className="controls-column">
                                                <div className="chart-panel control-card">
                                                      <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                                                            <Settings size={20} className="text-primary" /> System Controls
                                                      </h3>

                                                      <div className="control-item">
                                                            <div>
                                                                  <div style={{ fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        <HardDrive size={16} /> Maintenance Mode
                                                                  </div>
                                                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>
                                                                        {maintenanceMode ? 'System is locked' : 'System is live'}
                                                                  </div>
                                                            </div>
                                                            <button
                                                                  onClick={handleToggleMaintenance}
                                                                  disabled={actionLoading}
                                                                  className="toggle-switch"
                                                                  style={{ background: maintenanceMode ? '#ef4444' : 'rgba(255,255,255,0.1)' }}
                                                            >
                                                                  <div className="toggle-knob" style={{ left: maintenanceMode ? '27px' : '3px' }} />
                                                            </button>
                                                      </div>

                                                      {maintenanceMode && (
                                                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start', marginTop: '1rem' }}>
                                                                  <ShieldAlert size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                                                                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.8)', lineHeight: 1.4 }}>
                                                                        All API requests except whitelisted auth and admin routes are currently blocked.
                                                                  </p>
                                                            </div>
                                                      )}

                                                      <div className="control-item" style={{ marginTop: '1rem', border: '1px solid rgba(245, 158, 11, 0.15)' }}>
                                                            <div style={{ flex: 1 }}>
                                                                  <div style={{ fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                        <TrendingUp size={16} style={{ color: '#f59e0b' }} /> Revenue Share
                                                                  </div>
                                                                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>
                                                                        Manually run daily payouts
                                                                  </div>
                                                            </div>
                                                            <button
                                                                  onClick={async () => {
                                                                        if (!window.confirm('Run revenue share payouts now?')) return;
                                                                        setActionLoading(true);
                                                                        try {
                                                                              const res = await api.post('/admin/trigger-roi');
                                                                              if (res.data.success) {
                                                                                    alert(`Processed: ${res.data.stats.processed}\nDisbursed: ₹${res.data.stats.totalDisbursed.toFixed(2)}`);
                                                                                    fetchData();
                                                                              }
                                                                        } catch (error) {
                                                                              alert('Failed: ' + (error.response?.data?.message || error.message));
                                                                        } finally {
                                                                              setActionLoading(false);
                                                                        }
                                                                  }}
                                                                  disabled={actionLoading}
                                                                  className="btn-payout"
                                                                  style={{
                                                                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                                                                        color: 'white', border: 'none', padding: '0.6rem 1rem', borderRadius: '0.6rem',
                                                                        cursor: actionLoading ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem',
                                                                        display: 'flex', alignItems: 'center', gap: '0.5rem', opacity: actionLoading ? 0.5 : 1
                                                                  }}
                                                            >
                                                                  {actionLoading ? <RefreshCw size={14} className="animate-spin" /> : <TrendingUp size={14} />} Run
                                                            </button>
                                                      </div>
                                                </div>

                                                <div className="chart-panel">
                                                      <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                                                            <Info size={18} /> Governance Info
                                                      </h3>
                                                      <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, margin: 0 }}>
                                                            Administrative actions are logged and immutable. Use maintenance mode only for critical system updates.
                                                      </p>
                                                </div>
                                          </div>
                                    </div>
                              )}
                        </>
                  )}
            </div>
      );
};

export default AdminOverview;