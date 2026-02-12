import { useState, useEffect } from "react";
import axios from "axios";
import {
  Download,
  FileText,
  Calendar,
  Users,
  TrendingUp,
  Shield,
  Building2,
  PieChart,
  BarChart3,
  FileSpreadsheet,
  Filter,
  ChevronDown,
  Printer,
  Mail
} from "lucide-react";
import "./Reports.css";

const Reports = () => {
  const [reportType, setReportType] = useState("clients");
  const [dateRange, setDateRange] = useState("month");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    newClients: 0,
    activeClients: 0,
    growth: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/dashboard/stats", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Calculate additional stats
      const totalClients = res.data.clients || 0;
      setStats({
        totalClients,
        newClients: Math.round(totalClients * 0.15), // 15% new clients
        activeClients: Math.round(totalClients * 0.85), // 85% active
        growth: 12.5
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    alert(`Exporting ${reportType} report as ${format.toUpperCase()}`);
    // Implement actual export logic here
  };

  const reportOptions = [
    { id: "clients", label: "Client Report", icon: <Users />, description: "Overview of all clients in the system" },
    { id: "activity", label: "Activity Report", icon: <TrendingUp />, description: "Client activity and engagement metrics" },
    { id: "security", label: "Security Report", icon: <Shield />, description: "Security complement analysis" },
    { id: "growth", label: "Growth Report", icon: <BarChart3 />, description: "Client acquisition and growth trends" }
  ];

  const dateRanges = [
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "quarter", label: "This Quarter" },
    { id: "year", label: "This Year" },
    { id: "custom", label: "Custom Range" }
  ];

  return (
    <div className="reports-container">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <FileText />
          </div>
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">
              Generate and export detailed reports about your clients
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <Users />
          </div>
          <div className="stat-details">
            <h3>Total Clients</h3>
            <p className="stat-number">{stats.totalClients}</p>
            <span className="stat-trend positive">+{stats.growth}% vs last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <TrendingUp />
          </div>
          <div className="stat-details">
            <h3>New Clients</h3>
            <p className="stat-number">{stats.newClients}</p>
            <span className="stat-trend positive">+15% this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <Building2 />
          </div>
          <div className="stat-details">
            <h3>Active Clients</h3>
            <p className="stat-number">{stats.activeClients}</p>
            <span className="stat-trend">85% active rate</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber">
            <Calendar />
          </div>
          <div className="stat-details">
            <h3>Report Period</h3>
            <p className="stat-number">{dateRanges.find(d => d.id === dateRange)?.label}</p>
            <span className="stat-trend">{new Date().getFullYear()}</span>
          </div>
        </div>
      </div>

      {/* Report Generator */}
      <div className="report-generator">
        <div className="generator-header">
          <h2>Generate Report</h2>
          <p>Select report type and date range to generate custom reports</p>
        </div>

        <div className="generator-content">
          {/* Report Type Selection */}
          <div className="selection-section">
            <label className="section-label">
              <FileText size={18} />
              Report Type
            </label>
            <div className="report-options">
              {reportOptions.map((option) => (
                <div
                  key={option.id}
                  className={`report-option ${reportType === option.id ? "active" : ""}`}
                  onClick={() => setReportType(option.id)}
                >
                  <div className="option-icon">{option.icon}</div>
                  <div className="option-details">
                    <h4>{option.label}</h4>
                    <p>{option.description}</p>
                  </div>
                  {reportType === option.id && (
                    <div className="active-indicator"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Date Range Selection */}
          <div className="selection-section">
            <label className="section-label">
              <Calendar size={18} />
              Date Range
            </label>
            <div className="date-range-options">
              {dateRanges.map((range) => (
                <button
                  key={range.id}
                  className={`date-range-btn ${dateRange === range.id ? "active" : ""}`}
                  onClick={() => setDateRange(range.id)}
                >
                  {range.label}
                </button>
              ))}
            </div>
            
            {dateRange === "custom" && (
              <div className="custom-date-range">
                <div className="date-input">
                  <label>From</label>
                  <input type="date" className="date-picker" />
                </div>
                <div className="date-input">
                  <label>To</label>
                  <input type="date" className="date-picker" />
                </div>
              </div>
            )}
          </div>

          {/* Additional Filters */}
          <div className="selection-section">
            <label className="section-label">
              <Filter size={18} />
              Additional Filters
            </label>
            <div className="filters-grid">
              <div className="filter-item">
                <label className="filter-label">Client Status</label>
                <select className="filter-select">
                  <option>All Clients</option>
                  <option>Active Only</option>
                  <option>Inactive Only</option>
                  <option>New Clients</option>
                </select>
              </div>
              <div className="filter-item">
                <label className="filter-label">Security Complement</label>
                <select className="filter-select">
                  <option>All</option>
                  <option>With Security</option>
                  <option>Without Security</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Export Actions */}
        <div className="export-actions">
          <div className="export-buttons">
            <button className="btn-export pdf" onClick={() => handleExport('pdf')}>
              <FileText size={18} />
              Export as PDF
            </button>
            <button className="btn-export excel" onClick={() => handleExport('excel')}>
              <FileSpreadsheet size={18} />
              Export as Excel
            </button>
            <button className="btn-export csv" onClick={() => handleExport('csv')}>
              <Download size={18} />
              Export as CSV
            </button>
          </div>
          <div className="action-buttons">
            <button className="btn-print">
              <Printer size={18} />
              Print
            </button>
            <button className="btn-email">
              <Mail size={18} />
              Email Report
            </button>
          </div>
        </div>
      </div>

      {/* Sample Report Preview */}
      <div className="report-preview">
        <div className="preview-header">
          <h3>Report Preview</h3>
          <span className="preview-badge">Sample Data</span>
        </div>
        
        <div className="preview-content">
          <table className="preview-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Security</th>
                <th>Added Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>ABC Corporation</td>
                <td>John Doe</td>
                <td>0777 123 456</td>
                <td>24/7 Surveillance</td>
                <td>2026-02-01</td>
                <td><span className="status-badge active">Active</span></td>
              </tr>
              <tr>
                <td>XYZ Enterprises</td>
                <td>Jane Smith</td>
                <td>0777 789 012</td>
                <td>Access Control</td>
                <td>2026-01-15</td>
                <td><span className="status-badge active">Active</span></td>
              </tr>
              <tr>
                <td>Global Solutions</td>
                <td>Mike Johnson</td>
                <td>0112 345 678</td>
                <td>None</td>
                <td>2025-12-10</td>
                <td><span className="status-badge inactive">Inactive</span></td>
              </tr>
              <tr>
                <td>Tech Innovations</td>
                <td>Sarah Williams</td>
                <td>0777 456 789</td>
                <td>CCTV Monitoring</td>
                <td>2026-02-05</td>
                <td><span className="status-badge active">Active</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="quick-reports">
        <h3>Quick Reports</h3>
        <div className="quick-reports-grid">
          <div className="quick-report-card">
            <div className="quick-report-icon">
              <Users />
            </div>
            <div className="quick-report-details">
              <h4>New Clients This Month</h4>
              <p className="quick-report-number">24</p>
              <span className="quick-report-trend">↑ 8% from last month</span>
            </div>
            <button className="quick-report-btn" onClick={() => handleExport('pdf')}>
              <Download size={16} />
            </button>
          </div>

          <div className="quick-report-card">
            <div className="quick-report-icon">
              <Shield />
            </div>
            <div className="quick-report-details">
              <h4>Security Complement Summary</h4>
              <p className="quick-report-number">67%</p>
              <span className="quick-report-trend">Clients with security</span>
            </div>
            <button className="quick-report-btn" onClick={() => handleExport('pdf')}>
              <Download size={16} />
            </button>
          </div>

          <div className="quick-report-card">
            <div className="quick-report-icon">
              <TrendingUp />
            </div>
            <div className="quick-report-details">
              <h4>Growth Rate (YTD)</h4>
              <p className="quick-report-number">+12.5%</p>
              <span className="quick-report-trend positive">↑ 2.3% vs target</span>
            </div>
            <button className="quick-report-btn" onClick={() => handleExport('pdf')}>
              <Download size={16} />
            </button>
          </div>

          <div className="quick-report-card">
            <div className="quick-report-icon">
              <Building2 />
            </div>
            <div className="quick-report-details">
              <h4>Top Locations</h4>
              <p className="quick-report-number">8</p>
              <span className="quick-report-trend">Cities with clients</span>
            </div>
            <button className="quick-report-btn" onClick={() => handleExport('pdf')}>
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;