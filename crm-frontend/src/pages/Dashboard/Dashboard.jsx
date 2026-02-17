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

      setStats({ clients: sRes.data.clients || 0, admins: sRes.data.admins || 0 });
      setChartData(cRes.data);
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
      default: return <Activity size={14} className="activity-icon" />;
    }
  };

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
        <div className="stat-card" onClick={() => navigate("/clients")}>
          <div className="card-header">
            <div className="icon-wrapper blue-bg"><Users /></div>
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
            <div className="icon-wrapper green-bg"><UserCog /></div>
            <span className="card-badge">System Admins</span>
          </div>
          <div className="card-value">
            <p>{loading ? "..." : stats.admins}</p>
            <div className="growth positive"><span>Active</span></div>
          </div>
          <div className="card-footer">
            <span className="card-label">Active now</span>
            <span className="card-stats">{stats.admins}</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper purple-bg"><TrendingUp /></div>
            <span className="card-badge">Growth Rate</span>
          </div>
          <div className="card-value"><p>12.5%</p></div>
        </div>

        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper amber-bg"><Shield /></div>
            <span className="card-badge">Security Score</span>
          </div>
          <div className="card-value"><p>98%</p></div>
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
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}} />
              <Area type="monotone" dataKey="clients" fill="#3b82f620" stroke="#3b82f6" strokeWidth={3} connectNulls />
              <Bar dataKey="target" barSize={20} fill="#e2e8f0" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bottom-grid">
        <div className="quick-actions">
          <div className="quick-header"><Briefcase size={20} /><h2>Quick Actions</h2></div>
          <div className="quick-grid">
            <button onClick={() => navigate("/clients")} className="quick-action-btn">
              <div className="icon-wrapper blue-bg"><Search size={18} /></div>
              <span>Search Clients</span>
            </button>
            <button onClick={() => navigate("/add-client")} className="quick-action-btn">
              <div className="icon-wrapper green-bg"><UserPlus size={18} /></div>
              <span>Add Client</span>
            </button>
          </div>
        </div>

        <div className="recent-activity">
          <div className="activity-header">
            <div className="activity-title"><Clock size={18} /><h2>Recent Activity</h2></div>
            <button className="view-all-btn" onClick={() => alert("Detailed logs coming soon!")}>View All</button>
          </div>
          <div className="activity-list">
            {recentActivity.slice(0, 5).map((activity) => (
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