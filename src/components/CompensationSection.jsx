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
                                    Multiple avenues to earn from our content’s success, rewarding both personal participation and network building.
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
                                          8.5% Level Commission
                                    </h3>
                                    <p className="comp-text">
                                          Paid instantly upon new successful participations into your network hierarchy. One-time payout per participation.
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

                              {/* Monthly Bonus */}
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
                                          1% Monthly Bonus
                                    </h3>

                                    <div className="comp-alert">
                                          <AlertTriangle className="text-primary" size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
                                          <p className="comp-alert-text">
                                                "Monthly bonuses are paid up to 1% based on profit availability from active projects. Bonuses are performance-based and not guaranteed."
                                          </p>
                                    </div>

                                    <div className="comp-list">
                                          <div className="comp-list-item">
                                                <ArrowUpRight className="text-accent" />
                                                <p>Target Annual Bonus: <strong className="text-white">12%</strong></p>
                                          </div>
                                          <div className="comp-list-item">
                                                <ArrowUpRight className="text-accent" />
                                                <p>Paid exclusively from actual <strong className="text-white">active project profits</strong>.</p>
                                          </div>
                                          <div className="comp-list-item">
                                                <ArrowUpRight className="text-accent" />
                                                <p>Example: Participate with <strong className="text-white">₹1,00,000</strong> → Receive up to <strong className="text-white">₹1,000/month</strong> if profitable.</p>
                                          </div>
                                    </div>
                              </motion.div>
                        </div>

                        {/* Profit Split Pools */}
                        <motion.div
                              initial={{ opacity: 0, y: 30 }}
                              whileInView={{ opacity: 1, y: 0 }}
                              viewport={{ once: true }}
                              className="glass-panel"
                        >
                              <div className="comp-split-header">
                                    <h3 className="comp-split-title">20% Project Profit Split</h3>
                                    <p className="text-muted">Distributed from the Net Profit of every successful Web Series or Movie.</p>
                              </div>

                              <div className="comp-split-grid">
                                    <div className="comp-split-divider"></div>

                                    <div className="comp-pool">
                                          <div className="comp-pool-circle accent">10%</div>
                                          <h4 className="comp-pool-title">Network Profit Pool</h4>
                                          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                Distributed among the first 10,000 volunteers (Min ₹1L). Weighted fairly: 50% Personal Participation + 50% Network Volume.
                                          </p>
                                    </div>

                                    <div className="comp-pool">
                                          <div className="comp-pool-circle primary">10%</div>
                                          <h4 className="comp-pool-title">Rank Achievement Pool</h4>
                                          <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                                                Exclusive to Top 100 Achievers. Distributed equally or tiered based on leadership ranks (Manager, Senior Manager, Director).
                                          </p>
                                    </div>
                              </div>
                        </motion.div>

                  </div>
            </section>
      );
};

export default CompensationSection;
