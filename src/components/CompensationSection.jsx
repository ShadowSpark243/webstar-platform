import React from 'react';
import { motion } from 'framer-motion';
import { Network, Gem, AlertTriangle, ArrowUpRight } from 'lucide-react';
import './CompensationSection.css';

const CompensationSection = () => {
      const levels = [
            { level: '1 (Direct)', percent: '5%' },
            { level: '2', percent: '2%' },
            { level: '3', percent: '0.5%' },
            { level: '4', percent: '0.5%' },
            { level: '5', percent: '0.5%' }
      ];

      return (
            <section id="compensation" className="comp-section">
                  <div className="comp-bg-glow"></div>

                  <div className="container" style={{ position: 'relative', zIndex: 10 }}>
                        <div className="section-header">
                              <h2 className="section-title">
                                    Industry-Leading <span className="text-gradient">Compensation Plan</span>
                              </h2>
                              <p className="section-subtitle">
                                    Multiple avenues to benefit from our content's success, rewarding both personal contribution and network building.
                              </p>
                        </div>

                        <div className="grid grid-2" style={{ marginBottom: '2rem' }}>

                              {/* Level Commission */}
                              <motion.div
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="glass-panel comp-panel"
                              >
                                    <div className="comp-panel-icon-bg">
                                          <Network size={100} />
                                    </div>

                                    <h3 className="comp-title-flex">
                                          <Network className="text-primary" />
                                          8.5% Referral Commission
                                    </h3>
                                    <p className="comp-text">
                                          Paid upon new successful contributions into your network hierarchy. One-time payout per contribution, distributed across 5 levels.
                                    </p>

                                    <div className="comp-table">
                                          <div className="comp-table-row comp-table-header">
                                                <span>Level</span>
                                                <span>Percentage</span>
                                          </div>
                                          {levels.map((lvl, index) => (
                                                <div key={index} className="comp-table-row">
                                                      <span>Level {lvl.level}</span>
                                                      <span className="comp-percent">{lvl.percent}</span>
                                                </div>
                                          ))}
                                          <div className="comp-table-row comp-table-footer">
                                                <span>Total Payout</span>
                                                <span className="text-primary">8.5%</span>
                                          </div>
                                    </div>
                              </motion.div>

                              {/* Monthly Revenue Share */}
                              <motion.div
                                    initial={{ opacity: 0, x: 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    className="glass-panel comp-panel"
                              >
                                    <div className="comp-panel-icon-bg">
                                          <Gem size={100} />
                                    </div>

                                    <h3 className="comp-title-flex">
                                          <Gem className="text-primary" />
                                          Up to 1% Monthly Revenue Share
                                    </h3>

                                    <div className="comp-alert">
                                          <AlertTriangle className="text-primary" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                          <p className="comp-alert-text">
                                                "Monthly revenue share is paid up to 1% based on actual revenue generated from active projects. This is performance-based and NOT guaranteed. Zero revenue means zero distribution."
                                          </p>
                                    </div>

                                    <div className="comp-list">
                                          <div className="comp-list-item">
                                                <ArrowUpRight className="text-accent" />
                                                <p>Projected Annual Revenue Share: Up to <strong className="text-white">12%</strong> <em style={{ opacity: 0.6, fontSize: '0.85em' }}>(subject to project performance)</em></p>
                                          </div>
                                          <div className="comp-list-item">
                                                <ArrowUpRight className="text-accent" />
                                                <p>Paid exclusively from actual <strong className="text-white">project revenue</strong> — OTT licensing, satellite rights, theatrical, and more.</p>
                                          </div>
                                          <div className="comp-list-item">
                                                <ArrowUpRight className="text-accent" />
                                                <p>Example: Contribute <strong className="text-white">₹1,00,000</strong> → Receive up to <strong className="text-white">₹1,000/month</strong> if project generates sufficient revenue.</p>
                                          </div>
                                    </div>
                              </motion.div>
                        </div>

                        {/* Revenue Split Pools */}
                        <motion.div
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              className="glass-panel"
                        >
                              <div className="comp-split-header">
                                    <h3 className="comp-split-title">20% Project Revenue Split</h3>
                                    <p className="text-muted">Distributed from the Net Revenue of every successful Web Series or Movie, based on actual project earnings.</p>
                              </div>

                              <div className="comp-split-grid">
                                    <div className="comp-split-divider"></div>

                                    <div className="comp-pool">
                                          <div className="comp-pool-circle accent">10%</div>
                                          <h4 className="comp-pool-title">Network Revenue Pool</h4>
                                          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                Distributed among verified contributors (Min ₹1L). Weighted fairly: 50% Personal Contribution + 50% Network Volume.
                                          </p>
                                    </div>

                                    <div className="comp-pool">
                                          <div className="comp-pool-circle primary">10%</div>
                                          <h4 className="comp-pool-title">Rank Achievement Pool</h4>
                                          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                Exclusive to Top Achievers. Distributed equally or tiered based on leadership ranks (Manager, Senior Manager, Director).
                                          </p>
                                    </div>
                              </div>
                        </motion.div>

                  </div>
            </section>
      );
};

export default CompensationSection;
