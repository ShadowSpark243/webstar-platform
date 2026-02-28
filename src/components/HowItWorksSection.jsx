import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clapperboard, Coins, Users } from 'lucide-react';
import './HowItWorksSection.css';

const HowItWorksSection = () => {
      const steps = [
            {
                  num: '01',
                  icon: <Wallet className="text-white" size={24} />,
                  title: "Capital Contribution",
                  desc: "Volunteers contribute capital (Min ₹1,00,000) to fund specific upcoming web series or movie projects."
            },
            {
                  num: '02',
                  icon: <Clapperboard className="text-white" size={24} />,
                  title: "Content Production",
                  desc: "Capital is deployed exclusively for writing, casting, shooting, and post-production of the selected project."
            },
            {
                  num: '03',
                  icon: <Users className="text-white" size={24} />,
                  title: "Release & Revenue",
                  desc: "Project generates revenue through Subscriptions, Ads, Licensing, and Brand Integrations."
            },
            {
                  num: '04',
                  icon: <Coins className="text-white" size={24} />,
                  title: "Profit Sharing",
                  desc: "20% of net profit is distributed to the Network and Rank Achievers. 80% is retained for company growth."
            }
      ];

      return (
            <section id="how-it-works" className="hiw-section">
                  <div className="container" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 className="section-title">
                              How the <span className="text-gradient">Project Model</span> Works
                        </h2>
                        <p className="section-subtitle">
                              A transparent workflow from initial funding to final profit distribution.
                        </p>
                  </div>

                  <div className="container" style={{ position: 'relative' }}>
                        <div className="hiw-line"></div>

                        <div className="hiw-grid">
                              {steps.map((step, idx) => (
                                    <motion.div
                                          key={idx}
                                          initial={{ opacity: 0, y: 30 }}
                                          whileInView={{ opacity: 1, y: 0 }}
                                          viewport={{ once: true, margin: "-100px" }}
                                          transition={{ duration: 0.5, delay: idx * 0.15 }}
                                          className="hiw-step"
                                    >
                                          <div className="hiw-icon-wrapper">
                                                <div className="hiw-icon-bg">
                                                      {step.icon}
                                                      <span className="hiw-number">{step.num}</span>
                                                </div>
                                                <div className="hiw-icon-glow"></div>
                                          </div>

                                          <h3 className="hiw-title">{step.title}</h3>
                                          <p className="hiw-desc">{step.desc}</p>
                                    </motion.div>
                              ))}
                        </div>
                  </div>
            </section>
      );
};

export default HowItWorksSection;
