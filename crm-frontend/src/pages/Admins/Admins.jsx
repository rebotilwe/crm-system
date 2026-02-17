import { useState, useEffect } from "react";
import api from "../../api/axios";
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Mail, 
  Lock, 
  User,
  Shield,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Power
} from "lucide-react";
import "./Admins.css";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "",
    role: "admin"
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admins");
      setAdmins(res.data);
    } catch (err) {
      setError("Could not load administrators list.");
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      await api.post("/admins", form);
      setSuccess(`Account for ${form.name} created successfully!`);
      setForm({ name: "", email: "", password: "", role: "admin" });
      fetchAdmins();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating admin account.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      // Logic: if currentStatus is 1 (true), send 0 (false)
      await api.patch(`/admins/${id}/status`, { is_active: currentStatus ? 0 : 1 });
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Are you sure? This action is permanent.")) return;
    try {
      await api.delete(`/admins/${id}`);
      fetchAdmins();
    } catch (err) {
      alert(err.response?.data?.message || "Error deleting admin.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "??";
  };

  return (
    <div className="admins-container">
      <div className="page-header">
        <h1 className="page-title">Admin Management</h1>
        <p className="page-subtitle">Manage system access and permissions</p>
      </div>

      <div className="content-grid">
        <div className="form-card">
          <div className="card-header">
            <UserPlus className="header-icon" />
            <h2>Create New User</h2>
          </div>
          
          <div className="card-content">
            {success && <div className="alert-message success-alert"><CheckCircle2 size={18} /> {success}</div>}
            {error && <div className="alert-message error-alert"><AlertCircle size={18} /> {error}</div>}

            <form onSubmit={addAdmin} className="admin-form">
              <div className="form-group">
                <label className="form-label"><User size={16} /> Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label"><Mail size={16} /> Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label"><Lock size={16} /> Password</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} className="form-input" required minLength={8} />
              </div>
              <div className="form-group">
                <label className="form-label"><Shield size={16} /> Role</label>
                <select name="role" value={form.role} onChange={handleChange} className="form-input">
                  <option value="admin">Administrator</option>
                  <option value="controller">Controller</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? <Loader2 className="spinner" size={18} /> : <><UserPlus size={18} /> Create Account</>}
              </button>
            </form>
          </div>
        </div>

        <div className="list-card">
          <div className="list-header">
            <div className="list-title"><Users /> <h2>Active Staff</h2></div>
            <span className="admin-count">{admins.length} Users</span>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div className="loading-state"><Loader2 className="spinner" size={32} /><p>Loading...</p></div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Role</th>
                    <th>Status & Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>
                        <div className="admin-info">
                          <div className="admin-avatar">{getInitials(admin.name)}</div>
                          <div className="admin-details">
                            <span className="admin-name">{admin.name}</span>
                            <span className="admin-email">{admin.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`role-badge ${admin.role?.toLowerCase()}`}>
                          {admin.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => toggleStatus(admin.id, admin.is_active)}
                            className={`btn-status ${admin.is_active ? 'active' : 'inactive'}`}
                          >
                            <Power size={12} /> {admin.is_active ? "Active" : "Disabled"}
                          </button>
                          <button onClick={() => deleteAdmin(admin.id)} className="btn-delete-icon">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admins;