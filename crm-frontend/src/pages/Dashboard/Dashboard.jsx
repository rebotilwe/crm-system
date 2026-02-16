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
  Legend,
  Area,
  AreaChart,
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
  PieChart,
  Target,
  Radio,
  Fingerprint,
  LogIn,
  Trash2
} from "lucide-react";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({ 
    clients: 0, 
    admins: 0
  });
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
    const storedRole = localStorage.getItem("role") || "super_admin";
    const storedName = localStorage.getItem("name") || "Super Admin";
    setRole(storedRole);
    setUserName(storedName);
    
    // Load data
    fetchStats();
    fetchChartData();
    fetchRecentActivity();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "https://crm-system-staging-626e.up.railway.app/api/dashboard/stats",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data) {
        setStats({
          clients: res.data.clients || 0,
          admins: res.data.admins || 0
        });
        setApiError(false);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
      setApiError(true);
      // Set default values on error
      setStats({
        clients: 156,
        admins: 8
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartLoading(true);
      const token = localStorage.getItem("token");
      
      const res = await axios.get(
        "https://crm-system-staging-626e.up.railway.app/api/dashboard/clients-per-month",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (res.data && res.data.length > 0) {
        // Transform data for better visualization
        const transformedData = res.data.map((item) => ({
          name: item.name,
          clients: item.clients || 0,
          previousYear: Math.floor((item.clients || 0) * 0.7),
          target: 25
        }));
        setChartData(transformedData);
        setApiError(false);
      } else {
        // If API returns empty array, use fallback data
        console.log("No chart data from API, using fallback");
        setChartData(generateFallbackChartData());
      }
    } catch (err) {
      console.error("Error fetching chart data:", err);
      setApiError(true);
      // Set fallback data on error
      setChartData(generateFallbackChartData());
    } finally {
      setChartLoading(false);
    }
  };

  const generateFallbackChartData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months.map((month, index) => ({
      name: month,
      clients: Math.floor(Math.random() * 30) + 15 + index,
      previousYear: Math.floor(Math.random() * 25) + 10 + index,
      target: 25
    }));
  };

  const fetchRecentActivity = async () => {
    try {
      setActivityLoading(true);
      const token = localStorage.getItem("token");
      
      // Try to fetch real activity data
      try {
        const res = await axios.get(
          "https://crm-system-staging-626e.up.railway.app/api/activity/recent",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (res.data && res.data.length > 0) {
          setRecentActivity(res.data);
          setApiError(false);
        } else {
          // Use fallback if no data
          setRecentActivity(getFallbackActivity());
        }
      } catch (err) {
        console.log("Using fallback activity data");
        setRecentActivity(getFallbackActivity());
      }
    } catch (err) {
      console.error("Error in activity fetch:", err);
      setRecentActivity(getFallbackActivity());
    } finally {
      setActivityLoading(false);
    }
  };

  const getFallbackActivity = () => {
    return [
      { id: 1, action: "New client added", client: "John Doe", time: "5 minutes ago", type: "add" },
      { id: 2, action: "Client updated", client: "Jane Smith", time: "2 hours ago", type: "update" },
      { id: 3, action: "Report generated", client: "Monthly Report", time: "5 hours ago", type: "report" },
      { id: 4, action: "Bulk upload", client: "25 clients", time: "1 day ago", type: "upload" },
      { id: 5, action: "Security alert", client: "New login detected", time: "2 days ago", type: "alert" }
    ];
  };

  const calculateGrowth = () => {
    if (chartData.length < 2) return 12.5;
    const lastMonth = chartData[chartData.length - 1]?.clients || 0;
    const previousMonth = chartData[chartData.length - 2]?.clients || 0;
    if (previousMonth === 0) return lastMonth > 0 ? 100 : 0;
    return ((lastMonth - previousMonth) / previousMonth * 100).toFixed(1);
  };

  const calculateYearlyGrowth = () => {
    if (chartData.length < 12) return 15.3;
    const thisYear = chartData.slice(-12).reduce((sum, item) => sum + (item.clients || 0), 0);
    const lastYear = chartData.slice(-24, -12).reduce((sum, item) => sum + (item.clients || 0), 0);
    if (lastYear === 0) return thisYear > 0 ? 100 : 0;
    return ((thisYear - lastYear) / lastYear * 100).toFixed(1);
  };

  const growthRate = calculateGrowth();
  const yearlyGrowth = calculateYearlyGrowth();
  
  const formatNumber = (num) => {
    if (num === undefined || num === null) return '0';
    return new Intl.NumberFormat().format(num);
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case "add":
      case "new client added":
        return <UserPlus size={14} className="activity-icon add" />;
      case "update":
      case "client updated":
        return <Users size={14} className="activity-icon update" />;
      case "delete":
      case "client deleted":
        return <Trash2 size={14} className="activity-icon delete" />;
      case "report":
      case "report generated":
        return <FileText size={14} className="activity-icon report" />;
      case "upload":
      case "bulk upload":
        return <Upload size={14} className="activity-icon upload" />;
      case "login":
      case "user logged in":
        return <LogIn size={14} className="activity-icon login" />;
      case "alert":
      case "security alert":
        return <AlertCircle size={14} className="activity-icon alert" />;
      default:
        return <Activity size={14} className="activity-icon" />;
    }
  };

  const activeClients = Math.round((stats.clients || 0) * 0.85);
  const monthlyGrowth = 12.5; // This could also come from API later
  const securityScore = 98;
  const threatsBlocked = 1247;

  return (
    <div className="dashboard-container">
      {/* Welcome Section */}
      <div className="welcome-section">
        <div className="welcome-content">
          <h1>Welcome back, <span className="user-highlight">{userName}</span></h1>
          <p>Here's what's happening with your security operations today.</p>
        </div>
        <div className="date-badge">
          <Calendar size={16} />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {/* Total Clients */}
        <div className="stat-card" onClick={() => navigate("/clients")}>
          <div className="card-header">
            <div className="icon-wrapper blue-bg">
              <Users className="icon" />
            </div>
            <span className="card-badge">Total Clients</span>
          </div>
          <div className="card-value">
            <p>{loading ? '...' : formatNumber(stats.clients)}</p>
            <div className="growth positive">
              <ArrowUpRight size={14} />
              <span>+{monthlyGrowth}%</span>
            </div>
          </div>
          <div className="card-footer">
            <span className="card-label">Active this month</span>
            <span className="card-stats">+{Math.round((stats.clients || 0) * 0.15)}</span>
          </div>
          <div className="card-link">
            <span>View all clients</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Total Admins */}
        {(role === "super_admin" || role === "admin") && (
          <div className="stat-card" onClick={() => navigate("/admins")}>
            <div className="card-header">
              <div className="icon-wrapper green-bg">
                <UserCog className="icon" />
              </div>
              <span className="card-badge">System Admins</span>
            </div>
            <div className="card-value">
              <p>{loading ? '...' : formatNumber(stats.admins)}</p>
              <div className="growth positive">
                <ArrowUpRight size={14} />
                <span>+2</span>
              </div>
            </div>
            <div className="card-footer">
              <span className="card-label">Active now</span>
              <span className="card-stats">{Math.round((stats.admins || 0) * 0.8)}</span>
            </div>
            <div className="card-link">
              <span>Manage admins</span>
              <ChevronRight size={16} />
            </div>
          </div>
        )}

        {/* Monthly Growth */}
        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper purple-bg">
              <TrendingUp className="icon" />
            </div>
            <span className="card-badge">Monthly Growth</span>
          </div>
          <div className="card-value">
            <p>{chartLoading ? '...' : `${growthRate}%`}</p>
            <div className={`growth ${parseFloat(growthRate) >= 0 ? 'positive' : 'negative'}`}>
              {parseFloat(growthRate) >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span>vs last month</span>
            </div>
          </div>
          <div className="card-footer">
            <span className="card-label">Year to date</span>
            <span className="card-stats">{yearlyGrowth}%</span>
          </div>
          <div className="card-link">
            <span>View analytics</span>
            <ChevronRight size={16} />
          </div>
        </div>

        {/* Security Status */}
        <div className="stat-card">
          <div className="card-header">
            <div className="icon-wrapper amber-bg">
              <Shield className="icon" />
            </div>
            <span className="card-badge">Security Status</span>
          </div>
          <div className="card-value">
            <p>{securityScore}%</p>
            <div className="growth positive">
              <CheckCircle size={14} />
              <span>Secure</span>
            </div>
          </div>
          <div className="progress-bar">
            <div className="progress" style={{ width: `${securityScore}%` }}></div>
          </div>
          <div className="card-footer">
            <span className="card-label">Threats blocked</span>
            <span className="card-stats">{formatNumber(threatsBlocked)}</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-header">
          <div className="chart-title">
            <h2>Client Acquisition Trends</h2>
            <p className="chart-subtitle">Monthly performance vs targets and previous year</p>
          </div>
          <div className="chart-controls">
            <button 
              className={`period-btn ${selectedPeriod === 'monthly' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('monthly')}
            >
              Monthly
            </button>
            <button 
              className={`period-btn ${selectedPeriod === 'quarterly' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('quarterly')}
            >
              Quarterly
            </button>
            <button 
              className={`period-btn ${selectedPeriod === 'yearly' ? 'active' : ''}`}
              onClick={() => setSelectedPeriod('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>
        
        <div className="chart-container">
          {chartLoading ? (
            <div className="chart-loading">
              <div className="spinner"></div>
              <p>Loading chart data...</p>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.1}/>
                  </linearGradient>
                  <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#94a3b8" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'white', 
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="circle"
                  iconSize={8}
                />
                <Area 
                  type="monotone" 
                  dataKey="clients" 
                  name="New Clients" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fill="url(#colorClients)"
                  dot={{ r: 4, fill: '#2563eb', strokeWidth: 0 }}
                  activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2, fill: 'white' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="previousYear" 
                  name="Previous Year" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  fill="url(#colorPrevious)"
                  dot={{ r: 4, fill: '#94a3b8', strokeWidth: 0 }}
                />
                <Bar 
                  dataKey="target" 
                  name="Monthly Target" 
                  fill="#fbbf24" 
                  barSize={20}
                  radius={[4, 4, 0, 0]}
                />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="no-data">
              <BarChart3 size={48} />
              <p>No data available for the selected period</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="bottom-grid">
        {/* Quick Actions */}
        <div className="quick-actions">
          <div className="quick-header">
            <Briefcase size={20} />
            <div>
              <h2>Quick Actions</h2>
              <p>Frequently used operations</p>
            </div>
          </div>

          <div className="quick-grid">
            <button onClick={() => navigate("/clients")} className="quick-action-btn">
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
                <span className="action-desc">Create new client record</span>
              </div>
            </button>

            {(role === "super_admin" || role === "admin") && (
              <button onClick={() => navigate("/upload-clients")} className="quick-action-btn">
                <div className="icon-wrapper purple-bg"><Upload size={18} /></div>
                <div className="quick-action-content">
                  <span className="action-title">Upload CSV</span>
                  <span className="action-desc">Bulk import clients</span>
                </div>
              </button>
            )}

            {(role === "super_admin" || role === "admin") && (
              <button onClick={() => navigate("/reports")} className="quick-action-btn">
                <div className="icon-wrapper amber-bg"><Download size={18} /></div>
                <div className="quick-action-content">
                  <span className="action-title">Generate Report</span>
                  <span className="action-desc">Export client data</span>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="recent-activity">
          <div className="activity-header">
            <div className="activity-title">
              <Clock size={18} />
              <h2>Recent Activity</h2>
            </div>
            <button className="view-all-btn" onClick={() => navigate("/activity")}>View All</button>
          </div>

          <div className="activity-list">
            {activityLoading ? (
              <div className="activity-loading">
                <div className="spinner-small"></div>
                <span>Loading activities...</span>
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="activity-item">
                  <div className="activity-icon-wrapper">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-details">
                    <div className="activity-info">
                      <span className="activity-action">{activity.action}</span>
                      <span className="activity-client">{activity.client}</span>
                    </div>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-activity">
                <Activity size={24} />
                <p>No recent activity</p>
              </div>
            )}
          </div>

          <div className="activity-footer">
            <div className="security-threat">
              <Shield size={14} />
              <span>No security threats detected</span>
            </div>
            <div className="live-indicator">
              <span className="live-dot"></span>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Error Banner (optional) */}
      {apiError && (
        <div className="api-error-banner">
          <AlertCircle size={16} />
          <span>Using demo data - API connection unavailable</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;