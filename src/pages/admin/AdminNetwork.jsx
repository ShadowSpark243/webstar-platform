import React, { useState, useEffect } from 'react';
import { Network, Search, User, ChevronDown, ChevronUp, Loader2, Globe, Users, Target } from 'lucide-react';
import api from '../../utils/api';
import UserDetailsModal from '../../components/UserDetailsModal';

const AdminNetworkNode = ({ node, level = 0, onNodeClick, forceExpand }) => {
      const [expanded, setExpanded] = useState(level < 1);
      const isRoot = level === 0;

      useEffect(() => {
            if (forceExpand) setExpanded(true);
      }, [forceExpand]);

      const toggleExpand = (e) => {
            e.stopPropagation();
            setExpanded(!expanded);
      };

      return (
            <div style={{ marginLeft: level > 0 ? '1rem' : '0', marginTop: '0.75rem', position: 'relative' }}>
                  {level > 0 && (
                        <div style={{ position: 'absolute', left: '-0.5rem', top: '-0.75rem', bottom: '1.25rem', width: '1px', borderLeft: '1px dashed rgba(255,255,255,0.1)' }} />
                  )}
                  <div
                        className="glass-panel"
                        style={{
                              padding: '1rem',
                              borderRadius: '0.85rem',
                              border: isRoot ? '1px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(255,255,255,0.05)',
                              background: isRoot ? 'rgba(139, 92, 246, 0.05)' : 'rgba(255,255,255,0.02)',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              position: 'relative',
                        }}
                        onClick={toggleExpand}
                  >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isRoot ? '#8b5cf6' : 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isRoot ? 'white' : 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                                          <User size={20} />
                                    </div>
                                    <div>
                                          <div style={{ fontWeight: 700, color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                {node.fullName}
                                                {node.status === 'ACTIVE' ? <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} /> : <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />}
                                          </div>
                                          <div style={{ fontSize: '0.75rem', color: '#8b5cf6', fontWeight: 600 }}>@{node.username || 'user_' + node.id}</div>
                                    </div>
                              </div>
                              <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                          onClick={(e) => { e.stopPropagation(); onNodeClick(node.id); }}
                                          style={{ padding: '0.4rem 0.75rem', borderRadius: '0.5rem', background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6', border: 'none', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
                                    >
                                          Inspect
                                    </button>
                                    {node.children && node.children.length > 0 && (
                                          <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.6rem', borderRadius: '0.5rem', color: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                          </div>
                                    )}
                              </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                              <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Personal</div>
                                    <div style={{ fontWeight: 700, color: 'white' }}>₹{(node.totalInvested || 0).toLocaleString()}</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Team Vol</div>
                                    <div style={{ fontWeight: 700, color: '#10b981' }}>₹{(node.teamVolume || 0).toLocaleString()}</div>
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>Directs</div>
                                    <div style={{ fontWeight: 700, color: '#8b5cf6' }}>{node.children?.length || 0} Members</div>
                              </div>
                        </div>
                  </div>
                  {expanded && node.children && node.children.length > 0 && (
                        <div style={{ paddingLeft: '0.5rem' }}>
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
                  const res = await api.get('/admin/network');
                  setNetworkTree(res.data.tree || []);
            } catch (error) {
                  console.error('Error fetching global network tree:', error);
            } finally {
                  setLoading(false);
            }
      };

      useEffect(() => {
            fetchNetwork();
      }, []);

      const filterTree = (nodes, term) => {
            if (!term) return nodes;
            const lowerTerm = term.toLowerCase();
            return nodes.map(node => {
                  const matches = node.fullName.toLowerCase().includes(lowerTerm) || node.username?.toLowerCase().includes(lowerTerm);
                  const filteredChildren = filterTree(node.children || [], term);
                  if (matches || filteredChildren.length > 0) {
                        return { ...node, children: filteredChildren, forceExpand: true };
                  }
                  return null;
            }).filter(Boolean);
      };

      const filteredTree = filterTree(networkTree, searchQuery);

      // Summary Stats
      const calculateStats = (nodes) => {
            let totalMembers = 0;
            let totalVolume = 0;
            const traverse = (n) => {
                  totalMembers++;
                  totalVolume += (n.totalInvested || 0);
                  n.children?.forEach(traverse);
            };
            nodes.forEach(traverse);
            return { totalMembers, totalVolume };
      };

      const stats = calculateStats(networkTree);

      if (loading && networkTree.length === 0) return (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
                  <Loader2 size={48} className="animate-spin" style={{ color: '#8b5cf6', margin: '0 auto 1.5rem auto' }} />
                  <p style={{ color: 'rgba(255,255,255,0.5)' }}>Analyzing platform matrix structure...</p>
            </div>
      );

      return (
            <div className="fade-in">
                  <header style={{ marginBottom: '2rem' }}>
                        <h1 className="admin-page-title">Global Matrix</h1>
                        <p className="admin-page-subtitle">Multi-level relationship and volume tracking.</p>
                  </header>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ padding: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '0.75rem', color: '#8b5cf6' }}><Globe size={24} /></div>
                              <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Network Size</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>{stats.totalMembers} Nodes</div>
                              </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '0.75rem', color: '#10b981' }}><Target size={24} /></div>
                              <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Total Capacity</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>₹{(stats.totalVolume).toLocaleString()}</div>
                              </div>
                        </div>
                        <div className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '0.75rem', color: '#3b82f6' }}><Users size={24} /></div>
                              <div>
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>Root Clusters</div>
                                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white' }}>{networkTree.length} Lineages</div>
                              </div>
                        </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                        <div className="search-wrapper">
                              <Search size={18} className="search-icon" />
                              <input type="text" placeholder="Search lineage..." className="admin-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </div>
                  </div>

                  <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {filteredTree.length === 0 ? (
                              <div style={{ padding: '4rem', textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No nodes found matching your focus.</div>
                        ) : (
                              filteredTree.map(root => (
                                    <AdminNetworkNode key={root.id} node={root} onNodeClick={setSelectedUserId} forceExpand={!!searchQuery} />
                              ))
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
