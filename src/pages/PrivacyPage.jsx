import React from 'react';
import { ShieldAlert, Fingerprint, Lock, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

const PrivacyPage = () => {
      return (
            <div style={{
                  minHeight: '100vh',
                  background: '#0f172a',
                  color: 'white',
                  fontFamily: "'Inter', sans-serif",
                  padding: '4rem 2rem'
            }}>
                  <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ maxWidth: '800px', margin: '0 auto' }}
                  >
                        <header style={{ marginBottom: '4rem', textAlign: 'center' }}>
                              <div style={{
                                    display: 'inline-flex',
                                    padding: '1rem',
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    borderRadius: '1rem',
                                    color: '#3b82f6',
                                    marginBottom: '1.5rem'
                              }}>
                                    <Lock size={32} />
                              </div>
                              <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Privacy Policy</h1>
                              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Last updated: March 05, 2024</p>
                        </header>

                        <div className="glass-panel" style={{
                              padding: '3rem',
                              borderRadius: '1.5rem',
                              background: 'rgba(30, 41, 59, 0.5)',
                              backdropFilter: 'blur(10px)',
                              border: '1px solid rgba(255,255,255,0.05)',
                              lineHeight: 1.8
                        }}>
                              <section style={{ marginBottom: '2.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: '#3b82f6' }}>1. Data Collection</h2>
                                    <p>We collect personal information that you voluntarily provide to us when you register on the platform. This includes your name, email address, phone number, and KYC documentation necessary for financial compliance.</p>
                              </section>

                              <section style={{ marginBottom: '2.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: '#3b82f6' }}>2. Use of Information</h2>
                                    <p>Your information is used to manage your account, process investments, fulfill KYC requirements, and provide platform updates. We do not sell your personal data to third parties.</p>
                              </section>

                              <section style={{ marginBottom: '2.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: '#3b82f6' }}>3. Data Security</h2>
                                    <p>We implement robust technical and organizational security measures to protect your data. All sensitive information (including financial records) is encrypted at rest and in transit.</p>
                              </section>

                              <section style={{ marginBottom: '2.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: '#3b82f6' }}>4. Your Rights</h2>
                                    <p>You have the right to access, correct, or delete your personal information. You can manage your data preferences directly through your profile settings or by contacting support.</p>
                              </section>

                              <div style={{
                                    marginTop: '4rem',
                                    padding: '1.5rem',
                                    background: 'rgba(139, 92, 246, 0.05)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center'
                              }}>
                                    <Fingerprint size={24} style={{ color: '#8b5cf6' }} />
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                                          WEBSTAR utilizes industry-standard encryption protocols (AES-256) for all identity-related data and financial transactions.
                                    </span>
                              </div>
                        </div>

                        <footer style={{ marginTop: '3rem', textAlign: 'center' }}>
                              <button
                                    onClick={() => window.history.back()}
                                    style={{
                                          background: 'transparent',
                                          border: '1px solid rgba(255,255,255,0.1)',
                                          color: 'white',
                                          padding: '0.75rem 1.5rem',
                                          borderRadius: '0.75rem',
                                          cursor: 'pointer',
                                          fontWeight: 600,
                                          display: 'inline-flex',
                                          alignItems: 'center',
                                          gap: '0.5rem'
                                    }}
                              >
                                    Go Back
                              </button>
                        </footer>
                  </motion.div>
            </div>
      );
};

export default PrivacyPage;
