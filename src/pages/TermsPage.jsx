import React from 'react';
import { Scale, FileText, AlertTriangle, Shield, Landmark, Users, Clock, Ban, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionStyle = { marginBottom: '2.5rem' };
const h2Style = { fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const h3Style = { fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'rgba(255,255,255,0.85)', marginTop: '1.25rem' };
const pStyle = { marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.92rem' };
const liStyle = { marginBottom: '0.4rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' };
const disclaimerBox = {
      padding: '1.25rem',
      background: 'rgba(239, 68, 68, 0.06)',
      border: '1px solid rgba(239, 68, 68, 0.25)',
      borderRadius: '0.75rem',
      marginBottom: '2rem',
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-start'
};

const TermsPage = () => {
      return (
            <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: "'Inter', sans-serif", padding: '4rem 2rem' }}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>

                        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '1rem', color: '#3b82f6', marginBottom: '1.5rem' }}>
                                    <Scale size={32} />
                              </div>
                              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Terms of Service</h1>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>ITRAM WEBPRO — A product of ITRAM Management LLP</p>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Last updated: March 06, 2026 | Effective Date: March 06, 2026</p>
                        </header>

                        {/* Critical Disclaimer */}
                        <div style={disclaimerBox}>
                              <AlertTriangle size={22} style={{ color: '#ef4444', flexShrink: 0, marginTop: '2px' }} />
                              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                                    <strong style={{ color: '#ef4444' }}>IMPORTANT LEGAL NOTICE:</strong> ITRAM WEBPRO is <strong>NOT</strong> a Collective
                                    Investment Scheme (CIS) under SEBI (Collective Investment Schemes) Regulations, 1999, and is <strong>NOT</strong> regulated
                                    by the Securities and Exchange Board of India (SEBI) or the Reserve Bank of India (RBI). Contributions made through this
                                    platform are structured as <strong>revenue-sharing agreements</strong> under individual Special Purpose Vehicles (SPVs) and
                                    do <strong>NOT</strong> constitute securities, deposits, or guaranteed financial instruments. <strong>Returns are NOT guaranteed.</strong>
                              </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '1.5rem', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.8 }}>

                              {/* 1. Acceptance */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><BookOpen size={20} /> 1. Acceptance of Terms</h2>
                                    <p style={pStyle}>By registering on, accessing, or using the ITRAM WEBPRO platform ("Platform"), operated by ITRAM Management LLP, a Limited Liability Partnership registered under the Limited Liability Partnership Act, 2008, with its registered office in India ("Company", "we", "us"), you ("User", "Contributor", "you") agree to be bound by these Terms of Service ("Terms"), our Privacy Policy, and all applicable Indian laws. If you do not agree, you must immediately cease using the Platform.</p>
                                    <p style={pStyle}>These Terms constitute a legally binding agreement between you and the Company. By clicking "I Agree", creating an account, or making any contribution, you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety.</p>
                              </section>

                              {/* 2. Nature of the Platform */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Landmark size={20} /> 2. Nature of the Platform & SPV Structure</h2>
                                    <p style={pStyle}>ITRAM WEBPRO operates as a technology platform that facilitates contributions to content production projects (films, web series, OTT content) through a <strong>Special Purpose Vehicle (SPV)</strong> model.</p>
                                    <h3 style={h3Style}>2.1 SPV Structure</h3>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>Each content project listed on the Platform is managed through a separate SPV entity (LLP or Private Limited Company) created specifically for that project.</li>
                                          <li style={liStyle}>Contributors participate in a <strong>revenue-sharing arrangement</strong> with the project-specific SPV, NOT an equity or debt instrument.</li>
                                          <li style={liStyle}>Revenue shares are distributed based on actual net revenue generated by the completed project through OTT licensing, theatrical distribution, satellite rights, music rights, brand placements, and allied revenues.</li>
                                    </ul>
                                    <h3 style={h3Style}>2.2 Non-Investment Disclaimer</h3>
                                    <p style={pStyle}>Contributions made through this Platform are <strong>NOT</strong> investments in securities as defined under the Securities Contracts (Regulation) Act, 1956, or the SEBI Act, 1992. The Platform does not offer any deposit scheme, chit fund, or financial instrument. The Company is not a Non-Banking Financial Company (NBFC) and does not accept deposits under the Companies Act, 2013.</p>
                              </section>

                              {/* 3. Eligibility */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Users size={20} /> 3. Eligibility & KYC</h2>
                                    <p style={pStyle}>To use the Platform, you must:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>Be at least 18 years of age and a resident of India.</li>
                                          <li style={liStyle}>Complete Know Your Customer (KYC) verification as required under the Prevention of Money Laundering Act, 2002 (PMLA) and related RBI/SEBI guidelines.</li>
                                          <li style={liStyle}>Provide a valid PAN card, Aadhaar (optional, per Supreme Court guidelines), bank account, and other identity documents as requested.</li>
                                          <li style={liStyle}>Provide accurate and truthful information. Any misrepresentation may result in account termination and forfeiture of pending revenue shares.</li>
                                    </ul>
                                    <p style={pStyle}>The Company reserves the right to refuse or revoke access if KYC verification fails or if suspicious activity is detected in compliance with PMLA obligations.</p>
                              </section>

                              {/* 4. Risk Factors */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><AlertTriangle size={20} /> 4. Risk Factors & Disclaimers</h2>
                                    <div style={{ ...disclaimerBox, marginTop: '0.5rem' }}>
                                          <AlertTriangle size={18} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
                                          <p style={{ margin: 0, fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                                                Content production is inherently high-risk. You may lose part or all of your contribution. Past project performance does not guarantee future results.
                                          </p>
                                    </div>
                                    <p style={pStyle}>By contributing, you acknowledge the following risks:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}><strong>Production Risk:</strong> Projects may be delayed, abandoned, or fail to complete due to creative, financial, regulatory, or force majeure events.</li>
                                          <li style={liStyle}><strong>Market Risk:</strong> Completed content may not generate expected revenue from OTT platforms, theatrical releases, or other distribution channels.</li>
                                          <li style={liStyle}><strong>Revenue Uncertainty:</strong> Revenue share percentages shown on the Platform are <strong>projections only</strong> and are NOT guaranteed. Actual revenue may be zero.</li>
                                          <li style={liStyle}><strong>Liquidity Risk:</strong> Contributions are locked for the stated project duration and cannot be withdrawn early under normal circumstances.</li>
                                          <li style={liStyle}><strong>Regulatory Risk:</strong> Changes in Indian tax law, entertainment regulations, or content censorship rules (CBFC/MIB) may adversely affect project outcomes.</li>
                                          <li style={liStyle}><strong>Platform Risk:</strong> The Platform is a technology intermediary. Technical failures, cyber attacks, or operational issues may temporarily affect access.</li>
                                    </ul>
                              </section>

                              {/* 5. Contributions & Revenue Share */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Scale size={20} /> 5. Contributions & Revenue Distribution</h2>
                                    <h3 style={h3Style}>5.1 Making Contributions</h3>
                                    <p style={pStyle}>All contributions must be made through the Platform's approved payment methods. Each contribution is recorded against the specific project SPV. The minimum contribution amount, projected revenue share percentage, and project duration are displayed at the time of contribution.</p>
                                    <h3 style={h3Style}>5.2 Revenue Distribution</h3>
                                    <p style={pStyle}>Revenue distribution occurs based on the actual net revenue received by the project SPV after deducting production costs, distribution fees, taxes, and other applicable expenses. Revenue shares are credited to your Revenue Share Wallet on the Platform and are subject to applicable TDS/TCS as per the Income Tax Act, 1961.</p>
                                    <h3 style={h3Style}>5.3 Referral Commissions</h3>
                                    <p style={pStyle}>The Platform operates a multi-level referral commission structure. Commissions are paid from the operational budget and NOT from contributors' capital. Commission disbursement is subject to the Company's discretion and may be modified or discontinued.</p>
                              </section>

                              {/* 6. Withdrawals */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Clock size={20} /> 6. Withdrawals & Wallet Policy</h2>
                                    <p style={pStyle}>Withdrawals are subject to:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>Completed KYC verification as mandated under PMLA.</li>
                                          <li style={liStyle}>Minimum withdrawal threshold as displayed on the Platform.</li>
                                          <li style={liStyle}>Admin review for anti-money laundering (AML) compliance within 48 working hours.</li>
                                          <li style={liStyle}>Tax Deducted at Source (TDS) as applicable under the Income Tax Act, 1961.</li>
                                          <li style={liStyle}>Bank account must match the name on your KYC documents.</li>
                                    </ul>
                                    <p style={pStyle}>The Company reserves the right to withhold, delay, or refuse withdrawals if suspicious activity is detected or if required by law enforcement / regulatory authorities.</p>
                              </section>

                              {/* 7. Intellectual Property */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Shield size={20} /> 7. Intellectual Property</h2>
                                    <p style={pStyle}>All content, designs, logos, trademarks, and technology on the Platform are the intellectual property of ITRAM Management LLP or its licensors. Contributors do NOT acquire any copyright, trademark, or IP rights over the content produced by projects they have contributed to. Revenue share is purely financial participation in project proceeds.</p>
                              </section>

                              {/* 8. Termination */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Ban size={20} /> 8. Termination & Account Suspension</h2>
                                    <p style={pStyle}>The Company may terminate or suspend your account without prior notice if:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>You breach any provision of these Terms.</li>
                                          <li style={liStyle}>KYC documents are found to be forged, expired, or fraudulent.</li>
                                          <li style={liStyle}>Suspicious activity is detected that may constitute money laundering (PMLA) or fraud.</li>
                                          <li style={liStyle}>Required by a court order, regulatory directive, or law enforcement agency.</li>
                                    </ul>
                                    <p style={pStyle}>Upon termination, pending revenue shares (if any) will be processed subject to applicable laws. Contributions locked in active projects will follow the project SPV's terms.</p>
                              </section>

                              {/* 9. Governing Law */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Landmark size={20} /> 9. Governing Law & Dispute Resolution</h2>
                                    <p style={pStyle}>These Terms are governed by and construed in accordance with the laws of India. Any dispute arising from these Terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra.</p>
                                    <p style={pStyle}>Before initiating litigation, parties agree to attempt resolution through mediation under the Mediation Act, 2023, or through arbitration under the Arbitration and Conciliation Act, 1996, at the seat of Mumbai.</p>
                              </section>

                              {/* 10. Limitation of Liability */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}>10. Limitation of Liability</h2>
                                    <p style={pStyle}>To the maximum extent permitted by applicable Indian law, the Company, its directors, partners, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of revenue, data, or goodwill, arising from your use of the Platform or any contribution made through it.</p>
                                    <p style={pStyle}>The Company's total aggregate liability shall not exceed the amount actually contributed by the User to the specific project giving rise to the claim.</p>
                              </section>

                              {/* 11. Amendments */}
                              <section style={{ marginBottom: '1rem' }}>
                                    <h2 style={h2Style}>11. Amendments</h2>
                                    <p style={pStyle}>The Company reserves the right to modify these Terms at any time. Material changes will be notified via email or Platform notification at least 15 days before taking effect. Continued use of the Platform after such notification constitutes acceptance of the revised Terms.</p>
                              </section>

                              {/* Contact */}
                              <div style={{ marginTop: '3rem', padding: '1.25rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <FileText className="text-primary" />
                                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                                          For questions regarding these Terms, contact us at <strong>legal@itramwebpro.com</strong> or write to: ITRAM Management LLP, Registered Office, India.
                                    </span>
                              </div>
                        </div>

                        <footer style={{ marginTop: '3rem', textAlign: 'center' }}>
                              <button onClick={() => window.history.back()} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                                    Go Back
                              </button>
                        </footer>
                  </motion.div>
            </div>
      );
};

export default TermsPage;
