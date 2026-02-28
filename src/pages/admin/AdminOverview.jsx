import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { ShieldAlert, Users, TrendingUp, CreditCard, Activity, BarChart2, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminOverview = () => {
      const [globalStats, setGlobalStats] = useState({ users: {}, funding: {}, analytics: { fundingData: [], userGrowthData: [] } });
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            const fetchStats = async () => {
                  setLoading(true);
                  try {
                        const statsRes = await api.get('/admin/stats');
                        setGlobalStats(statsRes.data);
                  } catch (error) {
                        console.error("Failed to fetch admin stats:", error);
                  } finally {
                        setLoading(false);
                  }
            };
            fetchStats();
      }, []);



      return (
            <div>
                  <h1 className="admin-page-title">Command Center</h1>
                  <p className="admin-page-subtitle">Global platform metrics and live funding overview.</p>

                  {loading ? (
                        <div style={{ color: 'rgba(255,255,255,0.6)' }}>Syncing live database feeds...</div>
                  ) : (
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
                                          {globalStats.users.total || 0}
                                          <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>/ 10,000</span>
                                    </div>
                                    <div style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '1rem', height: '6px', overflow: 'hidden' }}>
                                          <div style={{ background: '#3b82f6', height: '100%', width: `${((globalStats.users.total || 0) / 10000) * 100}%` }}></div>
                                    </div>
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#10b981' }}>
                                          {globalStats.users.remaining || 10000} registration slots remaining
                                    </div>
                              </div>

                              {/* Total Global Deposits Card */}
                              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ position: 'absolute', top: '-10%', right: '-5%', opacity: 0.05, color: '#10b981' }}>
                                          <TrendingUp size={120} />
                                    </div>
                                    <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <TrendingUp size={16} /> Total Global Deposits
                                    </div>
                                    <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>
                                          ₹{(globalStats.funding.totalDeposited || 0).toLocaleString('en-IN')}
                                    </div>
                                    <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                          <Activity size={14} /> Total approved liquidity in the system
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
                                          ₹{(globalStats.funding.totalInvested || 0).toLocaleString('en-IN')}
                                    </div>
                                    <div style={{ marginTop: '1rem', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                          <ShieldAlert size={14} /> Funds locked in OTT Projects
                                    </div>
                              </div>

                        </div>
                  )}

                  {/* Analytics Section */}
                  {!loading && globalStats?.analytics?.fundingData?.length > 0 && (
                        <div style={{ marginTop: '3rem' }}>
                              <h2 className="admin-page-title" style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BarChart2 className="text-purple-400" /> Platform Analytics
                              </h2>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>

                                    {/* Funding Growth Chart */}
                                    <div className="dashboard-card glass-panel" style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem' }}>
                                          <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <LineChartIcon size={18} className="text-green-400" /> Financial Velocity (6 Months)
                                          </h3>
                                          <div style={{ width: '100%', height: 300 }}>
                                                <ResponsiveContainer>
                                                      <LineChart data={globalStats.analytics.fundingData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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

                                    {/* User Growth Chart */}
                                    <div className="dashboard-card glass-panel" style={{ border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem' }}>
                                          <h3 style={{ color: 'rgba(255,255,255,0.7)', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Users size={18} className="text-blue-400" /> User Acquisition (Last 30 Days)
                                          </h3>
                                          <div style={{ width: '100%', height: 300 }}>
                                                <ResponsiveContainer>
                                                      <BarChart data={globalStats.analytics.userGrowthData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
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
            </div>
      );
};

export default AdminOverview;
