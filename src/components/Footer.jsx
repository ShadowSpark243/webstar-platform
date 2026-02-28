import React from 'react';
import { PlaySquare, Mail, Phone, MapPin } from 'lucide-react';
import './Footer.css';

const Footer = () => {
      return (
            <footer className="footer">
                  <div className="footer-glow"></div>

                  <div className="container footer-container">
                        <div className="footer-grid">

                              <div className="footer-brand">
                                    <a href="#" className="footer-logo">
                                          <PlaySquare className="text-primary" size={32} />
                                          <span>
                                                WEB<span className="text-primary">STAR</span>
                                          </span>
                                    </a>
                                    <p className="footer-desc">
                                          Funding the next generation of blockbuster web series and movies through a revolutionary project-based profit sharing and network incentive model.
                                    </p>
                                    <div className="footer-contact-list">
                                          <div className="footer-contact-item">
                                                <Mail size={18} className="text-primary" />
                                                <span>contact@webstar.com</span>
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
                                          <li><a href="#risk">Risk Disclosure</a></li>
                                          <li><a href="#">Terms of Service</a></li>
                                          <li><a href="#">Privacy Policy</a></li>
                                          <li><a href="#">KYC Requirements</a></li>
                                    </ul>
                              </div>
                        </div>

                        <div className="footer-bottom">
                              <p>© {new Date().getFullYear()} WEBSTAR (A product of The Anytime Mediatec Pvt Ltd). All rights reserved.</p>
                              <p className="footer-disclaimer">
                                    Disclaimer: Content production is high-risk. Returns are not guaranteed and depend entirely on project performance.
                              </p>
                        </div>
                  </div>
            </footer>
      );
};

export default Footer;
