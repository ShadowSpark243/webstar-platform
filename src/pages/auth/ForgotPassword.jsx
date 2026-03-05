import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Loader2, CheckCircle, AlertCircle, PlaySquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './AuthPages.css';

const ForgotPassword = () => {
      const [loginId, setLoginId] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [status, setStatus] = useState({ type: '', message: '' });
      const { requestPasswordReset } = useAuth();

      const handleSubmit = async (e) => {
            e.preventDefault();

            if (loginId.trim().length < 3) {
                  setStatus({ type: 'error', message: 'Please enter a valid email or username.' });
                  return;
            }

            setIsSubmitting(true);
            setStatus({ type: '', message: '' });

            const result = await requestPasswordReset(loginId);

            if (result.success) {
                  setStatus({
                        type: 'success',
                        message: 'If your account exists, a secure reset link has been dispatched to your inbox.'
                  });
                  setLoginId('');
            } else {
                  setStatus({ type: 'error', message: result.message });
            }

            setIsSubmitting(false);
      };

      return (
            <div className="auth-page-wrapper">

                  {/* Premium Background Orbs */}
                  <div className="auth-bg-orb1"></div>
                  <div className="auth-bg-orb2 purple"></div>

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
                                    <h2 className="auth-card-title">Account Recovery</h2>
                                    <p className="auth-card-subtitle">
                                          Enter your registered email address or username and we'll send you a secure link to reset your password.
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

                              <form onSubmit={handleSubmit}>
                                    <div className="auth-form-group">
                                          <label className="auth-label">Identification</label>
                                          <div className={`auth-input-wrap ${loginId.length > 0 ? 'auth-input-valid' : ''}`}>
                                                <Mail size={18} className="auth-input-ic" />
                                                <input
                                                      type="text"
                                                      placeholder="Username or email address"
                                                      value={loginId}
                                                      onChange={(e) => setLoginId(e.target.value)}
                                                      disabled={isSubmitting || status.type === 'success'}
                                                      className="auth-input"
                                                />
                                          </div>
                                    </div>

                                    <button
                                          type="submit"
                                          disabled={isSubmitting || !loginId.trim() || status.type === 'success'}
                                          className={`auth-action-btn ${status.type !== 'success' && loginId.trim() ? 'primary' : 'disabled'}`}
                                    >
                                          {isSubmitting ? (
                                                <><Loader2 size={20} className="animate-spin" /> Dispatching Link...</>
                                          ) : (
                                                'Send Reset Link'
                                          )}
                                    </button>

                                    <div className="auth-footer">
                                          <Link to="/" className="auth-link">
                                                <ArrowLeft size={16} /> Return to Sign In
                                          </Link>
                                    </div>
                              </form>
                        </div>
                  </div>
            </div>
      );
};

export default ForgotPassword;
