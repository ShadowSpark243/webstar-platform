import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './HeroSection.css';

const HeroSection = () => {
      const navigate = useNavigate();
      const { user, setIsAuthModalOpen } = useAuth();

      return (
            <section className="hero">
                  <div className="hero-bg">
                        <div className="hero-bg-gradient"></div>
                        <img
                              src="https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop"
                              alt="OTT Production Background"
                        />
                  </div>

                  <div className="container hero-content">
                        <motion.div
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.8 }}
                              className="hero-inner"
                        >
                              <div className="hero-badge animate-pulseGlow">
                                    Project-Based Profit Sharing Model
                              </div>

                              <h1 className="hero-title">
                                    Participate in the Future of <br />
                                    <span className="text-gradient">Blockbuster Content</span>
                              </h1>

                              <p className="hero-subtitle">
                                    Fund premium web series and movies. Earn up to <span className="hero-subtitle-highlight">1% Monthly Bonus</span> and share <span className="hero-subtitle-highlight">20% of Net Profits</span> from successful projects.
                              </p>

                              <div className="hero-actions">
                                    <button onClick={() => {
                                          if (user) {
                                                navigate('/dashboard');
                                          } else {
                                                setIsAuthModalOpen(true);
                                          }
                                    }} className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
                                          {user ? 'Go to Dashboard' : 'Start Participating'} <ChevronRight size={20} />
                                    </button>
                                    <a href="#how-it-works" className="btn btn-outline" style={{ padding: '1rem 2rem' }}>
                                          <PlayCircle size={20} /> How It Works
                                    </a>
                              </div>

                              <div className="hero-stats">
                                    <div className="hero-stat-item">
                                          <p className="hero-stat-value">₹1L</p>
                                          <p className="hero-stat-label">Minimum Participation</p>
                                    </div>
                                    <div className="hero-stat-item">
                                          <p className="hero-stat-value">8.5%</p>
                                          <p className="hero-stat-label">Level Commission</p>
                                    </div>
                                    <div className="hero-stat-item">
                                          <p className="hero-stat-value">20%</p>
                                          <p className="hero-stat-label">Project Profit Pool</p>
                                    </div>
                              </div>
                        </motion.div>
                  </div>
            </section>
      );
};

export default HeroSection;
