import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Menu, X, Shield, Settings, LogOut, 
  LayoutDashboard, Users, UserCog, Upload, BarChart3,
  ChevronDown, Briefcase, User
} from "lucide-react";
import "./DashboardLayout.css";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  // States
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock user data (Replace with your actual auth logic/context)
  const userName = localStorage.getItem("name") || "Rebotilwe Mokiba";
  const userRole = "admin"; 

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setShowProfileMenu(false);
  }, [location.pathname]);

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: <LayoutDashboard size={20} /> },
    // { name: "Clients", path: "/profile", icon: <Users size={20} /> },
    { name: "Add Client", path: "/add-client", icon: <Briefcase size={20} /> },
    { name: "Admins", path: "/admins", icon: <UserCog size={20} /> },
    { name: "Upload", path: "/upload-clients", icon: <Upload size={20} /> },
    { name: "Reports", path: "/reports", icon: <BarChart3 size={20} /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const getInitials = (name) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase();
  };

  return (
    <div className={`app-shell ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "mobile-active" : ""}`}>
      
      {/* Mobile Burger Menu */}
      <button className="mobile-burger" onClick={() => setMobileOpen(!mobileOpen)}>
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className="sidebar-container">
        <div className="sidebar-header">
          <div className="brand">
            <div className="brand-logo"><Shield size={22} fill="currentColor" /></div>
            <div className="brand-text">
              <h2>REACTION</h2>
              <span>UNIT SA</span>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div 
              key={item.name} 
              className={`nav-link ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => navigate(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.name}</span>
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="signout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <main className="main-viewport">
        <header className="navbar-top">
          <div className="navbar-left">
            <h1>{location.pathname.split("/").pop().toUpperCase() || "DASHBOARD"}</h1>
          </div>

          <div className="navbar-right">
            {/* Profile Menu */}
            <div className="profile-container" ref={menuRef}>
              <button 
                className="profile-trigger"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="user-avatar-hex">
                  {getInitials(userName)}
                </div>
                <div className="profile-info-text">
                  <span className="profile-name">{userName}</span>
                  <span className="profile-role">System Admin</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`chevron ${showProfileMenu ? 'open' : ''}`} 
                />
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <div className="dropdown-avatar">{getInitials(userName)}</div>
                    <div className="dropdown-info">
                      <p className="dropdown-name">{userName}</p>
                      <p className="dropdown-email">admin@reactionsa.co.za</p>
                    </div>
                  </div>

                  <div className="dropdown-menu">
                    <button onClick={() => navigate("/adminProfile")}>
                      <User size={14} />
                      <span>My Profile</span>
                    </button>
                    {/* <button onClick={() => navigate("/settings")}>
                      <Settings size={14} />
                      <span>Settings</span>
                    </button> */}
                    
                    <div className="dropdown-divider"></div>
                    
                    {/* <button onClick={handleLogout} className="logout-btn">
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button> */}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;