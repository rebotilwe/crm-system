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
  Mail as Postal, 
  Shield, 
  FileText, 
  Save
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
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/api/clients", formData);
      alert(`Client added successfully! ID: ${res.data.id}`);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Error adding client. Please try again.");
    } finally {
      setLoading(false);
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
        { name: "postal_address", label: "Postal Address", icon: <MapPin />, placeholder: "P.O. Box, city" },
      ]
    },
    {
      title: "Additional Information",
      icon: <FileText />,
      fields: [
        { name: "additional_requirements", label: "Additional Requirements", icon: <FileText />, placeholder: "Any special requirements or notes" },
      ]
    }
  ];

  return (
    <div className="add-client-container">
      <div className="page-header">
        <h1 className="page-title">Add New Client</h1>
        <p className="page-subtitle">Fill in the client details below</p>
      </div>

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
                    className={`form-group ${field.name === "additional_requirements" ? "full-width" : ""}`}
                  >
                    <label className="form-label">
                      {field.label}
                      {field.required && <span className="required-asterisk">*</span>}
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">{field.icon}</span>
                      <input
                        type={field.type || "text"}
                        name={field.name}
                        value={formData[field.name]}
                        onChange={handleChange}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="form-input"
                      />
                    </div>
                    {field.name === 'owner_phone' && (
                      <p className="field-hint">Format: 0777 123 456 or +263 77 123 4567</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

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
                <Save />
                Add Client
              </>
            )}
          </button>
        </div>
      </form>

      <div className="tips-card">
        <div className="tips-icon">
          <FileText />
        </div>
        <div>
          <h3 className="tips-title">Quick Tips:</h3>
          <ul className="tips-list">
            <li>Business Name, Owner Name, and Owner Phone are required fields</li>
            <li>Include country code for international phone numbers</li>
            <li>You can edit client details later from the client list</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AddClient;