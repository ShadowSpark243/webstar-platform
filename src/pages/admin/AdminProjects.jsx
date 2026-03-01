import React, { useState, useEffect, useMemo } from 'react';
import api from '../../utils/api';
import { Film, Plus, Search, Edit2, Trash2, TrendingUp, Users, Calendar, Target, X, IndianRupee, Clock, BarChart3, Clapperboard, Loader2, Info, ChevronDown } from 'lucide-react';
import './AdminProjects.css';

const statusConfig = {
      COMING_SOON: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: 'Coming Soon', glow: 'rgba(245,158,11,0.3)' },
      OPEN: { bg: 'rgba(16,185,129,0.15)', color: '#10b981', label: 'Open', glow: 'rgba(16,185,129,0.3)' },
      FUNDED: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', label: 'Funded', glow: 'rgba(59,130,246,0.3)' },
      COMPLETED: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6', label: 'Completed', glow: 'rgba(139,92,246,0.3)' }
};

const emptyProject = {
      title: '', description: '', genre: '', imageUrl: '', targetAmount: '', minInvestment: '', roiPercentage: '', durationMonths: '', status: 'COMING_SOON'
};

const formatINR = (n) => {
      if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)} Cr`;
      if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`;
      return `₹${Number(n).toLocaleString('en-IN')} `;
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
      const [showInvestorsModal, setShowInvestorsModal] = useState(null); // project object
      const [expandedUserId, setExpandedUserId] = useState(null);

      const fetchProjects = async () => {
            try {
                  const res = await api.get('/admin/projects');
                  if (res.data.success) setProjects(res.data.projects);
            } catch (err) {
                  console.error('Failed to fetch projects:', err);
            } finally {
                  setIsLoading(false);
            }
      };

      useEffect(() => { fetchProjects(); }, []);

      // Auto-dismiss success messages
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
            ).map(p => ({
                  ...p,
                  uniqueInvestors: new Set(p.investments?.map(i => i.userId)).size || 0
            }));
      }, [projects, searchQuery]);

      const groupedInvestments = useMemo(() => {
            if (!showInvestorsModal?.investments) return {};
            return showInvestorsModal.investments.reduce((acc, inv) => {
                  const uid = inv.userId;
                  if (!acc[uid]) {
                        acc[uid] = {
                              user: inv.user,
                              total: 0,
                              txs: []
                        };
                  }
                  acc[uid].total += inv.amount;
                  acc[uid].txs.push(inv);
                  return acc;
            }, {});
      }, [showInvestorsModal]);

      const openCreate = () => {
            setEditingProject(null);
            setForm({ ...emptyProject });
            setErrorMsg('');
            setShowModal(true);
      };

      const openEdit = (project) => {
            setEditingProject(project);
            setForm({
                  title: project.title,
                  description: project.description,
                  genre: project.genre,
                  imageUrl: project.imageUrl,
                  targetAmount: project.targetAmount,
                  minInvestment: project.minInvestment,
                  roiPercentage: project.roiPercentage,
                  durationMonths: project.durationMonths,
                  status: project.status
            });
            setErrorMsg('');
            setShowModal(true);
      };

      const handleSubmit = async (e) => {
            e.preventDefault();
            setProcessing(true);
            setErrorMsg('');
            try {
                  if (editingProject) {
                        await api.put(`/admin/projects/${editingProject.id}`, form);
                        setSuccessMsg(`"${form.title}" updated successfully!`);
                  } else {
                        await api.post('/admin/projects', form);
                        setSuccessMsg(`"${form.title}" created successfully!`);
                  }
                  setShowModal(false);
                  fetchProjects();
            } catch (err) {
                  setErrorMsg(err?.response?.data?.message || 'Operation failed.');
            } finally {
                  setProcessing(false);
            }
      };

      const handleDelete = async () => {
            if (!confirmDelete) return;
            setProcessing(true);
            try {
                  await api.delete(`/admin/projects/${confirmDelete.id}`);
                  setSuccessMsg(`"${confirmDelete.title}" deleted.`);
                  setConfirmDelete(null);
                  fetchProjects();
            } catch (err) {
                  setErrorMsg(err?.response?.data?.message || 'Delete failed.');
                  setConfirmDelete(null);
            } finally {
                  setProcessing(false);
            }
      };

      const handleStatusChange = async (projectId, newStatus) => {
            try {
                  await api.put(`/admin/projects/${projectId}`, { status: newStatus });
                  setSuccessMsg(`Status → ${statusConfig[newStatus]?.label || newStatus}`);
                  fetchProjects();
            } catch (err) {
                  console.error('Status update failed:', err);
            }
      };

      const stats = [
            { label: 'Total Projects', value: projects.length, icon: <Film size={20} />, color: '#8b5cf6', gradient: 'linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))' },
            { label: 'Open', value: projects.filter(p => p.status === 'OPEN').length, icon: <Target size={20} />, color: '#10b981', gradient: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(16,185,129,0.05))' },
            { label: 'Coming Soon', value: projects.filter(p => p.status === 'COMING_SOON').length, icon: <Clock size={20} />, color: '#f59e0b', gradient: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(245,158,11,0.05))' },
            { label: 'Funded / Done', value: projects.filter(p => ['FUNDED', 'COMPLETED'].includes(p.status)).length, icon: <BarChart3 size={20} />, color: '#3b82f6', gradient: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.05))' }
      ];

      if (isLoading) {
            return (
                  <div className="ap-loading">
                        <div className="ap-loading-spinner" />
                        <p>Loading projects...</p>
                  </div>
            );
      }

      return (
            <div className="ap-container">
                  {/* Success Toast */}
                  {successMsg && (
                        <div className="ap-toast ap-toast-success">
                              <span>✓</span> {successMsg}
                        </div>
                  )}

                  {/* Header */}
                  <header className="ap-header">
                        <div className="ap-header-left">
                              <div className="ap-header-icon"><Clapperboard size={28} /></div>
                              <div>
                                    <h1 className="admin-page-title">Project Hub</h1>
                                    <p className="admin-page-subtitle" style={{ marginBottom: 0 }}>Create, manage, and monitor all investment projects.</p>
                              </div>
                        </div>
                        <div className="ap-header-actions">
                              <div className="ap-search-wrapper">
                                    <Search size={16} className="ap-search-icon" />
                                    <input
                                          type="text" placeholder="Search projects..." value={searchQuery}
                                          onChange={(e) => setSearchQuery(e.target.value)}
                                          className="ap-search-input"
                                    />
                              </div>
                              <button onClick={openCreate} className="ap-create-btn">
                                    <Plus size={18} /> <span>New Project</span>
                              </button>
                        </div>
                  </header>

                  {/* Stats Grid */}
                  <div className="ap-stats-grid">
                        {stats.map((s, i) => (
                              <div key={i} className="ap-stat-card" style={{ background: s.gradient, borderColor: `${s.color} 22` }}>
                                    <div className="ap-stat-icon" style={{ color: s.color, background: `${s.color} 15` }}>{s.icon}</div>
                                    <div className="ap-stat-info">
                                          <span className="ap-stat-value">{s.value}</span>
                                          <span className="ap-stat-label">{s.label}</span>
                                    </div>
                              </div>
                        ))}
                  </div>

                  {/* Projects Grid — Card-based */}
                  {filtered.length === 0 ? (
                        <div className="ap-empty-state">
                              <Film size={48} />
                              <h3>{projects.length === 0 ? 'No Projects Yet' : 'No Matching Projects'}</h3>
                              <p>{projects.length === 0 ? 'Click "New Project" to create your first investment project.' : 'Try adjusting your search query.'}</p>
                              {projects.length === 0 && (
                                    <button onClick={openCreate} className="ap-create-btn" style={{ marginTop: '1rem' }}>
                                          <Plus size={18} /> Create First Project
                                    </button>
                              )}
                        </div>
                  ) : (
                        <div className="ap-projects-grid">
                              {filtered.map(p => {
                                    const sc = statusConfig[p.status] || statusConfig.COMING_SOON;
                                    const progress = p.targetAmount > 0 ? Math.min((p.raisedAmount / p.targetAmount) * 100, 100) : 0;
                                    return (
                                          <div key={p.id} className="ap-project-card">
                                                {/* Card Header — Image + Status */}
                                                <div className="ap-card-header">
                                                      <div className="ap-card-image-wrap">
                                                            {p.imageUrl ? (
                                                                  <img src={p.imageUrl} alt={p.title} className="ap-card-image" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                                                            ) : null}
                                                            <div className="ap-card-image-fallback" style={{ display: p.imageUrl ? 'none' : 'flex' }}>
                                                                  <Film size={28} />
                                                            </div>
                                                      </div>
                                                      <div className="ap-card-badge" style={{ background: sc.bg, color: sc.color, boxShadow: `0 0 12px ${sc.glow} ` }}>
                                                            {sc.label}
                                                      </div>
                                                </div>

                                                {/* Card Body */}
                                                <div className="ap-card-body">
                                                      <div className="ap-card-title-row">
                                                            <div>
                                                                  <h3 className="ap-card-title">{p.title}</h3>
                                                                  <span className="ap-card-genre">{p.genre} · ID #{p.id}</span>
                                                            </div>
                                                      </div>

                                                      {/* Progress Bar */}
                                                      <div className="ap-card-progress-section">
                                                            <div className="ap-card-progress-labels">
                                                                  <span>Raised: {formatINR(p.raisedAmount)}</span>
                                                                  <span>Target: {formatINR(p.targetAmount)}</span>
                                                            </div>
                                                            <div className="ap-card-progress-track">
                                                                  <div className="ap-card-progress-fill" style={{ width: `${progress}% ` }} />
                                                            </div>
                                                            <span className="ap-card-progress-pct">{progress.toFixed(1)}% funded</span>
                                                      </div>

                                                      {/* Key Metrics */}
                                                      <div className="ap-card-metrics">
                                                            <div className="ap-metric">
                                                                  <IndianRupee size={14} />
                                                                  <div>
                                                                        <span className="ap-metric-value">{formatINR(p.minInvestment)}</span>
                                                                        <span className="ap-metric-label">Min Invest</span>
                                                                  </div>
                                                            </div>
                                                            <div className="ap-metric">
                                                                  <TrendingUp size={14} />
                                                                  <div>
                                                                        <span className="ap-metric-value ap-metric-green">{p.roiPercentage}%</span>
                                                                        <span className="ap-metric-label">ROI</span>
                                                                  </div>
                                                            </div>
                                                            <div className="ap-metric">
                                                                  <Calendar size={14} />
                                                                  <div>
                                                                        <span className="ap-metric-value">{p.durationMonths}mo</span>
                                                                        <span className="ap-metric-label">Duration</span>
                                                                  </div>
                                                            </div>
                                                            <div className="ap-metric">
                                                                  <Users size={14} />
                                                                  <div>
                                                                        <span className="ap-metric-value">{p.uniqueInvestors}</span>
                                                                        <span className="ap-metric-label">Investors</span>
                                                                  </div>
                                                            </div>
                                                      </div>

                                                      {p._count?.investments > 0 && (
                                                            <button
                                                                  onClick={() => setShowInvestorsModal(p)}
                                                                  style={{
                                                                        width: '100%',
                                                                        marginTop: '1rem',
                                                                        padding: '0.5rem',
                                                                        background: 'rgba(59, 130, 246, 0.1)',
                                                                        border: '1px solid rgba(59, 130, 246, 0.2)',
                                                                        borderRadius: '0.4rem',
                                                                        color: '#3b82f6',
                                                                        fontSize: '0.75rem',
                                                                        fontWeight: 600,
                                                                        cursor: 'pointer',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        gap: '0.4rem'
                                                                  }}
                                                            >
                                                                  <Users size={14} /> View {p.uniqueInvestors} Investors
                                                            </button>
                                                      )}
                                                </div>
                                                {/* Card Footer — Actions */}
                                                <div className="ap-card-footer">
                                                      <select
                                                            value={p.status}
                                                            onClick={(e) => e.stopPropagation()}
                                                            onChange={(e) => handleStatusChange(p.id, e.target.value)}
                                                            className="ap-status-select"
                                                            style={{ background: sc.bg, color: sc.color, borderColor: `${sc.color} 44` }}
                                                      >
                                                            <option value="COMING_SOON">Coming Soon</option>
                                                            <option value="OPEN">Open</option>
                                                            <option value="FUNDED">Funded</option>
                                                            <option value="COMPLETED">Completed</option>
                                                      </select>
                                                      <div className="ap-card-actions">
                                                            <button onClick={() => openEdit(p)} className="ap-action-btn ap-action-edit" title="Edit">
                                                                  <Edit2 size={15} /> <span>Edit</span>
                                                            </button>
                                                            <button onClick={() => setConfirmDelete(p)} className="ap-action-btn ap-action-delete" title="Delete">
                                                                  <Trash2 size={15} />
                                                            </button>
                                                      </div>
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  )}
                  {/* ═══════ Create / Edit Project Modal ═══════ */}
                  {
                        showModal && (
                              <div className="ap-modal-overlay" onClick={() => setShowModal(false)}>
                                    <div className="ap-modal" onClick={(e) => e.stopPropagation()}>
                                          <div className="ap-modal-accent" />
                                          <div className="ap-modal-content">
                                                <div className="ap-modal-header">
                                                      <h2>{editingProject ? '✏️ Edit Project' : '🎬 Create New Project'}</h2>
                                                      <button onClick={() => setShowModal(false)} className="ap-modal-close"><X size={20} /></button>
                                                </div>

                                                {errorMsg && <div className="ap-alert ap-alert-error">{errorMsg}</div>}

                                                <form onSubmit={handleSubmit} className="ap-form">
                                                      <div className="ap-form-group ap-form-full">
                                                            <label>Project Title *</label>
                                                            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Kalyug Chronicles Season 2" />
                                                      </div>
                                                      <div className="ap-form-group ap-form-full">
                                                            <label>Description *</label>
                                                            <textarea required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the project..." rows={3} />
                                                      </div>
                                                      <div className="ap-form-group">
                                                            <label>Genre *</label>
                                                            <input required value={form.genre} onChange={(e) => setForm({ ...form, genre: e.target.value })} placeholder="e.g. Web Series" />
                                                      </div>
                                                      <div className="ap-form-group">
                                                            <label>Image URL</label>
                                                            <input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                                                      </div>
                                                      <div className="ap-form-group">
                                                            <label>Target Amount (₹) *</label>
                                                            <input required type="number" min="0" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} placeholder="e.g. 50000000" />
                                                      </div>
                                                      <div className="ap-form-group">
                                                            <label>Min Investment (₹) *</label>
                                                            <input required type="number" min="0" value={form.minInvestment} onChange={(e) => setForm({ ...form, minInvestment: e.target.value })} placeholder="e.g. 100000" />
                                                      </div>
                                                      <div className="ap-form-group">
                                                            <label>ROI Percentage (%) *</label>
                                                            <input required type="number" min="0" step="0.1" value={form.roiPercentage} onChange={(e) => setForm({ ...form, roiPercentage: e.target.value })} placeholder="e.g. 25" />
                                                      </div>
                                                      <div className="ap-form-group">
                                                            <label>Duration (Months) *</label>
                                                            <input required type="number" min="1" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })} placeholder="e.g. 12" />
                                                      </div>
                                                      <div className="ap-form-group">
                                                            <label>Status</label>
                                                            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                                                                  <option value="COMING_SOON">Coming Soon</option>
                                                                  <option value="OPEN">Open</option>
                                                                  <option value="FUNDED">Funded</option>
                                                                  <option value="COMPLETED">Completed</option>
                                                            </select>
                                                      </div>

                                                      <div className="ap-form-actions">
                                                            <button type="button" onClick={() => setShowModal(false)} disabled={processing} className="ap-btn-secondary">Cancel</button>
                                                            <button type="submit" disabled={processing} className="ap-btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                                                  {processing ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : editingProject ? 'Update Project' : 'Create Project'}
                                                            </button>
                                                      </div>
                                                </form>
                                          </div>
                                    </div>
                              </div>
                        )
                  }

                  {/* ═══════ Delete Confirmation Modal ═══════ */}
                  {
                        confirmDelete && (
                              <div className="ap-modal-overlay" onClick={() => setConfirmDelete(null)}>
                                    <div className="ap-modal ap-modal-sm" onClick={(e) => e.stopPropagation()}>
                                          <div className="ap-modal-accent ap-modal-accent-danger" />
                                          <div className="ap-modal-content">
                                                <div className="ap-delete-icon-wrap">
                                                      <Trash2 size={28} />
                                                </div>
                                                <h3 className="ap-delete-title">Delete Project</h3>
                                                <p className="ap-delete-text">
                                                      Are you sure you want to permanently delete <strong>{confirmDelete.title}</strong>? This action cannot be undone.
                                                </p>
                                                {errorMsg && <div className="ap-alert ap-alert-error">{errorMsg}</div>}
                                                <div className="ap-form-actions ap-form-actions-center">
                                                      <button onClick={() => { setConfirmDelete(null); setErrorMsg(''); }} className="ap-btn-secondary">Cancel</button>
                                                      <button onClick={handleDelete} disabled={processing} className="ap-btn-danger" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                                                            {processing ? <><Loader2 size={16} className="animate-spin" /> Deleting...</> : 'Delete Forever'}
                                                      </button>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        )
                  }

                  {/* ═══════ View Investors Modal ═══════ */}
                  {
                        showInvestorsModal && (
                              <div className="ap-modal-overlay" onClick={() => setShowInvestorsModal(null)}>
                                    <div className="ap-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                                          <div className="ap-modal-accent" style={{ background: '#3b82f6' }} />
                                          <div className="ap-modal-content">
                                                <div className="ap-modal-header">
                                                      <div>
                                                            <h2 style={{ margin: 0 }}>👥 Project Investors</h2>

                                                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)' }}>{showInvestorsModal.title} · Total Raised: {formatINR(showInvestorsModal.raisedAmount)}</p>
                                                      </div>
                                                      <button onClick={() => setShowInvestorsModal(null)} className="ap-modal-close"><X size={20} /></button>
                                                </div>

                                                <div style={{ marginTop: '1.5rem', maxHeight: '450px', overflowY: 'auto' }}>
                                                      {showInvestorsModal.investments?.length > 0 ? (
                                                            <>
                                                                  {/* Desktop View Table */}
                                                                  <div className="mobile-hide">
                                                                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                                                                              <thead>
                                                                                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                                                          <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Investor</th>
                                                                                          <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>Total Investment</th>
                                                                                          <th style={{ padding: '0.75rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>Details</th>
                                                                                    </tr>
                                                                              </thead>
                                                                              <tbody>
                                                                                    {Object.entries(groupedInvestments).map(([uid, data]) => (
                                                                                          <React.Fragment key={uid}>
                                                                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer', background: expandedUserId === uid ? 'rgba(59, 130, 246, 0.05)' : 'transparent' }} onClick={() => setExpandedUserId(expandedUserId === uid ? null : uid)}>
                                                                                                      <td style={{ padding: '0.75rem' }}>
                                                                                                            <div style={{ fontWeight: 600, color: 'white' }}>{data.user?.fullName}</div>
                                                                                                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>@{data.user?.username}</div>
                                                                                                      </td>
                                                                                                      <td style={{ padding: '0.75rem', textAlign: 'right', fontWeight: 700, color: '#10b981' }}>
                                                                                                            ₹{data.total.toLocaleString()}
                                                                                                      </td>
                                                                                                      <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                                                                                                            <ChevronDown size={14} style={{ transform: expandedUserId === uid ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'rgba(255,255,255,0.3)' }} />
                                                                                                      </td>
                                                                                                </tr>
                                                                                                {expandedUserId === uid && (
                                                                                                      <tr>
                                                                                                            <td colSpan="3" style={{ padding: '0.5rem 0.75rem 1rem 1.5rem', background: 'rgba(0,0,0,0.1)' }}>
                                                                                                                  <div style={{ borderLeft: '2px solid rgba(59, 130, 246, 0.3)', paddingLeft: '1rem' }}>
                                                                                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Transaction History ({data.txs.length})</div>
                                                                                                                        {data.txs.map((tx) => (
                                                                                                                              <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                                                                                                                                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                                                                                                    <span style={{ fontWeight: 600, color: 'white' }}>₹{tx.amount.toLocaleString()}</span>
                                                                                                                              </div>
                                                                                                                        ))}
                                                                                                                  </div>
                                                                                                            </td>
                                                                                                      </tr>
                                                                                                )}
                                                                                          </React.Fragment>
                                                                                    ))}
                                                                              </tbody>
                                                                        </table>
                                                                  </div>

                                                                  {/* Mobile View Card List */}
                                                                  <div className="mobile-show">
                                                                        <div className="admin-card-list">
                                                                              {Object.entries(groupedInvestments).map(([uid, data]) => (
                                                                                    <div key={uid} className="admin-card" style={{ padding: '0.75rem' }} onClick={() => setExpandedUserId(expandedUserId === uid ? null : uid)}>
                                                                                          <div className="admin-card-row">
                                                                                                <div>
                                                                                                      <div style={{ fontWeight: 700, color: 'white' }}>{data.user?.fullName}</div>
                                                                                                      <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>@{data.user?.username}</div>
                                                                                                </div>
                                                                                                <div style={{ textAlign: 'right' }}>
                                                                                                      <div className="admin-card-label">Total</div>
                                                                                                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#10b981', marginTop: '0.15rem' }}>₹{data.total.toLocaleString()}</div>
                                                                                                </div>
                                                                                          </div>

                                                                                          <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                                                                                                <ChevronDown size={14} style={{ transform: expandedUserId === uid ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'rgba(255,255,255,0.3)' }} />
                                                                                          </div>

                                                                                          {expandedUserId === uid && (
                                                                                                <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                                                                                      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transactions</div>
                                                                                                      {data.txs.map((tx) => (
                                                                                                            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.8rem' }}>
                                                                                                                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>{new Date(tx.createdAt).toLocaleDateString()}</span>
                                                                                                                  <span style={{ fontWeight: 600, color: 'white' }}>₹{tx.amount.toLocaleString()}</span>
                                                                                                            </div>
                                                                                                      ))}
                                                                                                </div>
                                                                                          )}
                                                                                    </div>
                                                                              ))}
                                                                        </div>
                                                                  </div>
                                                            </>
                                                      ) : (
                                                            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.3)' }}>
                                                                  No investments recorded for this project yet.
                                                            </div>
                                                      )}
                                                </div>

                                                <div className="ap-form-actions" style={{ marginTop: '2rem' }}>
                                                      <button onClick={() => setShowInvestorsModal(null)} className="ap-btn-secondary" style={{ width: '100%' }}>Close Window</button>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        )
                  }
            </div >
      );
};

export default AdminProjects;
