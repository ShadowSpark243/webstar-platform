import React from 'react';
import { Lock, Fingerprint, Shield, Eye, Server, FileText, AlertTriangle, Globe, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionStyle = { marginBottom: '2.5rem' };
const h2Style = { fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const h3Style = { fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.5rem', color: 'rgba(255,255,255,0.85)', marginTop: '1.25rem' };
const pStyle = { marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.92rem' };
const liStyle = { marginBottom: '0.4rem', color: 'rgba(255,255,255,0.65)', fontSize: '0.9rem' };

const PrivacyPage = () => {
      return (
            <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: "'Inter', sans-serif", padding: '4rem 2rem' }}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>

                        <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '1rem', color: '#8b5cf6', marginBottom: '1.5rem' }}>
                                    <Lock size={32} />
                              </div>
                               <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Privacy Policy</h1>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>ITRAM WEBPRO — A product of ITRAM Management LLP</p>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Last updated: March 07, 2026</p>
                        </header>

                        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '1.5rem', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.8 }}>
                              
                              <section style={sectionStyle}>
                                    <p style={pStyle}><strong>ITRAM WEBPRO</strong> respects the privacy of its users and is committed to protecting personal information.</p>
                              </section>

                              {/* 1. Data Collection */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Eye size={20} /> 1. Data We Collect</h2>
                                    <p style={pStyle}>We collect the following categories of personal data ("Personal Data") when you use the Platform:</p>
                                    <h3 style={h3Style}>1.1 Information You Provide</h3>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}><strong>Identity Data:</strong> Full name, date of birth, gender, PAN card number, Aadhaar number (voluntary, per Supreme Court directive), passport or voter ID.</li>
                                          <li style={liStyle}><strong>Contact Data:</strong> Email address, mobile number, postal address.</li>
                                          <li style={liStyle}><strong>Financial Data:</strong> Bank account details (account number, IFSC code, bank name), UPI ID, transaction records, wallet balances.</li>
                                          <li style={liStyle}><strong>KYC Documents:</strong> Government-issued identity proofs, address proofs, and photographs as mandated by PMLA, 2002.</li>
                                    </ul>
                                    <h3 style={h3Style}>1.2 Data Collected Automatically</h3>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}><strong>Technical Data:</strong> IP address, browser type and version, device information, operating system, time zone settings.</li>
                                          <li style={liStyle}><strong>Usage Data:</strong> Pages visited, features used, click patterns, session duration, referral source.</li>
                                          <li style={liStyle}><strong>Cookie Data:</strong> Session cookies and analytical cookies (see Section 7).</li>
                                    </ul>
                              </section>

                              {/* 2. Purpose of Processing */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><FileText size={20} /> 2. Purpose of Data Processing</h2>
                                    <p style={pStyle}>We process your Personal Data for the following purposes as permitted under the DPDP Act, 2023:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}><strong>Account Management:</strong> Creating and maintaining your Platform account, verifying identity, and authenticating access.</li>
                                          <li style={liStyle}><strong>KYC & Regulatory Compliance:</strong> Fulfilling obligations under PMLA 2002, Foreign Exchange Management Act (FEMA), and Income Tax Act, 1961.</li>
                                          <li style={liStyle}><strong>Contribution Processing:</strong> Facilitating contributions to project SPVs, recording transactions, and distributing revenue shares.</li>
                                          <li style={liStyle}><strong>Withdrawal Processing:</strong> Verifying bank details, processing withdrawals, and deducting TDS/TCS.</li>
                                          <li style={liStyle}><strong>Communication:</strong> Sending transaction confirmations, project updates, platform notifications, and required legal notices.</li>
                                          <li style={liStyle}><strong>Fraud Prevention:</strong> Detecting and preventing fraudulent activity, money laundering, and unauthorized access in accordance with PMLA.</li>
                                          <li style={liStyle}><strong>Analytics & Improvement:</strong> Improving Platform performance, user experience, and developing new features.</li>
                                    </ul>
                              </section>

                              {/* 3. Legal Basis */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Shield size={20} /> 3. Legal Basis for Processing</h2>
                                    <p style={pStyle}>Under the DPDP Act, 2023, we process your data based on:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}><strong>Consent:</strong> Your explicit consent provided during registration and KYC submission.</li>
                                          <li style={liStyle}><strong>Contractual Necessity:</strong> Processing required to fulfill our obligations under the Terms of Service and revenue-sharing agreements.</li>
                                          <li style={liStyle}><strong>Legal Obligation:</strong> Compliance with PMLA, IT Act, Income Tax Act, Companies Act, and other applicable laws.</li>
                                          <li style={liStyle}><strong>Legitimate Use:</strong> Processing necessary for our legitimate business interests, as defined under Section 7 of the DPDP Act, 2023.</li>
                                    </ul>
                              </section>

                              {/* 4. Data Sharing */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Globe size={20} /> 4. Data Sharing & Disclosure</h2>
                                    <p style={pStyle}>We do <strong>NOT</strong> sell your personal data. We may share your data with:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}><strong>Payment Processors:</strong> Banks and payment gateways for processing deposits and withdrawals within India.</li>
                                          <li style={liStyle}><strong>KYC Verification Partners:</strong> Authorized verification agencies for PAN/Aadhaar verification.</li>
                                          <li style={liStyle}><strong>Project SPVs:</strong> Relevant contributor data shared with project-specific SPVs for revenue distribution.</li>
                                          <li style={liStyle}><strong>Legal Authorities:</strong> When required by court order, regulatory directive, or law enforcement (including FIU-IND for PMLA reporting).</li>
                                          <li style={liStyle}><strong>Tax Authorities:</strong> TDS/TCS certificates and PAN details shared with the Income Tax Department as required by law.</li>
                                          <li style={liStyle}><strong>Professional Advisors:</strong> Auditors, legal advisors, and compliance officers under strict confidentiality agreements.</li>
                                    </ul>
                                    <h3 style={h3Style}>4.1 Cross-Border Data Transfer</h3>
                                    <p style={pStyle}>Your data is primarily stored on servers located in India. If any data is transferred outside India, it shall be done in compliance with Section 16 of the DPDP Act, 2023, and only to jurisdictions approved by the Central Government or with adequate safeguards in place. We will not transfer data to any country restricted by the Government of India.</p>
                              </section>

                              {/* 5. Data Security */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Server size={20} /> 5. Data Security Measures</h2>
                                    <p style={pStyle}>In compliance with the IT (Reasonable Security Practices) Rules, 2011, we implement:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}><strong>Encryption:</strong> AES-256 encryption for data at rest; TLS 1.2+ for data in transit.</li>
                                          <li style={liStyle}><strong>Access Controls:</strong> Role-based access controls (RBAC) for admin users; multi-factor authentication (MFA) encouraged.</li>
                                          <li style={liStyle}><strong>Monitoring:</strong> Real-time intrusion detection, security incident logging, and automated threat alerting.</li>
                                          <li style={liStyle}><strong>Audit Trail:</strong> All administrative actions are cryptographically logged for accountability and regulatory audit.</li>
                                          <li style={liStyle}><strong>Data Minimization:</strong> We collect only the minimum data necessary for the stated purposes.</li>
                                    </ul>
                                    <p style={pStyle}>While we implement industry-standard security measures, no electronic transmission or storage method is 100% secure. We cannot guarantee absolute data security.</p>
                              </section>

                              {/* 6. Your Rights */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Fingerprint size={20} /> 6. Your Rights Under DPDP Act, 2023</h2>
                                    <p style={pStyle}>As a Data Principal under the DPDP Act, 2023, you have the following rights:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}><strong>Right to Access:</strong> Request confirmation of whether your data is being processed and obtain a summary of such data.</li>
                                          <li style={liStyle}><strong>Right to Correction:</strong> Request correction of inaccurate or incomplete personal data.</li>
                                          <li style={liStyle}><strong>Right to Erasure:</strong> Request deletion of your personal data, subject to legal retention requirements (PMLA mandates minimum 5-year retention of KYC records).</li>
                                          <li style={liStyle}><strong>Right to Withdraw Consent:</strong> Withdraw consent for processing at any time through your Profile Settings. Note: Withdrawal may affect your ability to use certain Platform features.</li>
                                          <li style={liStyle}><strong>Right to Grievance Redressal:</strong> File a complaint with our Grievance Officer (see Section 9) or with the Data Protection Board of India.</li>
                                          <li style={liStyle}><strong>Right to Nominate:</strong> Nominate an individual to exercise your rights in the event of your death or incapacity.</li>
                                    </ul>
                              </section>

                              {/* 7. Cookies */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}>7. Cookies & Tracking</h2>
                                    <p style={pStyle}>We use essential cookies for session management and authentication. Analytical cookies (if used) are deployed only with your explicit consent. You may manage cookie preferences through your browser settings. Disabling essential cookies may prevent you from using the Platform.</p>
                              </section>

                              {/* 8. Data Retention */}
                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Trash2 size={20} /> 8. Data Retention</h2>
                                    <p style={pStyle}>We retain your personal data for the following periods:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}><strong>Account Data:</strong> Duration of your account plus 3 years after account closure.</li>
                                          <li style={liStyle}><strong>KYC Records:</strong> Minimum 5 years after the business relationship ends, as mandated by PMLA, 2002.</li>
                                          <li style={liStyle}><strong>Transaction Records:</strong> Minimum 8 years as required under the Income Tax Act, 1961.</li>
                                          <li style={liStyle}><strong>Usage/Technical Data:</strong> Maximum 12 months from date of collection.</li>
                                    </ul>
                                    <p style={pStyle}>After the retention period, data is securely deleted or anonymized in accordance with our data disposal policies.</p>
                              </section>

                              {/* 9. Grievance Officer */}
                              <section style={{ marginBottom: '1rem' }}>
                                    <h2 style={h2Style}><Shield size={20} /> 9. Grievance Officer</h2>
                                    <p style={pStyle}>In accordance with Section 5(2) of the IT (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, and the DPDP Act, 2023, we have appointed a Grievance Officer:</p>
                                    <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem 1.25rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
                                          <strong style={{ color: 'white' }}>Grievance Officer</strong><br />
                                          ITRAM Management LLP<br />
                                          Email: <strong>grievance@itramwebpro.com</strong><br />
                                          Response Time: Within 24 hours of receipt. Resolution within 15 days as required by law.
                                    </div>
                                    <p style={{ ...pStyle, marginTop: '0.75rem' }}>If your grievance is not resolved satisfactorily, you may approach the Data Protection Board of India established under the DPDP Act, 2023.</p>
                              </section>

                              {/* Bottom banner */}
                              <div style={{ marginTop: '3rem', padding: '1.25rem', background: 'rgba(139, 92, 246, 0.05)', border: '1px solid rgba(139, 92, 246, 0.2)', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <Fingerprint size={24} style={{ color: '#8b5cf6', flexShrink: 0 }} />
                                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                                          ITRAM WEBPRO utilizes industry-standard encryption protocols (AES-256) for all identity-related data and financial transactions. For data-related inquiries, contact <strong>privacy@itramwebpro.com</strong>.
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

export default PrivacyPage;
