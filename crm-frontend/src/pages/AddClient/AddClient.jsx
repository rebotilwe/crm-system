// src/pages/AddClient/AddClient.jsx
import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  User, 
  Phone, 
  Landmark, 
  Mail, 
  MapPin, 
  Shield, 
  FileText, 
  Save,
  ArrowLeft,
  Info,
  CheckCircle,
  AlertCircle,
  Briefcase,
  Home,
  Globe,
  Hash,
  X
} from "lucide-react";
import "./AddClient.css";

const AddClient = () => {
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

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");
  const [currentSection, setCurrentSection] = useState(0);
  const navigate = useNavigate();

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
      // Scroll to first error
      const firstErrorField = document.querySelector('[data-error="true"]');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Session expired. Please login again.");
        navigate("/login");
        return;
      }

      const res = await axios.post(
        "https://crm-system-staging-626e.up.railway.app/api/clients",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessMessage(`Client "${formData.business_name}" added successfully!`);
      
      // Show success message and redirect after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (err) {
      console.error("Add Client Error:", err.response || err);

      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
      } else if (err.response?.status === 400) {
        setErrors(err.response.data.errors || { general: "Please check your input and try again." });
      } else {
        setErrors({ general: "Error adding client. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const formSections = [
    {
      id: "business",
      title: "Business Information",
      icon: <Building2 />,
      description: "Enter the primary business details",
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

  return (
    <div className="add-client-container">
      {/* Header with Back Button */}
      <div className="page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate("/")}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Add New Client</h1>
            <p className="page-subtitle">Enter the client details to create a new record</p>
          </div>
        </div>
        <div className="header-badge">
          <Shield size={16} />
          <span>Secure Form</span>
        </div>
      </div>

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
                <CheckCircle size={16} />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            <span className="step-label">{section.title}</span>
          </div>
        ))}
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

      <form onSubmit={handleSubmit}>
        {/* Form Sections */}
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
                          value={formData[field.name]}
                          onChange={handleChange}
                          placeholder={field.placeholder}
                          className="form-input"
                          rows={4}
                        />
                      ) : (
                        <input
                          type={field.type || "text"}
                          name={field.name}
                          value={formData[field.name]}
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
                    <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Form Actions */}
        <div className="form-actions">
          <button type="button" onClick={() => navigate("/")} className="btn-cancel">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? (
              <>
                <span className="spinner"></span>
                Adding Client...
              </>
            ) : (
              <>
                <Save size={18} />
                Add Client
              </>
            )}
          </button>
        </div>
      </form>

      {/* Tips Card */}
      <div className="tips-card">
        <div className="tips-icon">
          <Info size={20} />
        </div>
        <div className="tips-content">
          <h3 className="tips-title">Quick Tips:</h3>
          <ul className="tips-list">
            <li>
              <CheckCircle size={14} />
              <span>Business Name, Owner Name, and Owner Phone are required fields</span>
            </li>
            <li>
              <CheckCircle size={14} />
              <span>Include country code for international phone numbers (+27 for South Africa)</span>
            </li>
            <li>
              <CheckCircle size={14} />
              <span>You can edit client details later from the client list</span>
            </li>
            <li>
              <CheckCircle size={14} />
              <span>All information is encrypted and secure</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddClient;