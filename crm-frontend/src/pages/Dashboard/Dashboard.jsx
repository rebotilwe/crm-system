import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Bar
} from "recharts";
import { 
  Users, 
  UserCog, 
  Search, 
  UserPlus, 
  Upload, 
  TrendingUp,
  Briefcase,
  Shield,
  Activity,
  Clock,
  CheckCircle,
  Calendar,
  ArrowUpRight,
  Download,
  LogIn,
  Trash2,
  AlertCircle
} from "lucide-react";
import "./Dashboard.css";

const API_URL = "https://crm-system-staging-626e.up.railway.app";

const Dashboard = () => {
  const [stats, setStats] = useState({ clients: 0, admins: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [activityLoading, setActivityLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedName = localStorage.getItem("name") || "Super Admin";
    setUserName(storedName);
    
    fetchStats();
    fetchChartData();
    fetchRecentActivity();
  }, []);

  // Fixes the "683 months ago" bug by correctly parsing DB timestamps
  const formatTimeAgo = (dateValue) => {
    if (!dateValue) return "Just now";
    const now = new Date();
    const past = new Date(dateValue);
    
    if (isNaN(past.getTime())) return "Recently";

    const diffInSeconds = Math.floor((now - past) / 1000);
    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return past.toLocaleDateString();
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/dashboard/stats`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setStats({ clients: res.data.clients || 0, admins: res.data.admins || 0 });
    } catch (err) {
      console.error("Stats error", err);
    } finally { setLoading(false); }
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/dashboard/clients-per-month`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setChartData(res.data?.length > 0 ? res.data : generateFallbackData());
    } catch (err) { setChartData(generateFallbackData()); } 
    finally { setChartLoading(false); }
  };

  const generateFallbackData = () => [
    { name: 'Jan', clients: 10, target: 25 },
    { name: 'Feb', clients: stats.clients, target: 25 }
  ];

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/activity/recent`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setRecentActivity(res.data || []);
    } catch (err) { console.error(err); } 
    finally { setActivityLoading(false); }
  };

  const getActivityIcon = (type) => {
    switch(type?.toLowerCase()) {
      case "add": return <UserPlus size={14} className="activity-icon add" />;
      case "delete": return <Trash2 size={14} className="activity-icon delete" />;
      case "login": return <LogIn size={14} className="activity-icon login" />;
      default: return <Activity size={14} className="activity-icon" />;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, <span className="user-highlight">{userName}</span></h1>
          <p>Here's what's happening with your security operations today.</p>
        </div>
        <div className="date-badge">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate("/clients")}>
          <div className="card-header">
            <div className="icon-wrapper blue-bg"><Users className="icon" /></div>
            <span className="card-badge">Total Clients</span>
          </div>
          <div className="card-value">
            <p>{loading ? "..." : stats.clients}</p>
            <div className="growth positive"><ArrowUpRight size={14} /><span>+12.5%</span></div>
          </div>
          <div className="card-footer">
            <span className="card-label">Active this month</span>
            <span className="card-stats">+{Math.round(stats.clients * 0.1)}</span>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate("/admins")}>
          <div className="card-header">
            <div className="icon-wrapper green-bg"><UserCog className="icon" /></div>
            <span className="card-badge">System Admins</span>
          </div>
          <div className="card-value">
            <p>{loading ? "..." : stats.admins}</p>
            <div className="growth positive"><ArrowUpRight size={14} /><span>Active</span></div>
          </div>
          <div className="card-footer">
            <span className="card-label">Active now</span>
            <span className="card-stats">{stats.admins > 0 ? stats.admins : 0}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper purple-bg"><TrendingUp className="icon" /></div>
            <span className="card-badge">Growth Rate</span>
          </div>
          <div className="card-value"><p>12.5%</p></div>
          <div className="card-footer"><span className="card-label">Yearly Progress</span><span className="card-stats">High</span></div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper amber-bg"><Shield className="icon" /></div>
            <span className="card-badge">Security Score</span>
          </div>
          <div className="card-value"><p>98%</p></div>
          <div className="progress-bar"><div className="progress" style={{ width: `98%` }}></div></div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header"><h2>Client Acquisition Trends</h2></div>
        <div className="chart-container">
          {chartLoading ? <div className="spinner"></div> : (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="clients" fill="#3b82f620" stroke="#3b82f6" strokeWidth={3} />
                <Bar dataKey="target" barSize={20} fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bottom-grid">
        <div className="quick-actions">
          <div className="quick-header"><Briefcase size={20} /><h2>Quick Actions</h2></div>
          <div className="quick-grid">
            <button onClick={() => navigate("/clients")} className="quick-action-btn"><div className="icon-wrapper blue-bg"><Search size={18} /></div><span>Search</span></button>
            <button onClick={() => navigate("/add-client")} className="quick-action-btn"><div className="icon-wrapper green-bg"><UserPlus size={18} /></div><span>Add Client</span></button>
            <button onClick={() => navigate("/upload-clients")} className="quick-action-btn"><div className="icon-wrapper purple-bg"><Upload size={18} /></div><span>Upload</span></button>
            <button onClick={() => navigate("/reports")} className="quick-action-btn"><div className="icon-wrapper amber-bg"><Download size={18} /></div><span>Reports</span></button>
          </div>
        </div>

        <div className="recent-activity">
          <div className="activity-header">
            <div className="activity-title"><Clock size={18} /><h2>Recent Activity</h2></div>
            <button className="view-all-btn" onClick={() => alert("Activity page coming soon!")}>View All</button>
          </div>
          <div className="activity-list">
            {activityLoading ? <span>Loading...</span> : recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon-wrapper">{getActivityIcon(activity.type)}</div>
                <div className="activity-details">
                  <div className="activity-info">
                    <span className="activity-action">{activity.action}</span>
                    <span className="activity-client">{activity.client}</span>
                  </div>
                  <span className="activity-time">{formatTimeAgo(activity.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;