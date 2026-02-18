// src/pages/EditClient/EditClient.jsx
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
  Shield, 
  FileText, 
  ArrowLeft, 
  Save,
  Briefcase,
  AlertCircle,
  CheckCircle,
  Info,
  X,
  Edit3,
  Clock,
  Hash,
  Home,
  Globe,
  Lock
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
  const [successMessage, setSuccessMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [currentSection, setCurrentSection] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const res = await axios.get(
          `https://crm-system-staging-626e.up.railway.app/api/clients/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setFormData(res.data);
        setLastUpdated(new Date().toLocaleString());
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.business_name?.trim()) {
      newErrors.business_name = "Business name is required";
    }
    if (!formData.owner_name?.trim()) {
      newErrors.owner_name = "Owner name is required";
    }
    if (!formData.owner_phone?.trim()) {
      newErrors.owner_phone = "Owner phone is required";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.owner_phone)) {
      newErrors.owner_phone = "Please enter a valid phone number";
    }
    
    if (formData.owner_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.owner_email)) {
      newErrors.owner_email = "Please enter a valid email address";
    }

    return newErrors;
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  // Validate form
  const newErrors = validateForm();
  if (Object.keys(newErrors).length > 0) {
    setErrors(newErrors);
    const firstErrorField = document.querySelector('[data-error="true"]');
    if (firstErrorField) firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  setSubmitting(true);
  setErrors({});
  setSuccessMessage("");

  try {
    const token = localStorage.getItem("token");

    await axios.put(
      `https://crm-system-staging-626e.up.railway.app/api/clients/${id}`,
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setSuccessMessage(`Client "${formData.business_name}" updated successfully!`);
    setLastUpdated(new Date().toLocaleString());

    // Redirect after showing success message
    setTimeout(() => {
      setSuccessMessage("");
      navigate(`/client/${id}`); // Redirect to client detail page
    }, 1500); // Show message for 1.5s

  } catch (err) {
    console.error(err);

    if (err.response?.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.clear();
      navigate("/login");
    } else if (err.response?.status === 400) {
      setErrors(err.response.data.errors || { general: "Please check your input and try again." });
    } else {
      setErrors({ general: "Error updating client. Please try again." });
    }
  } finally {
    setSubmitting(false);
  }
};


  const formSections = [
    {
      id: "business",
      title: "Business Information",
      icon: <Building2 />,
      description: "Update business details",
      fields: [
        { 
          name: "business_name", 
          label: "Business Name", 
          icon: <Briefcase />, 
          placeholder: "e.g., ABC Corporation", 
          required: true,
          type: "text"
        },
        { 
          name: "security_complement", 
          label: "Security Complement", 
          icon: <Shield />, 
          placeholder: "e.g., 24/7 Surveillance, Armed Response",
          type: "text"
        },
      ]
    },
    {
      id: "owner",
      title: "Owner Information",
      icon: <User />,
      description: "Contact details of the primary owner",
      fields: [
        { 
          name: "owner_name", 
          label: "Owner Name", 
          icon: <User />, 
          placeholder: "Full name of owner", 
          required: true,
          type: "text"
        },
        { 
          name: "owner_email", 
          label: "Owner Email", 
          icon: <Mail />, 
          placeholder: "owner@example.com", 
          type: "email"
        },
      ]
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: <Phone />,
      description: "Primary contact numbers",
      fields: [
        { 
          name: "owner_phone", 
          label: "Owner Phone", 
          icon: <Phone />, 
          placeholder: "e.g., 0777 123 456", 
          required: true,
          type: "tel"
        },
        { 
          name: "landline", 
          label: "Landline", 
          icon: <Landmark />, 
          placeholder: "e.g., 0112 345 678",
          type: "tel"
        },
      ]
    },
    {
      id: "address",
      title: "Address Information",
      icon: <MapPin />,
      description: "Physical and postal addresses",
      fields: [
        { 
          name: "physical_address", 
          label: "Physical Address", 
          icon: <Home />, 
          placeholder: "Street address, city, province",
          type: "text"
        },
        { 
          name: "postal_address", 
          label: "Postal Address", 
          icon: <Mail />, 
          placeholder: "P.O. Box, city, postal code",
          type: "text"
        },
      ]
    },
    {
      id: "additional",
      title: "Additional Information",
      icon: <FileText />,
      description: "Any special requirements or notes",
      fields: [
        { 
          name: "additional_requirements", 
          label: "Additional Requirements", 
          icon: <FileText />, 
          placeholder: "Any special requirements, notes, or instructions...",
          type: "textarea"
        },
      ]
    }
  ];

  const getSectionStatus = (sectionIndex) => {
    const section = formSections[sectionIndex];
    const requiredFields = section.fields.filter(f => f.required).map(f => f.name);
    const filledRequired = requiredFields.every(field => formData[field]?.trim());
    
    if (filledRequired) return "completed";
    if (sectionIndex === currentSection) return "current";
    return "pending";
  };

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
            <AlertCircle size={48} />
          </div>
          <h2>Unable to Load Client</h2>
          <p className="error-message">{error}</p>
        
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
            {/* <button onClick={() => navigate(`/client/${id}`)} className="back-btn">
              <ArrowLeft size={20} />
            </button> */}
            <div className="header-icon">
              <Edit3 size={24} />
            </div>
            <div>
              <div className="header-title">
                <h1>Edit Client</h1>
                <div className="client-id-badge">
                  <Hash size={12} />
                  <span>{id}</span>
                </div>
              </div>
              <div className="header-meta">
                <span className="meta-item">
                  <Clock size={14} />
                  Last updated: {lastUpdated || 'Just now'}
                </span>
                <span className="meta-item">
                  <Lock size={14} />
                  Secure edit mode
                </span>
              </div>
            </div>
          </div>
          <div className="required-badge">
            <span className="required-star">*</span> Required fields
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="alert success">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
          <button className="close-alert" onClick={() => setSuccessMessage("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* General Error */}
      {errors.general && (
        <div className="alert error">
          <AlertCircle size={20} />
          <span>{errors.general}</span>
          <button className="close-alert" onClick={() => setErrors({})}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="form-progress">
        {formSections.map((section, index) => (
          <div 
            key={section.id}
            className={`progress-step ${getSectionStatus(index)} ${index === currentSection ? 'active' : ''}`}
            onClick={() => setCurrentSection(index)}
          >
            <div className="step-indicator">
              {getSectionStatus(index) === 'completed' ? (
                <CheckCircle size={14} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="step-label">{section.title}</span>
          </div>
        ))}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {formSections.map((section, idx) => (
          <div 
            key={idx} 
            className={`form-section ${idx === currentSection ? 'expanded' : 'collapsed'}`}
          >
            <div 
              className="section-header"
              onClick={() => setCurrentSection(idx)}
            >
              <div className="section-header-left">
                <div className={`section-icon ${getSectionStatus(idx)}`}>
                  {section.icon}
                </div>
                <div>
                  <h2>{section.title}</h2>
                  <p className="section-description">{section.description}</p>
                </div>
              </div>
              <div className="section-status">
                {getSectionStatus(idx) === 'completed' && (
                  <span className="status-badge completed">
                    <CheckCircle size={14} />
                    Completed
                  </span>
                )}
                {idx === currentSection && (
                  <span className="status-badge current">Current</span>
                )}
              </div>
            </div>
            
            <div className="section-content">
              <div className="form-grid">
                {section.fields.map((field) => (
                  <div 
                    key={field.name} 
                    className={`form-group ${field.name === "additional_requirements" ? "full-width" : ""}`}
                    data-error={!!errors[field.name]}
                  >
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required-asterisk">*</span>}
                    </label>
                    <div className={`input-wrapper ${errors[field.name] ? 'error' : ''}`}>
                      <span className="input-icon">{field.icon}</span>
                      {field.type === 'textarea' ? (
                        <textarea
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className="form-input"
                          rows={4}
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={formData[field.name] || ""}
                          onChange={handleChange}
                          required={field.required}
                          placeholder={field.placeholder}
                          className="form-input"
                        />
                      )}
                    </div>
                    {errors[field.name] && (
                      <span className="error-message">
                        <AlertCircle size={12} />
                        {errors[field.name]}
                      </span>
                    )}
                    {field.name === 'owner_phone' && !errors[field.name] && (
                      <p className="field-hint">
                        <Info size={12} />
                        Format: 0777 123 456 or +27 77 123 4567
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Section Navigation */}
              <div className="section-navigation">
                {idx > 0 && (
                  <button 
                    type="button"
                    className="nav-btn prev"
                    onClick={() => setCurrentSection(idx - 1)}
                  >
                    <ArrowLeft size={16} />
                    Previous
                  </button>
                )}
                {idx < formSections.length - 1 && (
                  <button 
                    type="button"
                    className="nav-btn next"
                    onClick={() => setCurrentSection(idx + 1)}
                  >
                    Next
                 <ArrowLeft size={16} />

                  </button>
                )}
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
                <Save size={18} />
                Update Client
              </>
            )}
          </button>
        </div>

        {/* Client Info */}
        <div className="client-info">
          <Info size={14} />
          <p>
            Editing client <span className="client-id">#{id}</span> • Changes will be saved immediately
          </p>
        </div>
      </form>

      {/* Warning Card */}
      <div className="warning-card">
        <div className="warning-icon">
          <AlertCircle size={20} />
        </div>
        <div className="warning-content">
          <h3>Important Information</h3>
          <ul className="warning-list">
            <li>
              <CheckCircle size={14} />
              Make sure all required fields (*) are filled correctly
            </li>
            <li>
              <CheckCircle size={14} />
              Changes will be immediately reflected in the client list
            </li>
            <li>
              <CheckCircle size={14} />
              All edits are logged for security purposes
            </li>
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