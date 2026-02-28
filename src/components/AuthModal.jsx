import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Phone, UserPlus, LogIn, CheckCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthModal.css';

const AuthModal = () => {
      const { isAuthModalOpen, setIsAuthModalOpen, login, register } = useAuth();
      const navigate = useNavigate();
      const [isLoginView, setIsLoginView] = useState(true);
      const [error, setError] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);

      // Form State
      const [fullName, setFullName] = useState('');
      const [username, setUsername] = useState('');
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [phone, setPhone] = useState('');
      const [referralCode, setReferralCode] = useState('');
      const [refFromUrl, setRefFromUrl] = useState(false);
      const [fieldErrors, setFieldErrors] = useState({});

      // On mount — check URL for ?ref=CODE and pre-fill + switch to register
      useEffect(() => {
            const params = new URLSearchParams(window.location.search);
            const ref = params.get('ref');
            if (ref) {
                  setReferralCode(ref.toUpperCase());
                  setRefFromUrl(true);
                  setIsLoginView(false); // Auto-switch to Register tab
            }
      }, []);

      if (!isAuthModalOpen) return null;

      const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setFieldErrors({});
            setIsSubmitting(true);

            let result;
            if (isLoginView) {
                  result = await login(email, password);
            } else {
                  result = await register(fullName, email, username, phone, password, referralCode);
            }

            if (!result.success) {
                  setError(result.fieldErrors?.length > 0 ? 'Please fix the errors below.' : result.message);
                  if (result.fieldErrors?.length > 0) {
                        const errObj = {};
                        result.fieldErrors.forEach(err => {
                              if (!errObj[err.path]) errObj[err.path] = err.msg;
                        });
                        setFieldErrors(errObj);
                  }
            } else {
                  navigate('/dashboard');
            }
            setIsSubmitting(false);
      };
      return (
            <AnimatePresence>
                  {isAuthModalOpen && (
                        <div className="auth-modal-overlay" onClick={() => setIsAuthModalOpen(false)}>
                              <motion.div
                                    className="auth-modal-container glass-panel"
                                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                    onClick={(e) => e.stopPropagation()}
                              >
                                    <button className="auth-close-btn" onClick={() => setIsAuthModalOpen(false)}>
                                          <X size={24} />
                                    </button>

                                    <div className="auth-header">
                                          <h2 className="auth-title">
                                                {isLoginView ? 'Welcome Back' : 'Start Participating'}
                                          </h2>
                                          <p className="auth-subtitle">
                                                {isLoginView ? 'Login to check your portfolio and network.' : 'Join the WEBSTAR network to fund blockbuster content.'}
                                          </p>
                                    </div>

                                    <div className="auth-tabs">
                                          <button
                                                className={`auth-tab ${isLoginView ? 'active' : ''}`}
                                                onClick={() => { setIsLoginView(true); setError(''); setFieldErrors({}); }}
                                          >
                                                <LogIn size={18} /> Login
                                          </button>
                                          <button
                                                className={`auth-tab ${!isLoginView ? 'active' : ''}`}
                                                onClick={() => { setIsLoginView(false); setError(''); setFieldErrors({}); }}
                                          >
                                                <UserPlus size={18} /> Register
                                          </button>
                                    </div>

                                    {error && !Object.keys(fieldErrors).length && (
                                          <div className="auth-error-message">
                                                {error}
                                          </div>
                                    )}

                                    <form className="auth-form" onSubmit={handleSubmit}>
                                          {!isLoginView && (
                                                <>
                                                      <div className="form-group">
                                                            <label>Full Name</label>
                                                            <div className={`input-with-icon ${fieldErrors.fullName ? 'input-error' : ''}`}>
                                                                  <User size={18} className="input-icon" />
                                                                  <input
                                                                        type="text"
                                                                        placeholder="John Doe"
                                                                        value={fullName}
                                                                        onChange={(e) => setFullName(e.target.value)}
                                                                  />
                                                            </div>
                                                            {fieldErrors.fullName && <div className="field-error-text">{fieldErrors.fullName}</div>}
                                                      </div>
                                                      <div className="form-group">
                                                            <label>Username</label>
                                                            <div className={`input-with-icon ${fieldErrors.username ? 'input-error' : ''}`}>
                                                                  <User size={18} className="input-icon" />
                                                                  <input
                                                                        type="text"
                                                                        placeholder="johndoe123"
                                                                        value={username}
                                                                        onChange={(e) => setUsername(e.target.value)}
                                                                  />
                                                            </div>
                                                            {fieldErrors.username && <div className="field-error-text">{fieldErrors.username}</div>}
                                                      </div>
                                                      <div className="form-group">
                                                            <label>Phone Number</label>
                                                            <div className={`input-with-icon ${fieldErrors.phone ? 'input-error' : ''}`}>
                                                                  <Phone size={18} className="input-icon" />
                                                                  <input
                                                                        type="tel"
                                                                        placeholder="+91 98765 43210"
                                                                        value={phone}
                                                                        onChange={(e) => setPhone(e.target.value)}
                                                                  />
                                                            </div>
                                                            {fieldErrors.phone && <div className="field-error-text">{fieldErrors.phone}</div>}
                                                      </div>
                                                </>
                                          )}

                                          <div className="form-group">
                                                <label>Email Address</label>
                                                <div className={`input-with-icon ${fieldErrors.email ? 'input-error' : ''}`}>
                                                      <Mail size={18} className="input-icon" />
                                                      <input
                                                            type="email"
                                                            placeholder="you@example.com"
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                      />
                                                </div>
                                                {fieldErrors.email && <div className="field-error-text">{fieldErrors.email}</div>}
                                          </div>

                                          <div className="form-group">
                                                <label>Password</label>
                                                <div className={`input-with-icon ${fieldErrors.password ? 'input-error' : ''}`}>
                                                      <Lock size={18} className="input-icon" />
                                                      <input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                      />
                                                </div>
                                                {fieldErrors.password && <div className="field-error-text">{fieldErrors.password}</div>}
                                          </div>

                                          {!isLoginView && (
                                                <div className="form-group">
                                                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                                            Referral Code {refFromUrl ? <span style={{ color: '#4ade80', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><CheckCircle size={12} /> Applied</span> : '(Optional)'}
                                                      </label>
                                                      <div className={`input-with-icon ${fieldErrors.referralCode ? 'input-error' : ''}`}>
                                                            {refFromUrl ? <CheckCircle size={18} className="input-icon" style={{ color: '#4ade80' }} /> : <UserPlus size={18} className="input-icon" />}
                                                            <input
                                                                  type="text"
                                                                  placeholder="Optional"
                                                                  value={referralCode}
                                                                  onChange={(e) => !refFromUrl && setReferralCode(e.target.value.toUpperCase())}
                                                                  readOnly={refFromUrl}
                                                                  style={refFromUrl ? { color: '#4ade80', fontWeight: 700, cursor: 'not-allowed', letterSpacing: '0.1em' } : {}}
                                                            />
                                                      </div>
                                                      {fieldErrors.referralCode && <div className="field-error-text">{fieldErrors.referralCode}</div>}
                                                      <small className="form-help-text">
                                                            {refFromUrl ? '✅ Referral code automatically applied from your invite link.' : 'Leave blank if you don\'t have a referral code.'}
                                                      </small>
                                                </div>
                                          )}

                                          <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
                                                {isSubmitting ? <><Loader2 size={18} className="animate-spin" /> Processing...</> : (isLoginView ? 'Login to Dashboard' : 'Create Account')}
                                          </button>
                                    </form>
                              </motion.div>
                        </div>
                  )}
            </AnimatePresence>
      );
};

export default AuthModal;
