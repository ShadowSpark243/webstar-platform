import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation, Navigate } from 'react-router-dom';
import {
      LayoutDashboard,
      Users,
      CreditCard,
      ShieldCheck,
      Settings,
      LogOut,
      Menu,
      X,
      PlaySquare,
      ShieldAlert,
      Network,
      Film
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AdminLayout.css';

const AdminLayout = () => {
      const { user, logout } = useAuth();
      const navigate = useNavigate();
      const location = useLocation();
      const [isSidebarOpen, setIsSidebarOpen] = useState(false);

      useEffect(() => {
            setIsSidebarOpen(false);
      }, [location]);

      if (user?.role !== 'ADMIN') {
            return <Navigate to="/dashboard" />;
      }

      const handleLogout = () => {
            logout();
            navigate('/');
      };

      const navItems = [
            { path: '/admin', label: 'Command Center', icon: <LayoutDashboard size={20} />, exact: true },
            { path: '/admin/users', label: 'User Directory', icon: <Users size={20} /> },
            { path: '/admin/ledger', label: 'Global Ledger', icon: <CreditCard size={20} /> },
            { path: '/admin/kyc', label: 'Verification Queue', icon: <ShieldCheck size={20} /> },
            { path: '/admin/projects', label: 'Project Hub', icon: <Film size={20} /> },
            { path: '/admin/network', label: 'Global Network', icon: <Network size={20} /> },
            { path: '/admin/settings', label: 'System Directives', icon: <Settings size={20} /> },
      ];

      return (
            <div className="admin-container">
                  {/* Mobile Header */}
                  <div className="admin-mobile-header">
                        <a href="/admin" className="admin-logo">
                              <ShieldAlert className="text-purple-400" size={24} />
                              <span>ADMIN<span className="text-purple-400">CORE</span></span>
                        </a>
                        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="mobile-menu-btn text-white">
                              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                  </div>

                  {/* Sidebar */}
                  <aside className={`admin-sidebar ${isSidebarOpen ? 'open' : ''}`}>
                        <div className="sidebar-header">
                              <div className="admin-logo">
                                    <ShieldAlert className="text-purple-400" size={28} />
                                    <span>ADMIN<span className="text-purple-400">CORE</span></span>
                              </div>
                        </div>

                        <div className="sidebar-user-card admin-user-card">
                              <div className="user-avatar admin-avatar">
                                    <UserAvatar name={user?.fullName || 'God Mode'} />
                              </div>
                              <div className="user-info">
                                    <p className="user-name" style={{ color: '#e2e8f0' }}>{user?.fullName}</p>
                                    <p className="user-id" style={{ color: '#8b5cf6' }}>Super Administrator</p>
                              </div>
                        </div>

                        <nav className="sidebar-nav">
                              {navItems.map((item) => (
                                    <NavLink
                                          key={item.path}
                                          to={item.path}
                                          end={item.exact}
                                          className={({ isActive }) => `sidebar-link admin-link ${isActive ? 'active' : ''}`}
                                          onClick={() => setIsSidebarOpen(false)}
                                    >
                                          {item.icon}
                                          <span>{item.label}</span>
                                    </NavLink>
                              ))}
                        </nav>

                        <div className="sidebar-footer">
                              <button onClick={handleLogout} className="sidebar-link admin-link logout-btn">
                                    <LogOut size={20} />
                                    <span>Terminate Session</span>
                              </button>
                        </div>
                  </aside>

                  {/* Main Content */}
                  <main className="admin-main">
                        <div className="admin-content-wrapper">
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
      const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'A';
      return <div className="avatar-circle">{initials}</div>;
};

export default AdminLayout;
