import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { 
  Lock, 
  Mail, 
  LogIn, 
  Eye, 
  EyeOff, 
  Shield, 
  AlertCircle,
  Briefcase,
  CheckCircle,
  Copy,
  Fingerprint,
  Radio,
  Users,
  Target
} from "lucide-react";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "https://crm-system-staging-626e.up.railway.app/api/auth/login",
        { email, password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin", JSON.stringify(res.data.user));
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("name", res.data.user.name);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const autoFillCredentials = () => {
    setEmail("admin@crm.com");
    setPassword("Bobo.98@");
  };

  return (
    <div className="login-container">
      {/* Security Grid Background */}
      <div className="security-grid">
        <div className="grid-overlay"></div>
      </div>

      {/* Animated Security Elements */}
      <div className="security-elements">
        <div className="element-1">
          <Radio />
        </div>
        <div className="element-2">
          <Fingerprint />
        </div>
        <div className="element-3">
          <Target />
        </div>
        <div className="element-4">
          <Users />
        </div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="card-shine"></div>
        <div className="card-pattern"></div>
        
        <div className="card-content">
          {/* Company Header */}
          <div className="company-header">
            <div className="badge-container">
              <div className="security-badge">
                <Shield className="badge-icon" />
                <span>SECURE ACCESS</span>
              </div>
              <div className="badge-line"></div>
            </div>
            
            <div className="logo-wrapper">
              <div className="logo-icon">
                <Radio />
              </div>
              <div className="logo-text">
                <h1>REACTION UNIT</h1>
                <span>SOUTH AFRICA</span>
              </div>
            </div>

            <p className="welcome-text">
              Restricted Access • Authorized Personnel Only
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="error-alert">
              <AlertCircle className="error-icon" />
              <div className="error-content">
                <p className="error-title">Authentication Failed</p>
                <p className="error-message">{error}</p>
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={14} />
                <span>Operator ID / Email</span>
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@reactionunit.co.za"
                  className="form-input"
                />
                <div className={`input-status ${email ? 'filled' : ''}`}></div>
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="label-row">
                <label className="form-label">
                  <Lock size={14} />
                  <span>Access Code</span>
                </label>
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => alert("Contact Security Administrator")}
                >
                  Reset Code
                </button>
              </div>
              <div className="input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your access code"
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <div className={`input-status ${password ? 'filled' : ''}`}></div>
              </div>
            </div>

            {/* Security Options */}
            <div className="security-options">
              <label className="checkbox-wrapper">
                <input type="checkbox" id="remember" />
                <span className="checkbox-custom"></span>
                <span className="checkbox-label">Remember this device</span>
              </label>
              
              <div className="security-indicator">
                <span className="dot"></span>
                <span>Secure Connection</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-submit"
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Access Control Panel</span>
                </>
              )}
            </button>

            {/* Demo Credentials - Commented out for production */}
            {/* <div className="demo-section">
              <div className="demo-header">
                <Shield size={14} />
                <span>Training Mode Credentials</span>
              </div>
              <div className="demo-credentials">
                <div className="credential-row">
                  <span className="cred-label">ID:</span>
                  <code>admin@crm.com</code>
                </div>
                <div className="credential-row">
                  <span className="cred-label">Code:</span>
                  <code>Bobo.98@</code>
                </div>
                <button
                  type="button"
                  onClick={autoFillCredentials}
                  className="auto-fill-btn"
                >
                  <Copy size={12} />
                  Auto-fill Training Credentials
                </button>
              </div>
            </div> */}
          </form>

          {/* Footer */}
          <div className="login-footer">
            <div className="footer-links">
              <span>© {new Date().getFullYear()} Reaction Unit South Africa</span>
              <span className="separator">|</span>
              <span>All rights reserved</span>
              <span className="separator">|</span>
              <span>v2.0.1</span>
            </div>
            <p className="security-notice">
              Unauthorized access is prohibited and may result in prosecution
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;