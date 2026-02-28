import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
      LayoutDashboard,
      Wallet,
      Film,
      Network,
      ShieldCheck,
      LogOut,
      Menu,
      X,
      PlaySquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DashboardLayout.css';

const DashboardLayout = () => {
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      const location = useLocation();
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);

      useEffect(() => {
            setIsSidebarOpen(false);
      }, [location]);

      const handleLogout = () => {
            logout();
            navigate('/');
      };

      const navItems = [
            { path: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} />, exact: true },
            { path: '/dashboard/wallet', label: user?.role === 'ADMIN' ? 'Wallet' : 'My Wallet', icon: <Wallet size={20} /> },
            { path: '/dashboard/projects', label: 'Live Projects', icon: <Film size={20} /> },
            { path: '/dashboard/network', label: 'My Network', icon: <Network size={20} /> },
            { path: '/dashboard/kyc', label: 'KYC & Verification', icon: <ShieldCheck size={20} /> },
      ];

      // Bounce Admins straight to their dedicated layout
      if (user?.role === 'ADMIN') {
            return <Navigate to="/admin" replace />;
      }

      return (
            <div className="dashboard-container">
                  {/* Mobile Header */}
                  <div className="dashboard-mobile-header">
                        <a href="/" className="dashboard-logo">
                              <PlaySquare className="text-primary" size={24} />
                              <span>WEB<span className="text-primary">STAR</span></span>
                        </a>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mobile-menu-btn">
                              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                  </div>

                  {/* Sidebar */}
                  <aside className={`dashboard-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        <div className="sidebar-header">
                              <a href="/" className="dashboard-logo">
                                    <PlaySquare className="text-primary" size={28} />
                                    <span>WEB<span className="text-primary">STAR</span></span>
                              </a>
                        </div>

                        <div className="sidebar-user-card">
                              <div className="user-avatar">
                                    <UserAvatar name={user?.fullName || 'User'} />
                              </div>
                              <div className="user-info">
                                    <p className="user-name">{user?.fullName}</p>
                                    <p className="user-id">{String(user?.id).padStart(5, '0')}</p>
                                    <span className={`status-badge ${user?.status === 'ACTIVE' ? 'active' : 'inactive'}`}>
                                          {user?.status}
                                    </span>
                              </div>
                        </div>

                        <nav className="sidebar-nav">
                              {navItems.map((item) => (
                                    <NavLink
                                          key={item.path}
                                          to={item.path}
                                          end={item.exact}
                                          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                                          onClick={() => setIsSidebarOpen(false)}
                                    >
                                          {item.icon}
                                          <span>{item.label}</span>
                                    </NavLink>
                              ))}
                        </nav>

                        <div className="sidebar-footer">
                              <button onClick={handleLogout} className="sidebar-link logout-btn">
                                    <LogOut size={20} />
                                    <span>Logout</span>
                              </button>
                        </div>
                  </aside>

                  {/* Main Content */}
                  <main className="dashboard-main">
                        <div className="dashboard-content-wrapper">
                              <Outlet />
                        </div>
                  </main>

                  {/* Overlay for mobile sidebar */}
                  {isSidebarOpen && (
                        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>
                  )}
            </div>
      );
};

// Helper component for generic Avatar
const UserAvatar = ({ name }) => {
      const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';
      return <div className="avatar-circle">{initials}</div>;
};

export default DashboardLayout;
