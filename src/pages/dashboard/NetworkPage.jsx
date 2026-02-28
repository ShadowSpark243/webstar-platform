import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Network, Users, ArrowUpRight, Copy, CheckCircle2, Search, User } from 'lucide-react';
import api from '../../utils/api';
import UserDetailsModal from '../../components/UserDetailsModal';
import './Dashboard.css';

// Recursive Component for rendering the Deep Network Tree
const NetworkNode = ({ node, level = 0, onNodeClick, forceExpand }) => {
      const [expanded, setExpanded] = useState(level < 1); // Auto-expand only first level
      const isRoot = level === 0;

      useEffect(() => {
            if (forceExpand) setExpanded(true);
      }, [forceExpand]);

      return (
            <div style={{ marginLeft: level > 0 ? '1.5rem' : '0', marginTop: '0.75rem' }}>
                  <div
                        style={{
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '1rem',
                              background: isRoot ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                              border: isRoot ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                              padding: '1.25rem',
                              borderRadius: '0.75rem',
                              cursor: node.children && node.children.length > 0 ? 'pointer' : 'default',
                              transition: 'all 0.2s',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onClick={() => {
                              if (node.children && node.children.length > 0) setExpanded(!expanded);
                        }}
                  >
                        {/* Optional Inspect Button for Admins viewing the User Tree */}
                        {onNodeClick && (
                              <button
                                    onClick={(e) => { e.stopPropagation(); onNodeClick(node.id); }}
                                    className="btn btn-outline"
                                    style={{
                                          position: 'absolute',
                                          top: '1rem',
                                          right: '1rem',
                                          padding: '0.4rem 0.8rem',
                                          fontSize: '0.75rem',
                                          color: '#3b82f6',
                                          borderColor: 'rgba(59, 130, 246, 0.4)',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '0.4rem',
                                          background: 'rgba(59, 130, 246, 0.1)',
                                          borderRadius: '2rem',
                                          fontWeight: 600,
                                          backdropFilter: 'blur(4px)',
                                          zIndex: 2,
                                          transition: 'all 0.2s'
                                    }}
                              >
                                    <User size={14} /> Inspect
                              </button>
                        )}

                        {/* User Header Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', paddingRight: onNodeClick ? '5.5rem' : '0' }}>
                              <div style={{ fontWeight: 700, fontSize: '1.15rem', color: isRoot ? '#3b82f6' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', lineHeight: 1.2 }}>
                                    {node.fullName}
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: '0.75rem', color: '#c4b5fd', background: 'rgba(139, 92, 246, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '2rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                                          @{node.username}
                                    </span>
                                    {node.children && node.children.length > 0 && (
                                          <span style={{ fontSize: '0.75rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.15)', padding: '0.2rem 0.6rem', borderRadius: '2rem', fontWeight: 600, letterSpacing: '0.5px' }}>
                                                {node.children.length} Direct Referrals
                                          </span>
                                    )}
                              </div>
                        </div>

                        {/* Stats Grid - 3 Equal Columns */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'rgba(0,0,0,0.25)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.03)', marginTop: '0.5rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Invested</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'white' }}>₹{(node.totalInvested || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Team Vol</span>
                                    <span style={{ fontSize: '1rem', fontWeight: 700, color: '#4ade80' }}>₹{(node.teamVolume || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Rank</span>
                                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#3b82f6' }}>{node.rank || 'N/A'}</span>
                              </div>
                        </div>

                        {/* Expand/Collapse Indicator */}
                        {node.children && node.children.length > 0 && (
                              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '0.25rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, transition: 'color 0.2s' }}>
                                    {expanded ? (
                                          <>▲ Hide Downline</>
                                    ) : (
                                          <>▼ Show Downline Matrix</>
                                    )}
                              </div>
                        )}
                  </div>
                  {expanded && node.children && node.children.length > 0 && (
                        <div style={{ marginTop: '0.5rem', borderLeft: '2px dashed rgba(255,255,255,0.1)' }}>
                              {node.children.map(child => (
                                    <NetworkNode key={child.id} node={child} level={level + 1} onNodeClick={onNodeClick} forceExpand={forceExpand} />
                              ))}
                        </div>
                  )}
            </div>
      );
};

const NetworkPage = () => {
      const { user } = useAuth();
      const [copied, setCopied] = useState(false);
      const [networkStats, setNetworkStats] = useState([]);
      const [networkTree, setNetworkTree] = useState([]);
      const [searchQuery, setSearchQuery] = useState('');
      const [selectedUserId, setSelectedUserId] = useState(null);
      const [rankProgress, setRankProgress] = useState(null);

      const referralLink = `${window.location.origin}/?ref=${user?.referralCode || ''}`;

      const handleCopy = () => {
            navigator.clipboard.writeText(referralLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
      };

      const fetchStats = async () => {
            try {
                  const res = await api.get('/wallet/network-stats');
                  if (res.data.success) {
                        setNetworkStats(res.data.networkStats);
                        if (user?.role !== 'ADMIN') {
                              setNetworkTree(res.data.tree);
                        }
                  }

                  if (user?.role === 'ADMIN') {
                        const adminRes = await api.get('/admin/network');
                        setNetworkTree(adminRes.data.tree);
                  }

                  // Fetch rank progress from dashboard endpoint
                  const dashRes = await api.get('/wallet/dashboard');
                  if (dashRes.data.success && dashRes.data.rankProgress) {
                        setRankProgress(dashRes.data.rankProgress);
                  }
            } catch (error) {
                  console.error('Error fetching network stats:', error);
            }
      };

      useEffect(() => {
            fetchStats();
      }, [user?.role]);

      const totalComputedVolume = networkStats.reduce((sum, s) => sum + s.volume, 0);

      // Recursive physical tree search
      const filterTree = (nodes, term) => {
            if (!term) return nodes;
            const lowerTerm = term.toLowerCase();

            return nodes.map(node => {
                  const matches = node.fullName.toLowerCase().includes(lowerTerm) || (node.username && node.username.toLowerCase().includes(lowerTerm));
                  const filteredChildren = filterTree(node.children || [], term);

                  if (matches || filteredChildren.length > 0) {
                        return { ...node, children: filteredChildren, forceExpand: term ? true : false };
                  }
                  return null;
            }).filter(n => n !== null);
      };

      const filteredTree = filterTree(networkTree, searchQuery);
      const filteredNetwork = networkStats.filter(node =>
            !searchQuery ||
            node.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            node.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      // Dynamic rank values
      const currentRankName = rankProgress?.current?.name || user?.rank || 'Starter';
      const nextRankName = rankProgress?.next?.name || null;
      const nextRankVolume = rankProgress?.next?.minVolume || 0;
      const progressPercent = rankProgress?.progressPercent ?? 0;
      const isMaxRank = rankProgress?.isMaxRank || false;

      return (
            <div className="dashboard-page">
                  <header className="page-header">
                        <div>
                              <h1 className="page-title">My Network</h1>
                              <p className="page-subtitle">Track your team volume and level commissions.</p>
                        </div>
                  </header>

                  {/* Referral Link & Rank Info */}
                  <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
                        <div className="dashboard-card glass-panel" style={{ display: 'flex', flexDirection: 'column', padding: '2rem' }}>
                              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem', color: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <Network size={24} className="text-primary" /> Your Referral Link
                              </h3>
                              <div style={{
                                    background: 'rgba(0,0,0,0.4)',
                                    padding: '1.25rem',
                                    borderRadius: '0.75rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    marginBottom: '1rem'
                              }}>
                                    <code style={{ color: '#4ade80', fontSize: '1rem', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>{referralLink}</code>
                                    <button
                                          onClick={handleCopy}
                                          style={{ background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', borderRadius: '0.5rem', padding: '0.5rem', cursor: 'pointer', color: copied ? '#10b981' : '#3b82f6', display: 'flex', alignItems: 'center', transition: 'all 0.2s', marginLeft: '1rem' }}
                                          title="Copy to clipboard"
                                    >
                                          {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                                    </button>
                              </div>
                              <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', marginTop: 'auto', marginBottom: 0, lineHeight: 1.5 }}>
                                    Share this secure link with your network. When they register using your code and invest, you instantly earn commissions up to 5 levels deep.
                              </p>
                        </div>

                        <div className="dashboard-card glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                          <p style={{ margin: '0 0 0.5rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Rank</p>
                                          <h2 style={{ margin: 0, color: rankProgress?.current?.color || '#3b82f6', fontSize: '2.5rem', fontWeight: 800 }}>{currentRankName}</h2>
                                    </div>
                                    <div className="avatar-circle" style={{ width: '56px', height: '56px', fontSize: '1.5rem' }}>{rankProgress?.current?.icon || 'R'}</div>
                              </div>
                              <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                                    <div style={{ width: `${isMaxRank ? 100 : progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}></div>
                              </div>
                              <p style={{ margin: 0, fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', display: 'flex', justifyContent: 'space-between', fontWeight: 500 }}>
                                    <span>{isMaxRank ? 'Maximum Rank Achieved! 🎉' : `Next Rank: ${nextRankName} (₹${(nextRankVolume / 100000).toFixed(0)}L)`}</span>
                                    <span className="text-primary">{isMaxRank ? '100%' : `${progressPercent.toFixed(1)}%`} Completed</span>
                              </p>
                        </div>
                  </div>

                  {/* Level Stats Table */}
                  <div className="dashboard-card glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <Users className="text-purple-400" />
                              <h2 className="card-title" style={{ margin: 0 }}>Network Level Statistics</h2>
                        </div>

                        <div style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', display: 'block', WebkitOverflowScrolling: 'touch' }}>
                              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                          <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Level</th>
                                                <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Total Users</th>
                                                <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Active Users</th>
                                                <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem' }}>Total Invested</th>
                                                <th style={{ padding: '1.25rem 1.5rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.85rem', textAlign: 'right' }}>Commission Earned</th>
                                          </tr>
                                    </thead>
                                    <tbody>
                                          {networkStats.length === 0 ? (
                                                <tr>
                                                      <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>
                                                            No network data available.
                                                      </td>
                                                </tr>
                                          ) : (
                                                <>
                                                      {networkStats.map((stat) => (
                                                            <tr key={stat.level} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(255,255,255,0.03)' })} onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'transparent' })}>
                                                                  <td style={{ padding: '1.25rem 1.5rem' }}>
                                                                        <span style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', padding: '0.2rem 0.6rem', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>L{stat.level} ({stat.percent})</span>
                                                                  </td>
                                                                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: 'white' }}>{stat.count}</td>
                                                                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#10b981' }}>{stat.active}</td>
                                                                  <td style={{ padding: '1.25rem 1.5rem', fontWeight: 600, color: '#e2e8f0' }}>₹{(stat.volume || 0).toLocaleString('en-IN')}</td>
                                                                  <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 700, color: '#f59e0b' }}>
                                                                        ₹{(stat.commission || 0).toLocaleString('en-IN')}
                                                                  </td>
                                                            </tr>
                                                      ))}
                                                      {/* Totals Row */}
                                                      <tr style={{ background: 'rgba(59, 130, 246, 0.05)', borderTop: '2px solid rgba(59, 130, 246, 0.2)' }}>
                                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: '#3b82f6' }}>TOTAL</td>
                                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: 'white' }}>{networkStats.reduce((sum, s) => sum + s.count, 0)}</td>
                                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: '#10b981' }}>{networkStats.reduce((sum, s) => sum + s.active, 0)}</td>
                                                            <td style={{ padding: '1.25rem 1.5rem', fontWeight: 800, color: '#e2e8f0' }}>₹{totalComputedVolume.toLocaleString('en-IN')}</td>
                                                            <td style={{ padding: '1.25rem 1.5rem', textAlign: 'right', fontWeight: 800, color: '#f59e0b' }}>
                                                                  ₹{networkStats.reduce((sum, s) => sum + (s.commission || 0), 0).toLocaleString('en-IN')}
                                                            </td>
                                                      </tr>
                                                </>
                                          )}
                                    </tbody>
                              </table>
                        </div>
                  </div>

                  {/* My Downline Tree */}
                  <div className="dashboard-card glass-panel" style={{ padding: 0, overflow: 'hidden', marginTop: '2rem' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                    <h2 className="card-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                          <Network className="text-purple-400" /> {user?.role === 'ADMIN' ? 'Administrative Global Network Tree' : 'My Downline Matrix'}
                                    </h2>
                                    <p style={{ margin: '0.5rem 0 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
                                          Explore {user?.role === 'ADMIN' ? 'the fully nested Downline of all users' : 'your direct referrals and downlines up to level 5'}. {user?.role === 'ADMIN' && 'Click a username to inspect their profile.'}
                                    </p>
                              </div>
                              <div style={{ position: 'relative', maxWidth: '300px', width: '100%' }}>
                                    <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                                    <input
                                          type="text"
                                          placeholder="Search tree by name or @username..."
                                          value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          className="dashboard-input"
                                          style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '2rem' }}
                                    />
                              </div>
                        </div>
                        <div style={{ padding: '1.5rem', maxHeight: '700px', overflowY: 'auto' }}>
                              {networkTree.length === 0 ? (
                                    <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>{user?.role === 'ADMIN' ? 'Loading network topology...' : 'You currently have no downlines.'}</div>
                              ) : filteredTree.length === 0 ? (
                                    <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '2rem' }}>No nodes match your search query.</div>
                              ) : (
                                    filteredTree.map(rootNode => (
                                          <NetworkNode key={rootNode.id} node={rootNode} onNodeClick={user?.role === 'ADMIN' ? setSelectedUserId : null} forceExpand={searchQuery !== ''} />
                                    ))
                              )}
                        </div>
                  </div>

                  {/* Unified User Details Modal */}
                  {selectedUserId && (
                        <UserDetailsModal
                              userId={selectedUserId}
                              onClose={() => setSelectedUserId(null)}
                              onUpdate={fetchStats}
                        />
                  )}
            </div>
      );
};

export default NetworkPage;
