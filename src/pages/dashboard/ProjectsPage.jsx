import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { Film, AlertCircle, PlaySquare, ChevronRight, X, TrendingUp, Clock, Target, Users, IndianRupee, Info, CheckCircle2, XCircle } from 'lucide-react';
import './Dashboard.css';

const ProjectsPage = () => {
      const { user, setUser } = useAuth();
      const [projects, setProjects] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [selectedProject, setSelectedProject] = useState(null);
      const [showInvestModal, setShowInvestModal] = useState(false);
      const [investAmount, setInvestAmount] = useState('');
      const [isProcessing, setIsProcessing] = useState(false);
      const [confirmInvest, setConfirmInvest] = useState(false);
      const [resultModal, setResultModal] = useState(null); // { success: bool, message: string }

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

      useEffect(() => { fetchProjects(); }, []);

      const openDetails = (project) => {
            setSelectedProject(project);
            setInvestAmount(String(project.minInvestment));
      };

      const openInvest = (project) => {
            setSelectedProject(project);
            setInvestAmount(String(project.minInvestment));
            setShowInvestModal(true);
            setConfirmInvest(false);
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
                        amount: parseFloat(investAmount)
                  });

                  if (res.data.success) {
                        setUser(res.data.user);
                        setShowInvestModal(false);
                        setConfirmInvest(false);
                        setSelectedProject(null);
                        setResultModal({ success: true, message: 'Investment successful! 5-Level Commission has been distributed to your network.' });
                        fetchProjects();
                  }
            } catch (error) {
                  setResultModal({ success: false, message: error.response?.data?.message || error.message });
                  setConfirmInvest(false);
            } finally {
                  setIsProcessing(false);
            }
      };

      if (isLoading) return <div style={{ padding: '3rem', textAlign: 'center', color: 'rgba(255,255,255,0.5)' }}>Loading projects...</div>;

      return (
            <div className="dashboard-page relative">
                  <header className="page-header">
                        <div>
                              <h1 className="page-title">Live Projects</h1>
                              <p className="page-subtitle">Fund upcoming blockbuster content and earn profit shares.</p>
                        </div>
                  </header>

                  {/* Current Wallet Banner */}
                  <div className="alert-banner" style={{ background: 'rgba(59, 130, 246, 0.1)', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
                        <div className="alert-content" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                              <div>
                                    <h4 style={{ color: '#3b82f6' }}>Available Balance</h4>
                                    <p>₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}</p>
                              </div>
                        </div>
                  </div>

                  {projects.length === 0 ? (
                        <div className="dashboard-card glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
                              <Film size={48} style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '1rem' }} />
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.1rem' }}>No projects available at the moment.</p>
                              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Check back soon for exciting investment opportunities.</p>
                        </div>
                  ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
                              {projects.map((project) => {
                                    const progress = project.targetAmount > 0 ? Math.min((project.raisedAmount / project.targetAmount) * 100, 100) : 0;
                                    const isFunded = project.status === 'FUNDED';
                                    const isComingSoon = project.status === 'COMING_SOON';
                                    return (
                                          <div key={project.id} className="dashboard-card glass-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                                <div style={{ position: 'relative', height: '200px' }}>
                                                      <img src={project.imageUrl} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2025&auto=format&fit=crop'; }} />
                                                      <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.7)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.8rem', fontWeight: 600, color: '#3b82f6', border: '1px solid rgba(59,130,246,0.3)' }}>
                                                            {project.genre}
                                                      </div>
                                                      {isFunded && (
                                                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(16,185,129,0.85)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>FULLY FUNDED</div>
                                                      )}
                                                      {isComingSoon && (
                                                            <div style={{ position: 'absolute', top: '1rem', left: '1rem', background: 'rgba(245,158,11,0.85)', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 700, color: 'white' }}>COMING SOON</div>
                                                      )}
                                                </div>

                                                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                                                      <h3 style={{ fontSize: '1.4rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <PlaySquare size={22} className="text-primary" /> {project.title}
                                                      </h3>

                                                      <div style={{ marginBottom: '1rem' }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'rgba(255,255,255,0.7)' }}>
                                                                  <span>Raised: ₹{(project.raisedAmount / 100000).toFixed(1)}L</span>
                                                                  <span>Target: ₹{(project.targetAmount / 100000).toFixed(1)}L</span>
                                                            </div>
                                                            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                                  <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', transition: 'width 0.5s ease' }} />
                                                            </div>
                                                      </div>

                                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                                                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Min Investment</p>
                                                                  <p style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 600, color: 'white' }}>₹{project.minInvestment.toLocaleString('en-IN')}</p>
                                                            </div>
                                                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '0.5rem' }}>
                                                                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>Expected ROI</p>
                                                                  <p style={{ margin: '0.2rem 0 0', fontSize: '1rem', fontWeight: 600, color: '#10b981' }}>{project.roiPercentage}%</p>
                                                            </div>
                                                      </div>

                                                      <div style={{ marginTop: 'auto', display: 'flex', gap: '0.75rem' }}>
                                                            <button
                                                                  onClick={() => openDetails(project)}
                                                                  className="btn btn-outline"
                                                                  style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '0.4rem', alignItems: 'center', padding: '0.75rem', borderColor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.8)' }}
                                                            >
                                                                  <Info size={16} /> Details
                                                            </button>
                                                            <button
                                                                  className="btn btn-primary"
                                                                  style={{ flex: 2, display: 'flex', justifyContent: 'center', gap: '0.4rem', padding: '0.75rem', opacity: (isFunded || isComingSoon) ? 0.5 : 1, cursor: (isFunded || isComingSoon) ? 'not-allowed' : 'pointer' }}
                                                                  onClick={() => !isFunded && !isComingSoon && openInvest(project)}
                                                                  disabled={isFunded || isComingSoon}
                                                            >
                                                                  {isFunded ? 'Fully Funded' : isComingSoon ? 'Coming Soon' : <><IndianRupee size={16} /> Invest Now</>}
                                                            </button>
                                                      </div>
                                                </div>
                                          </div>
                                    );
                              })}
                        </div>
                  )}

                  {/* Project Details Modal */}
                  {selectedProject && !showInvestModal && (
                        <div onClick={() => setSelectedProject(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                              <div onClick={(e) => e.stopPropagation()} className="glass-panel" style={{ width: '95%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
                                    <div style={{ height: '3px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />
                                    <div style={{ padding: '1.5rem 2rem' }}>
                                          <button onClick={() => setSelectedProject(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={20} /></button>

                                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                                <PlaySquare size={28} className="text-primary" />
                                                <div>
                                                      <h2 style={{ margin: 0, fontSize: '1.3rem' }}>{selectedProject.title}</h2>
                                                      <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600 }}>{selectedProject.genre}</span>
                                                </div>
                                          </div>

                                          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>{selectedProject.description}</p>

                                          {/* Stats Grid */}
                                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                                {[
                                                      { icon: <Target size={16} />, label: 'Target', value: `₹${(selectedProject.targetAmount / 100000).toFixed(1)}L`, color: '#3b82f6' },
                                                      { icon: <TrendingUp size={16} />, label: 'Raised', value: `₹${(selectedProject.raisedAmount / 100000).toFixed(1)}L`, color: '#8b5cf6' },
                                                      { icon: <IndianRupee size={16} />, label: 'Min Investment', value: `₹${selectedProject.minInvestment.toLocaleString('en-IN')}`, color: '#f59e0b' },
                                                      { icon: <TrendingUp size={16} />, label: 'ROI', value: `${selectedProject.roiPercentage}%`, color: '#10b981' },
                                                      { icon: <Clock size={16} />, label: 'Duration', value: `${selectedProject.durationMonths} months`, color: '#6366f1' },
                                                      { icon: <Users size={16} />, label: 'Investors', value: selectedProject._count?.investments || 0, color: '#ec4899' }
                                                ].map((s, i) => (
                                                      <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: s.color, fontSize: '0.75rem', marginBottom: '0.25rem' }}>{s.icon} {s.label}</div>
                                                            <div style={{ color: 'white', fontWeight: 600, fontSize: '1rem' }}>{s.value}</div>
                                                      </div>
                                                ))}
                                          </div>

                                          {/* Progress Bar */}
                                          <div style={{ marginBottom: '1.5rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.4rem' }}>
                                                      <span>Funding Progress</span>
                                                      <span>{Math.min(((selectedProject.raisedAmount / selectedProject.targetAmount) * 100), 100).toFixed(1)}%</span>
                                                </div>
                                                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                                                      <div style={{ width: `${Math.min((selectedProject.raisedAmount / selectedProject.targetAmount) * 100, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)', transition: 'width 0.5s ease' }} />
                                                </div>
                                          </div>

                                          <button
                                                className="btn btn-primary"
                                                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', opacity: (selectedProject.status === 'FUNDED' || selectedProject.status === 'COMING_SOON') ? 0.5 : 1 }}
                                                onClick={() => { setSelectedProject(selectedProject); openInvest(selectedProject); }}
                                                disabled={selectedProject.status === 'FUNDED' || selectedProject.status === 'COMING_SOON'}
                                          >
                                                {selectedProject.status === 'FUNDED' ? 'Fully Funded' : selectedProject.status === 'COMING_SOON' ? 'Coming Soon' : 'Invest in This Project'}
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* Investment Modal */}
                  {showInvestModal && selectedProject && !confirmInvest && (
                        <div onClick={() => { setShowInvestModal(false); setSelectedProject(null); }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '1rem' }}>
                              <div onClick={(e) => e.stopPropagation()} className="glass-panel" style={{ width: '90%', maxWidth: '480px', position: 'relative' }}>
                                    <div style={{ height: '3px', background: 'linear-gradient(90deg, #10b981, #3b82f6)' }} />
                                    <div style={{ padding: '1.5rem 2rem' }}>
                                          <button onClick={() => { setShowInvestModal(false); setSelectedProject(null); }} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}><X size={20} /></button>

                                          <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.2rem' }}>Participate in Project</h2>
                                          <p className="text-primary" style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '1.5rem' }}>{selectedProject.title}</p>

                                          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1.25rem', fontSize: '0.85rem' }}>
                                                <span style={{ color: 'rgba(255,255,255,0.5)' }}>Your Balance</span>
                                                <span style={{ color: 'white', fontWeight: 600 }}>₹{user?.walletBalance?.toLocaleString('en-IN') || '0'}</span>
                                          </div>

                                          <div style={{ marginBottom: '1.25rem' }}>
                                                <label style={{ display: 'block', marginBottom: '0.4rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600 }}>Investment Amount (₹)</label>
                                                <input
                                                      type="number"
                                                      min={selectedProject.minInvestment}
                                                      step="10000"
                                                      required
                                                      value={investAmount}
                                                      onChange={(e) => setInvestAmount(e.target.value)}
                                                      style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '0.75rem', fontSize: '1.1rem', outline: 'none', boxSizing: 'border-box' }}
                                                />
                                                <small style={{ color: 'rgba(255,255,255,0.4)', display: 'block', marginTop: '0.4rem' }}>
                                                      Minimum: ₹{selectedProject.minInvestment.toLocaleString('en-IN')} | ROI: {selectedProject.roiPercentage}% over {selectedProject.durationMonths} months
                                                </small>
                                          </div>

                                          {investAmount && parseFloat(investAmount) >= selectedProject.minInvestment && (
                                                <div style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
                                                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>
                                                            <span>Expected Return</span>
                                                            <span style={{ color: '#10b981', fontWeight: 600 }}>₹{(parseFloat(investAmount) * (1 + selectedProject.roiPercentage / 100)).toLocaleString('en-IN')}</span>
                                                      </div>
                                                </div>
                                          )}

                                          {user?.kycStatus !== 'VERIFIED' && (
                                                <div style={{ display: 'flex', gap: '0.5rem', color: '#ef4444', marginBottom: '1.25rem', fontSize: '0.85rem', background: 'rgba(239,68,68,0.1)', padding: '0.75rem 1rem', borderRadius: '0.5rem', alignItems: 'flex-start' }}>
                                                      <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                                                      <span>Your KYC is not verified. Please complete verification to invest.</span>
                                                </div>
                                          )}

                                          <button
                                                className="btn btn-primary"
                                                style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem' }}
                                                onClick={handleInvest}
                                          >
                                                Proceed to Confirm
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* Investment Confirmation Modal */}
                  {confirmInvest && selectedProject && (
                        <div onClick={() => setConfirmInvest(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '1rem' }}>
                              <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #111 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', width: '100%', maxWidth: '420px', overflow: 'hidden' }}>
                                    <div style={{ height: '3px', background: 'linear-gradient(90deg, #f59e0b, #10b981)' }} />
                                    <div style={{ padding: '1.5rem' }}>
                                          <h3 style={{ margin: '0 0 0.75rem 0', color: 'white', fontSize: '1.1rem', fontWeight: 700 }}>⚡ Confirm Investment</h3>
                                          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '1rem', borderRadius: '0.75rem', marginBottom: '1rem' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Project</span>
                                                      <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>{selectedProject.title}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Amount</span>
                                                      <span style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1rem' }}>₹{parseFloat(investAmount).toLocaleString('en-IN')}</span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>Expected Return</span>
                                                      <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>₹{(parseFloat(investAmount) * (1 + selectedProject.roiPercentage / 100)).toLocaleString('en-IN')}</span>
                                                </div>
                                          </div>
                                          <p style={{ margin: '0 0 1.25rem 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>
                                                This will deduct ₹{parseFloat(investAmount).toLocaleString('en-IN')} from your wallet. 5-level commissions will be distributed to your network upline.
                                          </p>
                                          <div style={{ display: 'flex', gap: '0.75rem' }}>
                                                <button onClick={() => setConfirmInvest(false)} disabled={isProcessing} style={{ flex: 1, padding: '0.65rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>Cancel</button>
                                                <button onClick={executeInvest} disabled={isProcessing} style={{ flex: 2, padding: '0.65rem', background: '#10b981', border: 'none', color: 'white', borderRadius: '0.5rem', cursor: isProcessing ? 'not-allowed' : 'pointer', fontWeight: 600, fontSize: '0.85rem', opacity: isProcessing ? 0.6 : 1 }}>
                                                      {isProcessing ? 'Processing...' : 'Confirm Investment'}
                                                </button>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  )}

                  {/* Result Modal (Success/Error) */}
                  {resultModal && (
                        <div onClick={() => setResultModal(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}>
                              <div onClick={(e) => e.stopPropagation()} style={{ background: 'linear-gradient(180deg, #1a1a2e 0%, #111 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '1rem', width: '100%', maxWidth: '400px', overflow: 'hidden' }}>
                                    <div style={{ height: '3px', background: resultModal.success ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #f87171, #ef4444)' }} />
                                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                                          {resultModal.success ?
                                                <CheckCircle2 size={48} style={{ color: '#10b981', marginBottom: '1rem' }} /> :
                                                <XCircle size={48} style={{ color: '#ef4444', marginBottom: '1rem' }} />
                                          }
                                          <h3 style={{ margin: '0 0 0.5rem 0', color: 'white', fontSize: '1.1rem' }}>{resultModal.success ? 'Success!' : 'Error'}</h3>
                                          <p style={{ margin: '0 0 1.5rem 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.5 }}>{resultModal.message}</p>
                                          <button onClick={() => setResultModal(null)} style={{ padding: '0.6rem 2rem', background: resultModal.success ? '#10b981' : '#ef4444', border: 'none', color: 'white', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}>Got it</button>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
};

export default ProjectsPage;
