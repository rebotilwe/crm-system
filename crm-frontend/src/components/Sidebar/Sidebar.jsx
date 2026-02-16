// src/components/Sidebar/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  Upload, 
  Download,
  Shield,
  Briefcase,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  BarChart3
} from "lucide-react";
import "./Sidebar.css";

const Sidebar = () => {
  const role = localStorage.getItem("role");
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth <= 768) {
        setCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const menuItems = [
    { 
      name: "Dashboard", 
      path: "/", 
      icon: <LayoutDashboard size={20} />,
      roles: ["super_admin", "admin", "user"]
    },
    { 
      name: "Clients", 
      path: "/clients", 
      icon: <Users size={20} />,
      roles: ["super_admin", "admin", "user"]
    },
    { 
      name: "Admins", 
      path: "/admins", 
      icon: <UserCog size={20} />,
      roles: ["super_admin"]
    },
    { 
      name: "Upload Clients", 
      path: "/upload-clients", 
      icon: <Upload size={20} />,
      roles: ["super_admin", "admin"]
    },
    { 
      name: "Reports", 
      path: "/reports", 
      icon: <BarChart3 size={20} />,
      roles: ["super_admin", "admin"]
    },
 
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(role)
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && !collapsed && (
        <div className="sidebar-overlay" onClick={() => setCollapsed(true)} />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="logo-container" onClick={() => navigate("/")}>
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

    
        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul>
            {filteredMenuItems.map((item) => (
              <li
                key={item.name}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setCollapsed(true);
                }}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.name}</span>}
                {!collapsed && location.pathname === item.path && (
                  <span className="active-indicator" />
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
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
    </>
  );
};

export default Sidebar;