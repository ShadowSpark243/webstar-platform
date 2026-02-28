import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Trophy, Crown, Star } from 'lucide-react';
import './RanksSection.css';

const RanksSection = () => {
      const ranks = [
            {
                  title: "Manager",
                  icon: <Star size={32} color="#60a5fa" />,
                  volume: "₹15 Lakh",
                  cssClass: "manager"
            },
            {
                  title: "Senior Manager",
                  icon: <Trophy size={32} color="#c084fc" />,
                  volume: "₹50 Lakh",
                  cssClass: "senior"
            },
            {
                  title: "Director",
                  icon: <Crown size={32} color="#facc15" />,
                  volume: "₹1 Crore",
                  cssClass: "director"
            }
      ];

      return (
            <section id="ranks" className="ranks-section">
                  <div className="container">

                        {/* Ranks & Eligibility Title */}
                        <div className="section-header">
                              <h2 className="section-title">
                                    Leadership <span className="text-gradient">Rank Structure</span>
                              </h2>
                              <p className="section-subtitle">
                                    Climb the ranks by building massive network volume and unlock exclusive shares in the 10% Rank Achievement Pool.
                              </p>
                        </div>

                        {/* Ranks Cards */}
                        <div className="ranks-grid">
                              {ranks.map((rank, idx) => (
                                    <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, scale: 0.95 }}
                                          whileInView={{ opacity: 1, scale: 1 }}
                                          viewport={{ once: true }}
                                          transition={{ delay: idx * 0.1 }}
                                          className={`glass-panel rank-card ${rank.cssClass}`}
                                    >
                                          <div className={`rank-bg-gradient ${rank.cssClass}`}></div>

                                          <div className="rank-icon-container">
                                                {rank.icon}
                                          </div>
                                          <h3 className="rank-title">{rank.title}</h3>
                                          <p className="rank-subtitle">Team Volume Required</p>
                                          <div className="rank-volume">
                                                <span>{rank.volume}</span>
                                          </div>
                                    </motion.div>
                              ))}
                        </div>

                        {/* Eligibility Rules */}
                        <div className="glass-panel eligibility-rules">
                              <div className="eligibility-watermark">
                                    <ShieldCheck size={300} />
                              </div>

                              <h3 className="eligibility-title">
                                    <ShieldCheck className="text-primary" size={36} />
                                    Eligibility Rules
                              </h3>

                              <div className="eligibility-grid">
                                    <div>
                                          <h4 className="eligibility-section-title">Bonus Qualification</h4>
                                          <ul className="eligibility-list">
                                                <li><span className="text-primary">•</span> Maintain an active participation holding.</li>
                                                <li><span className="text-primary">•</span> Complete mandatory KYC verification.</li>
                                                <li><span className="text-primary">•</span> Active Platform ID status required at payout.</li>
                                          </ul>
                                    </div>

                                    <div>
                                          <h4 className="eligibility-section-title">Network Pool (10%)</h4>
                                          <ul className="eligibility-list">
                                                <li><span className="text-primary">•</span> Minimum personal participation of ₹1 Lakh.</li>
                                                <li><span className="text-primary">•</span> Active ID with no policy violations.</li>
                                                <li><span className="text-primary">•</span> Raising Awareness of our Brand with strictly <strong className="text-white">10,000 Volunteers</strong> only. You will remain with us until you make your full settlement.</li>
                                          </ul>
                                    </div>
                              </div>
                        </div>

                  </div>
            </section>
      );
};

export default RanksSection;
