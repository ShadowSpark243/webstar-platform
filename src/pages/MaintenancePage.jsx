import React from 'react';
import { Hammer, Clock, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const MaintenancePage = () => {
      return (
            <div style={{
                  minHeight: '100vh',
                  background: '#0f172a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '2rem',
                  fontFamily: "'Inter', sans-serif",
                  overflow: 'hidden',
                  position: 'relative'
            }}>
                  {/* Animated Background Elements */}
                  <div style={{
                        position: 'absolute',
                        top: '10%',
                        left: '20%',
                        width: '300px',
                        height: '300px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        filter: 'blur(100px)',
                        borderRadius: '50%'
                  }} />
                  <div style={{
                        position: 'absolute',
                        bottom: '10%',
                        right: '25%',
                        width: '250px',
                        height: '250px',
                        background: 'rgba(139, 92, 246, 0.1)',
                        filter: 'blur(100px)',
                        borderRadius: '50%'
                  }} />

                  <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        style={{
                              maxWidth: '500px',
                              width: '100%',
                              textAlign: 'center',
                              background: 'rgba(30, 41, 59, 0.5)',
                              backdropFilter: 'blur(12px)',
                              padding: '3rem 2rem',
                              borderRadius: '1.5rem',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                  >
                        <div style={{
                              width: '80px',
                              height: '80px',
                              background: 'rgba(59, 130, 246, 0.1)',
                              borderRadius: '1.25rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto 2rem',
                              color: '#3b82f6',
                              border: '1px solid rgba(59, 130, 246, 0.2)'
                        }}>
                              <Hammer size={40} />
                        </div>

                        <h1 style={{
                              fontSize: '2.25rem',
                              fontWeight: 800,
                              color: 'white',
                              marginBottom: '1rem',
                              letterSpacing: '-0.02em'
                        }}>System Maintenance</h1>

                        <p style={{
                              fontSize: '1.1rem',
                              color: 'rgba(255, 255, 255, 0.6)',
                              lineHeight: 1.6,
                              marginBottom: '2.5rem'
                        }}>
                              We are currently upgrading the ITRAM WEBPRO infrastructure to provide you with a more secure and powerful platform experience.
                        </p>

                        <div style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 1fr',
                              gap: '1rem',
                              marginBottom: '2.5rem'
                        }}>
                              <div style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                              }}>
                                    <Clock size={20} style={{ color: '#8b5cf6', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Estimated Time</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginTop: '0.25rem' }}>~ 45 Minutes</div>
                              </div>
                              <div style={{
                                    background: 'rgba(255, 255, 255, 0.03)',
                                    padding: '1.25rem',
                                    borderRadius: '1rem',
                                    border: '1px solid rgba(255, 255, 255, 0.05)'
                              }}>
                                    <ShieldCheck size={20} style={{ color: '#10b981', marginBottom: '0.5rem' }} />
                                    <div style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</div>
                                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#10b981', marginTop: '0.25rem' }}>Upgrading Node</div>
                              </div>
                        </div>

                        <button
                              onClick={() => window.location.href = '/'}
                              style={{
                                    padding: '0.8rem 1.5rem',
                                    background: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.6rem',
                                    transition: 'transform 0.2s',
                                    boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                              <ArrowLeft size={18} /> Refresh Platform
                        </button>

                        <div style={{
                              marginTop: '3rem',
                              fontSize: '0.85rem',
                              color: 'rgba(255, 255, 255, 0.3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem'
                        }}>
                              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />
                              Live Infrastructure Monitoring Active
                        </div>
                  </motion.div>
            </div>
      );
};

export default MaintenancePage;
