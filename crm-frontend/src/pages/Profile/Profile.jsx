// src/pages/Profile/Profile.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  FileText,
  Edit,
  Briefcase,
  PhoneCall,
  Calendar,
  Clock,
  Copy,
  Check,
  ExternalLink,
  Home,
  Globe,
  Lock,
  Fingerprint,
  Radio,
  Target,
  Users
} from "lucide-react";
import "./Profile.css";

const API_URL = "https://crm-system-staging-626e.up.railway.app";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedField, setCopiedField] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`${API_URL}/api/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setClient(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load client profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [id, token, navigate]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper function to safely format ID for display
  const formatClientId = (id) => {
    if (!id) return "N/A";
    // Convert to string first, then slice
    const idString = String(id);
    return idString.length > 8 ? idString.slice(0, 8) + '...' : idString;
  };

  // Helper function to get short ID
  const getShortId = (id) => {
    if (!id) return "N/A";
    const idString = String(id);
    return idString.slice(0, 4);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-card">
          <div className="loading-animation">
            <div className="ping-effect"></div>
            <div className="loading-icon">
              <Shield size={32} />
            </div>
          </div>
          <p>Loading client profile...</p>
          <p className="loading-hint">Decrypting secure data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-card">
          <div className="error-icon-wrapper">
            <AlertCircle size={48} />
          </div>
          <h2>Access Denied</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="btn-retry">
              Retry Connection
            </button>
            <button onClick={() => navigate(-1)} className="btn-back">
              Return to Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  const tabs = [
    { id: "overview", label: "Overview", icon: <Briefcase size={16} /> },
    { id: "security", label: "Security", icon: <Shield size={16} /> },
    { id: "activity", label: "Activity", icon: <Radio size={16} /> },
    { id: "documents", label: "Documents", icon: <FileText size={16} /> }
  ];

  const clientFields = [
    {
      title: "Business Information",
      icon: <Building2 />,
      items: [
        { label: "Business Name", value: client.business_name, icon: <Briefcase />, key: "business_name" },
        { label: "Security Complement", value: client.security_complement || "Not specified", icon: <Shield />, key: "security_complement" },
      ]
    },
    {
      title: "Owner Information",
      icon: <User />,
      items: [
        { label: "Owner Name", value: client.owner_name, icon: <User />, key: "owner_name" },
        { label: "Email Address", value: client.owner_email || "Not provided", icon: <Mail />, key: "owner_email", type: "email" },
      ]
    },
    {
      title: "Contact Details",
      icon: <Phone />,
      items: [
        { label: "Mobile Number", value: client.owner_phone, icon: <Phone />, key: "owner_phone", type: "phone" },
        { label: "Landline", value: client.landline || "Not provided", icon: <PhoneCall />, key: "landline", type: "phone" },
      ]
    },
    {
      title: "Address Information",
      icon: <MapPin />,
      items: [
        { label: "Physical Address", value: client.physical_address || "Not provided", icon: <Home />, key: "physical_address" },
        { label: "Postal Address", value: client.postal_address || "Not provided", icon: <Mail />, key: "postal_address" },
      ]
    },
    {
      title: "Additional Information",
      icon: <FileText />,
      items: [
        { label: "Additional Requirements", value: client.additional_requirements || "None", icon: <FileText />, key: "additional_requirements", fullWidth: true },
        { label: "Created", value: formatDate(client.created_at), icon: <Calendar />, key: "created_at" },
        { label: "Last Updated", value: formatDate(client.updated_at), icon: <Clock />, key: "updated_at" },
        { label: "Client ID", value: String(client.id), icon: <Fingerprint />, key: "id" },
      ]
    }
  ];

  return (
    <div className="profile-container">
      {/* Security Background Elements */}
      <div className="security-elements">
        <div className="element element-1"><Radio /></div>
        <div className="element element-2"><Fingerprint /></div>
        <div className="element element-3"><Target /></div>
        <div className="element element-4"><Lock /></div>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <Shield size={28} />
          </div>
          <div>
            <h1 className="page-title">Client Profile</h1>
            <p className="page-subtitle">
              <span className="security-badge">
                <Lock size={12} />
                Secure View
              </span>
              <span className="client-id-badge">
                <Fingerprint size={12} />
                ID: {formatClientId(client.id)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-left">
          <button onClick={() => navigate(-1)} className="back-btn">
            <ArrowLeft size={20} />
          </button>
          <div className="client-info">
            <div className="client-avatar">
              {getInitials(client.business_name)}
            </div>
            <div>
              <div className="client-title">
                <h1>{client.business_name}</h1>
                <span className="status-badge">
                  <span className="status-dot"></span>
                  Active
                </span>
              </div>
              <div className="client-meta">
                <span><User size={14} /> {client.owner_name}</span>
                <span className="separator">•</span>
                <span><Briefcase size={14} /> Client #{getShortId(client.id)}</span>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/edit-client/${client.id}`)}
          className="btn-edit"
        >
          <Edit size={18} />
          Edit Profile
        </button>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Hero Profile Card */}
      <div className="hero-card">
        <div className="hero-decoration"></div>
        <div className="hero-decoration-2"></div>
        <div className="hero-content">
          <div className="hero-grid">
            <div className="hero-icon-wrapper">
              <Building2 size={40} />
            </div>
            <div className="hero-info">
              <h2>{client.business_name}</h2>
              <div className="hero-contact">
                <div className="hero-contact-item">
                  <User size={16} />
                  <span>{client.owner_name}</span>
                </div>
                <div className="hero-contact-item">
                  <Phone size={16} />
                  <a href={`tel:${client.owner_phone}`}>{client.owner_phone}</a>
                </div>
                {client.owner_email && (
                  <div className="hero-contact-item">
                    <Mail size={16} />
                    <a href={`mailto:${client.owner_email}`}>{client.owner_email}</a>
                  </div>
                )}
              </div>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-value">24</span>
                <span className="stat-label">Reports</span>
              </div>
              <div className="stat">
                <span className="stat-value">12</span>
                <span className="stat-label">Incidents</span>
              </div>
              <div className="stat">
                <span className="stat-value">98%</span>
                <span className="stat-label">Security</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Info Sections */}
      {activeTab === "overview" && (
        <>
          {clientFields.map((section, idx) => (
            <div key={idx} className="info-section">
              <div className="section-header">
                <div className="section-icon">{section.icon}</div>
                <h2>{section.title}</h2>
                <button className="section-copy" onClick={() => handleCopy(JSON.stringify(section.items), `section-${idx}`)}>
                  {copiedField === `section-${idx}` ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </div>
              <div className="section-content">
                <div className="info-grid">
                  {section.items.map((item, itemIdx) => (
                    <div 
                      key={itemIdx} 
                      className={`info-item ${item.fullWidth ? 'full-width' : ''}`}
                    >
                      <div className="info-icon">{item.icon}</div>
                      <div className="info-content">
                        <div className="info-label">
                          {item.label}
                          <button 
                            className="copy-btn"
                            onClick={() => handleCopy(item.value, item.key)}
                          >
                            {copiedField === item.key ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                        {item.type === "phone" && item.value !== "Not provided" && item.value !== "None" ? (
                          <div className="info-value">
                            <a href={`tel:${item.value}`}>
                              {item.value}
                              <PhoneCall size={14} />
                            </a>
                          </div>
                        ) : item.type === "email" && item.value !== "Not provided" && item.value !== "None" ? (
                          <div className="info-value">
                            <a href={`mailto:${item.value}`}>
                              {item.value}
                              <ExternalLink size={14} />
                            </a>
                          </div>
                        ) : (
                          <div className={`info-value ${
                            item.value === "Not provided" || 
                            item.value === "Not specified" || 
                            item.value === "None" || 
                            item.value === "Unknown" ? "empty" : ""
                          }`}>
                            {item.value}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {activeTab === "security" && (
        <div className="security-section">
          <div className="security-card">
            <div className="security-header">
              <Shield size={20} />
              <h3>Security Overview</h3>
            </div>
            <div className="security-stats">
              <div className="security-stat">
                <div className="stat-circle">
                  <span>98%</span>
                </div>
                <div className="stat-details">
                  <h4>Security Score</h4>
                  <p>Excellent</p>
                </div>
              </div>
              <div className="security-features">
                <div className="feature">
                  <CheckCircle size={16} />
                  <span>2FA Enabled</span>
                </div>
                <div className="feature">
                  <CheckCircle size={16} />
                  <span>Encrypted Data</span>
                </div>
                <div className="feature">
                  <CheckCircle size={16} />
                  <span>Audit Log Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "activity" && (
        <div className="activity-section">
          <div className="activity-card">
            <div className="activity-header">
              <Radio size={20} />
              <h3>Recent Activity</h3>
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
                  <p>Client updated</p>
                  <span>2 hours ago</span>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <p>Security check passed</p>
                  <span>1 day ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "documents" && (
        <div className="documents-section">
          <div className="documents-card">
            <div className="documents-header">
              <FileText size={20} />
              <h3>Client Documents</h3>
            </div>
            <div className="documents-grid">
              <div className="document-item">
                <FileText size={24} />
                <div>
                  <h4>Contract.pdf</h4>
                  <p>2.4 MB • Updated 3 days ago</p>
                </div>
              </div>
              <div className="document-item">
                <FileText size={24} />
                <div>
                  <h4>Security_Report_Q1.pdf</h4>
                  <p>1.8 MB • Updated 1 week ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="profile-footer">
        <div className="footer-content">
          <p className="footer-text">
            <Lock size={14} />
            Encrypted Profile • Last accessed {formatDate(new Date())}
          </p>
          <div className="footer-badges">
            <span className="footer-badge">Secure Connection</span>
            <span className="footer-badge">Audit Log Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;