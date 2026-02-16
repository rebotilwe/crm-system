// src/pages/Profile/AdminProfile.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Shield,
  Save,
  Camera,
  Key,
  Bell,
  Moon,
  Globe,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Briefcase,
  Fingerprint,
  Radio,
  Target,
  Clock,
  Calendar,
  Edit3,
  MapPin,
  Phone,
  Award,
  Star
} from "lucide-react";
import "./AdminProfile.css";

const AdminProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    department: "Security Operations",
    joinDate: "",
    phone: "+27 ",
    location: "South Africa",
    employeeId: "EMP-2024-001",
    securityLevel: "Level 3",
    lastLogin: "",
    permissions: ["view_clients", "edit_clients", "upload_csv", "generate_reports"]
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const storedName = localStorage.getItem("name") || "Super Admin";
      const storedEmail = localStorage.getItem("email") || "admin@reactionunit.co.za";
      const storedRole = localStorage.getItem("role") || "super_admin";
      
      setUserData({
        ...userData,
        name: storedName,
        email: storedEmail,
        role: storedRole,
        department: "Security Operations",
        joinDate: "January 2024",
        phone: "+27 82 123 4567",
        location: "Johannesburg, South Africa",
        lastLogin: new Date().toLocaleString()
      });
    } catch (err) {
      setError("Failed to load profile");
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      localStorage.setItem("name", userData.name);
      setSuccess("Profile updated successfully");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
    { id: "activity", label: "Activity Log", icon: Clock }
  ];

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-animation">
          <div className="ping-effect"></div>
          <div className="loading-icon">
            <Shield size={32} />
          </div>
        </div>
        <p>Loading profile...</p>
        <p className="loading-hint">Please wait</p>
      </div>
    );
  }

  const getRoleBadgeColor = (role) => {
    switch(role) {
      case "super_admin": return "super-admin";
      case "admin": return "admin";
      default: return "user";
    }
  };

  const formatRole = (role) => {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="admin-profile-container">
      {/* Security Background Elements */}
      <div className="security-elements">
        <div className="element element-1"><Radio /></div>
        <div className="element element-2"><Fingerprint /></div>
        <div className="element element-3"><Target /></div>
        <div className="element element-4"><Shield /></div>
      </div>

      {/* Header */}
      <div className="profile-header">
        <div className="header-left">
          <div className="header-icon">
            <Shield size={28} />
          </div>
          <div>
            <h1>Account Settings</h1>
            <p className="header-subtitle">
              <span className="security-badge">
                <Lock size={12} />
                Secure Area
              </span>
              <span className="role-badge">
                <Award size={12} />
                {formatRole(userData.role)}
              </span>
            </p>
          </div>
        </div>
        {/* Sign Out button removed - now only in sidebar */}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="alert success">
          <CheckCircle size={18} />
          <span>{success}</span>
          <button className="close-alert" onClick={() => setSuccess("")}>×</button>
        </div>
      )}
      
      {error && (
        <div className="alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
          <button className="close-alert" onClick={() => setError("")}>×</button>
        </div>
      )}

      <div className="profile-content">
        {/* Sidebar */}
        <div className="profile-sidebar">
          {/* Profile Card */}
          <div className="profile-card">
            <div className="avatar-section">
              <div className="avatar-wrapper">
                <div className="avatar">
                  {getInitials(userData.name)}
                </div>
                <button className="avatar-upload">
                  <Camera size={14} />
                </button>
                <div className="online-indicator"></div>
              </div>
              <div className="user-info">
                <h3>{userData.name}</h3>
                <p>{userData.email}</p>
              </div>
            </div>

            <div className="role-section">
              <div className={`role-badge ${getRoleBadgeColor(userData.role)}`}>
                <Shield size={14} />
                <span>{formatRole(userData.role)}</span>
              </div>
              <div className="employee-id">
                <Fingerprint size={12} />
                <span>{userData.employeeId}</span>
              </div>
            </div>

            <div className="user-meta">
              <div className="meta-item">
                <Briefcase size={14} className="meta-icon" />
                <div>
                  <span className="meta-label">Department</span>
                  <span className="meta-value">{userData.department}</span>
                </div>
              </div>
              <div className="meta-item">
                <Calendar size={14} className="meta-icon" />
                <div>
                  <span className="meta-label">Member since</span>
                  <span className="meta-value">{userData.joinDate}</span>
                </div>
              </div>
              <div className="meta-item">
                <MapPin size={14} className="meta-icon" />
                <div>
                  <span className="meta-label">Location</span>
                  <span className="meta-value">{userData.location}</span>
                </div>
              </div>
              <div className="meta-item">
                <Clock size={14} className="meta-icon" />
                <div>
                  <span className="meta-label">Last login</span>
                  <span className="meta-value">{userData.lastLogin}</span>
                </div>
              </div>
            </div>

            <div className="security-level">
              <div className="level-header">
                <Shield size={14} />
                <span>Security Level</span>
              </div>
              <div className="level-bar">
                <div className="level-progress" style={{ width: '75%' }}></div>
              </div>
              <span className="level-text">{userData.securityLevel}</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="profile-nav">
            {tabs.map(tab => (
              <button
                key={tab.id}
                className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
                <ChevronRight size={16} className="nav-arrow" />
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {activeTab === "profile" && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Profile Information</h2>
                <p className="tab-description">Update your personal information</p>
              </div>

              <form className="profile-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label>Full Name</label>
                  <div className="input-wrapper">
                    <User size={18} className="input-icon" />
                    <input
                      type="text"
                      value={userData.name}
                      onChange={(e) => setUserData({...userData, name: e.target.value})}
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <div className="input-wrapper">
                    <Mail size={18} className="input-icon" />
                    <input
                      type="email"
                      value={userData.email}
                      onChange={(e) => setUserData({...userData, email: e.target.value})}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number</label>
                    <div className="input-wrapper">
                      <Phone size={18} className="input-icon" />
                      <input
                        type="tel"
                        value={userData.phone}
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                        placeholder="+27 XX XXX XXXX"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <div className="input-wrapper">
                      <MapPin size={18} className="input-icon" />
                      <input
                        type="text"
                        value={userData.location}
                        onChange={(e) => setUserData({...userData, location: e.target.value})}
                        placeholder="City, Country"
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <div className="input-wrapper">
                    <Briefcase size={18} className="input-icon" />
                    <input
                      type="text"
                      value={userData.department}
                      onChange={(e) => setUserData({...userData, department: e.target.value})}
                      placeholder="Department"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-save"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <span className="spinner-small"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "security" && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Security Settings</h2>
                <p className="tab-description">Manage your password and security preferences</p>
              </div>

              <form className="profile-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <div className="input-wrapper">
                    <Lock size={18} className="input-icon" />
                    <input type="password" placeholder="Enter current password" />
                  </div>
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <div className="input-wrapper">
                    <Key size={18} className="input-icon" />
                    <input type="password" placeholder="Enter new password" />
                  </div>
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <div className="input-wrapper">
                    <Key size={18} className="input-icon" />
                    <input type="password" placeholder="Confirm new password" />
                  </div>
                </div>

                <div className="security-notes">
                  <h4>Password Requirements:</h4>
                  <ul>
                    <li>
                      <CheckCircle size={12} />
                      At least 8 characters long
                    </li>
                    <li>
                      <CheckCircle size={12} />
                      Contains at least one uppercase letter
                    </li>
                    <li>
                      <CheckCircle size={12} />
                      Contains at least one number
                    </li>
                    <li>
                      <CheckCircle size={12} />
                      Contains at least one special character
                    </li>
                  </ul>
                </div>

                <div className="permissions-section">
                  <h4>Your Permissions</h4>
                  <div className="permissions-grid">
                    {userData.permissions.map((perm, index) => (
                      <div key={index} className="permission-tag">
                        <CheckCircle size={12} />
                        <span>{perm.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-actions">
                  <button type="button" className="btn-save">
                    <Key size={18} />
                    Update Password
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Notification Preferences</h2>
                <p className="tab-description">Choose how you want to be notified</p>
              </div>

              <div className="notifications-list">
                <div className="notification-item">
                  <div className="notification-info">
                    <Bell size={18} />
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Receive updates via email</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <User size={18} />
                    <div>
                      <h4>New Client Alerts</h4>
                      <p>Get notified when new clients are added</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <Radio size={18} />
                    <div>
                      <h4>System Updates</h4>
                      <p>Receive information about system maintenance</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="notification-item">
                  <div className="notification-info">
                    <Shield size={18} />
                    <div>
                      <h4>Security Alerts</h4>
                      <p>Critical security notifications</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Preferences</h2>
                <p className="tab-description">Customize your experience</p>
              </div>

              <div className="preferences-list">
                <div className="preference-item">
                  <div className="preference-info">
                    <Moon size={18} />
                    <div>
                      <h4>Dark Mode</h4>
                      <p>Switch between light and dark theme</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <Globe size={18} />
                    <div>
                      <h4>Language</h4>
                      <p>Select your preferred language</p>
                    </div>
                  </div>
                  <select className="language-select">
                    <option>English</option>
                    <option>Afrikaans</option>
                    <option>Zulu</option>
                    <option>Xhosa</option>
                  </select>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <Bell size={18} />
                    <div>
                      <h4>Sound Effects</h4>
                      <p>Play sounds for notifications</p>
                    </div>
                  </div>
                  <label className="switch">
                    <input type="checkbox" defaultChecked />
                    <span className="slider"></span>
                  </label>
                </div>

                <div className="preference-item">
                  <div className="preference-info">
                    <Clock size={18} />
                    <div>
                      <h4>Time Format</h4>
                      <p>24-hour or 12-hour format</p>
                    </div>
                  </div>
                  <select className="language-select">
                    <option>24-hour</option>
                    <option>12-hour</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="tab-content">
              <div className="tab-header">
                <h2>Activity Log</h2>
                <p className="tab-description">Recent account activity</p>
              </div>

              <div className="activity-timeline">
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p>Profile viewed</p>
                    <span>Just now</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p>Profile updated</p>
                    <span>2 minutes ago</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p>Password changed</p>
                    <span>1 day ago</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p>New login from Johannesburg</p>
                    <span>2 days ago</span>
                  </div>
                </div>
                <div className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <p>Security settings updated</p>
                    <span>1 week ago</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="profile-footer">
        <div className="footer-content">
          <p className="footer-text">
            <Lock size={14} />
            Secure Profile • Last updated {new Date().toLocaleString()}
          </p>
          <div className="footer-badges">
            <span className="footer-badge">2FA Enabled</span>
            <span className="footer-badge">Session Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;