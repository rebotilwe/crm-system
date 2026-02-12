import { useState, useEffect } from "react";
import axios from "axios";
import { 
  UserPlus, 
  Users, 
  Trash2, 
  Mail, 
  Lock, 
  User,
  Shield,
  AlertCircle 
} from "lucide-react";
import "./Admins.css";

const Admins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    password: "" 
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/admins", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAdmins(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addAdmin = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5000/api/admins",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setForm({ name: "", email: "", password: "" });
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Error adding admin. Please try again.");
    }
  };

  const deleteAdmin = async (id) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/admins/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert("Error deleting admin. Please try again.");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Get initials from name
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="admins-container">
      <div className="page-header">
        <h1 className="page-title">Admin Management</h1>
        <p className="page-subtitle">Manage system administrators and their permissions</p>
      </div>

      <div className="content-grid">
        {/* Add Admin Form Card */}
        <div className="form-card">
          <div className="card-header">
            <UserPlus />
            <h2>Add New Admin</h2>
          </div>
          <div className="card-content">
            <form onSubmit={addAdmin} className="admin-form">
              <div className="form-group">
                <label className="form-label">
                  <User />
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., John Doe"
                  value={form.name}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Lock />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
                <span className="password-hint">
                  <AlertCircle size={14} />
                  Minimum 8 characters
                </span>
              </div>

              <button type="submit" className="btn-submit">
                <UserPlus size={18} />
                Create Admin Account
              </button>
            </form>
          </div>
        </div>

        {/* Admin List Card */}
        <div className="list-card">
          <div className="list-header">
            <div className="list-title">
              <Users />
              <h2>System Administrators</h2>
            </div>
            <span className="admin-count">
              {admins.length} {admins.length === 1 ? 'Admin' : 'Admins'}
            </span>
          </div>

          <div className="table-responsive">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading administrators...</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Administrator</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {admins.length > 0 ? (
                    admins.map((admin) => (
                      <tr key={admin.id}>
                        <td>
                          <div className="admin-info">
                            <div className="admin-avatar">
                              {getInitials(admin.name)}
                            </div>
                            <div className="admin-details">
                              <span className="admin-name">{admin.name}</span>
                              <span className="admin-email">{admin.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-badge ${admin.role?.toLowerCase().replace('_', '-') || 'admin'}`}>
                            <Shield size={12} style={{ marginRight: '4px' }} />
                            {admin.role?.replace('_', ' ') || 'Admin'}
                          </span>
                        </td>
                        <td>
                          <button
                            onClick={() => deleteAdmin(admin.id)}
                            className="btn-delete"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3}>
                        <div className="empty-state">
                          <Users size={48} />
                          <p>No administrators found</p>
                          <p className="empty-subtitle">
                            Add your first admin using the form
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
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