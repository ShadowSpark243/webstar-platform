import React from 'react';
import { AlertTriangle, Shield, Scale, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionStyle = { marginBottom: '2.5rem' };
const h2Style = { fontSize: '1.35rem', fontWeight: 700, marginBottom: '1rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.5rem' };
const pStyle = { marginBottom: '1rem', color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', lineHeight: '1.7' };

const DisclaimerPage = () => {
    return (
        <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: "'Inter', sans-serif", padding: '4rem 2rem' }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ maxWidth: '800px', margin: '0 auto' }}>
                <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '1rem', color: '#f59e0b', marginBottom: '1.5rem' }}>
                        <AlertTriangle size={32} />
                    </div>
                    <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>Legal Disclaimer</h1>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '1rem' }}>Important Regulatory Information for Participants</p>
                </header>

                <div className="glass-panel" style={{ padding: '3rem', borderRadius: '1.5rem', background: 'rgba(30, 41, 59, 0.5)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <section style={sectionStyle}>
                        <h2 style={h2Style}><Shield size={20} /> Not a Financial Product</h2>
                        <p style={pStyle}>ITRAM WEBPRO facilitates private participation in film and media production. It is not an "investment platform" in the sense of financial markets. The opportunities listed are not shares, units of a fund, or debt instruments. Participation is based on private contracts for production support.</p>
                    </section>

                    <section style={sectionStyle}>
                        <h2 style={h2Style}><Info size={20} /> No SEBI/RBI Solicitation</h2>
                        <p style={pStyle}>This platform does not solicit public deposits or investments. Activities are structured to remain outside the purview of the SEBI Collective Investment Scheme (CIS) Regulations and the RBI Non-Banking Financial Company (NBFC) rules. We do not provide financial advice or guaranteed returns.</p>
                    </section>

                    <section style={sectionStyle}>
                        <h2 style={h2Style}><AlertTriangle size={20} /> Risk Awareness</h2>
                        <p style={pStyle}>Entertainment projects are highly speculative. Revenue share is strictly dependent on the commercial success of the project. A significant risk of loss of principal contribution exists. Participants should only support projects with capital they can afford to lose.</p>
                    </section>

                    <section style={sectionStyle}>
                        <h2 style={h2Style}><Scale size={20} /> Private Placement Only</h2>
                        <p style={pStyle}>Participation is permitted only for verified users through a private agreement process. The information provided on the platform is for informational purposes only and does not constitute a prospectus or public offering document.</p>
                    </section>

                    <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '1rem' }}>
                        <p style={{ ...pStyle, marginBottom: 0, fontSize: '0.85rem', color: '#f59e0b', fontWeight: 600 }}>
                            By using this platform, you acknowledge that you have read this disclaimer and understand the risks associated with media production funding.
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

export default DisclaimerPage;
