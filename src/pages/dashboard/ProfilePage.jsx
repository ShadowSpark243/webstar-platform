import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, Hash, ShieldCheck, AlertCircle, Clock, Key, Loader2, CheckCircle2, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ProfilePage.css';

const ProfilePage = () => {
      const { user, requestPasswordReset } = useAuth();
      const [isResetting, setIsResetting] = useState(false);
      const [resetSuccess, setResetSuccess] = useState(false);
      const [resetError, setResetError] = useState('');

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
                                    <h2 className="prof-card-hdr">
                                          Personal Information
                                    </h2>

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
                                    <h2 className="prof-card-hdr">
                                          Network & Sponsorship
                                    </h2>
                                    <div className="prof-net-grid">

                                          {/* Sponsor Box */}
                                          <div className="prof-net-box">
                                                <label className="prof-label">
                                                      <UserPlus size={16} /> Sponsor / Invited By
                                                </label>
                                                <div className="prof-sponsor">
                                                      {user.inviter ? (
                                                            <span className="prof-sponsor-txt">{user.inviter}</span>
                                                      ) : user.referredById ? (
                                                            <span>User #{String(user.referredById).padStart(4, '0')}</span>
                                                      ) : (
                                                            <span className="text-emerald-400">Direct Sign-up (System)</span>
                                                      )}
                                                </div>
                                                <div className="prof-net-hint mt-1">The person who invited you to WEBSTAR.</div>
                                          </div>

                                          {/* Own Referral Code Box */}
                                          <div className="prof-net-box">
                                                <label className="prof-label">
                                                      <Hash size={16} /> My Referral Code
                                                </label>
                                                <div className="prof-refcode">
                                                      {user.referralCode}
                                                </div>
                                                <div className="prof-net-hint mt-1 text-primary">Share this code to build your own network!</div>
                                          </div>

                                    </div>
                              </div>
                        </div>

                        {/* Vertical Sidebar Column */}
                        <div className="prof-col-side">

                              {/* KYC Status Card */}
                              <div className="prof-card prof-status-card">
                                    <div className={`prof-status-line ${statusClass}`}></div>

                                    <div className={`prof-status-ring ${statusClass}`}>
                                          {getKycIcon()}
                                    </div>

                                    <h3 className="prof-status-title">Identity Status</h3>

                                    {getKycBadge()}

                                    <p className="prof-status-desc">
                                          {user.kycStatus === 'VERIFIED' ? "Your identity is fully verified. You have full platform access and can participate in live projects."
                                                : user.kycStatus === 'PENDING' ? "Your documents are currently under review by the admin team. Please allow 24-48 hours."
                                                      : "Your verification was rejected or is incomplete. Please submit valid documents."}
                                    </p>
                              </div>

                              {/* Security Actions Card */}
                              <div className="prof-card">
                                    <h3 className="prof-card-hdr mb-4">
                                          <Key size={20} className="text-primary" />
                                          Global Security
                                    </h3>

                                    <p className="prof-sec-desc">
                                          Need to update your password? Request a secure reset link to your registered email address automatically.
                                    </p>

                                    <button
                                          onClick={handlePasswordReset}
                                          disabled={isResetting || resetSuccess}
                                          className={`prof-btn ${resetSuccess ? 'prof-btn-success' : 'prof-btn-primary'}`}
                                    >
                                          {isResetting ? <><Loader2 size={18} className="animate-spin" /> Dispatching Link...</>
                                                : resetSuccess ? <><CheckCircle2 size={18} /> Link Dispatched</>
                                                      : "Reset Password Instantly"}
                                    </button>

                                    <AnimatePresence>
                                          {(resetError || resetSuccess) && (
                                                <motion.div
                                                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                                      animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                                                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                                      className={`prof-msg ${resetSuccess ? 'success' : 'error'}`}
                                                >
                                                      {resetSuccess ? "Check your email inbox for the secure reset link." : resetError}
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
