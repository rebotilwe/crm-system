// src/components/Navbar/Navbar.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LogOut, 
  User, 
  Settings, 
  Shield, 
  ChevronDown,
  Bell,
  Briefcase
} from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("name") || "Admin User";
    const role = localStorage.getItem("role") || "admin";
    setUserName(name);
    setUserRole(role);

    // Close profile menu when clicking outside
    const handleClickOutside = (e) => {
      if (!e.target.closest('.profile-container')) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
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
    <nav className="navbar">
      {/* Logo Section */}
      <div className="navbar-left">
        <div className="logo-container">
          <div className="logo-icon">
            <Briefcase size={20} />
          </div>
          <h1 className="navbar-logo">REACTION UNIT</h1>
          <span className="logo-badge">SA</span>
        </div>
      </div>

      {/* Right Section */}
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
            <ChevronDown 
              size={16} 
              className={`chevron ${showProfileMenu ? 'open' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
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
                <button onClick={() => navigate("/profile")}>
                  <User size={14} />
                  <span>My Profile</span>
                </button>
                <button onClick={() => navigate("/settings")}>
                  <Settings size={14} />
                  <span>Settings</span>
                </button>
                
                <div className="dropdown-divider"></div>
                
                <button onClick={handleLogout} className="logout-btn">
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;