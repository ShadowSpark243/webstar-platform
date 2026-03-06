import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { Film, Plus, Search, Edit2, Trash2, TrendingUp, Users, Calendar, Target, X, IndianRupee, Clock, BarChart3, Clapperboard, Loader2, Info, ChevronDown, Eye } from 'lucide-react';
import './AdminProjects.css';

const statusConfig = {
      COMING_SOON: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Coming Soon' },
      OPEN: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Open' },
      FUNDED: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: 'Funded' },
      COMPLETED: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6', label: 'Completed' }
};

const emptyProject = {
      title: '', description: '', genre: '', imageUrl: '', targetAmount: '', minInvestment: '', revenueSharePercent: '', durationMonths: '', status: 'COMING_SOON', spvName: '', spvRegistration: '', revenueAgreementUrl: ''
};

const formatINR = (n) => {
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
      return `₹${Number(n).toLocaleString('en-IN')}`;
};

const AdminProjects = () => {
      const [projects, setProjects] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [searchQuery, setSearchQuery] = useState('');
      const [showModal, setShowModal] = useState(false);
      const [editingProject, setEditingProject] = useState(null);
      const [form, setForm] = useState({ ...emptyProject });
      const [processing, setProcessing] = useState(false);
      const [confirmDelete, setConfirmDelete] = useState(null);
      const [errorMsg, setErrorMsg] = useState('');
      const [successMsg, setSuccessMsg] = useState('');
      const [showInvestorsModal, setShowInvestorsModal] = useState(null);
      const [expandedUserId, setExpandedUserId] = useState(null);

      const fetchProjects = async () => {
            try {
                  const res = await api.get('/admin/projects');
                  if (res.data.success) setProjects(res.data.projects || []);
            } catch (err) {
                  console.error('Failed to fetch projects:', err);
            } finally {
                  setIsLoading(false);
            }
      };

      useEffect(() => { fetchProjects(); }, []);

      useEffect(() => {
            if (successMsg) {
                  const timer = setTimeout(() => setSuccessMsg(''), 3000);
                  return () => clearTimeout(timer);
            }
      }, [successMsg]);

      const filtered = useMemo(() => {
            return projects.filter(p =>
                  p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  p.genre.toLowerCase().includes(searchQuery.toLowerCase())
            );
      }, [projects, searchQuery]);

      const groupedInvestments = useMemo(() => {
            if (!showInvestorsModal?.investments) return {};
            return showInvestorsModal.investments.reduce((acc, inv) => {
                  const uid = inv.userId;
                  if (!acc[uid]) acc[uid] = { user: inv.user, total: 0, txs: [] };
                  acc[uid].total += inv.amount;
                  acc[uid].txs.push(inv);
                  return acc;
            }, {});
      }, [showInvestorsModal]);

      const handleSubmit = async (e) => {
            e.preventDefault();
            setProcessing(true);
            setErrorMsg('');
            try {
                  const payload = {
                        ...form,
                        targetAmount: Number(form.targetAmount),
                        minInvestment: Number(form.minInvestment),
                        revenueSharePercent: Number(form.revenueSharePercent),
                        durationMonths: Number(form.durationMonths)
                  };
                  if (editingProject) {
                        await api.put(`/admin/projects/${editingProject.id}`, payload);
                        setSuccessMsg("Project updated successfully");
                  } else {
                        await api.post('/admin/projects', payload);
                        setSuccessMsg("New project created");
                  }
                  setShowModal(false);
                  fetchProjects();
            } catch (err) {
                  setErrorMsg(err?.response?.data?.message || 'Operation failed');
            } finally {
                  setProcessing(false);
            }
      };

      const handleStatusChange = async (projectId, newStatus) => {
            try {
                  await api.put(`/admin/projects/${projectId}`, { status: newStatus });
                  setSuccessMsg(`Status updated to ${newStatus}`);
                  fetchProjects();
            } catch (err) {
                  console.error('Status update failed:', err);
            }
      };

      const handleDelete = async () => {
            setProcessing(true);
            try {
                  await api.delete(`/admin/projects/${confirmDelete.id}`);
                  setSuccessMsg("Project removed");
                  setConfirmDelete(null);
                  fetchProjects();
            } catch (err) {
                  setErrorMsg("Failed to delete project");
            } finally {
                  setProcessing(false);
            }
      };

      if (isLoading && projects.length === 0) return (
            <div style={{ padding: '5rem', textAlign: 'center' }}>
                  <Loader2 size={48} className="animate-spin" style={{ color: '#8b5cf6', margin: '0 auto 1.5rem auto' }} />
                  <p style={{ color: 'rgba(255,255,255,0.5)' }}>Loading project catalog...</p>
            </div>
      );

      return (
            <div className="ap-container">
                  {successMsg && <div className="ap-toast">✓ {successMsg}</div>}

                  <header className="ap-header">
                        <div className="ap-header-left">
                              <div className="ap-header-icon"><Clapperboard size={24} /></div>
                              <div>
                                    <h1 className="admin-page-title">Project Control</h1>
                                    <p className="admin-page-subtitle">Oversee content assets and funding status.</p>
                              </div>
                        </div>
                        <div className="ap-header-actions">
                              <div className="search-wrapper">
                                    <Search size={18} className="search-icon" />
                                    <input type="text" placeholder="Search projects..." className="admin-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                              </div>
                              <button onClick={() => { setEditingProject(null); setForm({ ...emptyProject }); setShowModal(true); }} className="ap-create-btn">
                                    <Plus size={18} /> New Asset
                              </button>
                        </div>
                  </header>

                  <div className="ap-stats-grid">
                        <div className="ap-stat-card">
                              <div className="ap-stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><Film size={20} /></div>
                              <div>
                                    <span className="ap-stat-value">{projects.length}</span>
                                    <span className="ap-stat-label">Stock</span>
                              </div>
                        </div>
                        <div className="ap-stat-card">
                              <div className="ap-stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><TrendingUp size={20} /></div>
                              <div>
                                    <span className="ap-stat-value">₹{(projects.reduce((s, p) => s + p.raisedAmount, 0) / 10000000).toFixed(2)}Cr</span>
                                    <span className="ap-stat-label">Raised</span>
                              </div>
                        </div>
                        <div className="ap-stat-card">
                              <div className="ap-stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}><Users size={20} /></div>
                              <div>
                                    <span className="ap-stat-value">{projects.reduce((s, p) => s + (p._count?.investments || 0), 0)}</span>
                                    <span className="ap-stat-label">Tickets</span>
                              </div>
                        </div>
                  </div>

                  <div className="ap-projects-grid">
                        {filtered.map(p => {
                              const sc = statusConfig[p.status] || statusConfig.COMING_SOON;
                              const progress = Math.min((p.raisedAmount / p.targetAmount) * 100, 100);
                              return (
                                    <div key={p.id} className="ap-project-card">
                                          <div className="ap-card-header">
                                                {p.imageUrl ? <img src={p.imageUrl} className="ap-card-image" alt={p.title} /> : <div className="ap-card-image-fallback"><Film size={32} /></div>}
                                                <div className="ap-card-badge" style={{ background: sc.bg, color: sc.color }}>{sc.label}</div>
                                          </div>
                                          <div className="ap-card-body">
                                                <h3 className="ap-card-title">{p.title}</h3>
                                                <span className="ap-card-genre">{p.genre}</span>

                                                <div className="ap-card-progress-section">
                                                      <div className="ap-card-progress-labels">
                                                            <span>Raised: {formatINR(p.raisedAmount)}</span>
                                                            <span>Target: {formatINR(p.targetAmount)}</span>
                                                      </div>
                                                      <div className="ap-card-progress-track">
                                                            <div className="ap-card-progress-fill" style={{ width: `${progress}%` }} />
                                                      </div>
                                                </div>

                                                <div className="ap-card-metrics">
                                                      <div className="ap-metric">
                                                            <div className="ap-stat-icon-sm" style={{ color: '#8b5cf6' }}><IndianRupee size={12} /></div>
                                                            <div>
                                                                  <span className="ap-metric-value">{formatINR(p.minInvestment)}</span>
                                                                  <span className="ap-metric-label">Min</span>
                                                            </div>
                                                      </div>
                                                      <div className="ap-metric">
                                                            <div className="ap-stat-icon-sm" style={{ color: '#10b981' }}><TrendingUp size={12} /></div>
                                                            <div>
                                                                  <span className="ap-metric-value">{p.revenueSharePercent}%</span>
                                                                  <span className="ap-metric-label">Rev Share</span>
                                                            </div>
                                                      </div>
                                                      <div className="ap-metric">
                                                            <div className="ap-stat-icon-sm" style={{ color: '#3b82f6' }}><Users size={12} /></div>
                                                            <div>
                                                                  <span className="ap-metric-value">{p._count?.investments || 0}</span>
                                                                  <span className="ap-metric-label">Backers</span>
                                                            </div>
                                                      </div>
                                                      <div className="ap-metric">
                                                            <div className="ap-stat-icon-sm" style={{ color: '#f59e0b' }}><Clock size={12} /></div>
                                                            <div>
                                                                  <span className="ap-metric-value">{p.durationMonths}m</span>
                                                                  <span className="ap-metric-label">Term</span>
                                                            </div>
                                                      </div>
                                                </div>

                                                {p._count?.investments > 0 && (
                                                      <button onClick={() => setShowInvestorsModal(p)} style={{ width: '100%', marginTop: '1.25rem', padding: '0.6rem', borderRadius: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: 'none', fontWeight: 700, fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                                            <Users size={14} /> View Participants
                                                      </button>
                                                )}
                                          </div>
                                          <div className="ap-card-footer">
                                                <select value={p.status} onChange={(e) => handleStatusChange(p.id, e.target.value)} className="ap-status-select">
                                                      <option value="COMING_SOON">Coming Soon</option>
                                                      <option value="OPEN">Open</option>
                                                      <option value="FUNDED">Funded</option>
                                                      <option value="COMPLETED">Completed</option>
                                                </select>
                                                <div className="ap-card-actions">
                                                      <button onClick={() => { setEditingProject(p); setForm({ ...p }); setShowModal(true); }} className="ap-action-btn ap-action-edit"><Edit2 size={14} /></button>
                                                      <button onClick={() => setConfirmDelete(p)} className="ap-action-btn ap-action-delete"><Trash2 size={14} /></button>
                                                </div>
                                          </div>
                                    </div>
                              );
                        })}
                  </div>

                  {showModal && (
                        <div className="ap-modal-overlay" onClick={() => setShowModal(false)}>
                              <div className="ap-modal" onClick={e => e.stopPropagation()}>
                                    <div className="ap-modal-header">
                                          <h2 style={{ margin: 0, color: 'white' }}>{editingProject ? 'Edit Project Identity' : 'Commission New Project'}</h2>
                                          <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={24} /></button>
                                    </div>
                                    <div className="ap-modal-content">
                                          {errorMsg && <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' }}>{errorMsg}</div>}
                                          <form onSubmit={handleSubmit} className="ap-form">
                                                <div className="ap-form-group ap-form-full">
                                                      <label>Project Name *</label>
                                                      <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Operation Trident" />
                                                </div>
                                                <div className="ap-form-group ap-form-full">
                                                      <label>Internal Summary *</label>
                                                      <textarea required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Enter project technical specifications..." />
                                                </div>
                                                <div className="ap-form-group">
                                                      <label>Genre / Category *</label>
                                                      <input required value={form.genre} onChange={e => setForm({ ...form, genre: e.target.value })} placeholder="e.g. Action Drama" />
                                                </div>
                                                <div className="ap-form-group">
                                                      <label>Preview Image URL</label>
                                                      <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                                                </div>
                                                <div className="ap-form-group">
                                                      <label>Capital Target (₹) *</label>
                                                      <input required type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
                                                </div>
                                                <div className="ap-form-group">
                                                      <label>Base Contribution (₹) *</label>
                                                      <input required type="number" value={form.minInvestment} onChange={e => setForm({ ...form, minInvestment: e.target.value })} />
                                                </div>
                                                <div className="ap-form-group">
                                                      <label>Rev Share Offer (%) *</label>
                                                      <input required type="number" step="0.1" value={form.revenueSharePercent} onChange={e => setForm({ ...form, revenueSharePercent: e.target.value })} />
                                                </div>
                                                <div className="ap-form-group">
                                                      <label>Lock-in Period (Months) *</label>
                                                      <input required type="number" value={form.durationMonths} onChange={e => setForm({ ...form, durationMonths: e.target.value })} />
                                                </div>
                                                <div className="ap-form-group">
                                                      <label>SPV Entity Name</label>
                                                      <input value={form.spvName} onChange={e => setForm({ ...form, spvName: e.target.value })} placeholder="e.g. Star LLP" />
                                                </div>
                                                <div className="ap-form-group">
                                                      <label>SPV Registration No.</label>
                                                      <input value={form.spvRegistration} onChange={e => setForm({ ...form, spvRegistration: e.target.value })} />
                                                </div>

                                                <div className="ap-form-actions">
                                                      <button type="button" onClick={() => setShowModal(false)} className="ap-btn-secondary">Dismiss</button>
                                                      <button type="submit" disabled={processing} className="ap-btn-primary">
                                                            {processing ? <Loader2 size={16} className="animate-spin" /> : editingProject ? 'Update Asset' : 'Deploy Project'}
                                                      </button>
                                                </div>
                                          </form>
                                    </div>
                              </div>
                        </div>
                  )}

                  {confirmDelete && (
                        <div className="ap-modal-overlay" onClick={() => setConfirmDelete(null)}>
                              <div className="ap-modal" style={{ maxWidth: '400px', textAlign: 'center' }}>
                                    <div style={{ padding: '2rem' }}>
                                          <div style={{ width: '64px', height: '64px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', margin: '0 auto 1.5rem auto' }}><Trash2 size={32} /></div>
                                          <h3 style={{ color: 'white', margin: '0 0 1rem 0' }}>Purge Project?</h3>
                                          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '2rem' }}>
                                                Are you sure you want to delete <strong>{confirmDelete.title}</strong>? This will remove all related metadata and visibility.
                                          </p>
                                          <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={() => setConfirmDelete(null)} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.05)', color: 'white', border: 'none', cursor: 'pointer' }}>Hold on</button>
                                                <button onClick={handleDelete} disabled={processing} style={{ flex: 1, padding: '0.75rem', borderRadius: '0.75rem', background: '#ef4444', color: 'white', border: 'none', fontWeight: 700, cursor: 'pointer' }}>Delete Forever</button>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}

                  {showInvestorsModal && (
                        <div className="ap-modal-overlay" onClick={() => setShowInvestorsModal(null)}>
                              <div className="ap-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px' }}>
                                    <div className="ap-modal-header">
                                          <div>
                                                <h3 style={{ margin: 0, color: 'white' }}>Asset Backers</h3>
                                                <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>Total Capital: {formatINR(showInvestorsModal.raisedAmount)}</span>
                                          </div>
                                          <button onClick={() => setShowInvestorsModal(null)} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={24} /></button>
                                    </div>
                                    <div className="ap-modal-content" style={{ maxHeight: '450px', overflowY: 'auto' }}>
                                          {Object.values(groupedInvestments).map((data, i) => {
                                                const userId = data.user?.id || i;
                                                const isExpanded = expandedUserId === userId;
                                                return (
                                                      <div key={userId} style={{ marginBottom: '1rem', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                            <div 
                                                                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                                                  onClick={() => setExpandedUserId(isExpanded ? null : userId)}
                                                            >
                                                                  <div>
                                                                        <div style={{ fontWeight: 700, color: 'white' }}>{data.user?.fullName}</div>
                                                                        <div style={{ fontSize: '0.75rem', color: '#8b5cf6' }}>@{data.user?.username}</div>
                                                                  </div>
                                                                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                        <div style={{ textAlign: 'right' }}>
                                                                              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981' }}>{formatINR(data.total)}</div>
                                                                              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{data.txs.length} Contribution(s)</div>
                                                                        </div>
                                                                        <div style={{ color: 'rgba(255,255,255,0.4)' }}>
                                                                              {isExpanded ? <ChevronDown size={18} /> : <Eye size={18} />}
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                            
                                                            {isExpanded && (
                                                                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                                                        {data.txs.map(tx => (
                                                                              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                                                                    <div>
                                                                                          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'white' }}>{formatINR(tx.amount)}</div>
                                                                                          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginTop: '0.2rem' }}><Clock size={10} style={{ display: 'inline', marginRight: '0.2rem' }}/>{new Date(tx.createdAt).toLocaleDateString()}</div>
                                                                                    </div>
                                                                                    <div style={{ textAlign: 'right' }}>
                                                                                          <div style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>Est. {formatINR(tx.estimatedRevShare)}</div>
                                                                                          <div style={{ fontSize: '0.65rem', marginTop: '0.2rem', padding: '0.1rem 0.4rem', borderRadius: '0.25rem', display: 'inline-block', background: tx.status === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : 'rgba(59,130,246,0.1)', color: tx.status === 'COMPLETED' ? '#10b981' : '#3b82f6' }}>
                                                                                                {tx.status}
                                                                                          </div>
                                                                                    </div>
                                                                              </div>
                                                                        ))}
                                                                  </div>
                                                            )}
                                                      </div>
                                                );
                                          })}
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
};

export default AdminProjects;
