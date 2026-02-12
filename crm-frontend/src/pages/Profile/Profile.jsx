import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
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
  Home,
  PhoneCall,
  Calendar,
  Clock
} from "lucide-react";
import "./Profile.css";

const Profile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`http://localhost:5000/api/clients/${id}`);
        setClient(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load client profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-card">
          <div className="loading-animation">
            <div className="ping-effect"></div>
            <div className="loading-icon">
              <Loader2 />
            </div>
          </div>
          <p>Loading client profile...</p>
          <p className="loading-hint">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <div className="error-card">
          <div className="error-icon-wrapper">
            <AlertCircle />
          </div>
          <h2>Client Not Found</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="btn-retry">
              Try Again
            </button>
            <Link to="/" className="btn-back">
              Back to Directory
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!client) return null;

  const clientFields = [
    {
      title: "Business Information",
      icon: <Building2 />,
      items: [
        { label: "Business Name", value: client.business_name, icon: <Building2 /> },
        { label: "Security Complement", value: client.security_complement || "Not specified", icon: <Shield /> },
      ]
    },
    {
      title: "Owner Information",
      icon: <User />,
      items: [
        { label: "Owner Name", value: client.owner_name, icon: <User /> },
        { label: "Email", value: client.owner_email || "Not provided", icon: <Mail />, type: "email" },
      ]
    },
    {
      title: "Contact Details",
      icon: <Phone />,
      items: [
        { label: "Mobile", value: client.owner_phone, icon: <Phone />, type: "phone" },
        { label: "Landline", value: client.landline || "Not provided", icon: <Phone />, type: "phone" },
      ]
    },
    {
      title: "Address Information",
      icon: <MapPin />,
      items: [
        { label: "Physical Address", value: client.physical_address || "Not provided", icon: <MapPin /> },
        { label: "Postal Address", value: client.postal_address || "Not provided", icon: <Mail /> },
      ]
    },
    {
      title: "Additional Information",
      icon: <FileText />,
      items: [
        { label: "Additional Requirements", value: client.additional_requirements || "None", icon: <FileText />, fullWidth: true },
        { 
          label: "Created At", 
          value: client.created_at ? new Date(client.created_at).toLocaleString() : "Unknown", 
          icon: <Calendar /> 
        },
        { 
          label: "Last Updated", 
          value: client.updated_at ? new Date(client.updated_at).toLocaleString() : "Unknown", 
          icon: <Clock /> 
        },
      ]
    }
  ];

  return (
    <div className="profile-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <Briefcase />
          </div>
          <div>
            <h1 className="page-title">Client Profile</h1>
            <p className="page-subtitle">
              <span className="status-dot"></span>
              View detailed client information
              <span className="client-id-badge">ID: {client.id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" className="back-btn">
            <ArrowLeft />
          </Link>
          <div>
            <div className="client-title">
              <h1>{client.business_name}</h1>
              {client.security_complement && (
                <span className="status-badge">
                  <span className="status-dot"></span>
                  Active
                </span>
              )}
            </div>
            <div className="client-meta">
              <span>{client.owner_name}</span>
              <span className="separator"></span>
              <span>Client #{client.id}</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/edit-client/${client.id}`)}
          className="btn-edit"
        >
          <Edit />
          Edit Client
        </button>
      </div>

      {/* Hero Profile Card */}
      <div className="hero-card">
        <div className="hero-decoration"></div>
        <div className="hero-decoration-2"></div>
        <div className="hero-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
            <div className="hero-icon-wrapper">
              <Building2 />
            </div>
            <div className="hero-title">
              <h2>{client.business_name}</h2>
              <div className="hero-contact">
                <div className="hero-contact-item">
                  <User />
                  <span>{client.owner_name}</span>
                </div>
                <div className="hero-contact-item">
                  <Phone />
                  <a href={`tel:${client.owner_phone}`}>{client.owner_phone}</a>
                </div>
                {client.owner_email && (
                  <div className="hero-contact-item">
                    <Mail />
                    <a href={`mailto:${client.owner_email}`}>{client.owner_email}</a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Client Info Sections */}
      {clientFields.map((section, idx) => (
        <div key={idx} className="info-section">
          <div className="section-header">
            {section.icon}
            <h2>{section.title}</h2>
          </div>
          <div className="section-content">
            <div className="info-grid">
              {section.items.map((item, itemIdx) => (
                <div 
                  key={itemIdx} 
                  className={`info-item ${item.fullWidth ? 'full-width' : ''}`}
                >
                  <div className="info-icon">
                    {item.icon}
                  </div>
                  <div className="info-content">
                    <div className="info-label">
                      {item.label}
                    </div>
                    {item.type === "phone" && item.value !== "Not provided" && item.value !== "None" ? (
                      <div className="info-value">
                        <a href={`tel:${item.value}`}>
                          {item.value}
                          <PhoneCall />
                        </a>
                      </div>
                    ) : item.type === "email" && item.value !== "Not provided" && item.value !== "None" ? (
                      <div className="info-value">
                        <a href={`mailto:${item.value}`}>
                          {item.value}
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

      {/* Footer */}
      <div className="profile-footer">
        <p className="footer-text">
          Client profile last viewed • {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
};

export default Profile;