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
  Building2
} from "lucide-react";
import "./DashboardLayout.css";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const admin = JSON.parse(localStorage.getItem("admin") || "{}");
    setUserName(admin?.name || "Admin User");
    setUserRole(admin?.role || "admin");
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const menuItems = [
    { 
      label: "Dashboard", 
      path: "/dashboard", 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      label: "Clients", 
      path: "/", 
      icon: <Building2 size={20} /> 
    },
    { 
      label: "Add Client", 
      path: "/add-client", 
      icon: <UserPlus size={20} /> 
    },
    ...(userRole === "super_admin" ? [
      { 
        label: "Admins", 
        path: "/admins", 
        icon: <UserCog size={20} /> 
      }
    ] : []),
    ...(userRole === "super_admin" || userRole === "admin" ? [
      { 
        label: "Upload CSV", 
        path: "/upload-clients", 
        icon: <Upload size={20} /> 
      },
      { 
        label: "Reports", 
        path: "/reports", 
        icon: <Download size={20} /> 
      }
    ] : []),
    { 
      label: "Profile", 
      path: "/userProfile", 
      icon: <Settings size={20} /> 
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Dashboard";
    if (path === "/") return "Client Directory";
    if (path.includes("/add-client")) return "Add New Client";
    if (path.includes("/edit-client")) return "Edit Client";
    if (path.includes("/profile")) return "Client Profile";
    if (path.includes("/admins")) return "Admin Management";
    if (path.includes("/upload-clients")) return "Upload CSV";
    if (path.includes("/reports")) return "Reports";
    return "Dashboard";
  };

  return (
    <div className={`dashboard-layout ${collapsed ? "collapsed" : ""}`}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo" onClick={() => navigate("/dashboard")}>
            <div className="logo-icon">CRM</div>
            {!collapsed && <span>CRM Pro</span>}
          </div>
          <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <div className="menu-container">
          <ul className="menu">
            {menuItems.map((item, index) => (
              <li
                key={index}
                onClick={() => navigate(item.path)}
                className={location.pathname === item.path ? "active" : ""}
              >
                <span className="icon">{item.icon}</span>
                {!collapsed && <span className="label">{item.label}</span>}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <nav className="navbar">
          <h1>{getPageTitle()}</h1>
          
          <div className="navbar-right">
            <div className="user-info">
              <div className="user-avatar">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{userName}</span>
                <span className="user-role">
                  {userRole?.replace('_', ' ') || 'Administrator'}
                </span>
              </div>
            </div>
            
            <button onClick={logout} className="logout-btn">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </nav>

        <main className="content-area">
          {children}
        </main>

        <footer className="footer">
          &copy; {new Date().getFullYear()} CRM Pro. All rights reserved.
        </footer>
      </div>
    </div>
  );
};

export default DashboardLayout;