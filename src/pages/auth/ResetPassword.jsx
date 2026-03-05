import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Loader2, CheckCircle, AlertCircle, ArrowRight, PlaySquare } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const ResetPassword = () => {
      const { token } = useParams();
      const navigate = useNavigate();
      const { resetPassword, setIsAuthModalOpen } = useAuth();

      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [status, setStatus] = useState({ type: '', message: '' });

      const isPasswordValid = password.length >= 8;
      const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

      const handleSubmit = async (e) => {
            e.preventDefault();

            if (!isPasswordValid) {
                  setStatus({ type: 'error', message: 'Password must be at least 8 characters long.' });
                  return;
            }

            if (!doPasswordsMatch) {
                  setStatus({ type: 'error', message: 'Passwords do not match.' });
                  return;
            }

            setIsSubmitting(true);
            setStatus({ type: '', message: '' });

            const result = await resetPassword(token, password);

            if (result.success) {
                  setStatus({
                        type: 'success',
                        message: 'Your password has been successfully reset. You may now log in.'
                  });
            } else {
                  setStatus({ type: 'error', message: result.message });
            }

            setIsSubmitting(false);
      };

      return (
            <div className="auth-page-wrapper">

                  {/* Premium Background Orbs */}
                  <div className="auth-bg-orb1"></div>
                  <div className="auth-bg-orb2"></div>

                  {/* Logo Header */}
                  <Link to="/" className="auth-logo-header">
                        <PlaySquare className="text-primary" size={32} />
                        <span className="auth-logo-text">
                              WEB<span className="text-primary">STAR</span>
                        </span>
                  </Link>

                  <div className="auth-card">
                        <div className="auth-card-body">
                              <div className="auth-card-header">
                                    <h2 className="auth-card-title">Secure Your Account</h2>
                                    <p className="auth-card-subtitle">
                                          Create a strong, unique password to secure your digital vault.
                                    </p>
                              </div>

                              <AnimatePresence mode="wait">
                                    {status.message && (
                                          <motion.div
                                                initial={{ opacity: 0, height: 0, y: -10 }}
                                                animate={{ opacity: 1, height: 'auto', y: 0 }}
                                                exit={{ opacity: 0, height: 0, y: -10 }}
                                                className={`auth-status ${status.type}`}
                                          >
                                                {status.type === 'success' ? <CheckCircle size={20} className="shrink-0 mt-1" /> : <AlertCircle size={20} className="shrink-0 mt-1" />}
                                                <p>{status.message}</p>
                                          </motion.div>
                                    )}
                              </AnimatePresence>

                              {status.type === 'success' ? (
                                    <motion.div
                                          className="text-center"
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          transition={{ delay: 0.2 }}
                                    >
                                          <div className="auth-success-circle">
                                                <CheckCircle size={40} />
                                          </div>
                                          <button
                                                className="auth-action-btn primary"
                                                onClick={() => {
                                                      navigate('/');
                                                      setTimeout(() => setIsAuthModalOpen(true), 100);
                                                }}
                                          >
                                                Access Your Vault <ArrowRight size={20} />
                                          </button>
                                    </motion.div>
                              ) : (
                                    <form onSubmit={handleSubmit}>
                                          <div className="auth-form-group">
                                                <label className="auth-label">
                                                      New Password <span className="auth-label-hint">(min. 8 characters)</span>
                                                </label>
                                                <div className={`auth-input-wrap ${password.length > 0 ? (isPasswordValid ? 'auth-input-valid' : '') : ''}`}>
                                                      <Lock size={18} className="auth-input-ic" />
                                                      <input
                                                            type="password"
                                                            placeholder="••••••••••••"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            disabled={isSubmitting}
                                                            className="auth-input"
                                                      />
                                                </div>
                                          </div>

                                          <div className="auth-form-group">
                                                <label className="auth-label">Confirm Password</label>
                                                <div className={`auth-input-wrap ${confirmPassword.length > 0 ? (doPasswordsMatch ? 'auth-input-success' : 'auth-input-error') : ''}`}>
                                                      <Lock size={18} className="auth-input-ic" />
                                                      <input
                                                            type="password"
                                                            placeholder="••••••••••••"
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            disabled={isSubmitting}
                                                            className="auth-input"
                                                      />
                                                </div>
                                                {confirmPassword.length > 0 && !doPasswordsMatch && (
                                                      <div className="auth-err-msg">Passwords do not match</div>
                                                )}
                                          </div>

                                          <button
                                                type="submit"
                                                disabled={isSubmitting || !isPasswordValid || !doPasswordsMatch}
                                                className={`auth-action-btn ${isPasswordValid && doPasswordsMatch ? 'primary' : 'disabled'}`}
                                          >
                                                {isSubmitting ? (
                                                      <><Loader2 size={18} className="animate-spin" /> Finalizing...</>
                                                ) : (
                                                      'Confirm & Reset Password'
                                                )}
                                          </button>

                                          <div className="auth-footer">
                                                <Link to="/" className="auth-link">
                                                      Cancel Request
                                                </Link>
                                          </div>
                                    </form>
                              )}
                        </div>
                  </div>
            </div>
      );
};

export default ResetPassword;
