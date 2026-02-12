import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Building2,
  User,
  Phone,
  Mail,
  MapPin,
  Shield,
  FileText,
  Edit,
  Briefcase,
  Calendar,
  Clock,
  ChevronRight
} from "lucide-react";
import "./UserProfile.css";

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
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/clients/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
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
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading client profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error-icon">!</div>
        <h3>Unable to Load Profile</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="btn-retry">
          Try Again
        </button>
      </div>
    );
  }

  if (!client) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const sections = [
    {
      title: "Business Information",
      icon: <Building2 />,
      items: [
        { 
          label: "Business Name", 
          value: client.business_name, 
          icon: <Building2 />,
          important: true 
        },
        { 
          label: "Security Complement", 
          value: client.security_complement || "Not specified", 
          icon: <Shield /> 
        },
      ]
    },
    {
      title: "Owner Information",
      icon: <User />,
      items: [
        { 
          label: "Owner Name", 
          value: client.owner_name, 
          icon: <User />,
          important: true 
        },
        { 
          label: "Email Address", 
          value: client.owner_email || "Not provided", 
          icon: <Mail />,
          type: "email" 
        },
      ]
    },
    {
      title: "Contact Details",
      icon: <Phone />,
      items: [
        { 
          label: "Mobile Phone", 
          value: client.owner_phone, 
          icon: <Phone />,
          type: "phone",
          important: true 
        },
        { 
          label: "Landline", 
          value: client.landline || "Not provided", 
          icon: <Phone />,
          type: "phone" 
        },
      ]
    },
    {
      title: "Address Information",
      icon: <MapPin />,
      items: [
        { 
          label: "Physical Address", 
          value: client.physical_address || "Not provided", 
          icon: <MapPin /> 
        },
        { 
          label: "Postal Address", 
          value: client.postal_address || "Not provided", 
          icon: <Mail /> 
        },
      ]
    },
    {
      title: "Additional Information",
      icon: <FileText />,
      items: [
        { 
          label: "Additional Requirements", 
          value: client.additional_requirements || "No additional requirements", 
          icon: <FileText />,
          fullWidth: true 
        },
        { 
          label: "Created Date", 
          value: formatDate(client.created_at), 
          icon: <Calendar /> 
        },
        { 
          label: "Last Updated", 
          value: formatDate(client.updated_at), 
          icon: <Clock /> 
        },
      ]
    }
  ];

  return (
    <div className="profile-page">
      {/* Header with actions */}
      <div className="profile-header">
        <div className="header-left">
          <div className="client-avatar">
            {getInitials(client.business_name)}
          </div>
          <div className="header-info">
            <h1>{client.business_name}</h1>
            <div className="header-meta">
              <span className="client-id">ID: {client.id}</span>
              <span className="meta-separator">•</span>
              <span className="client-owner">{client.owner_name}</span>
              {client.security_complement && (
                <>
                  <span className="meta-separator">•</span>
                  <span className="security-badge">
                    <Shield size={12} />
                    Active
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <button 
          onClick={() => navigate(`/edit-client/${client.id}`)}
          className="btn-edit-profile"
        >
          <Edit size={16} />
          Edit Client
        </button>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {sections.map((section, idx) => (
          <div key={idx} className="info-card">
            <div className="card-header">
              <div className="card-icon">
                {section.icon}
              </div>
              <h2>{section.title}</h2>
            </div>
            <div className="card-body">
              <div className="info-grid">
                {section.items.map((item, itemIdx) => (
                  <div 
                    key={itemIdx} 
                    className={`info-item ${item.fullWidth ? 'full-width' : ''} ${item.important ? 'important' : ''}`}
                  >
                    <div className="item-icon">
                      {item.icon}
                    </div>
                    <div className="item-content">
                      <span className="item-label">{item.label}</span>
                      {item.type === "phone" && item.value !== "Not provided" && item.value !== "Not specified" ? (
                        <a href={`tel:${item.value}`} className="item-value link">
                          {item.value}
                        </a>
                      ) : item.type === "email" && item.value !== "Not provided" ? (
                        <a href={`mailto:${item.value}`} className="item-value link">
                          {item.value}
                        </a>
                      ) : (
                        <span className={`item-value ${item.value === "Not provided" || item.value === "Not specified" || item.value === "No additional requirements" ? 'empty' : ''}`}>
                          {item.value}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="profile-actions">
        <button onClick={() => navigate("/clients")} className="action-link">
          <ChevronRight size={16} />
          Back to Client Directory
        </button>
      </div>
    </div>
  );
};

export default Profile;