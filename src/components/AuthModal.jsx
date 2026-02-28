import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Phone, UserPlus, LogIn } from 'lucide-react';
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

      if (!isAuthModalOpen) return null;

      const handleSubmit = async (e) => {
            e.preventDefault();
            setError('');
            setIsSubmitting(true);

            let result;
            if (isLoginView) {
                  result = await login(email, password);
            } else {
                  result = await register(fullName, email, username, phone, password, referralCode);
            }

            if (!result.success) {
                  setError(result.message);
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
                                                onClick={() => { setIsLoginView(true); setError(''); }}
                                          >
                                                <LogIn size={18} /> Login
                                          </button>
                                          <button
                                                className={`auth-tab ${!isLoginView ? 'active' : ''}`}
                                                onClick={() => { setIsLoginView(false); setError(''); }}
                                          >
                                                <UserPlus size={18} /> Register
                                          </button>
                                    </div>

                                    {error && (
                                          <div className="auth-error-message">
                                                {error}
                                          </div>
                                    )}

                                    <form className="auth-form" onSubmit={handleSubmit}>
                                          {!isLoginView && (
                                                <>
                                                      <div className="form-group">
                                                            <label>Full Name</label>
                                                            <div className="input-with-icon">
                                                                  <User size={18} className="input-icon" />
                                                                  <input
                                                                        type="text"
                                                                        placeholder="John Doe"
                                                                        required
                                                                        value={fullName}
                                                                        onChange={(e) => setFullName(e.target.value)}
                                                                  />
                                                            </div>
                                                      </div>
                                                      <div className="form-group">
                                                            <label>Username</label>
                                                            <div className="input-with-icon">
                                                                  <User size={18} className="input-icon" />
                                                                  <input
                                                                        type="text"
                                                                        placeholder="johndoe123"
                                                                        required
                                                                        value={username}
                                                                        onChange={(e) => setUsername(e.target.value)}
                                                                  />
                                                            </div>
                                                      </div>
                                                      <div className="form-group">
                                                            <label>Phone Number</label>
                                                            <div className="input-with-icon">
                                                                  <Phone size={18} className="input-icon" />
                                                                  <input
                                                                        type="tel"
                                                                        placeholder="+91 98765 43210"
                                                                        required
                                                                        value={phone}
                                                                        onChange={(e) => setPhone(e.target.value)}
                                                                  />
                                                            </div>
                                                      </div>
                                                </>
                                          )}

                                          <div className="form-group">
                                                <label>Email Address</label>
                                                <div className="input-with-icon">
                                                      <Mail size={18} className="input-icon" />
                                                      <input
                                                            type="email"
                                                            placeholder="you@example.com"
                                                            required
                                                            value={email}
                                                            onChange={(e) => setEmail(e.target.value)}
                                                      />
                                                </div>
                                          </div>

                                          <div className="form-group">
                                                <label>Password</label>
                                                <div className="input-with-icon">
                                                      <Lock size={18} className="input-icon" />
                                                      <input
                                                            type="password"
                                                            placeholder="••••••••"
                                                            required
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                      />
                                                </div>
                                          </div>

                                          {!isLoginView && (
                                                <div className="form-group">
                                                      <label>Referral Code (Optional)</label>
                                                      <div className="input-with-icon">
                                                            <UserPlus size={18} className="input-icon" />
                                                            <input
                                                                  type="text"
                                                                  placeholder="WS-ADMIN"
                                                                  value={referralCode}
                                                                  onChange={(e) => setReferralCode(e.target.value)}
                                                            />
                                                      </div>
                                                      <small className="form-help-text">Leave as WS-ADMIN if you don't have one.</small>
                                                </div>
                                          )}

                                          <button type="submit" className="btn btn-primary auth-submit" disabled={isSubmitting}>
                                                {isSubmitting ? 'Processing...' : (isLoginView ? 'Login to Dashboard' : 'Create Account')}
                                          </button>
                                    </form>
                              </motion.div>
                        </div>
                  )}
            </AnimatePresence>
      );
};

export default AuthModal;
