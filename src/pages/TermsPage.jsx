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
                               <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Terms & Conditions</h1>
                              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>(Media Project Participation Platform)</p>
                              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Last updated: March 07, 2026</p>
                        </header>

                        <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '1.5rem', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)', lineHeight: 1.8 }}>
                              
                              <section style={sectionStyle}>
                                    <p style={pStyle}>Welcome to <strong>ITRAM WEBPRO</strong>, operated by <strong>ITRAM Management LLP</strong> (“Company”, “we”, “our”, or “us”).</p>
                                    <p style={pStyle}>This platform enables verified participants to <strong>support and participate in film, web series, and digital media productions</strong>.</p>
                                    <p style={pStyle}>By accessing or using the platform, you agree to the following Terms and Conditions.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><BookOpen size={20} /> 1. Platform Purpose</h2>
                                    <p style={pStyle}>The platform facilitates <strong>participation in media production projects</strong>, including:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>Films</li>
                                          <li style={liStyle}>Web series</li>
                                          <li style={liStyle}>OTT content</li>
                                          <li style={liStyle}>Digital media productions</li>
                                    </ul>
                                    <p style={pStyle}>Participants may support projects through structured <strong>project participation agreements</strong> with production entities.</p>
                                    <p style={pStyle}>Funds collected for a project are utilized for the <strong>development, production, marketing, and distribution of media content</strong>.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Users size={20} /> 2. Eligibility</h2>
                                    <p style={pStyle}>To use the platform, users must:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>Be <strong>18 years or older</strong></li>
                                          <li style={liStyle}>Complete required <strong>identity verification (KYC)</strong></li>
                                          <li style={liStyle}>Provide accurate personal information</li>
                                          <li style={liStyle}>Agree to applicable agreements related to project participation</li>
                                    </ul>
                                    <p style={pStyle}>The company reserves the right to approve or decline registrations at its discretion.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Landmark size={20} /> 3. Project Participation Structure</h2>
                                    <p style={pStyle}>Participation in projects may occur through legally structured arrangements such as:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}><strong>Special Purpose Production Entities (SPV / LLP)</strong></li>
                                          <li style={liStyle}><strong>Project participation agreements</strong></li>
                                          <li style={liStyle}><strong>Revenue participation arrangements</strong></li>
                                    </ul>
                                    <p style={pStyle}>Each project may have its own participation structure and documentation describing:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>Project details</li>
                                          <li style={liStyle}>Contribution structure</li>
                                          <li style={liStyle}>Revenue participation terms</li>
                                          <li style={liStyle}>Distribution timeline</li>
                                    </ul>
                                    <p style={pStyle}>Participants will receive relevant project documentation before confirming participation.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><FileText size={20} /> 4. Project Revenue Sources</h2>
                                    <p style={pStyle}>Media projects may generate revenue through various commercial channels, including:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>OTT platform licensing</li>
                                          <li style={liStyle}>Theatrical distribution</li>
                                          <li style={liStyle}>Satellite television broadcasting</li>
                                          <li style={liStyle}>Music rights licensing</li>
                                          <li style={liStyle}>Brand partnerships and product placements</li>
                                          <li style={liStyle}>International distribution</li>
                                          <li style={liStyle}>Digital platform streaming</li>
                                          <li style={liStyle}>Merchandise and related rights</li>
                                    </ul>
                                    <p style={pStyle}>Revenue allocation is governed by the respective project agreements.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Scale size={20} /> 5. Revenue Participation</h2>
                                    <p style={pStyle}>Participants may receive a share of project-generated revenue according to the specific project participation agreement.</p>
                                    <p style={pStyle}>Media production operates within a dynamic entertainment industry environment and participation outcomes are <strong>subject to market conditions and commercial performance</strong>.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Landmark size={20} /> 6. Use of Project Funds</h2>
                                    <p style={pStyle}>Funds collected for projects may be utilized for activities including:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>Script development</li>
                                          <li style={liStyle}>Production costs</li>
                                          <li style={liStyle}>Post-production</li>
                                          <li style={liStyle}>Marketing and promotion</li>
                                          <li style={liStyle}>Distribution and licensing</li>
                                          <li style={liStyle}>Platform and operational support</li>
                                    </ul>
                                    <p style={pStyle}>All activities are managed under professional production supervision.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Shield size={20} /> 7. Platform Role</h2>
                                    <p style={pStyle}>The platform acts as a <strong>technology and coordination interface</strong> connecting participants with media production projects.</p>
                                    <p style={pStyle}>The platform facilitates:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>Project information access</li>
                                          <li style={liStyle}>Participant onboarding</li>
                                          <li style={liStyle}>Communication between production teams and participants</li>
                                          <li style={liStyle}>Project updates and reporting</li>
                                    </ul>
                                    <p style={pStyle}>The platform does not function as a banking institution, stock exchange, or regulated financial marketplace.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><FileText size={20} /> 8. Intellectual Property</h2>
                                    <p style={pStyle}>All intellectual property related to the platform and media projects, including:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>Scripts</li>
                                          <li style={liStyle}>Visual content</li>
                                          <li style={liStyle}>Branding</li>
                                          <li style={liStyle}>Technology</li>
                                          <li style={liStyle}>Production materials</li>
                                    </ul>
                                    <p style={pStyle}>remains the property of the Company or its licensors unless otherwise stated in written agreements. Unauthorized reproduction or commercial use is prohibited.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Scale size={20} /> 9. Account Security</h2>
                                    <p style={pStyle}>Users are responsible for safeguarding their account credentials. The company shall not be responsible for unauthorized access resulting from user negligence or improper handling of login credentials.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Shield size={20} /> 10. Compliance</h2>
                                    <p style={pStyle}>All platform activities are conducted in accordance with applicable Indian laws including:</p>
                                    <ul style={{ paddingLeft: '1.5rem' }}>
                                          <li style={liStyle}>The Companies Act</li>
                                          <li style={liStyle}>The Limited Liability Partnership Act</li>
                                          <li style={liStyle}>The Indian Contract Act</li>
                                          <li style={liStyle}>Applicable digital platform regulations</li>
                                    </ul>
                                    <p style={pStyle}>Participation may be limited to <strong>verified individuals through private agreements</strong>.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><AlertTriangle size={20} /> 11. Limitation of Liability</h2>
                                    <p style={pStyle}>Media production and distribution involve creative and commercial variables.</p>
                                    <p style={pStyle}>Participation in projects through the platform is <strong>subject to industry performance, audience response, and market conditions</strong>.</p>
                                    <p style={pStyle}>The Company commits to managing projects with professional care and transparency.</p>
                              </section>

                              <section style={sectionStyle}>
                                    <h2 style={h2Style}><Clock size={20} /> 12. Changes to Terms</h2>
                                    <p style={pStyle}>The Company reserves the right to update these Terms periodically. Continued use of the platform after updates constitutes acceptance of revised Terms.</p>
                              </section>

                              <section style={{ marginBottom: '1rem' }}>
                                    <h2 style={h2Style}><Scale size={20} /> 13. Governing Law</h2>
                                    <p style={pStyle}>These Terms are governed by the laws of <strong>India</strong>. Any disputes shall fall under the jurisdiction of courts located in <strong>Mumbai, Maharashtra</strong>.</p>
                              </section>

                              <div style={{ marginTop: '3rem', padding: '1.25rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <FileText className="text-primary" />
                                    <span style={{ fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                                          For questions regarding these Terms, contact us at <strong>support@itramwebpro.com</strong>.
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
