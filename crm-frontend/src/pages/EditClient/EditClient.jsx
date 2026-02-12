import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Building2, 
  User, 
  Phone, 
  Landmark, 
  Mail, 
  MapPin, 
  Mail as Postal, 
  Shield, 
  FileText, 
  ArrowLeft, 
  Save,
  Briefcase,
  AlertCircle
} from "lucide-react";
import "./EditClient.css";

const EditClient = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    business_name: "",
    owner_name: "",
    owner_phone: "",
    landline: "",
    owner_email: "",
    physical_address: "",
    postal_address: "",
    security_complement: "",
    additional_requirements: "",
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
        setFormData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load client data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/clients/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Client updated successfully!");
      navigate(`/client/${id}`);
    } catch (err) {
      console.error(err);
      alert("Error updating client. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formSections = [
    {
      title: "Business Information",
      icon: <Building2 />,
      fields: [
        { name: "business_name", label: "Business Name", icon: <Building2 />, placeholder: "e.g., ABC Corporation", required: true },
        { name: "security_complement", label: "Security Complement", icon: <Shield />, placeholder: "e.g., 24/7 Surveillance" },
      ]
    },
    {
      title: "Owner Information",
      icon: <User />,
      fields: [
        { name: "owner_name", label: "Owner Name", icon: <User />, placeholder: "Full name of owner", required: true },
        { name: "owner_email", label: "Owner Email", icon: <Mail />, placeholder: "owner@example.com", type: "email" },
      ]
    },
    {
      title: "Contact Information",
      icon: <Phone />,
      fields: [
        { name: "owner_phone", label: "Owner Phone", icon: <Phone />, placeholder: "e.g., 0777 123 456", required: true },
        { name: "landline", label: "Landline", icon: <Landmark />, placeholder: "e.g., 0112 345 678" },
      ]
    },
    {
      title: "Address Information",
      icon: <MapPin />,
      fields: [
        { name: "physical_address", label: "Physical Address", icon: <MapPin />, placeholder: "Street address, city" },
        { name: "postal_address", label: "Postal Address", icon: <Postal />, placeholder: "P.O. Box, city" },
      ]
    },
    {
      title: "Additional Information",
      icon: <FileText />,
      fields: [
        { name: "additional_requirements", label: "Additional Requirements", icon: <FileText />, placeholder: "Any special requirements or notes", fullWidth: true },
      ]
    }
  ];

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-card">
          <div className="loading-spinner"></div>
          <p>Loading client data...</p>
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
          <h2>Unable to Load Client</h2>
          <p className="error-message">{error}</p>
          <div className="error-actions">
            <button onClick={() => window.location.reload()} className="btn-retry">
              Try Again
            </button>
            <button onClick={() => navigate("/")} className="btn-home">
              Go to Directory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-client-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate(`/client/${id}`)} className="back-btn">
              <ArrowLeft />
            </button>
            <div className="header-icon">
              <Briefcase />
            </div>
            <div>
              <div className="header-title">
                <h1>Edit Client</h1>
                <span className="client-id-badge">ID: {id}</span>
              </div>
              <p className="header-subtitle">
                Update client information below
              </p>
            </div>
          </div>
          <div className="required-badge">
            <span className="required-star">*</span> Required fields
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {formSections.map((section, idx) => (
          <div key={idx} className="form-section">
            <div className="section-header">
              {section.icon}
              <h2>{section.title}</h2>
            </div>
            
            <div className="section-content">
              <div className="form-grid">
                {section.fields.map((field) => (
                  <div 
                    key={field.name} 
                    className={`form-group ${field.fullWidth ? 'full-width' : ''}`}
                  >
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required-asterisk">*</span>}
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">
                        {field.icon}
                      </span>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="form-input"
                      />
                    </div>
                    {field.name === 'owner_phone' && (
                      <p className="field-hint">
                        Format: 0777 123 456 or +263 77 123 4567
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate(`/client/${id}`)}
            className="btn-cancel"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-submit"
          >
            {submitting ? (
              <>
                <span className="spinner"></span>
                Updating Client...
              </>
            ) : (
              <>
                <Save />
                Update Client
              </>
            )}
          </button>
        </div>

        {/* Client Info */}
        <div className="client-info">
          <p>
            Editing client <span className="client-id">#{id}</span> • Changes will be saved immediately
          </p>
        </div>
      </form>

      {/* Warning Card */}
      <div className="warning-card">
        <div className="warning-icon">
          <AlertCircle />
        </div>
        <div className="warning-content">
          <h3>Important</h3>
          <ul className="warning-list">
            <li>Make sure all required fields (*) are filled correctly</li>
            <li>Changes will be immediately reflected in the client list</li>
            <li>Client history and previous versions are not saved</li>
          </ul>
        </div>
      </div>

      {/* Mobile Required Note */}
      <div className="mobile-required-note">
        <span className="required-star">*</span> Required fields
      </div>
    </div>
  );
};

export default EditClient;