import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, Clapperboard, Coins, Users, FileText } from 'lucide-react';
import './HowItWorksSection.css';

const HowItWorksSection = () => {
      const steps = [
            {
                  num: '01',
                  icon: <Wallet className="text-white" size={24} />,
                  title: "Project Funding Contribution",
                  desc: "Contributors fund specific upcoming web series or movie projects through a dedicated SPV (LLP/Company). Minimum contribution: ₹1,00,000."
            },
            {
                  num: '02',
                  icon: <Clapperboard className="text-white" size={24} />,
                  title: "Content Production",
                  desc: "Capital is deployed exclusively for writing, casting, shooting, and post-production of the selected project through the project SPV."
            },
            {
                  num: '03',
                  icon: <Users className="text-white" size={24} />,
                  title: "Release & Revenue",
                  desc: "Project generates revenue through OTT licensing, theatrical release, satellite TV rights, music rights, and brand integrations."
            },
            {
                  num: '04',
                  icon: <Coins className="text-white" size={24} />,
                  title: "Revenue Distribution",
                  desc: "20% of net project revenue is distributed to contributors and rank achievers. 80% is retained for company growth and operations."
            }
      ];

      return (
            <section id="how-it-works" className="hiw-section">
                  <div className="container" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <h2 className="section-title">
                              How the <span className="text-gradient">Project Model</span> Works
                        </h2>
                        <p className="section-subtitle">
                              A transparent workflow from initial funding to revenue distribution — structured through legally compliant SPVs.
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
