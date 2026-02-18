/* Admins.jsx */
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { 
  UserPlus, Users, Trash2, Mail, Lock, User, Shield, 
  AlertCircle, Loader2, CheckCircle2, Power, Clock 
} from "lucide-react";
import "./Admins.css";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({ 
    name: "", email: "", password: "", role: "admin" 
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
      setError("Could not load personnel.");
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/admins", form);
      setSuccess(`Created account for ${form.name}`);
      setForm({ name: "", email: "", password: "", role: "admin" });
      fetchAdmins();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating account.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/admins/${id}/status`, { is_active: currentStatus ? 0 : 1 });
      fetchAdmins();
    } catch (err) {
      alert("Failed to update status");
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Are you sure? This is permanent.")) return;
    try {
      await api.delete(`/admins/${id}`);
      fetchAdmins();
    } catch (err) {
      alert("Error deleting user.");
    }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : "??";

  const formatLastLogin = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
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
            <UserPlus /> <h2>Create New User</h2>
          </div>
          <div className="card-content">
            {success && <div className="alert-message success-alert"><CheckCircle2 size={18} /> {success}</div>}
            {error && <div className="alert-message error-alert"><AlertCircle size={18} /> {error}</div>}
            <form onSubmit={addAdmin} className="admin-form">
              <div className="form-group">
                <label className="form-label"><User /> Full Name</label>
                <input type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="form-input" placeholder="e.g. John Doe" required />
              </div>
              <div className="form-group">
                <label className="form-label"><Mail /> Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="form-input" placeholder="john@crm.com" required />
              </div>
              <div className="form-group">
                <label className="form-label"><Lock /> Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="form-input" required />
              </div>
              <div className="form-group">
                <label className="form-label"><Shield /> Role</label>
                <select value={form.role} onChange={(e) => setForm({...form, role: e.target.value})} className="form-input">
                  <option value="admin">Administrator</option>
                  <option value="controller">Controller</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <button type="submit" className="btn-submit" disabled={submitting}>
                {submitting ? <Loader2 className="spinner" size={18} /> : "Create Account"}
              </button>
            </form>
          </div>
        </div>

        <div className="list-card">
      <div className="list-header">
  <div className="list-title-group">
    <div className="list-title">
      <Users /> 
      <h2>Active Staff</h2>
    </div>
    <div className="status-indicator">
      <span className="pulse-dot"></span>
      <span className="admin-count">{admins.length} Total Members</span>
    </div>
  </div>
</div>
          <div className="table-wrapper">
            {loading ? (
              <div className="loading-state"><div className="spinner"></div><p>Loading...</p></div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Staff Member</th>
                    <th>Role</th>
                    <th>Last Seen</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td data-label="Staff Member">
                        <div className="admin-info">
                          <div className="admin-avatar">{getInitials(admin.name)}</div>
                          <div className="admin-details">
                            <span className="admin-name">{admin.name}</span>
                            <span className="admin-email">{admin.email}</span>
                          </div>
                        </div>
                      </td>
                      <td data-label="Role">
                        <span className={`role-badge ${admin.role?.toLowerCase().replace('_', '-')}`}>
                          {admin.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td data-label="Last Seen">
                        <div className="last-login-cell"><Clock size={12} /> {formatLastLogin(admin.last_login)}</div>
                      </td>
                      <td data-label="Actions" className="text-right">
                        <div className="action-buttons">
                          <button onClick={() => toggleStatus(admin.id, admin.is_active)} className={`btn-status ${admin.is_active ? 'active' : 'inactive'}`}>
                            <Power size={12} /> {admin.is_active ? "Active" : "Disabled"}
                          </button>
                          <button onClick={() => deleteAdmin(admin.id)} className="btn-delete-icon"><Trash2 size={16} /></button>
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