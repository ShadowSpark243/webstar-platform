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
                                                Important Risk Disclosure & Regulatory Notice
                                          </h2>
                                          <p className="risk-intro">
                                                Before contributing to any project on this platform, you must read, understand, and accept the high-risk nature of content production financing.
                                          </p>

                                          <div className="risk-grid">
                                                <div className="risk-item">
                                                      <strong className="risk-item-title">High Risk Industry</strong>
                                                      <span className="risk-item-desc">Content production is inherently high-risk. Market trends shift rapidly, and past performance of projects does not indicate future results. There is a real possibility of partial or total loss of contribution.</span>
                                                </div>

                                                <div className="risk-item">
                                                      <strong className="risk-item-title">Revenue Share NOT Guaranteed</strong>
                                                      <span className="risk-item-desc">Revenue depends entirely on market performance (views, ads, OTT licensing, rights sold). Monthly revenue share is strictly NOT guaranteed. Projects that do not generate revenue will distribute ₹0.</span>
                                                </div>

                                                <div className="risk-item">
                                                      <strong className="risk-item-title">Actual Realized Revenue Only</strong>
                                                      <span className="risk-item-desc">Revenue distribution occurs ONLY from actual realized NET revenue of a specific project. Loss-making projects distribute 0%. Principal contribution may be at risk.</span>
                                                </div>

                                                <div className="risk-item">
                                                      <strong className="risk-item-title">Not a Collective Investment Scheme</strong>
                                                      <span className="risk-item-desc">This platform operates on a private, project-specific SPV (Special Purpose Vehicle) model with revenue-sharing contracts. This is NOT a Collective Investment Scheme (CIS) under SEBI regulations. Each project is funded through a separate legal entity.</span>
                                                </div>

                                                <div className="risk-item">
                                                      <strong className="risk-item-title">Regulatory Compliance</strong>
                                                      <span className="risk-item-desc">ITRAM WEBPRO operates under the Companies Act 2013 / LLP Act 2008. Contributions are structured as revenue-sharing arrangements, not securities. This platform is not regulated by SEBI or RBI. Consult your legal and financial advisor before contributing.</span>
                                                </div>

                                                <div className="risk-item">
                                                      <strong className="risk-item-title">KYC & AML Compliance</strong>
                                                      <span className="risk-item-desc">All contributors must complete mandatory KYC (Aadhaar + PAN verification) as required under the Prevention of Money Laundering Act (PMLA) and RBI guidelines. Funds are accepted only from verified participants.</span>
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
