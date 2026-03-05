import React from 'react';
import { Shield, FileText, Scale, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const TermsPage = () => {
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
                                    <Scale size={32} />
                              </div>
                              <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Terms of Service</h1>
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
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: '#3b82f6' }}>1. Acceptance of Terms</h2>
                                    <p>By accessing or using the WEBSTAR platform (a product of The Anytime Mediatec Pvt Ltd), you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>
                              </section>

                              <section style={{ marginBottom: '2.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: '#3b82f6' }}>2. Project-Based Funding</h2>
                                    <p>WEBSTAR operates as a project-based funding platform for OTT content. Capital invested in projects is subject to production risks. Returns are proportional to project performance and are not guaranteed.</p>
                              </section>

                              <section style={{ marginBottom: '2.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: '#3b82f6' }}>3. User Conduct</h2>
                                    <p>Users are responsible for maintaining the confidentiality of their account and password. You agree to accept responsibility for all activities that occur under your account.</p>
                              </section>

                              <section style={{ marginBottom: '2.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.25rem', color: '#3b82f6' }}>4. Withdrawal Policy</h2>
                                    <p>Withdrawals are subject to KYC verification and project cycles. The minimum withdrawal amount and processing times are clearly specified in the user dashboard.</p>
                              </section>

                              <div style={{
                                    marginTop: '4rem',
                                    padding: '1.5rem',
                                    background: 'rgba(59, 130, 246, 0.05)',
                                    border: '1px solid rgba(59, 130, 246, 0.2)',
                                    borderRadius: '1rem',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center'
                              }}>
                                    <FileText className="text-primary" />
                                    <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)' }}>
                                          For specific project-by-project legal agreements, please refer to the "Legal Docs" section within each project profile.
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

export default TermsPage;
