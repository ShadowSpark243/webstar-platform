import React, { useState, useEffect } from 'react';
import { Menu, X, PlaySquare, LayoutDashboard, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
      const [isScrolled, setIsScrolled] = useState(false);
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const { user, setIsAuthModalOpen, logout } = useAuth();
      const navigate = useNavigate();

      useEffect(() => {
            const handleScroll = () => {
                  setIsScrolled(window.scrollY > 50);
            };
            window.addEventListener('scroll', handleScroll);
            return () => window.removeEventListener('scroll', handleScroll);
      }, []);

      const navLinks = [
            { name: 'Vision', href: '#vision' },
            { name: 'How It Works', href: '#how-it-works' },
            { name: 'Compensation', href: '#compensation' },
            { name: 'Ranks', href: '#ranks' },
            { name: 'Risk', href: '#risk' },
      ];

      const handleActionClick = () => {
            setMobileMenuOpen(false);
            if (user) {
                  navigate('/dashboard');
            } else {
                  setIsAuthModalOpen(true);
            }
      };

      const handleLogoClick = (e) => {
            e.preventDefault();
            if (user) {
                  navigate('/dashboard');
            } else {
                  navigate('/');
            }
      };

      return (
            <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
                  <div className="container nav-container">
                        <a href="/" onClick={handleLogoClick} className="nav-logo">
                              <PlaySquare className="text-primary" size={32} />
                              <span>
                                    WEB<span className="text-primary">STAR</span>
                              </span>
                        </a>

                        {/* Desktop Nav */}
                        <div className="nav-links">
                              {navLinks.map((link) => (
                                    <a key={link.name} href={link.href} className="nav-link">
                                          {link.name}
                                    </a>
                              ))}

                              {user ? (
                                    <div style={{ display: 'flex', gap: '1rem', marginLeft: '1.5rem', alignItems: 'center' }}>
                                          <button onClick={() => navigate('/dashboard')} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                <LayoutDashboard size={18} /> Dashboard
                                          </button>
                                          <button onClick={logout} className="btn btn-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem' }}>
                                                <LogOut size={18} />
                                          </button>
                                    </div>
                              ) : (
                                    <button onClick={handleActionClick} className="btn btn-primary" style={{ marginLeft: '1.5rem' }}>
                                          Start Participating
                                    </button>
                              )}
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                              className="nav-mobile-btn"
                              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                        </button>
                  </div>

                  {/* Mobile Nav */}
                  <div className={`nav-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                        {navLinks.map((link) => (
                              <a
                                    key={link.name}
                                    href={link.href}
                                    className="nav-link"
                                    onClick={() => setMobileMenuOpen(false)}
                              >
                                    {link.name}
                              </a>
                        ))}
                        <button
                              onClick={handleActionClick}
                              className="btn btn-primary"
                              style={{ width: '100%', marginTop: '1rem' }}
                        >
                              {user ? 'Go to Dashboard' : 'Start Participating'}
                        </button>
                        {user && (
                              <button
                                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                                    className="btn btn-outline"
                                    style={{ width: '100%', marginTop: '0.5rem' }}
                              >
                                    Logout
                              </button>
                        )}
                  </div>
            </nav>
      );
};

export default Navbar;
