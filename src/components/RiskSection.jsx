import React from 'react';
import { AlertOctagon } from 'lucide-react';
import './RiskSection.css';

const RiskSection = () => {
      return (
            <section id="risk" className="risk-section">
                  <div className="risk-container">
                        <div className="risk-panel">
                              <div className="risk-bg-pattern"></div>

                              <div className="risk-content">
                                    <div className="risk-icon-wrapper">
                                          <AlertOctagon className="text-red-500" size={48} />
                                    </div>

                                    <div className="risk-text-area">
                                          <h2 className="risk-title">
                                                Important Risk Disclosure
                                          </h2>
                                          <p className="risk-intro">
                                                Before participating in this Network Incentive Model, you must read, understand, and accept the high-risk nature of content production financing.
                                          </p>

                                          <div className="risk-grid">
                                                <div className="risk-item">
                                                      <strong className="risk-item-title">High Risk Industry</strong>
                                                      <span className="risk-item-desc">Content production is high-risk. Market trends shift rapidly, and past success does not dictate future results.</span>
                                                </div>

                                                <div className="risk-item">
                                                      <strong className="risk-item-title">Returns Not Guaranteed</strong>
                                                      <span className="risk-item-desc">Revenue depends entirely on market performance (views, ads, rights sold). Fixed Bonus is strictly not guaranteed.</span>
                                                </div>

                                                <div className="risk-item">
                                                      <strong className="risk-item-title">Actual Realized Profits</strong>
                                                      <span className="risk-item-desc">Profit distribution occurs ONLY from actual realized NET profit of a specific project. Loss-making projects distribute 0%.</span>
                                                </div>

                                                <div className="risk-item">
                                                      <strong className="risk-item-title">Regulatory Compliance</strong>
                                                      <span className="risk-item-desc">We operate transparently. Consult your legal/financial advisor regarding your Participation Scheme.</span>
                                                </div>
                                          </div>
                                    </div>
                              </div>
                        </div>
                  </div>
            </section>
      );
};

export default RiskSection;
