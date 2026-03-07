import { Link } from 'react-router-dom';
import { PlaySquare, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
      return (
            <footer className="footer">
                  <div className="footer-glow"></div>

                  <div className="container footer-container">
                        <div className="footer-grid">

                              <div className="footer-brand">
                                    <Link to="/" className="footer-logo">
                                          <PlaySquare className="text-primary" size={32} />
                                          <span>
                                                ITRAM <span className="text-primary">WEBPRO</span>
                                          </span>
                                    </Link>
                                    <p className="footer-desc">
                                          Funding the next generation of blockbuster web series and movies through a legally structured, project-based revenue sharing and network model.
                                    </p>
                                    <div className="footer-contact-list">
                                          <div className="footer-contact-item">
                                                <Mail size={18} className="text-primary" />
                                                <span>contact@itramwebpro.com</span>
                                          </div>
                                          <div className="footer-contact-item">
                                                <Phone size={18} className="text-primary" />
                                                <span>+91 91522 91138</span>
                                          </div>
                                          <div className="footer-contact-item">
                                                <MapPin size={18} className="text-primary" />
                                                <span>Mumbai, Maharashtra, India</span>
                                          </div>
                                    </div>
                              </div>

                              <div className="footer-nav">
                                    <h4>Platform</h4>
                                    <ul>
                                          <li><a href="#vision">Our Vision</a></li>
                                          <li><a href="#how-it-works">How It Works</a></li>
                                          <li><a href="#compensation">Compensation Plan</a></li>
                                          <li><a href="#ranks">Rank Structure</a></li>
                                    </ul>
                              </div>

                              <div className="footer-nav">
                                    <h4>Legal & Compliance</h4>
                                    <ul>
                                          <li><Link to="/terms">Terms & Conditions</Link></li>
                                          <li><Link to="/privacy">Privacy Policy</Link></li>
                                          <li><Link to="/participation-agreement">Participation Agreement</Link></li>
                                    </ul>
                              </div>
                        </div>

                        <div className="footer-bottom">
                              <p>© {new Date().getFullYear()} ITRAM WEBPRO (A product of The Anytime Mediatec Pvt Ltd). All rights reserved.</p>
                              <p className="footer-disclaimer">
                                    Disclaimer: Content production is high-risk. Revenue shares are not guaranteed and depend entirely on actual project performance. This platform is not regulated by SEBI or RBI. This is not a Collective Investment Scheme.
                              </p>
                        </div>
                  </div>
            </footer>
      );
};

export default Footer;
