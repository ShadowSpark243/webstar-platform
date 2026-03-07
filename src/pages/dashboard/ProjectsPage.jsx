import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Film, AlertCircle, PlaySquare, ChevronRight, X, TrendingUp, Clock, Target, Users, IndianRupee, Info, CheckCircle2, XCircle, Loader2, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import './Dashboard.css';
import './ProjectsPage.css';

const ProjectsPage = () => {
      const location = useLocation();
      const { user, setUser } = useAuth();
      const [projects, setProjects] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [selectedProject, setSelectedProject] = useState(null);
      const [showInvestModal, setShowInvestModal] = useState(false);
      const [investAmount, setInvestAmount] = useState('');
      const [isProcessing, setIsProcessing] = useState(false);
      const [confirmInvest, setConfirmInvest] = useState(false);
      const [agreementAccepted, setAgreementAccepted] = useState(false);
      const [resultModal, setResultModal] = useState(null); // { success: bool, message: string }
      const [myContributions, setMyContributions] = useState([]);
      const [loadingPortfolio, setLoadingPortfolio] = useState(true);
      const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'opportunities');
      const [expandedProjects, setExpandedProjects] = useState({});

      const toggleProject = (projectId) => {
            setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
      };

      const fetchProjects = async () => {
            try {
                  const res = await api.get('/projects');
                  if (res.data.success) setProjects(res.data.projects);
            } catch (err) {
                  console.error('Failed to fetch projects:', err);
            } finally {
                  setIsLoading(false);
            }
      };

      const fetchMyInvestments = async () => {
            try {
                  const res = await api.get('/wallet/my-investments');
                  if (res.data.success) setMyContributions(res.data.investments);
            } catch (err) {
                  console.error('Failed to fetch my investments:', err);
            } finally {
                  setLoadingPortfolio(false);
            }
      };

      useEffect(() => {
            fetchProjects();
            fetchMyInvestments();
            
            const handleFocus = () => {
                  fetchProjects();
                  fetchMyInvestments();
            };
            
            window.addEventListener('focus', handleFocus);
            return () => window.removeEventListener('focus', handleFocus);
      }, []);

      const openDetails = (project) => {
            setSelectedProject(project);
            setInvestAmount(String(project.minInvestment));
      };

      const openInvest = (project) => {
            setSelectedProject(project);
            setInvestAmount(String(project.minInvestment));
            setShowInvestModal(true);
            setConfirmInvest(false);
            setAgreementAccepted(false);
      };

      const handleInvest = () => {
            const amount = parseFloat(investAmount);

            if (user.kycStatus !== 'VERIFIED') {
                  setResultModal({ success: false, message: 'You must verify your KYC before participating in projects.' });
                  return;
            }

            if (!amount || amount < selectedProject.minInvestment) {
                  setResultModal({ success: false, message: `Minimum participation for this project is ₹${selectedProject.minInvestment.toLocaleString('en-IN')}` });
                  return;
            }

            if (user.walletBalance < amount) {
                  setResultModal({ success: false, message: 'Insufficient Wallet Balance. Please deposit funds first.' });
                  return;
            }

            setConfirmInvest(true);
      };

      const executeInvest = async () => {
            setIsProcessing(true);
            try {
                  const res = await api.post('/wallet/invest', {
                        projectId: selectedProject.id,
                        amount: parseFloat(investAmount),
                        agreementAccepted
                  });

                  if (res.data.success) {
                        setUser(res.data.user);
                        setShowInvestModal(false);
                        setConfirmInvest(false);
                        setSelectedProject(null);
                        setResultModal({ success: true, message: 'Participation confirmed! 5-Level referral commission has been distributed to your network.' });
                        fetchProjects();
                        fetchMyInvestments();
                  }
            } catch (error) {
                  setResultModal({ success: false, message: error.response?.data?.message || error.message });
                  setConfirmInvest(false);
            } finally {
                  setIsProcessing(false);
            }
      };

      if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading projects...</div>;

      const portfolioStats = myContributions.reduce((acc, inv) => {
            acc.totalInvested += inv.amount;
            acc.totalEstimatedRevShare += inv.estimatedRevShare;
            return acc;
      }, { totalInvested: 0, totalEstimatedRevShare: 0 });

      const groupedInvestmentsMap = myContributions.reduce((acc, inv) => {
            if (!acc[inv.projectId]) {
                  acc[inv.projectId] = {
                        project: inv.project,
                        totalInvested: 0,
                        totalEstimatedRevShare: 0,
                        investments: []
                  };
            }
            acc[inv.projectId].totalInvested += inv.amount;
            acc[inv.projectId].totalEstimatedRevShare += inv.estimatedRevShare;
            acc[inv.projectId].investments.push(inv);
            return acc;
      }, {});

      const groupedPortfolio = Object.values(groupedInvestmentsMap);

      return (
            <div className="dashboard-page relative p-page-fade">
                  <header className="page-header">
                        <div>
                              <h1 className="page-title">Blockbuster Opportunities</h1>
                              <p className="page-subtitle">Participate in high-potential content projects and secure your revenue shares.</p>
                        </div>
                  </header>
                  

                  <div className="alert-banner p-balance-banner">
                        <div className="alert-content">
                              <div className="p-bal-info">
                                    <span className="p-bal-label">Available Balance</span>
                                    <h2 className="p-bal-value">₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}</h2>
                              </div>
                        </div>
                  </div>

                  <div className="projects-tabs">
                        <button
                              onClick={() => setActiveTab('opportunities')}
                              className={`projects-tab-btn ${activeTab === 'opportunities' ? 'active' : 'inactive'}`}
                        >
                              <Film size={18} /> Opportunities ({projects.length})
                        </button>
                        <button
                              onClick={() => setActiveTab('portfolio')}
                              className={`projects-tab-btn ${activeTab === 'portfolio' ? 'active' : 'inactive'}`}
                        >
                              <TrendingUp size={18} /> Participation History ({myContributions.length})
                        </button>
                  </div>

                  {activeTab === 'portfolio' && (
                        <section className="p-section-fade">
                              <div className="ov-sec-hdr">
                                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                          <Sparkles size={20} className="text-primary" /> My Portfolio Analysis
                                    </h2>
                              </div>

                              {loadingPortfolio ? (
                                    <div className="p-loading-box">Analyzing your portfolio...</div>
                              ) : groupedPortfolio.length === 0 ? (
                                    <div className="p-empty-state">
                                          <TrendingUp size={48} />
                                          <p>Your portfolio is currently empty. Start by exploring opportunities.</p>
                                    </div>
                              ) : (
                                    <>
                                          <div className="p-stats-row">
                                                <div className="p-stat-card">
                                                      <span className="p-stat-label">Total Contribution</span>
                                                      <h3 className="p-stat-value">₹{portfolioStats.totalInvested.toLocaleString('en-IN')}</h3>
                                                </div>
                                                <div className="p-stat-card">
                                                      <span className="p-stat-label">Active Projects</span>
                                                      <h3 className="p-stat-value text-primary">{groupedPortfolio.length}</h3>
                                                </div>
                                                <div className="p-stat-card">
                                                      <span className="p-stat-label">Estimated Rev. Share</span>
                                                      <h3 className="p-stat-value text-success">₹{portfolioStats.totalEstimatedRevShare.toLocaleString('en-IN')}</h3>
                                                </div>
                                          </div>

                                          <div className="p-portfolio-grid">
                                                {groupedPortfolio.map(grp => (
                                                      <div key={grp.project.id} className="p-item">
                                                            <div className="p-item-header">
                                                                  <div className="p-item-info">
                                                                        <h4>{grp.project?.title}</h4>
                                                                        <span>{grp.project?.genre} · {grp.investments.length} Slots</span>
                                                                  </div>
                                                                  <div className="p-item-total">
                                                                        <div className="p-item-amt">₹{grp.totalInvested.toLocaleString('en-IN')}</div>
                                                                        <div className="p-stat-label">Contributed</div>
                                                                  </div>
                                                            </div>

                                                            <div className="p-item-summary">
                                                                  <div className="p-summary-box">
                                                                        <div className="p-stat-label"><TrendingUp size={14} /> Est. Rev Share</div>
                                                                        <div className="p-stat-value text-primary">₹{grp.totalEstimatedRevShare.toLocaleString('en-IN')}</div>
                                                                  </div>
                                                                  <div className="p-summary-box">
                                                                        <div className="p-stat-label"><AlertCircle size={14} /> Status</div>
                                                                        <div className="p-stat-value">{grp.project.status}</div>
                                                                  </div>
                                                            </div>

                                                            <button
                                                                  onClick={() => toggleProject(grp.project.id)}
                                                                  className="p-history-toggle"
                                                            >
                                                                  {expandedProjects[grp.project.id] ? (
                                                                        <><ChevronUp size={16} /> Hide History</>
                                                                  ) : (
                                                                        <><ChevronDown size={16} /> View Contribution History ({grp.investments.length})</>
                                                                  )}
                                                            </button>

                                                            {expandedProjects[grp.project.id] && (
                                                                  <div className="p-history-list">
                                                                        {grp.investments.map((inv) => {
                                                                              const start = new Date(inv.createdAt).getTime();
                                                                              const end = new Date(inv.maturityDate).getTime();
                                                                              const now = Date.now();
                                                                              const total = end - start;
                                                                              const elapsed = now - start;
                                                                              const progress = Math.min(Math.max((elapsed / total) * 100, 0), 100);
                                                                              const isMatured = now >= end;

                                                                              return (
                                                                                    <div key={inv.id} className="p-history-card">
                                                                                          <div className="p-hist-item">
                                                                                                <div className="p-hist-label"><IndianRupee size={12} /> Amount</div>
                                                                                                <div className="p-hist-value amount">₹{inv.amount.toLocaleString('en-IN')}</div>
                                                                                          </div>
                                                                                          <div className="p-hist-item">
                                                                                                <div className="p-hist-label"><Clock size={12} /> Date</div>
                                                                                                <div className="p-hist-value">{new Date(inv.createdAt).toLocaleDateString()}</div>
                                                                                          </div>
                                                                                          <div className="p-hist-item">
                                                                                                <div className="p-hist-label"><TrendingUp size={12} /> Est. Share</div>
                                                                                                <div className="p-hist-value returns">₹{inv.estimatedRevShare.toLocaleString('en-IN')}</div>
                                                                                          </div>
                                                                                          <div className="p-hist-item">
                                                                                                <div className="p-hist-label"><CheckCircle2 size={12} /> Status</div>
                                                                                                <div className={`p-hist-value ${isMatured ? 'text-success' : 'text-primary'}`}>
                                                                                                      {isMatured ? 'COMPLETED' : 'ACTIVE'}
                                                                                                </div>
                                                                                          </div>
                                                                                          <div className="p-hist-item" style={{ gridColumn: 'span 2' }}>
                                                                                                <div className="p-hist-label"><Target size={12} /> Progress ({progress.toFixed(0)}%)</div>
                                                                                                <div className="p-progress-bar" style={{ marginTop: '0.4rem', height: '6px' }}>
                                                                                                      <div className="p-progress-fill" style={{ width: `${progress}%` }} />
                                                                                                </div>
                                                                                                <div className="p-hist-label" style={{ marginTop: '0.4rem', justifyContent: 'flex-end' }}>
                                                                                                      Ends: {new Date(inv.maturityDate).toLocaleDateString()}
                                                                                                </div>
                                                                                          </div>
                                                                                    </div>
                                                                              );
                                                                        })}
                                                                  </div>
                                                            )}
                                                      </div>
                                                ))}
                                          </div>
                                    </>
                              )}
                        </section>
                  )}

                  {/* Available Opportunities Section */}
                  {activeTab === 'opportunities' && (
                        <section className="p-section-fade">
                              {/* Removed duplicate heading since tabs already indicate the section */}

                              {projects.length === 0 ? (
                                    <div className="p-empty-state">
                                          <Film size={48} />
                                          <p>No projects available at the moment.</p>
                                          <p>Check back soon for exciting project opportunities.</p>
                                    </div>
                              ) : (
                                    <div className="p-grid">
                                          {projects.map((project, index) => {
                                                const progress = project.targetAmount > 0 ? Math.min((project.raisedAmount / project.targetAmount) * 100, 100) : 0;
                                                const isFunded = project.status === 'FUNDED';
                                                const isComingSoon = project.status === 'COMING_SOON';
                                                const isCompleted = project.status === 'COMPLETED';
                                                
                                                let badgeClass = 'badge-open';
                                                let badgeText = 'OPEN';
                                                
                                                if (isFunded) {
                                                      badgeClass = 'badge-funded';
                                                      badgeText = 'FULLY FUNDED';
                                                } else if (isComingSoon) {
                                                      badgeClass = 'badge-coming';
                                                      badgeText = 'COMING SOON';
                                                } else if (isCompleted) {
                                                      badgeClass = 'badge-completed';
                                                      badgeText = 'COMPLETED';
                                                }

                                                return (
                                                      <div
                                                            key={project.id}
                                                            className="p-card"
                                                            style={{ animationDelay: `${index * 0.1}s` }}
                                                      >
                                                            <div className="p-card-header">
                                                                  <img src={project.imageUrl} alt={project.title} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop'; }} />
                                                                  <div className={`p-status-badge ${badgeClass}`}>
                                                                        {badgeText}
                                                                  </div>
                                                            </div>

                                                            <div className="p-card-body">
                                                                  <h3 className="p-title">
                                                                        <PlaySquare size={22} className="text-primary" /> {project.title}
                                                                  </h3>

                                                                  <div className="p-progress-container">
                                                                        <div className="p-progress-labels">
                                                                              <span>Raised: ₹{(project.raisedAmount / 100000).toFixed(1)}L</span>
                                                                              <span>Target: ₹{(project.targetAmount / 100000).toFixed(1)}L</span>
                                                                        </div>
                                                                        <div className="p-progress-bar">
                                                                              <div className="p-progress-fill" style={{ width: `${progress}%` }} />
                                                                        </div>
                                                                  </div>

                                                                  <div className="p-stats-grid">
                                                                        <div className="p-card-info-box">
                                                                              <p className="p-stat-label">Min Contribution</p>
                                                                              <p className="p-stat-value">₹{project.minInvestment.toLocaleString('en-IN')}</p>
                                                                        </div>
                                                                        <div className="p-card-info-box">
                                                                              <p className="p-stat-label">Projected Rev. Share</p>
                                                                              <p className="p-stat-value text-success">{project.revenueSharePercent}%</p>
                                                                        </div>
                                                                  </div>

                                                                  <div className="p-card-btn-group">
                                                                        <button
                                                                              onClick={(e) => { e.stopPropagation(); openDetails(project); }}
                                                                              className="btn btn-outline"
                                                                              style={{ flex: 1 }}
                                                                        >
                                                                              <Info size={16} /> Details
                                                                        </button>
                                                                        <button
                                                                              className="btn btn-primary"
                                                                              style={{ flex: 2, opacity: (isFunded || isComingSoon || isCompleted) ? 0.5 : 1, cursor: (isFunded || isComingSoon || isCompleted) ? 'not-allowed' : 'pointer' }}
                                                                              onClick={(e) => { 
                                                                                    e.stopPropagation(); 
                                                                                    if (!isFunded && !isComingSoon && !isCompleted) openInvest(project); 
                                                                              }}
                                                                              disabled={isFunded || isComingSoon || isCompleted}
                                                                        >
                                                                              {isCompleted ? 'Completed' : isFunded ? 'Fully Funded' : isComingSoon ? 'Coming Soon' : 'Participate Now'}
                                                                        </button>
                                                                  </div>
                                                            </div>
                                                      </div>
                                                );
                                          })}
                                    </div>
                              )}
                        </section>
                  )}

                  {/* Project Details Modal */}
                  {
                        selectedProject && !showInvestModal && (
                              <div className="p-modal-overlay" onClick={() => setSelectedProject(null)}>
                                    <div className="p-modal" onClick={(e) => e.stopPropagation()}>
                                          <div className="p-modal-accent" />
                                          <button className="p-modal-close" onClick={() => setSelectedProject(null)}><X size={18} /></button>
                                          <div className="p-modal-scroll">
                                                <div className="p-modal-header">
                                                      <div className="p-modal-title-row">
                                                            <PlaySquare size={28} className="text-primary" />
                                                            <div>
                                                                  <h2 className="p-modal-title">{selectedProject.title}</h2>
                                                                  <span className="p-modal-genre">{selectedProject.genre}</span>
                                                            </div>
                                                      </div>
                                                </div>

                                                <p className="p-modal-desc">{selectedProject.description}</p>

                                                <div className="p-detail-stats-grid">
                                                      {[
                                                            { icon: <Target size={16} />, label: 'Target', value: `₹${(selectedProject.targetAmount / 100000).toFixed(1)}L`, color: '#3b82f6' },
                                                            { icon: <TrendingUp size={16} />, label: 'Raised', value: `₹${(selectedProject.raisedAmount / 100000).toFixed(1)}L`, color: '#8b5cf6' },
                                                            { icon: <IndianRupee size={16} />, label: 'Min Project Contribution', value: `₹${selectedProject.minInvestment.toLocaleString('en-IN')}`, color: '#f59e0b' },
                                                            { icon: <TrendingUp size={16} />, label: 'Rev. Share', value: `${selectedProject.revenueSharePercent}%`, color: '#10b981' },
                                                            { icon: <Clock size={16} />, label: 'Duration', value: `${selectedProject.durationMonths} months`, color: '#6366f1' },
                                                            { icon: <Users size={16} />, label: 'Contributors', value: selectedProject._count?.investments || 0, color: '#ec4899' }
                                                      ].map((s, i) => (
                                                            <div key={i} className="p-detail-stat-box">
                                                                  <div className="p-detail-stat-label" style={{ color: s.color }}>{s.icon} {s.label}</div>
                                                                  <div className="p-detail-stat-value">{s.value}</div>
                                                            </div>
                                                      ))}
                                                </div>

                                                <div className="p-detail-progress-section">
                                                      <div className="p-detail-progress-labels">
                                                            <span>Funding Progress</span>
                                                            <span>{Math.min(((selectedProject.raisedAmount / selectedProject.targetAmount) * 100), 100).toFixed(1)}%</span>
                                                      </div>
                                                      <div className="p-progress-bar">
                                                            <div className="p-progress-fill" style={{ width: `${Math.min((selectedProject.raisedAmount / selectedProject.targetAmount) * 100, 100)}%` }} />
                                                      </div>
                                                </div>

                                                <button
                                                      className="btn btn-primary p-modal-cta"
                                                      onClick={() => { setSelectedProject(selectedProject); openInvest(selectedProject); }}
                                                      disabled={selectedProject.status === 'FUNDED' || selectedProject.status === 'COMING_SOON' || selectedProject.status === 'COMPLETED'}
                                                      style={{ opacity: (selectedProject.status === 'FUNDED' || selectedProject.status === 'COMING_SOON' || selectedProject.status === 'COMPLETED') ? 0.5 : 1 }}
                                                >
                                                      {selectedProject.status === 'COMPLETED' ? 'Completed' : selectedProject.status === 'FUNDED' ? 'Fully Funded' : selectedProject.status === 'COMING_SOON' ? 'Coming Soon' : 'Participate in This Project'}
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )
                  }

                  {/* Investment Modal */}
                  {
                        showInvestModal && selectedProject && !confirmInvest && (
                              <div className="p-modal-overlay" onClick={() => { setShowInvestModal(false); setSelectedProject(null); }}>
                                    <div className="p-modal p-modal-sm" onClick={(e) => e.stopPropagation()}>
                                          <div className="p-modal-accent p-modal-accent-green" />
                                          <div className="p-modal-close" onClick={() => { setShowInvestModal(false); setSelectedProject(null); setConfirmInvest(false); }}>
                                                <X size={20} />
                                          </div>
                                          <div className="p-modal-scroll">
                                                <h2 className="p-modal-title">Project Participation</h2>
                                                <div className="p-modal-genre" style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem' }}>{selectedProject.title}</div>
                                                <div className="p-invest-balance-row">
                                                      <span>Your Balance</span>
                                                      <span className="p-invest-balance-val">₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}</span>
                                                </div>

                                                <div className="p-invest-input-wrap">
                                                      <label className="p-invest-label">Participation Amount (₹)</label>
                                                      <input
                                                            type="number"
                                                            min={selectedProject.minInvestment}
                                                            step="10000"
                                                            required
                                                            placeholder={`Min: ₹${selectedProject.minInvestment.toLocaleString('en-IN')}`}
                                                            value={investAmount}
                                                            onChange={(e) => setInvestAmount(e.target.value)}
                                                            className="p-invest-input"
                                                      />
                                                      <small className="p-invest-hint">
                                                            Minimum: ₹{selectedProject.minInvestment.toLocaleString('en-IN')} | Revenue Share: {selectedProject.revenueSharePercent}% over {selectedProject.durationMonths} months (not guaranteed)
                                                      </small>
                                                </div>

                                                {investAmount && parseFloat(investAmount) >= selectedProject.minInvestment && (
                                                      <div className="p-invest-estimate">
                                                            <span>Estimated Revenue Share</span>
                                                            <span className="p-invest-estimate-val">₹{(parseFloat(investAmount) * (1 + selectedProject.revenueSharePercent / 100)).toLocaleString('en-IN')}</span>
                                                      </div>
                                                )}

                                                {user?.kycStatus !== 'VERIFIED' && (
                                                      <div className="p-invest-kyc-warn">
                                                            <AlertCircle size={18} />
                                                            <span>Your KYC is not verified. Please complete verification to participate.</span>
                                                      </div>
                                                )}

                                                <div className="p-agreement">
                                                      <input
                                                            type="checkbox"
                                                            id="agreement"
                                                            checked={agreementAccepted}
                                                            onChange={(e) => setAgreementAccepted(e.target.checked)}
                                                      />
                                                      <label htmlFor="agreement">
                                                            I have read and agree to the <a href={selectedProject.revenueAgreementUrl || '#'} target="_blank" rel="noopener noreferrer">Project Participation Agreement</a>. I understand that my contribution is for project funding and returns depend on actual revenue, not guaranteed fixed revenue share.
                                                      </label>
                                                </div>

                                                <button
                                                      className="btn btn-primary p-modal-cta"
                                                      onClick={handleInvest}
                                                      disabled={!agreementAccepted}
                                                      style={{ opacity: agreementAccepted ? 1 : 0.5 }}
                                                >
                                                      Proceed to Confirm
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        )
                  }

                  {/* Investment Confirmation Modal */}
                  {
                        confirmInvest && selectedProject && (
                              <div className="p-modal-overlay" onClick={() => setConfirmInvest(false)} style={{ zIndex: 200 }}>
                                    <div className="p-modal p-modal-sm" onClick={(e) => e.stopPropagation()}>
                                          <div className="p-modal-accent p-modal-accent-warn" />
                                          <div className="p-modal-scroll">
                                                <h3 className="p-confirm-title">⚡ Confirm Participation</h3>
                                                <div className="p-confirm-box">
                                                      <div className="p-confirm-row">
                                                            <span className="p-confirm-label">Project</span>
                                                            <span className="p-confirm-val">{selectedProject.title}</span>
                                                      </div>
                                                      <div className="p-confirm-row">
                                                            <span className="p-confirm-label">Amount</span>
                                                            <span className="p-confirm-val" style={{ color: '#f59e0b', fontSize: '1rem' }}>₹{parseFloat(investAmount).toLocaleString('en-IN')}</span>
                                                      </div>
                                                      <div className="p-confirm-row">
                                                            <span className="p-confirm-label">Est. Revenue Share</span>
                                                            <span className="p-confirm-val" style={{ color: '#10b981' }}>₹{(parseFloat(investAmount) * (1 + selectedProject.revenueSharePercent / 100)).toLocaleString('en-IN')}</span>
                                                      </div>
                                                </div>
                                                <p className="p-confirm-disclaimer">
                                                      This will deduct ₹{parseFloat(investAmount).toLocaleString('en-IN')} from your wallet. 5-level referral commissions will be distributed to your network upline. Revenue share is not guaranteed and depends on actual project performance.
                                                </p>
                                                <div className="p-confirm-actions">
                                                      <button className="p-confirm-cancel" onClick={() => setConfirmInvest(false)} disabled={isProcessing}>Cancel</button>
                                                      <button className="p-confirm-submit" onClick={executeInvest} disabled={isProcessing} style={{ opacity: isProcessing ? 0.6 : 1 }}>
                                                            {isProcessing ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : 'Confirm Participation'}
                                                      </button>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        )
                  }

                  {/* Result Modal (Success/Error) */}
                  {
                        resultModal && (
                              <div className="p-modal-overlay" onClick={() => setResultModal(null)} style={{ zIndex: 300 }}>
                                    <div className="p-modal p-modal-sm" onClick={(e) => e.stopPropagation()}>
                                          <div className="p-modal-accent" style={{ background: resultModal.success ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f87171, #ef4444)' }} />
                                          <div className="p-result-body">
                                                {resultModal.success ?
                                                      <CheckCircle2 size={48} className="p-result-icon p-result-success" /> :
                                                      <XCircle size={48} className="p-result-icon p-result-error" />
                                                }
                                                <h3 className="p-result-title">{resultModal.success ? 'Success!' : 'Error'}</h3>
                                                <p className="p-result-msg">{resultModal.message}</p>
                                                <button className={`p-result-btn ${resultModal.success ? 'p-result-btn-success' : 'p-result-btn-error'}`} onClick={() => setResultModal(null)}>Got it</button>
                                          </div>
                                    </div>
                              </div>
                        )
                  }
            </div >
      );
};

export default ProjectsPage;
