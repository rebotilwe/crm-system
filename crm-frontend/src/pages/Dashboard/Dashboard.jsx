import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, ComposedChart, Bar
} from "recharts";
import { 
  Users, UserCog, Search, UserPlus, Upload, TrendingUp,
  Briefcase, Shield, Activity, Clock, Calendar, ArrowUpRight, 
  Download, LogIn, Trash2
} from "lucide-react";
import "./Dashboard.css";

const API_URL = "https://crm-system-staging-626e.up.railway.app";

const Dashboard = () => {
  const [stats, setStats] = useState({ clients: 0, admins: 0 });
  const [chartData, setChartData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setUserName(localStorage.getItem("name") || "Super Admin");
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const [sRes, cRes, aRes] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard/stats`, { headers }),
        axios.get(`${API_URL}/api/dashboard/clients-per-month`, { headers }),
        axios.get(`${API_URL}/api/activity/recent`, { headers })
      ]);

      console.log("Stats response:", sRes.data); // Debug log
      
      setStats({ 
        clients: sRes.data.clients || 0, 
        admins: sRes.data.admins || 0 
      });
      
      setChartData(cRes.data || []);
      setRecentActivity(aRes.data || []);
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateValue) => {
    if (!dateValue) return "Just now";
    const past = new Date(dateValue);
    if (isNaN(past.getTime())) return "Recently";
    const diff = Math.floor((new Date() - past) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return past.toLocaleDateString();
  };

  const getActivityIcon = (type) => {
    switch(type?.toLowerCase()) {
      case "add": return <UserPlus size={14} className="activity-icon add" />;
      case "delete": return <Trash2 size={14} className="activity-icon delete" />;
      case "login": return <LogIn size={14} className="activity-icon login" />;
      case "update": return <Upload size={14} className="activity-icon update" />;
      default: return <Activity size={14} className="activity-icon" />;
    }
  };

  // Calculate derived stats
  const activeClientsThisMonth = Math.round(stats.clients * 0.1) || 1; // Fallback to 1 if 0
  const growthRate = stats.clients > 0 ? ((activeClientsThisMonth / stats.clients) * 100).toFixed(1) : 0;
  const securityScore = 98; // This could come from your backend later

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, <span className="user-highlight">{userName}</span></h1>
          <p>Here's your security operations overview.</p>
        </div>
        <div className="date-badge">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>
      </div>

      <div className="stats-grid">
        {/* Total Clients Card */}
        <div className="stat-card" onClick={() => navigate("/search")}>
          <div className="card-header">
            <div className="icon-wrapper blue-bg"><Users /></div>
            <span className="card-badge">Total Clients</span>
          </div>
          <div className="card-value">
            <p>{loading ? "..." : stats.clients}</p>
            {stats.clients > 0 && (
              <div className="growth positive">
                <ArrowUpRight size={14} />
                <span>+{growthRate}%</span>
              </div>
            )}
          </div>
          <div className="card-footer">
            <span className="card-label">Active this month</span>
            <span className="card-stats">+{activeClientsThisMonth}</span>
          </div>
        </div>

        {/* System Admins Card */}
        <div className="stat-card" onClick={() => navigate("/admins")}>
          <div className="card-header">
            <div className="icon-wrapper green-bg"><UserCog /></div>
            <span className="card-badge">System Admins</span>
          </div>
          <div className="card-value">
            <p>{loading ? "..." : stats.admins}</p>
            <div className="growth positive">
              <span>Active</span>
            </div>
          </div>
          <div className="card-footer">
            <span className="card-label">Online now</span>
            <span className="card-stats">{stats.admins}</span>
          </div>
        </div>

        {/* Growth Rate Card */}
        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper purple-bg"><TrendingUp /></div>
            <span className="card-badge">Growth Rate</span>
          </div>
          <div className="card-value">
            <p>{growthRate}%</p>
          </div>
          <div className="card-footer">
            <span className="card-label">vs last month</span>
            <span className="card-stats">↑ {growthRate}%</span>
          </div>
        </div>

        {/* Security Score Card */}
        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper amber-bg"><Shield /></div>
            <span className="card-badge">Security Score</span>
          </div>
          <div className="card-value">
            <p>{securityScore}%</p>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${securityScore}%` }}></div>
          </div>
          <div className="card-footer">
            <span className="card-label">System status</span>
            <span className="card-stats">Secure</span>
          </div>
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
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{
                    borderRadius: '12px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="clients" 
                  fill="#3b82f620" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  connectNulls 
                />
                <Bar 
                  dataKey="target" 
                  barSize={20} 
                  fill="#e2e8f0" 
                  radius={[4, 4, 0, 0]} 
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <p>No chart data available</p>
            </div>
          )}
        </div>
      </div>

      <div className="bottom-grid">
        <div className="quick-actions">
          <div className="quick-header">
            <Briefcase size={20} />
            <div>
              <h2>Quick Actions</h2>
              <p>Frequently used operations</p>
            </div>
          </div>
          <div className="quick-grid">
            <button onClick={() => navigate("/search")} className="quick-action-btn">
              <div className="icon-wrapper blue-bg"><Search size={18} /></div>
              <div className="quick-action-content">
                <span className="action-title">Search Clients</span>
                <span className="action-desc">Find and manage clients</span>
              </div>
            </button>
            <button onClick={() => navigate("/add-client")} className="quick-action-btn">
              <div className="icon-wrapper green-bg"><UserPlus size={18} /></div>
              <div className="quick-action-content">
                <span className="action-title">Add Client</span>
                <span className="action-desc">Create new record</span>
              </div>
            </button>
            <button onClick={() => navigate("/upload-clients")} className="quick-action-btn">
              <div className="icon-wrapper purple-bg"><Upload size={18} /></div>
              <div className="quick-action-content">
                <span className="action-title">Bulk Upload</span>
                <span className="action-desc">Import CSV file</span>
              </div>
            </button>
            <button onClick={() => navigate("/reports")} className="quick-action-btn">
              <div className="icon-wrapper amber-bg"><Download size={18} /></div>
              <div className="quick-action-content">
                <span className="action-title">Reports</span>
                <span className="action-desc">Download analytics</span>
              </div>
            </button>
          </div>
        </div>

        <div className="recent-activity">
          <div className="activity-header">
            <div className="activity-title">
              <Clock size={18} />
              <h2>Recent Activity</h2>
            </div>
            {/* <button className="view-all-btn" onClick={() => navigate("/activity")}>
              View All
            </button> */}
          </div>
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon-wrapper">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-details">
                    <div className="activity-info">
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-client">{activity.client}</span>
                    </div>
                    <span className="activity-time">
                      {formatTimeAgo(activity.created_at)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No recent activity</p>
              </div>
            )}
          </div>
          <div className="activity-footer">
            <div className="security-threat">
              <Shield size={14} />
              <span>No threats detected</span>
            </div>
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;