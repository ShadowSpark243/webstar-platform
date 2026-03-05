import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShieldAlert, Users, TrendingUp, CreditCard, Activity, BarChart2, LineChart as LineChartIcon, ShieldCheck, Settings, Bell, Clock, Info, Shield, HardDrive, RefreshCw, Wallet } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
                  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                        <div>
                              <h1 className="admin-page-title">Command Center</h1>
                              <p className="admin-page-subtitle">Global platform metrics and live platform governance.</p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                              <button
                                    onClick={fetchData}
                                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.6rem 1rem', borderRadius: '0.6rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
                              >
                                    <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Sync Data
                              </button>
                              <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '0.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <button
                                          onClick={() => setActiveTab('metrics')}
                                          style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: activeTab === 'metrics' ? '#3b82f6' : 'transparent', color: activeTab === 'metrics' ? 'white' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s' }}
                                    >
                                          <BarChart2 size={16} style={{ display: 'inline', marginRight: '6px' }} /> Metrics
                                    </button>
                                    <button
                                          onClick={() => setActiveTab('security')}
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
                                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                                                {/* Registered Users Card */}
                                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                                                      <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.05, color: '#3b82f6' }}>
                                                            <Users size={120} />
                                                      </div>
                                                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Users size={16} /> Total Registered Users
                                                      </div>
                                                      <div style={{ fontSize: '2rem', fontWeight: 700, color: 'white', display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                                                            {globalStats.users?.total || 0}
                                                            <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>/ 10,000</span>
                                                      </div>
                                                      <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', height: '6px', overflow: 'hidden' }}>
                                                            <div style={{ background: '#3b82f6', height: '100%', width: `${((globalStats.users?.total || 0) / 10000) * 100}%` }}></div>
                                                      </div>
                                                </div>

                                                {/* Total Global Deposits Card */}
                                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                                                      <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.05, color: '#10b981' }}>
                                                            <TrendingUp size={120} />
                                                      </div>
                                                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <TrendingUp size={16} /> Platform Net Funds (Net Deposits)
                                                      </div>
                                                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                                                            ₹{(globalStats.funding?.totalDeposited || 0).toLocaleString('en-IN')}
                                                      </div>
                                                </div>

                                                {/* Total Global Investments Card */}
                                                <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                                                      <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.05, color: '#8b5cf6' }}>
                                                            <CreditCard size={120} />
                                                      </div>
                                                      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <CreditCard size={16} /> Active Capital Invested
                                                      </div>
                                                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#c4b5fd' }}>
                                                            ₹{(globalStats.funding?.totalInvested || 0).toLocaleString('en-IN')}
                                                      </div>
                                                </div>

                                                {/* Total User Wallet Balances */}
                                                <div style={{ background: 'rgba(59, 130, 246, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(59, 130, 246, 0.2)', position: 'relative', overflow: 'hidden' }}>
                                                      <div style={{ color: 'rgba(59, 130, 246, 0.8)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Wallet size={16} /> Total User Wallets
                                                      </div>
                                                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#60a5fa' }}>
                                                            ₹{(globalStats.funding?.totalUserWallet || 0).toLocaleString('en-IN')}
                                                      </div>
                                                </div>

                                                {/* Total User Income Balances */}
                                                <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)', position: 'relative', overflow: 'hidden' }}>
                                                      <div style={{ color: 'rgba(16, 185, 129, 0.8)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <TrendingUp size={16} /> Total User Income
                                                      </div>
                                                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#34d399' }}>
                                                            ₹{(globalStats.funding?.totalUserIncome || 0).toLocaleString('en-IN')}
                                                      </div>
                                                </div>

                                                {/* Total Platform Liability */}
                                                <div style={{ background: 'rgba(239, 68, 68, 0.05)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(239, 68, 68, 0.3)', position: 'relative', overflow: 'hidden' }}>
                                                      <div style={{ color: 'rgba(239, 68, 68, 0.8)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <ShieldAlert size={16} /> Platform Liability (Total)
                                                      </div>
                                                      <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f87171' }}>
                                                            ₹{(globalStats.funding?.totalPlatformLiability || 0).toLocaleString('en-IN')}
                                                      </div>
                                                </div>
                                          </div>

                                          {/* Charts Grid */}
                                          <div style={{ marginTop: '2.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>
                                                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                      <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
                                                                        <Line type="monotone" dataKey="investments" name="Investments" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 0 }} />
                                                                  </LineChart>
                                                            </ResponsiveContainer>
                                                      </div>
                                                </div>

                                                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                      <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <Users size={18} className="text-blue-400" /> User Acquisition (Last 30 Days)
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
                                    <div style={{ animation: 'fadeIn 0.3s ease' }}>
                                          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem' }}>
                                                {/* Audit Trail Log */}
                                                <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', maxHeight: '700px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                                            <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                                                                  <Bell size={20} className="text-primary" /> Audit Trail (Recent Activity)
                                                            </h3>
                                                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>Last 100 entries</span>
                                                      </div>

                                                      <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }} className="custom-scrollbar">
                                                            {adminLogs.length === 0 ? (
                                                                  <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No administrative actions recorded yet.</div>
                                                            ) : (
                                                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                        {adminLogs.map(log => (
                                                                              <div key={log.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', gap: '1rem' }}>
                                                                                    <div style={{ background: `${getActionColor(log.action)}15`, width: '40px', height: '40px', borderRadius: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: getActionColor(log.action), border: `1px solid ${getActionColor(log.action)}30` }}>
                                                                                          <Shield size={20} />
                                                                                    </div>
                                                                                    <div style={{ flex: 1 }}>
                                                                                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                                                                                                <span style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem' }}>{log.action.replace(/_/g, ' ')}</span>
                                                                                                <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                                                                                                      <Clock size={10} /> {new Date(log.createdAt).toLocaleString()}
                                                                                                </span>
                                                                                          </div>
                                                                                          <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                                                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.1rem 0.5rem', borderRadius: '0.4rem', fontSize: '0.7rem', color: '#8b5cf6' }}>{log.targetType} #{log.targetId}</span>
                                                                                                {log.details && <span>• {log.details}</span>}
                                                                                          </div>
                                                                                    </div>
                                                                              </div>
                                                                        ))}
                                                                  </div>
                                                            )}
                                                      </div>
                                                </div>

                                                {/* System Status Controls */}
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <h3 style={{ fontSize: '1.1rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
                                                                  <Settings size={20} className="text-primary" /> System Controls
                                                            </h3>

                                                            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.03)' }}>
                                                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                                                        <div>
                                                                              <div style={{ fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                                    <HardDrive size={16} /> Maintenance Mode
                                                                              </div>
                                                                              <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}>
                                                                                    {maintenanceMode ? 'System is locked for users' : 'System is live and accessible'}
                                                                              </div>
                                                                        </div>
                                                                        <button
                                                                              onClick={handleToggleMaintenance}
                                                                              disabled={actionLoading}
                                                                              style={{
                                                                                    width: '50px',
                                                                                    height: '26px',
                                                                                    borderRadius: '13px',
                                                                                    background: maintenanceMode ? '#ef4444' : 'rgba(255,255,255,0.1)',
                                                                                    border: 'none',
                                                                                    position: 'relative',
                                                                                    cursor: actionLoading ? 'not-allowed' : 'pointer',
                                                                                    transition: 'all 0.3s ease'
                                                                              }}
                                                                        >
                                                                              <div style={{
                                                                                    width: '20px',
                                                                                    height: '20px',
                                                                                    background: 'white',
                                                                                    borderRadius: '50%',
                                                                                    position: 'absolute',
                                                                                    top: '3px',
                                                                                    left: maintenanceMode ? '27px' : '3px',
                                                                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                                                              }} />
                                                                        </button>
                                                                  </div>

                                                                  {maintenanceMode && (
                                                                        <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '0.75rem', borderRadius: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                                                                              <ShieldAlert size={16} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                                                                              <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(239, 68, 68, 0.8)', lineHeight: 1.4 }}>
                                                                                    Users currently see a "Maintenance in Progress" screen. All API requests except admin routes are blocked.
                                                                              </p>
                                                                        </div>
                                                                  )}
                                                            </div>
                                                      </div>

                                                      <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <h3 style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                                                                  <Info size={18} /> Governance Info
                                                            </h3>
                                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '0.5rem', lineHeight: 1.5 }}>
                                                                        Every action taken by an admin is cryptographically logged to the immutable audit trail.
                                                                  </div>
                                                                  <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.03)', padding: '0.85rem', borderRadius: '0.5rem', lineHeight: 1.5 }}>
                                                                        Maintenance mode should only be used for database migrations or critical security patches.
                                                                  </div>
                                                            </div>
                                                      </div>
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