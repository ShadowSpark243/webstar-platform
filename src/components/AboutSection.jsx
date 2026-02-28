import React from 'react';
import { motion } from 'framer-motion';
import { Film, TrendingUp, MonitorPlay, Activity } from 'lucide-react';
import './AboutSection.css';

const AboutSection = () => {
      const stats = [
            { label: "Active Projects", value: "12+" },
            { label: "Volunteers", value: "8,500+" },
            { label: "Total Funding", value: "₹50Cr+" },
            { label: "Avg. Returns", value: "11.5%" }
      ];

      const features = [
            {
                  icon: <MonitorPlay className="text-primary" size={32} style={{ marginBottom: '1rem' }} />,
                  title: "Premium Content",
                  description: "We produce high-quality web series and blockbuster movies tailored for leading OTT platforms."
            },
            {
                  icon: <TrendingUp className="text-primary" size={32} style={{ marginBottom: '1rem' }} />,
                  title: "Multiple Revenue Streams",
                  description: "Profits generated through Subscriptions, Ads, Licensing, Satellite Rights, and Brand Integrations."
            },
            {
                  icon: <Film className="text-primary" size={32} style={{ marginBottom: '1rem' }} />,
                  title: "Project-Specific Funding",
                  description: "Your participation goes directly into content creation, not general company operations."
            },
            {
                  icon: <Activity className="text-primary" size={32} style={{ marginBottom: '1rem' }} />,
                  title: "Transparent Performance",
                  description: "Track project milestones, box office/OTT metrics, and profit distributions in real-time."
            }
      ];

      return (
            <section id="vision" className="about-section">
                  <div className="container">

                        <div className="about-layout">
                              <div className="about-content">
                                    <h2 className="section-title" style={{ textAlign: 'left' }}>
                                          Redefining <span className="text-gradient">Entertainment Participation</span>
                                    </h2>
                                    <p className="about-text">
                                          Our vision is to democratize content production. We operate a cutting-edge OTT platform and production house where the community funds the stories they want to see.
                                    </p>
                                    <p className="about-text">
                                          Unlike traditional models where studios keep all the profits, we distribute 20% of net profits back to the active network that helped fund the project.
                                    </p>

                                    <div className="about-stats-grid">
                                          {stats.map((stat, idx) => (
                                                <div key={idx} className="glass-panel about-stat-panel">
                                                      <span className="about-stat-value">{stat.value}</span>
                                                      <span className="about-stat-label">{stat.label}</span>
                                                </div>
                                          ))}
                                    </div>
                              </div>

                              <div className="about-image-container">
                                    <div className="about-image-glow"></div>
                                    <img
                                          src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop"
                                          alt="Film Production Setup"
                                          className="about-image"
                                    />

                                    <motion.div
                                          className="glass-panel about-floating-card"
                                          animate={{ y: [0, -10, 0] }}
                                          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                    >
                                          <div className="about-floating-icon">
                                                <TrendingUp />
                                          </div>
                                          <div>
                                                <p className="about-floating-data">₹85.2L</p>
                                                <p className="about-floating-label">Profit Distributed</p>
                                          </div>
                                    </motion.div>
                              </div>
                        </div>

                        <div className="grid grid-4" style={{ marginTop: '2rem' }}>
                              {features.map((feature, idx) => (
                                    <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, y: 20 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true }}
                                          transition={{ delay: idx * 0.1 }}
                                          className="glass-panel"
                                          style={{ padding: '2rem' }}
                                    >
                                          {feature.icon}
                                          <h3 className="feature-title">{feature.title}</h3>
                                          <p className="feature-desc">{feature.description}</p>
                                    </motion.div>
                              ))}
                        </div>

                  </div>
            </section>
      );
};

export default AboutSection;
