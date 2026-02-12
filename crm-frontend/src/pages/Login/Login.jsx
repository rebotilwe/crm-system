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
  Copy
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
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
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
    <div style={{ 
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      position: 'relative'
    }}>
      {/* Background Decorations */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-10rem',
          right: '-10rem',
          width: '30rem',
          height: '30rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: '-10rem',
          left: '-10rem',
          width: '30rem',
          height: '30rem',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '50%',
          filter: 'blur(60px)'
        }}></div>
      </div>

      {/* Login Card */}
      <div className="login-card">
        <div className="card-gradient"></div>
        
        <div className="card-content">
          {/* Logo Section */}
          <div className="logo-section">
            <div className="logo-wrapper">
              <Briefcase />
            </div>
            <h1 className="logo-title">CRM Pro</h1>
            <p className="logo-subtitle">
              Sign in to access your dashboard
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="error-alert">
              <AlertCircle className="error-icon" />
              <p className="error-message">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Field */}
            <div className="form-group">
              <div className="form-label">
                <span>Email Address</span>
              </div>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Mail />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@crm.com"
                  className="form-input"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="form-label">
                <span>Password</span>
                <button
                  type="button"
                  className="forgot-link"
                  onClick={() => alert("Please contact your system administrator")}
                >
                  Forgot password?
                </button>
              </div>
              <div className="input-wrapper">
                <span className="input-icon">
                  <Lock />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="remember-me">
              <div className="checkbox-wrapper">
                <input
                  type="checkbox"
                  id="remember"
                />
                <label htmlFor="remember">Remember me</label>
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
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn />
                  Sign In
                </>
              )}
            </button>

            {/* Demo Credentials */}
            {/* <div className="divider">
              <div className="divider-line">
                <hr />
              </div>
              <div className="divider-text">
                <span>Demo Credentials</span>
              </div>
            </div>

            <div className="demo-credentials">
              <div className="demo-content">
                <Shield className="demo-icon" />
                <div className="demo-details">
                  <div className="demo-credential-item">
                    <span className="credential-label">Email:</span>
                    <span className="credential-value">admin@crm.com</span>
                  </div>
                  <div className="demo-credential-item">
                    <span className="credential-label">Password:</span>
                    <span className="credential-value">Bobo.98@</span>
                  </div>
                  <span className="demo-badge">
                    <CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />
                    Use these credentials to login
                  </span>
                  
                  <button
                    type="button"
                    onClick={autoFillCredentials}
                    className="auto-fill-btn"
                  >
                    <Copy size={14} />
                    Auto-fill credentials
                  </button>
                </div>
              </div>
            </div> */}
          </form>

          {/* Footer */}
          <div className="login-footer">
            <p className="copyright">
              © {new Date().getFullYear()} CRM Pro. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;