import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { User, Mail, Phone, Hash, ShieldCheck, AlertCircle, Clock, Key, Loader2, CheckCircle2, UserPlus, Laptop, Smartphone, Globe, LogOut, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProfilePage.css';

const ProfilePage = () => {
      const { user, requestPasswordReset } = useAuth();
      const [isResetting, setIsResetting] = useState(false);
      const [resetSuccess, setResetSuccess] = useState(false);
      const [resetError, setResetError] = useState('');

      // Change Password State
      const [oldPassword, setOldPassword] = useState('');
      const [newPassword, setNewPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [passwordLoading, setPasswordLoading] = useState(false);
      const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

      // Sessions State
      const [sessions, setSessions] = useState([]);
      const [sessionsLoading, setSessionsLoading] = useState(true);

      const fetchSessions = async () => {
            try {
                  const res = await api.get('/auth/sessions');
                  setSessions(res.data.sessions);
            } catch (error) {
                  console.error("Failed to fetch sessions", error);
            } finally {
                  setSessionsLoading(false);
            }
      };

      useEffect(() => {
            fetchSessions();
      }, []);

      const handleRevokeSession = async (sessionId) => {
            if (!window.confirm("Are you sure you want to log out of this session?")) return;
            try {
                  await api.delete(`/auth/sessions/${sessionId}`);
                  setSessions(sessions.filter(s => s.id !== sessionId));
            } catch (error) {
                  alert("Failed to revoke session");
            }
      };

      const handleChangePassword = async (e) => {
            e.preventDefault();
            if (newPassword !== confirmPassword) {
                  setPasswordMsg({ text: 'New passwords do not match', type: 'error' });
                  return;
            }
            setPasswordLoading(true);
            try {
                  const res = await api.put('/auth/change-password', { oldPassword, newPassword });
                  setPasswordMsg({ text: res.data.message || 'Password updated!', type: 'success' });
                  setOldPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
            } catch (error) {
                  setPasswordMsg({ text: error.response?.data?.message || 'Failed to update password', type: 'error' });
            } finally {
                  setPasswordLoading(false);
            }
      };

      const handlePasswordReset = async () => {
            setIsResetting(true);
            setResetError('');
            setResetSuccess(false);

            try {
                  const loginId = user.email || user.username;
                  if (!loginId) throw new Error("No valid email or username found for password reset.");

                  await requestPasswordReset(loginId);
                  setResetSuccess(true);
                  setTimeout(() => setResetSuccess(false), 5000);
            } catch (error) {
                  setResetError(error.message || 'Failed to send password reset email.');
            } finally {
                  setIsResetting(false);
            }
      };

      if (!user) return <div className="p-8 text-center text-gray-400 flex items-center justify-center min-h-[50vh]"><Loader2 size={32} className="animate-spin text-primary" /></div>;

      const getKycStatusClass = () => {
            if (user.kycStatus === 'VERIFIED') return 'verified';
            if (user.kycStatus === 'REJECTED') return 'rejected';
            if (user.kycStatus === 'PENDING') return 'pending';
            return 'unverified';
      };

      const statusClass = getKycStatusClass();

      const getKycBadge = () => {
            switch (user.kycStatus) {
                  case 'VERIFIED':
                        return <div className={`prof-badge ${statusClass}`}><ShieldCheck size={18} /> Verified</div>;
                  case 'PENDING':
                        return <div className={`prof-badge ${statusClass}`}><Clock size={18} /> Verification Pending</div>;
                  case 'REJECTED':
                        return <div className={`prof-badge ${statusClass}`}><AlertCircle size={18} /> Verification Rejected</div>;
                  default:
                        return <div className={`prof-badge ${statusClass}`}><AlertCircle size={18} /> Unverified</div>;
            }
      };

      const getKycIcon = () => {
            switch (user.kycStatus) {
                  case 'VERIFIED': return <ShieldCheck size={48} className="prof-status-ic verified" />;
                  case 'REJECTED': return <AlertCircle size={48} className="prof-status-ic rejected" />;
                  case 'PENDING': return <Clock size={48} className="prof-status-ic pending" />;
                  default: return <AlertCircle size={48} className="prof-status-ic unverified" />;
            }
      };

      return (
            <div className="prof-page">
                  {/* Ambient Background Orbs */}
                  <div className="prof-bg-orb1"></div>
                  <div className="prof-bg-orb2"></div>

                  <header className="prof-header">
                        <h1 className="prof-title">
                              <User size={28} />
                              My Profile
                        </h1>
                        <p className="prof-desc">Manage your personal information and security settings.</p>
                  </header>

                  <div className="prof-layout">

                        {/* Main Content Column */}
                        <div className="prof-col-main">

                              {/* Identity Card */}
                              <div className="prof-card">
                                    <h2 className="prof-card-hdr">Personal Information</h2>
                                    <div className="prof-info-grid">
                                          <div className="prof-info-field">
                                                <label className="prof-label">Full Name</label>
                                                <div className="prof-val">
                                                      <User size={18} className="prof-val-ic" />
                                                      <span>{user.fullName}</span>
                                                </div>
                                          </div>
                                          <div className="prof-info-field">
                                                <label className="prof-label">Username</label>
                                                <div className="prof-val">
                                                      <span className="prof-val-ic font-bold">@</span>
                                                      <span className="prof-val-purp">{user.username || 'Not set'}</span>
                                                </div>
                                          </div>
                                          <div className="prof-info-field full">
                                                <label className="prof-label">Email Address</label>
                                                <div className="prof-val">
                                                      <Mail size={18} className="prof-val-ic" />
                                                      <span>{user.email}</span>
                                                </div>
                                          </div>
                                          <div className="prof-info-field full">
                                                <label className="prof-label">Phone Number</label>
                                                <div className="prof-val">
                                                      <Phone size={18} className="prof-val-ic" />
                                                      <span>{user.phone || 'Not provided'}</span>
                                                </div>
                                          </div>
                                    </div>
                              </div>

                              {/* Network & Sponsor Data */}
                              <div className="prof-card">
                                    <h2 className="prof-card-hdr">Network & Sponsorship</h2>
                                    <div className="prof-net-grid">
                                          <div className="prof-net-box">
                                                <label className="prof-label"><UserPlus size={16} /> Sponsor / Invited By</label>
                                                <div className="prof-sponsor">
                                                      {user.inviter ? (
                                                            <span className="prof-sponsor-txt">{user.inviter}</span>
                                                      ) : user.referredById ? (
                                                            <span>User #{String(user.referredById).padStart(4, '0')}</span>
                                                      ) : (
                                                            <span className="text-emerald-400">Direct Sign-up (System)</span>
                                                      )}
                                                </div>
                                                <div className="prof-net-hint mt-1">The person who invited you to ITRAM WEBPRO.</div>
                                          </div>
                                          <div className="prof-net-box">
                                                <label className="prof-label"><Hash size={16} /> My Referral Code</label>
                                                <div className="prof-refcode">{user.referralCode}</div>
                                                <div className="prof-net-hint mt-1 text-primary">Share this code to build your own network!</div>
                                          </div>
                                    </div>
                              </div>

                              {/* Active Sessions Section */}
                              <div className="prof-card">
                                    <h2 className="prof-card-hdr">
                                          <Shield size={20} className="text-primary" /> Active Sessions
                                    </h2>
                                    <p className="prof-sec-desc mb-4">You are currently logged in on these devices. You can revoke any suspicious session remotely.</p>

                                    {sessionsLoading ? (
                                          <div style={{ padding: '1rem', textAlign: 'center' }}><Loader2 className="animate-spin inline-block mr-2" /> Loading sessions...</div>
                                    ) : (
                                          <div className="prof-sessions-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                                {sessions.map(sess => (
                                                      <div key={sess.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: sess.isCurrent ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent' }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                  <div style={{ background: sess.isCurrent ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.05)', padding: '0.75rem', borderRadius: '50%', color: sess.isCurrent ? '#3b82f6' : 'rgba(255,255,255,0.5)' }}>
                                                                        {sess.device?.toLowerCase().includes('mobile') ? <Smartphone size={18} /> : <Laptop size={18} />}
                                                                  </div>
                                                                  <div>
                                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                              <span style={{ fontWeight: 600, color: 'white' }}>{sess.device || 'Unknown Device'}</span>
                                                                              {sess.isCurrent && <span style={{ fontSize: '0.65rem', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '0.1rem 0.4rem', borderRadius: '1rem', fontWeight: 700 }}>CURRENT</span>}
                                                                        </div>
                                                                        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                                              <Globe size={12} /> {sess.ipAddress} • Active: {new Date(sess.lastActive).toLocaleTimeString()}
                                                                        </div>
                                                                  </div>
                                                            </div>
                                                            {!sess.isCurrent && (
                                                                  <button
                                                                        onClick={() => handleRevokeSession(sess.id)}
                                                                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '0.5rem' }}
                                                                        title="Log out of this device"
                                                                  >
                                                                        <LogOut size={18} />
                                                                  </button>
                                                            )}
                                                      </div>
                                                ))}
                                          </div>
                                    )}
                              </div>
                        </div>

                        {/* Vertical Sidebar Column */}
                        <div className="prof-col-side">

                              {/* KYC Status Card */}
                              <div className="prof-card prof-status-card">
                                    <div className={`prof-status-line ${statusClass}`}></div>
                                    <div className={`prof-status-ring ${statusClass}`}>{getKycIcon()}</div>
                                    <h3 className="prof-status-title">Identity Status</h3>
                                    {getKycBadge()}
                                    <p className="prof-status-desc">
                                          {user.kycStatus === 'VERIFIED' ? "Your identity is fully verified. You have full platform access and can participate in live projects."
                                                : user.kycStatus === 'PENDING' ? "Your documents are currently under review by the admin team. Please allow 24-48 hours."
                                                      : "Your verification was rejected or is incomplete. Please submit valid documents."}
                                    </p>
                              </div>

                              {/* Direct Password Change Card */}
                              <div className="prof-card">
                                    <h3 className="prof-card-hdr mb-4"><Key size={20} className="text-primary" /> Update Password</h3>
                                    <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                          <div>
                                                <label className="prof-label" style={{ fontSize: '0.75rem' }}>Current Password</label>
                                                <input
                                                      type="password" required className="dashboard-input"
                                                      value={oldPassword} onChange={e => setOldPassword(e.target.value)}
                                                      style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                                                />
                                          </div>
                                          <div>
                                                <label className="prof-label" style={{ fontSize: '0.75rem' }}>New Password</label>
                                                <input
                                                      type="password" required className="dashboard-input"
                                                      value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                                      style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                                                />
                                          </div>
                                          <div>
                                                <label className="prof-label" style={{ fontSize: '0.75rem' }}>Confirm New Password</label>
                                                <input
                                                      type="password" required className="dashboard-input"
                                                      value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                                                      style={{ width: '100%', padding: '0.6rem', fontSize: '0.85rem' }}
                                                />
                                          </div>
                                          <button type="submit" disabled={passwordLoading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                                                {passwordLoading ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
                                          </button>
                                          {passwordMsg.text && (
                                                <div style={{ fontSize: '0.75rem', padding: '0.5rem', borderRadius: '0.4rem', background: passwordMsg.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: passwordMsg.type === 'error' ? '#ef4444' : '#10b981', textAlign: 'center' }}>
                                                      {passwordMsg.text}
                                                </div>
                                          )}
                                    </form>
                              </div>

                              {/* Security Actions Card (Reset Link) */}
                              <div className="prof-card">
                                    <h3 className="prof-card-hdr mb-4"><Mail size={20} className="text-secondary" /> Email Reset</h3>
                                    <p className="prof-sec-desc">Forgot password? Request a secure reset link to your email.</p>
                                    <button onClick={handlePasswordReset} disabled={isResetting || resetSuccess} className={`prof-btn ${resetSuccess ? 'prof-btn-success' : 'prof-btn-primary'}`} style={{ fontSize: '0.85rem', padding: '0.6rem' }}>
                                          {isResetting ? <Loader2 size={16} className="animate-spin" /> : resetSuccess ? "Link Sent" : "Send Reset Email"}
                                    </button>
                                    <AnimatePresence>
                                          {(resetError || resetSuccess) && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`prof-msg ${resetSuccess ? 'success' : 'error'}`} style={{ fontSize: '0.7rem', marginTop: '0.5rem' }}>
                                                      {resetSuccess ? "Check your inbox." : resetError}
                                                </motion.div>
                                          )}
                                    </AnimatePresence>
                              </div>

                        </div>
                  </div>
            </div>
      );
};

export default ProfilePage;
