// src/pages/Dashboard/Dashboard.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
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
  Download
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({ clients: 0, admins: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role") || "";
    setRole(storedRole);
    fetchStats();
    fetchChartData();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/dashboard/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStats(res.data);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/dashboard/clients-per-month",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setChartData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setChartLoading(false);
    }
  };

  const calculateGrowth = () => {
    if (chartData.length < 2) return 0;
    const lastMonth = chartData[chartData.length - 1]?.clients || 0;
    const previousMonth = chartData[chartData.length - 2]?.clients || 0;
    if (previousMonth === 0) return lastMonth > 0 ? 100 : 0;
    return ((lastMonth - previousMonth) / previousMonth * 100).toFixed(1);
  };

  const growthRate = calculateGrowth();
  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  return (
    <div className="dashboard-container">
      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Total Clients */}
        <div className="stat-card" onClick={() => navigate("/clients")}>
          <div className="card-header">
            <div className="icon-wrapper blue-bg">
              <Users className="icon" />
            </div>
            <span className="card-badge">Total</span>
          </div>
          <h3>Total Clients</h3>
          <div className="card-value">
            <p>{loading ? '...' : formatNumber(stats.clients)}</p>
            <div className="growth positive">
              <TrendingUp className="icon-small" /> +12%
            </div>
          </div>
          <button className="card-link">
            View all clients <ChevronRight className="icon-small" />
          </button>
        </div>

        {/* Total Admins */}
        {(role === "super_admin" || role === "admin") && (
          <div className="stat-card" onClick={() => navigate("/admins")}>
            <div className="card-header">
              <div className="icon-wrapper green-bg">
                <UserCog className="icon" />
              </div>
              <span className="card-badge">System</span>
            </div>
            <h3>Total Admins</h3>
            <div className="card-value">
              <p>{loading ? '...' : formatNumber(stats.admins)}</p>
            </div>
            <span className="card-footer">Active administrators</span>
          </div>
        )}

        {/* Monthly Growth */}
        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper purple-bg">
              <TrendingUp className="icon" />
            </div>
            <span className="card-badge">Growth</span>
          </div>
          <h3>Monthly Growth</h3>
          <div className="card-value">
            <p>{chartLoading ? '...' : `${growthRate}%`}</p>
            <span className={`growth ${parseFloat(growthRate) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(growthRate) >= 0 ? '↑' : '↓'} vs last month
            </span>
          </div>
          <span className="card-footer">Based on new client additions</span>
        </div>

        {/* Active Clients */}
        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper amber-bg">
              <Shield className="icon" />
            </div>
            <span className="card-badge">Activity</span>
          </div>
          <h3>Active Clients</h3>
          <div className="card-value">
            <p>{loading ? '...' : formatNumber(Math.round(stats.clients * 0.85))}</p>
            <span className="growth positive">85% active</span>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <h2>Client Acquisition Trends</h2>
          <p className="chart-subtitle">Monthly client additions for {new Date().getFullYear()}</p>
        </div>
        
        <div className="chart-container">
          {chartLoading ? (
            <div className="chart-loading">
              <div className="spinner"></div>
              <p>Loading chart data...</p>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="clients"
                  name="New Clients"
                  stroke="#2563eb"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#2563eb' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <Activity className="icon-large" />
              <p>No data available</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <div className="quick-header">
          <Briefcase className="icon" />
          <div>
            <h2>Quick Actions</h2>
            <p>Frequently used operations</p>
          </div>
        </div>

        <div className="quick-grid">
          <button onClick={() => navigate("/clients")} className="quick-action-btn">
            <div className="icon-wrapper blue-bg"><Search className="icon" /></div>
            <span>Search Clients</span>
          </button>

          <button onClick={() => navigate("/add-client")} className="quick-action-btn">
            <div className="icon-wrapper green-bg"><UserPlus className="icon" /></div>
            <span>Add Client</span>
          </button>

          {(role === "super_admin" || role === "admin") && (
            <button onClick={() => navigate("/upload-clients")} className="quick-action-btn">
              <div className="icon-wrapper purple-bg"><Upload className="icon" /></div>
              <span>Upload CSV</span>
            </button>
          )}

          {(role === "super_admin" || role === "admin") && (
            <button onClick={() => navigate("/reports")} className="quick-action-btn">
              <div className="icon-wrapper amber-bg"><Download className="icon" /></div>
              <span>Generate Report</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;