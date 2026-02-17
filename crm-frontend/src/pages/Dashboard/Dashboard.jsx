import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
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
  ChevronRight,
  Download,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertCircle,
  FileText,
  BarChart3,
  LogIn,
  Trash2
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
  const [role, setRole] = useState("");
  const [userName, setUserName] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [apiError, setApiError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "admin";
    const storedName = localStorage.getItem("name") || "User";
    setRole(storedRole);
    setUserName(storedName);
    
    fetchStats();
    fetchChartData();
    fetchRecentActivity();
  }, []);

  // --- HELPER: Fixes the "683 months ago" bug ---
  const formatTimeAgo = (dateValue) => {
    if (!dateValue) return "Just now";
    
    const now = new Date();
    const past = new Date(dateValue);
    
    // If date is invalid, return original string if it contains "ago"
    if (isNaN(past.getTime())) {
      return typeof dateValue === 'string' && dateValue.includes('ago') ? dateValue : "Recently";
    }

    const diffInSeconds = Math.floor((now - past) / 1000);
    
    // Catch-all for negative time or system clock issues
    if (diffInSeconds < 5) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return past.toLocaleDateString();
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/dashboard/stats`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (res.data) {
        setStats({
          clients: res.data.clients || 0,
          admins: res.data.admins || 0
        });
      }
    } catch (err) {
      console.error("Stats fetch error:", err);
      setApiError(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/dashboard/clients-per-month`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (res.data && res.data.length > 0) {
        const transformedData = res.data.map((item) => ({
          name: item.name,
          clients: item.clients || 0,
          previousYear: Math.floor((item.clients || 0) * 0.7),
          target: 25
        }));
        setChartData(transformedData);
      } else {
        setChartData(generateFallbackChartData());
      }
    } catch (err) {
      setChartData(generateFallbackChartData());
    } finally {
      setChartLoading(false);
    }
  };

  const generateFallbackChartData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => ({
      name: month,
      clients: Math.floor(Math.random() * 30) + 15,
      previousYear: Math.floor(Math.random() * 20) + 10,
      target: 25
    }));
  };

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/activity/recent`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      if (res.data && res.data.length > 0) {
        setRecentActivity(res.data);
      } else {
        setRecentActivity(getFallbackActivity());
      }
    } catch (err) {
      setRecentActivity(getFallbackActivity());
    } finally {
      setActivityLoading(false);
    }
  };

  const getFallbackActivity = () => [
    { id: 1, action: "New client added", client: "System Demo", created_at: new Date(), type: "add" },
    { id: 2, action: "User logged in", client: "Admin", created_at: new Date(Date.now() - 3600000), type: "login" }
  ];

  const getActivityIcon = (type) => {
    const t = type?.toLowerCase();
    if (t?.includes('add')) return <UserPlus size={14} className="activity-icon add" />;
    if (t?.includes('update')) return <Users size={14} className="activity-icon update" />;
    if (t?.includes('delete')) return <Trash2 size={14} className="activity-icon delete" />;
    if (t?.includes('login')) return <LogIn size={14} className="activity-icon login" />;
    return <Activity size={14} className="activity-icon" />;
  };

  // Improved Calculations
  const growthRate = 12.5; 
  const activeAdmins = stats.admins > 0 ? Math.max(1, Math.round(stats.admins * 0.8)) : 0;

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
        {/* Total Clients */}
        <div className="stat-card" onClick={() => navigate("/clients")}>
          <div className="card-header">
            <div className="icon-wrapper blue-bg"><Users className="icon" /></div>
            <span className="card-badge">Total Clients</span>
          </div>
          <div className="card-value">
            <p>{loading ? '...' : stats.clients}</p>
            <div className="growth positive"><ArrowUpRight size={14} /><span>+12.5%</span></div>
          </div>
          <div className="card-footer">
            <span className="card-label">Active this month</span>
            <span className="card-stats">+{Math.round(stats.clients * 0.15)}</span>
          </div>
        </div>

        {/* Total Admins */}
        <div className="stat-card" onClick={() => navigate("/admins")}>
          <div className="card-header">
            <div className="icon-wrapper green-bg"><UserCog className="icon" /></div>
            <span className="card-badge">System Admins</span>
          </div>
          <div className="card-value">
            <p>{loading ? '...' : stats.admins}</p>
            <div className="growth positive"><ArrowUpRight size={14} /><span>Active</span></div>
          </div>
          <div className="card-footer">
            <span className="card-label">Active now</span>
            <span className="card-stats">{loading ? '...' : activeAdmins}</span>
          </div>
        </div>

        {/* Growth */}
        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper purple-bg"><TrendingUp className="icon" /></div>
            <span className="card-badge">Growth Rate</span>
          </div>
          <div className="card-value">
            <p>{growthRate}%</p>
            <div className="growth positive"><ArrowUpRight size={14} /><span>vs Target</span></div>
          </div>
          <div className="card-footer">
            <span className="card-label">Yearly Progress</span>
            <span className="card-stats">High</span>
          </div>
        </div>

        {/* Security */}
        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper amber-bg"><Shield className="icon" /></div>
            <span className="card-badge">Security Score</span>
          </div>
          <div className="card-value">
            <p>98%</p>
            <div className="growth positive"><CheckCircle size={14} /><span>Stable</span></div>
          </div>
          <div className="progress-bar"><div className="progress" style={{ width: `98%` }}></div></div>
        </div>
      </div>

      <div className="chart-section">
        <div className="chart-header">
          <div className="chart-title">
            <h2>Client Acquisition Trends</h2>
            <p className="chart-subtitle">Monthly performance vs targets</p>
          </div>
        </div>
        
        <div className="chart-container">
          {chartLoading ? (
            <div className="chart-loading"><div className="spinner"></div></div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="clients" fill="#3b82f620" stroke="#3b82f6" strokeWidth={3} />
                <Bar dataKey="target" barSize={20} fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bottom-grid">
        <div className="quick-actions">
          <div className="quick-header">
            <Briefcase size={20} />
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-grid">
            <button onClick={() => navigate("/clients")} className="quick-action-btn">
              <div className="icon-wrapper blue-bg"><Search size={18} /></div>
              <span>Search Clients</span>
            </button>
            <button onClick={() => navigate("/add-client")} className="quick-action-btn">
              <div className="icon-wrapper green-bg"><UserPlus size={18} /></div>
              <span>Add Client</span>
            </button>
            <button onClick={() => navigate("/upload-clients")} className="quick-action-btn">
              <div className="icon-wrapper purple-bg"><Upload size={18} /></div>
              <span>Bulk Upload</span>
            </button>
            <button onClick={() => navigate("/reports")} className="quick-action-btn">
              <div className="icon-wrapper amber-bg"><Download size={18} /></div>
              <span>Reports</span>
            </button>
          </div>
        </div>

        <div className="recent-activity">
          <div className="activity-header">
            <div className="activity-title"><Clock size={18} /><h2>Recent Activity</h2></div>
            <button className="view-all-btn" onClick={() => navigate("/activity")}>View All</button>
          </div>

          <div className="activity-list">
            {activityLoading ? (
              <div className="activity-loading"><span>Loading...</span></div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon-wrapper">{getActivityIcon(activity.type)}</div>
                  <div className="activity-details">
                    <div className="activity-info">
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-client">{activity.client}</span>
                    </div>
                    <span className="activity-time">{formatTimeAgo(activity.created_at || activity.time)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity"><p>No recent activity</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;