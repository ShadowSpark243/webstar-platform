import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
      Wallet, TrendingUp, Film, Users, ShieldAlert, ArrowUpRight,
      ArrowDownLeft, Clock, ChevronRight,
      Sparkles, CircleDollarSign, Layers, ArrowRight,
      Crown, Star, Trophy, Award, Lock
} from 'lucide-react';
import './Overview.css';

const fmtINR = (n) => {
      if (!n && n !== 0) return '₹0';
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
      return `₹${Number(n).toLocaleString('en-IN')}`;
};

const statusColors = {
      OPEN: { c: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      FUNDED: { c: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
      COMPLETED: { c: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
      COMING_SOON: { c: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
      ACTIVE: { c: '#10b981', bg: 'rgba(16,185,129,0.12)' },
      PAID_OUT: { c: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
      CANCELLED: { c: '#ef4444', bg: 'rgba(239,68,68,0.12)' }
};

const txIcons = {
      DEPOSIT: { icon: <ArrowDownLeft size={14} />, color: '#10b981' },
      WITHDRAWAL: { icon: <ArrowUpRight size={14} />, color: '#f59e0b' },
      INVESTMENT: { icon: <Film size={14} />, color: '#3b82f6' },
      COMMISSION: { icon: <Users size={14} />, color: '#8b5cf6' },
      REFUND: { icon: <ArrowDownLeft size={14} />, color: '#06b6d4' }
};

const rankIconMap = { 'Starter': <Star size={20} />, 'Manager': <Award size={20} />, 'Senior Manager': <Trophy size={20} />, 'Director': <Crown size={20} /> };

const Overview = () => {
      const { user } = useAuth();
      const navigate = useNavigate();
      const [data, setData] = useState(null);
      const [loading, setLoading] = useState(true);

      useEffect(() => {
            api.get('/wallet/dashboard')
                  .then(r => { if (r.data.success) setData(r.data); })
                  .catch(e => console.error('Dashboard load failed:', e))
                  .finally(() => setLoading(false));
      }, []);

      const inv = data?.investments || [];
      const tx = data?.recentTransactions || [];
      const pf = data?.portfolio || {};
      const rp = data?.rankProgress || { current: { name: user?.rank || 'Starter', icon: '🌱', color: '#94a3b8' }, next: null, progressPercent: 0, upcomingRanks: [], isMaxRank: false, teamVolume: 0 };
      const name = user?.fullName?.split(' ')[0] || 'Investor';
      const hour = new Date().getHours();
      const greet = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

      return (
            <div className="ov">
                  {/* ─── Hero ─── */}
                  <div className="ov-hero">
                        <div className="ov-hero-left">
                              <p className="ov-greet">{greet},</p>
                              <h1 className="ov-name">{name} <Sparkles size={18} className="ov-spark" /></h1>
                        </div>
                        <div className="ov-hero-btns">
                              <button className="ov-btn ov-btn-p" onClick={() => navigate('/dashboard/projects')}><Film size={14} /> Projects</button>
                              <button className="ov-btn ov-btn-s" onClick={() => navigate('/dashboard/wallet')}><Wallet size={14} /> Wallet</button>
                        </div>
                  </div>

                  {/* ─── KYC Alert ─── */}
                  {user?.kycStatus === 'UNVERIFIED' && (
                        <div className="ov-kyc">
                              <ShieldAlert size={18} className="ov-kyc-ic" />
                              <span>Complete KYC to start investing</span>
                              <button onClick={() => navigate('/dashboard/kyc')}>Verify <ChevronRight size={12} /></button>
                        </div>
                  )}

                  {/* ─── Stats Row ─── */}
                  <div className="ov-stats">
                        <div className="ov-stat ov-s1">
                              <Wallet size={16} className="ov-stat-ic" />
                              <div>
                                    <span className="ov-sv">{fmtINR(user?.walletBalance)}</span>
                                    <span className="ov-sl">Balance</span>
                              </div>
                        </div>
                        <div className="ov-stat ov-s2">
                              <TrendingUp size={16} className="ov-stat-ic" />
                              <div>
                                    <span className="ov-sv">{fmtINR(user?.totalInvested)}</span>
                                    <span className="ov-sl">Invested</span>
                              </div>
                        </div>
                        <div className="ov-stat ov-s3">
                              <CircleDollarSign size={16} className="ov-stat-ic" />
                              <div>
                                    <span className="ov-sv">{fmtINR(pf.totalExpectedReturn)}</span>
                                    <span className="ov-sl">Returns</span>
                              </div>
                        </div>
                        <div className="ov-stat ov-s4">
                              <Users size={16} className="ov-stat-ic" />
                              <div>
                                    <span className="ov-sv">{fmtINR(user?.teamVolume)}</span>
                                    <span className="ov-sl">Network</span>
                              </div>
                        </div>
                  </div>

                  {/* ─── Rank Progress ─── */}
                  <div className="ov-rank">
                        <div className="ov-rank-top">
                              <div className="ov-rank-badge" style={{ borderColor: rp.current.color, color: rp.current.color }}>
                                    {rankIconMap[rp.current.name] || <Star size={20} />}
                              </div>
                              <div className="ov-rank-info">
                                    <span className="ov-rank-lbl">Current Rank</span>
                                    <h3 className="ov-rank-val" style={{ color: rp.current.color }}>{rp.current.name}</h3>
                              </div>
                              {!rp.isMaxRank && rp.next && (
                                    <div className="ov-rank-next-chip">
                                          <span>Next: {rp.next.name}</span>
                                    </div>
                              )}
                              {rp.isMaxRank && <span className="ov-rank-max">🏅 Max Rank!</span>}
                        </div>

                        {!rp.isMaxRank && rp.next && (
                              <div className="ov-rank-bar-wrap">
                                    <div className="ov-rank-bar">
                                          <div className="ov-rank-fill" style={{ width: `${Math.max(rp.progressPercent, 2)}%`, background: `linear-gradient(90deg, ${rp.current.color}, ${rp.next.color})` }} />
                                    </div>
                                    <div className="ov-rank-bar-labels">
                                          <span>{fmtINR(rp.teamVolume)}</span>
                                          <span style={{ color: rp.next.color }}>{rp.progressPercent}% · {fmtINR(rp.next.minVolume)} needed</span>
                                    </div>
                              </div>
                        )}

                        {rp.upcomingRanks.length > 0 && (
                              <div className="ov-rank-upcoming">
                                    {rp.upcomingRanks.map((r, i) => (
                                          <div key={r.name} className={`ov-rank-up-item ${i === 0 ? 'ov-rank-up-next' : ''}`}>
                                                <div className="ov-rank-up-ic" style={{ color: r.color, borderColor: i === 0 ? r.color : 'rgba(255,255,255,0.08)' }}>
                                                      {i === 0 ? (rankIconMap[r.name] || <Star size={14} />) : <Lock size={12} />}
                                                </div>
                                                <span className="ov-rank-up-name" style={i === 0 ? { color: r.color } : {}}>{r.name}</span>
                                                <span className="ov-rank-up-vol">{fmtINR(r.requiredVolume)}</span>
                                          </div>
                                    ))}
                              </div>
                        )}
                  </div>

                  {/* ─── Two-column layout ─── */}
                  <div className="ov-grid">
                        {/* Investments */}
                        <div className="ov-col-main">
                              <div className="ov-sec-hdr">
                                    <h2><Layers size={16} /> My Investments</h2>
                                    {inv.length > 0 && <button className="ov-link" onClick={() => navigate('/dashboard/projects', { state: { activeTab: 'portfolio' } })}>See more <ArrowRight size={12} /></button>}
                              </div>

                              {loading ? (
                                    <div className="ov-skel-grid">{[1, 2].map(i => <div key={i} className="ov-skel" />)}</div>
                              ) : inv.length === 0 ? (
                                    <div className="ov-empty">
                                          <Film size={32} />
                                          <h3>No Investments Yet</h3>
                                          <p>Start investing in OTT projects today.</p>
                                          <button className="ov-btn ov-btn-p" onClick={() => navigate('/dashboard/projects', { state: { activeTab: 'opportunities' } })}><Film size={14} /> Browse Projects</button>
                                    </div>
                              ) : (
                                    <div className="ov-inv-grid">
                                          {inv.slice(0, 3).map(item => {
                                                const proj = item.project;
                                                const sc = statusColors[item.status] || statusColors.ACTIVE;
                                                const prog = proj?.targetAmount > 0 ? Math.min((proj.raisedAmount / proj.targetAmount) * 100, 100) : 0;
                                                const profit = item.expectedReturn - item.amount;
                                                return (
                                                      <div key={item.id} className="ov-inv">
                                                            <div className="ov-inv-img">
                                                                  {proj?.imageUrl ? <img src={proj.imageUrl} alt={proj.title} onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} /> : null}
                                                                  <div className="ov-inv-img-fb" style={{ display: proj?.imageUrl ? 'none' : 'flex' }}><Film size={20} /></div>
                                                                  <span className="ov-inv-badge" style={{ background: sc.bg, color: sc.c }}>{item.status}</span>
                                                            </div>
                                                            <div className="ov-inv-body">
                                                                  <h4>{proj?.title || 'Project'}</h4>
                                                                  <span className="ov-inv-meta">{proj?.genre} · {proj?.durationMonths}mo · {proj?.roiPercentage}% ROI</span>
                                                                  <div className="ov-inv-bar"><div style={{ width: `${prog}%` }} /></div>
                                                                  <div className="ov-inv-nums">
                                                                        <div><span className="ov-inv-nv">{fmtINR(item.amount)}</span><span className="ov-inv-nl">Invested</span></div>
                                                                        <div><span className="ov-inv-nv ov-green">+{fmtINR(profit)}</span><span className="ov-inv-nl">Profit</span></div>
                                                                        <div><span className="ov-inv-nv ov-green">{fmtINR(item.expectedReturn)}</span><span className="ov-inv-nl">Return</span></div>
                                                                        <div><span className="ov-inv-nv">{prog.toFixed(0)}%</span><span className="ov-inv-nl">Funded</span></div>
                                                                  </div>
                                                                  <span className="ov-inv-dt"><Clock size={10} /> {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              )}
                        </div>

                        {/* Activity */}
                        <div className="ov-col-side">
                              <div className="ov-sec-hdr">
                                    <h2><Clock size={15} /> Activity</h2>
                                    <button className="ov-link" onClick={() => navigate('/dashboard/wallet')}>History <ArrowRight size={12} /></button>
                              </div>
                              <div className="ov-tx-list">
                                    {loading ? [1, 2, 3].map(i => <div key={i} className="ov-skel-tx" />) :
                                          tx.length === 0 ? (
                                                <div className="ov-empty-sm">
                                                      <Clock size={24} />
                                                      <p>No transactions yet</p>
                                                </div>
                                          ) : tx.map(t => {
                                                const tc = txIcons[t.type] || txIcons.DEPOSIT;
                                                const pos = ['DEPOSIT', 'COMMISSION', 'REFUND'].includes(t.type);
                                                return (
                                                      <div key={t.id} className="ov-tx">
                                                            <div className="ov-tx-ic" style={{ background: `${tc.color}15`, color: tc.color }}>{tc.icon}</div>
                                                            <div className="ov-tx-mid">
                                                                  <span className="ov-tx-desc">{t.description || t.type}</span>
                                                                  <span className="ov-tx-dt">{new Date(t.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                            </div>
                                                            <span className={`ov-tx-amt ${pos ? 'ov-green' : 'ov-red'}`}>{pos ? '+' : '-'}₹{Math.abs(t.amount).toLocaleString('en-IN')}</span>
                                                      </div>
                                                );
                                          })}
                              </div>
                        </div>
                  </div>
            </div>
      );
};

export default Overview;
