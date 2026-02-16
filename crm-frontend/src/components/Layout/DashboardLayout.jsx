// src/components/Layout/DashboardLayout.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  Users,
  UserCog,
  Upload,
  Download,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Settings,
  Building2,
  Shield,
  Bell,
  Radio,
  Target,
  Fingerprint,
  Briefcase,
  Menu,
  X
} from "lucide-react";
import "./DashboardLayout.css";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin") || "{}");
    const storedName = localStorage.getItem("name") || admin?.name || "Admin User";
    const storedRole = localStorage.getItem("role") || admin?.role || "admin";
    setUserName(storedName);
    setUserRole(storedRole);

    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { 
      label: "Dashboard", 
      path: "/dashboard", 
      icon: <LayoutDashboard size={20} />,
      roles: ["super_admin", "admin", "user"]
    },
    { 
      label: "Clients", 
      path: "/", 
      icon: <Building2 size={20} />,
      roles: ["super_admin", "admin", "user"]
    },
    { 
      label: "Add Client", 
      path: "/add-client", 
      icon: <UserPlus size={20} />,
      roles: ["super_admin", "admin", "user"]
    },
    ...(userRole === "super_admin" ? [
      { 
        label: "Admins", 
        path: "/admins", 
        icon: <UserCog size={20} />,
        roles: ["super_admin"]
      }
    ] : []),
    ...(userRole === "super_admin" || userRole === "admin" ? [
      { 
        label: "Upload CSV", 
        path: "/upload-clients", 
        icon: <Upload size={20} />,
        roles: ["super_admin", "admin"]
      },
      { 
        label: "Reports", 
        path: "/reports", 
        icon: <Download size={20} />,
        roles: ["super_admin", "admin"]
      }
    ] : []),
    // { 
    //   label: "Profile", 
    //   path: "/adminProfile", 
    //   icon: <Settings size={20} />,
    //   roles: ["super_admin", "admin", "user"]
    // },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/") return "Client Directory";
    if (path.includes("/add-client")) return "Add New Client";
    if (path.includes("/edit-client")) return "Edit Client";
    if (path.includes("/profile")) return "Client Profile";
    if (path.includes("/admins")) return "Admin Management";
    if (path.includes("/upload-clients")) return "Upload CSV";
    if (path.includes("/reports")) return "Reports & Analytics";
    if (path.includes("/adminProfile")) return "Admin Profile";
    return "Dashboard";
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatRole = (role) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getRoleColor = (role) => {
    switch(role) {
      case "super_admin": return "#f59e0b";
      case "admin": return "#2563eb";
      default: return "#10b981";
    }
  };

  return (
    <div className={`dashboard-layout ${collapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      {/* Mobile Menu Toggle */}
      <button 
        className="mobile-menu-toggle"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        {/* Logo Section - ONLY THIS SHOULD SHOW "REACTION UNIT SA" */}
        <div className="sidebar-header">
          <div className="logo-container" onClick={() => {
            navigate("/dashboard");
            setMobileMenuOpen(false);
          }}>
            <div className="logo-icon">
              <Shield size={24} />
            </div>
            {!collapsed && (
              <div className="logo-text">
                <h2>REACTION</h2>
                <span>UNIT SA</span>
              </div>
            )}
          </div>
          
          <button 
            className="collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* REMOVED: User Info Section - This was showing the duplicate "Super Admin" */}

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul>
            {filteredMenuItems.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  navigate(item.path);
                  setMobileMenuOpen(false);
                }}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
                {!collapsed && location.pathname === item.path && (
                  <span className="active-indicator" />
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <LogOut size={20} />
            {!collapsed && <span>Sign Out</span>}
          </button>
          
          {!collapsed && (
            <div className="version-info">
              <span>v2.0.1</span>
              <span className="security-badge">SECURE</span>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-left">
            <h1>{getPageTitle()}</h1>
            {location.pathname === "/" && (
              <span className="total-count">156 total</span>
            )}
          </div>
          
          <div className="navbar-right">
            {/* Notifications */}
            <button className="notification-btn">
              <Bell size={18} />
              <span className="notification-badge">3</span>
            </button>

            {/* Profile Menu */}
            <div className="profile-container">
              <button 
                className="profile-trigger"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div 
                  className="profile-avatar"
                  style={{ background: getRoleColor(userRole) }}
                >
                  {getInitials(userName)}
                </div>
                <div className="profile-info">
                  <span className="profile-name">{userName}</span>
                  <span className="profile-role">
                    <Shield size={12} />
                    {formatRole(userRole)}
                  </span>
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">
                      {getInitials(userName)}
                    </div>
                    <div className="dropdown-info">
                      <p className="dropdown-name">{userName}</p>
                      <p className="dropdown-role">{formatRole(userRole)}</p>
                    </div>
                  </div>

                  <div className="dropdown-menu">
                    <button onClick={() => {
                      navigate("/adminProfile");
                      setShowProfileMenu(false);
                    }}>
                      <Settings size={14} />
                      <span>Profile Settings</span>
                    </button>
                    
                    <div className="dropdown-divider"></div>
                    
                    <button onClick={logout} className="logout-btn">
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* Content Area */}
        <main className="content-area">
          {children}
        </main>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <p>&copy; {new Date().getFullYear()} Reaction Unit South Africa. All rights reserved.</p>
            <div className="footer-links">
              <span>Privacy Policy</span>
              <span className="separator">•</span>
              <span>Terms of Use</span>
              <span className="separator">•</span>
              <span>Security</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Security Elements */}
      <div className="security-elements">
        <div className="element element-1"><Radio /></div>
        <div className="element element-2"><Fingerprint /></div>
        <div className="element element-3"><Target /></div>
        <div className="element element-4"><Briefcase /></div>
      </div>
    </div>
  );
};

export default DashboardLayout;