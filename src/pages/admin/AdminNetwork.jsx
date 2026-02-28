import React, { useState, useEffect } from 'react';
import { Network, Search, User, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import UserDetailsModal from '../../components/UserDetailsModal';

// Recursive Component for rendering the Deep Network Tree
const AdminNetworkNode = ({ node, level = 0, onNodeClick, forceExpand }) => {
      const [expanded, setExpanded] = useState(level < 1); // Auto-expand only first level
      const isRoot = level === 0;

      useEffect(() => {
            if (forceExpand) setExpanded(true);
      }, [forceExpand]);

      return (
            <div style={{ marginLeft: level > 0 ? (window.innerWidth < 768 ? '0.75rem' : '1.5rem') : '0', marginTop: '0.75rem' }}>
                  <div
                        style={{
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '0.75rem',
                              background: isRoot ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)',
                              border: isRoot ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                              padding: window.innerWidth < 768 ? '1rem' : '1.25rem',
                              borderRadius: '0.75rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        onClick={() => setExpanded(!expanded)}
                  >
                        {/* Absolute Top Right Inspect Button */}
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
                              onMouseEnter={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(59, 130, 246, 0.2)' })}
                              onMouseLeave={(e) => Object.assign(e.currentTarget.style, { background: 'rgba(59, 130, 246, 0.1)' })}
                        >
                              <User size={14} /> Inspect
                        </button>

                        {/* User Header Info */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingRight: window.innerWidth < 768 ? '0' : '5.5rem' }}>
                              <div style={{ fontWeight: 700, fontSize: window.innerWidth < 768 ? '1rem' : '1.15rem', color: isRoot ? '#60a5fa' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', lineHeight: 1.2 }}>
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
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem', background: 'rgba(0,0,0,0.25)', padding: window.innerWidth < 768 ? '0.75rem' : '1rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.03)', marginTop: '0.25rem' }}>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Invested</span>
                                    <span style={{ fontSize: window.innerWidth < 768 ? '0.85rem' : '1.1rem', fontWeight: 700, color: 'white' }}>₹{(node.totalInvested || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center', textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)' }}>
                                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Team Vol</span>
                                    <span style={{ fontSize: window.innerWidth < 768 ? '0.85rem' : '1.1rem', fontWeight: 700, color: '#4ade80' }}>₹{(node.teamVolume || 0).toLocaleString('en-IN')}</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center', textAlign: 'center' }}>
                                    <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Status</span>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: node.status === 'ACTIVE' ? '#10b981' : '#ef4444' }}>{node.status}</span>
                              </div>
                        </div>

                        {/* Expand/Collapse Indicator */}
                        {node.children && node.children.length > 0 && (
                              <div style={{ borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '0.75rem', marginTop: '0.25rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontWeight: 600, transition: 'color 0.2s' }}>
                                    {expanded ? (
                                          <><ChevronUp size={16} className="text-purple-400" /> Hide Downline</>
                                    ) : (
                                          <><ChevronDown size={16} className="text-purple-400" /> Show Downline Matrix</>
                                    )}
                              </div>
                        )}
                  </div>
                  {expanded && node.children && node.children.length > 0 && (
                        <div style={{ marginTop: '0.5rem', borderLeft: '2px dashed rgba(255,255,255,0.1)' }}>
                              {node.children.map(child => (
                                    <AdminNetworkNode key={child.id} node={child} level={level + 1} onNodeClick={onNodeClick} forceExpand={forceExpand} />
                              ))}
                        </div>
                  )}
            </div>
      );
};

const AdminNetwork = () => {
      const [networkTree, setNetworkTree] = useState([]);
      const [searchQuery, setSearchQuery] = useState('');
      const [selectedUserId, setSelectedUserId] = useState(null);
      const [loading, setLoading] = useState(true);

      const fetchNetwork = async () => {
            setLoading(true);
            try {
                  const adminRes = await api.get('/admin/network');
                  setNetworkTree(adminRes.data.tree);
            } catch (error) {
                  console.error('Error fetching global network tree:', error);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchNetwork();
      }, []);

      // Recursive physical tree search
      const filterTree = (nodes, term) => {
            if (!term) return nodes;
            const lowerTerm = term.toLowerCase();

            return nodes.map(node => {
                  const matches = node.fullName.toLowerCase().includes(lowerTerm) || (node.username && node.username.toLowerCase().includes(lowerTerm)) || node.email?.toLowerCase().includes(lowerTerm);
                  const filteredChildren = filterTree(node.children || [], term);

                  if (matches || filteredChildren.length > 0) {
                        return { ...node, children: filteredChildren, forceExpand: term ? true : false };
                  }
                  return null;
            }).filter(n => n !== null);
      };

      const filteredTree = filterTree(networkTree, searchQuery);

      return (
            <div>
                  <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
                        <div style={{ flex: '1 1 300px' }}>
                              <h1 className="admin-page-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}><Network size={28} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.5rem', color: '#8b5cf6' }} /> Global Matrix</h1>
                              <p className="admin-page-subtitle" style={{ marginBottom: 0, fontSize: '0.85rem' }}>Multi-level marketing tree downlines.</p>
                        </div>
                        <div style={{ position: 'relative', width: '100%', maxWidth: '300px', flex: '1 1 200px' }}>
                              <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                              <input
                                    type="text"
                                    placeholder="Search matrix..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.5rem', outline: 'none', fontSize: '0.85rem' }}
                              />
                        </div>
                  </header>

                  <div className="dashboard-card glass-panel" style={{ padding: '2rem', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
                        {loading ? (
                              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '3rem' }}>Computing global up-line architecture...</div>
                        ) : filteredTree.length > 0 ? (
                              <div>
                                    {filteredTree.map(rootNode => (
                                          <AdminNetworkNode key={rootNode.id} node={rootNode} onNodeClick={setSelectedUserId} forceExpand={searchQuery ? true : false} />
                                    ))}
                              </div>
                        ) : (
                              <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.5)', padding: '3rem' }}>
                                    {searchQuery ? 'No nodes found matching your query.' : 'The network tree is currently empty. No users have registered.'}
                              </div>
                        )}
                  </div>

                  {selectedUserId && (
                        <UserDetailsModal
                              userId={selectedUserId}
                              onClose={() => setSelectedUserId(null)}
                              onUpdate={fetchNetwork}
                        />
                  )}
            </div>
      );
};

export default AdminNetwork;
