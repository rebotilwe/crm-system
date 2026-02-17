// src/pages/AddClient/AddClient.jsx
import { useState, useEffect } from "react";
import api from "../../api/axios"; // Import our custom axios instance
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
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.business_name?.trim()) newErrors.business_name = "Business name is required";
    if (!formData.owner_name?.trim()) newErrors.owner_name = "Owner name is required";
    if (!formData.owner_phone?.trim()) {
      newErrors.owner_phone = "Owner phone is required";
    } else if (!/^[0-9+\-\s()]+$/.test(formData.owner_phone)) {
      newErrors.owner_phone = "Please enter a valid phone number";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // The interceptor automatically handles the Token and the Base URL
      const res = await api.post("/clients", formData);

      // Success logic
      setSuccessMessage(`Client "${formData.business_name}" added successfully!`);
      
      // Smooth redirect to dashboard after showing success message
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);

    } catch (err) {
      console.error("AddClient Error:", err);
      
      // We NO LONGER clear localStorage here. 
      // The Interceptor handles 401s globally.
      if (err.response?.status === 400) {
        setErrors(err.response.data.errors || { general: "Please check your input." });
      } else {
        setErrors({ general: err.response?.data?.message || "Failed to add client. Please try again." });
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
        { name: "business_name", label: "Business Name", icon: <Briefcase />, placeholder: "e.g., ABC Corporation", required: true },
        { name: "security_complement", label: "Security Complement", icon: <Shield />, placeholder: "e.g., 24/7 Surveillance" },
      ]
    },
    {
      id: "owner",
      title: "Owner Information",
      icon: <User />,
      description: "Contact details of the primary owner",
      fields: [
        { name: "owner_name", label: "Owner Name", icon: <User />, placeholder: "Full name", required: true },
        { name: "owner_email", label: "Owner Email", icon: <Mail />, placeholder: "owner@example.com", type: "email" },
      ]
    },
    {
      id: "contact",
      title: "Contact Information",
      icon: <Phone />,
      description: "Primary contact numbers",
      fields: [
        { name: "owner_phone", label: "Owner Phone", icon: <Phone />, placeholder: "e.g., 0777 123 456", required: true, type: "tel" },
        { name: "landline", label: "Landline", icon: <Landmark />, placeholder: "e.g., 0112 345 678", type: "tel" },
      ]
    },
    {
      id: "address",
      title: "Address Information",
      icon: <MapPin />,
      description: "Physical and postal addresses",
      fields: [
        { name: "physical_address", label: "Physical Address", icon: <Home />, placeholder: "Street address, city" },
        { name: "postal_address", label: "Postal Address", icon: <Mail />, placeholder: "P.O. Box" },
      ]
    },
    {
      id: "additional",
      title: "Additional Information",
      icon: <FileText />,
      description: "Special requirements or notes",
      fields: [
        { name: "additional_requirements", label: "Requirements", icon: <FileText />, placeholder: "Any special instructions...", type: "textarea" },
      ]
    }
  ];

  const getSectionStatus = (index) => {
    const section = formSections[index];
    const requiredFields = section.fields.filter(f => f.required).map(f => f.name);
    const filledRequired = requiredFields.every(field => formData[field]?.trim());
    
    if (filledRequired) return "completed";
    return index === currentSection ? "current" : "pending";
  };

  return (
    <div className="add-client-container">
      <div className="page-header">
        <div className="header-left">
          <button className="back-button" onClick={() => navigate("/dashboard")}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="page-title">Add New Client</h1>
            <p className="page-subtitle">Enter the client details to create a new record</p>
          </div>
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
              {getSectionStatus(index) === 'completed' ? <CheckCircle size={16} /> : <span>{index + 1}</span>}
            </div>
            <span className="step-label">{section.title}</span>
          </div>
        ))}
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="alert success">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
          <button className="close-alert" onClick={() => setSuccessMessage("")}><X size={16} /></button>
        </div>
      )}

      {errors.general && (
        <div className="alert error">
          <AlertCircle size={20} />
          <span>{errors.general}</span>
          <button className="close-alert" onClick={() => setErrors({})}><X size={16} /></button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {formSections.map((section, idx) => (
          <div key={idx} className={`form-section ${idx === currentSection ? 'expanded' : 'collapsed'}`}>
            <div className="section-header" onClick={() => setCurrentSection(idx)}>
              <div className="section-header-left">
                <div className={`section-icon ${getSectionStatus(idx)}`}>{section.icon}</div>
                <div>
                  <h2>{section.title}</h2>
                  <p className="section-description">{section.description}</p>
                </div>
              </div>
            </div>
            
            <div className="section-content">
              <div className="form-grid">
                {section.fields.map((field) => (
                  <div key={field.name} className={`form-group ${field.type === "textarea" ? "full-width" : ""}`}>
                    <label className="form-label">
                      {field.label} {field.required && <span className="required-asterisk">*</span>}
                    </label>
                    <div className={`input-wrapper ${errors[field.name] ? 'error' : ''}`}>
                      <span className="input-icon">{field.icon}</span>
                      {field.type === 'textarea' ? (
                        <textarea name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder} className="form-input" rows={4} />
                      ) : (
                        <input type={field.type || "text"} name={field.name} value={formData[field.name]} onChange={handleChange} placeholder={field.placeholder} className="form-input" />
                      )}
                    </div>
                    {errors[field.name] && <span className="error-message"><AlertCircle size={12} /> {errors[field.name]}</span>}
                  </div>
                ))}
              </div>

              <div className="section-navigation">
                {idx > 0 && (
                  <button type="button" className="nav-btn prev" onClick={() => setCurrentSection(idx - 1)}>
                    <ArrowLeft size={16} /> Previous
                  </button>
                )}
                {idx < formSections.length - 1 && (
                  <button type="button" className="nav-btn next" onClick={() => setCurrentSection(idx + 1)}>
                    Next <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button type="button" onClick={() => navigate("/dashboard")} className="btn-cancel">Cancel</button>
          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? <><span className="spinner"></span> Adding...</> : <><Save size={18} /> Add Client</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddClient;