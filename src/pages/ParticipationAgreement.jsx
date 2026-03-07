import React from 'react';
import { FileText, Shield, Scale, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionStyle = { marginBottom: '2rem' };
const h2Style = { fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const pStyle = { marginBottom: '0.75rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: '1.6' };

const ParticipationAgreement = () => {
    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: "'Inter', sans-serif", padding: '4rem 2rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '1rem', color: '#10b981', marginBottom: '1.5rem' }}>
                        <FileText size={32} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Project Participation Agreement</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>Media Production Funding & Revenue Sharing</p>
                </header>

                <div className="glass-panel" style={{ padding: '2.5rem', borderRadius: '1.5rem', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <section style={sectionStyle}>
                        <h2 style={h2Style}><Scale size={20} /> 1. Nature of Agreement</h2>
                        <p style={pStyle}>This Agreement is a private contract between the Participant and the Producer/SPV for the purpose of funding specific media production projects. This is NOT a solicitation for public investment, nor does it constitute an offer of shares, debentures, or units in a Collective Investment Scheme (CIS).</p>
                    </section>

                    <section style={sectionStyle}>
                        <h2 style={h2Style}><Shield size={20} /> 2. Contribution Terms</h2>
                        <p style={pStyle}>The Participant agrees to provide a "Project Contribution" which will be utilized exclusively for the production, marketing, and distribution of the identified media project. The contribution is non-refundable once the project enters active production phases.</p>
                    </section>

                    <section style={sectionStyle}>
                        <h2 style={h2Style}><CheckCircle size={20} /> 3. Revenue Sharing</h2>
                        <p style={pStyle}>The Participant is entitled to a "Revenue Share" based on the Net Receipts of the project as defined in the project-specific term sheet. Net Receipts are calculated after deducting production costs, distribution fees, marketing expenses, and applicable taxes.</p>
                    </section>

                    <section style={sectionStyle}>
                        <h2 style={h2Style}><AlertTriangle size={20} /> 4. Risk Disclosure</h2>
                        <p style={pStyle}>Media production is inherently speculative. Revenue is dependent on audience response, market conditions, and distribution success. There is no guarantee of profit or return of the original contribution amount. The Participant acknowledges and accepts these commercial risks.</p>
                    </section>

                    <section style={sectionStyle}>
                        <h2 style={h2Style}><Scale size={20} /> 5. Compliance with Indian Law</h2>
                        <p style={pStyle}>This agreement is governed by the Indian Contract Act, 1872. It is structured to comply with SEBI regulations and RBI guidelines regarding private participation in media ventures. The platform operator acts merely as a technology interface and is not a party to this production agreement.</p>
                    </section>

                    <div style={{ marginTop: '2rem', padding: '1rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <p style={{ ...pStyle, margin: 0, fontSize: '0.8rem', fontStyle: 'italic' }}>
                            By confirming your contribution on the ITRAM WEBPRO platform, you signify your acceptance of these base terms and the project-specific term sheet attached to your project dashboard.
                        </p>
                    </div>
                </div>

                <footer style={{ marginTop: '3rem', textAlign: 'center' }}>
                    <button onClick={() => window.history.back()} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '0.75rem', cursor: 'pointer', fontWeight: 600 }}>
                        Go Back
                    </button>
                </footer>
            </motion.div>
        </div>
    );
};

export default ParticipationAgreement;
