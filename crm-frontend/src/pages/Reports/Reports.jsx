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
  BarChart3,
  FileSpreadsheet,
  Printer,
  Mail
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Reports.css";

const API_URL = "https://crm-system-staging-626e.up.railway.app";

const Reports = () => {
  const [reportType, setReportType] = useState("clients");
  const [dateRange, setDateRange] = useState("month");
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState({
    totalClients: 0,
    newClients: 0,
    activeClients: 0,
    growth: 0,
    topLocations: 0
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchClients();
  }, [dateRange]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const allClients = res.data || [];
      const now = new Date();

      const filteredClients = allClients.filter(c => {
        const created = new Date(c.created_at);
        switch (dateRange) {
          case "today":
            return created.toDateString() === now.toDateString();
          case "week":
            const weekStart = new Date(now);
            weekStart.setDate(now.getDate() - now.getDay());
            return created >= weekStart;
          case "month":
            return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          case "quarter":
            const currentQuarter = Math.floor(now.getMonth() / 3);
            const clientQuarter = Math.floor(created.getMonth() / 3);
            return clientQuarter === currentQuarter && created.getFullYear() === now.getFullYear();
          case "year":
            return created.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });

      setClients(filteredClients);

      const totalClients = filteredClients.length;

      const newClients = filteredClients.filter(c => {
        const created = new Date(c.created_at);
        return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
      }).length;

      const activeClients = filteredClients.filter(c => c.security_complement).length;

      const growthYTD = (() => {
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const clientsStartYear = allClients.filter(c => new Date(c.created_at) < startOfYear).length;
        return clientsStartYear === 0 ? totalClients : Math.round((totalClients / clientsStartYear - 1) * 100);
      })();

      const topLocations = new Set(filteredClients.map(c => c.physical_address)).size;

      setStats({
        totalClients,
        newClients,
        activeClients,
        growth: growthYTD,
        topLocations
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(clients.map(c => ({
      "Business Name": c.business_name,
      "Owner Name": c.owner_name,
      "Phone": c.owner_phone,
      "Email": c.owner_email || "N/A",
      "Security Complement": c.security_complement || "None",
      "Physical Address": c.physical_address || "N/A",
      "Postal Address": c.postal_address || "N/A",
      "Created At": new Date(c.created_at).toLocaleDateString(),
      "Status": c.security_complement ? "Active" : "Inactive"
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, "Client_Report.xlsx");
  };

  const exportToCSV = () => {
    const worksheet = XLSX.utils.json_to_sheet(clients.map(c => ({
      "Business Name": c.business_name,
      "Owner Name": c.owner_name,
      "Phone": c.owner_phone,
      "Email": c.owner_email || "N/A",
      "Security Complement": c.security_complement || "None",
      "Physical Address": c.physical_address || "N/A",
      "Postal Address": c.postal_address || "N/A",
      "Created At": new Date(c.created_at).toLocaleDateString(),
      "Status": c.security_complement ? "Active" : "Inactive"
    })));
    const csv = XLSX.utils.sheet_to_csv(worksheet);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Client_Report.csv");
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Business Name", "Owner", "Phone", "Email", "Security", "Physical Address", "Postal Address", "Created At", "Status"];
    const tableRows = clients.map(c => [
      c.business_name,
      c.owner_name,
      c.owner_phone,
      c.owner_email || "N/A",
      c.security_complement || "None",
      c.physical_address || "N/A",
      c.postal_address || "N/A",
      new Date(c.created_at).toLocaleDateString(),
      c.security_complement ? "Active" : "Inactive"
    ]);
    doc.autoTable(tableColumn, tableRows, { startY: 20 });
    doc.text("Client Report", 14, 15);
    doc.save("Client_Report.pdf");
  };

  const handleExport = (format) => {
    if (format === "pdf") exportToPDF();
    if (format === "excel") exportToExcel();
    if (format === "csv") exportToCSV();
  };

  const reportOptions = [
    { id: "clients", label: "Client Report" },
    { id: "activity", label: "Activity Report" },
    { id: "security", label: "Security Report" },
    { id: "growth", label: "Growth Report" }
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
          <div className="header-icon"><FileText /></div>
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Generate and export detailed reports about your clients</p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Users /></div>
          <div className="stat-details">
            <h3>Total Clients</h3>
            <p className="stat-number">{stats.totalClients}</p>
            <span className="stat-trend positive">{stats.growth}% YTD Growth</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green"><TrendingUp /></div>
          <div className="stat-details">
            <h3>New Clients</h3>
            <p className="stat-number">{stats.newClients}</p>
            <span className="stat-trend positive">New this month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple"><Building2 /></div>
          <div className="stat-details">
            <h3>Active Clients</h3>
            <p className="stat-number">{stats.activeClients}</p>
            <span className="stat-trend">Clients with security</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amber"><Calendar /></div>
          <div className="stat-details">
            <h3>Top Locations</h3>
            <p className="stat-number">{stats.topLocations}</p>
            <span className="stat-trend">Cities/Addresses</span>
          </div>
        </div>
      </div>

      {/* Report Preview */}
      <div className="report-preview">
        <div className="preview-header"><h3>Report Preview</h3></div>
        <div className="preview-content">
          <table className="preview-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Security</th>
                <th>Physical Address</th>
                <th>Postal Address</th>
                <th>Added Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map(c => (
                <tr key={c.id}>
                  <td>{c.business_name}</td>
                  <td>{c.owner_name}</td>
                  <td>{c.owner_phone}</td>
                  <td>{c.owner_email || "N/A"}</td>
                  <td>{c.security_complement || "None"}</td>
                  <td>{c.physical_address || "N/A"}</td>
                  <td>{c.postal_address || "N/A"}</td>
                  <td>{new Date(c.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`status-badge ${c.security_complement ? "active" : "inactive"}`}>
                      {c.security_complement ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="quick-reports">
        <h3>Quick Reports</h3>
        <div className="quick-reports-grid">
          <div className="quick-report-card">
            <div className="quick-report-icon"><Users /></div>
            <div className="quick-report-details">
              <h4>New Clients This Month</h4>
              <p className="quick-report-number">{stats.newClients}</p>
            </div>
            <button className="quick-report-btn" onClick={() => handleExport('pdf')}><Download size={16} /></button>
          </div>

          <div className="quick-report-card">
            <div className="quick-report-icon"><Shield /></div>
            <div className="quick-report-details">
              <h4>Security Complement Summary</h4>
              <p className="quick-report-number">{stats.activeClients}</p>
              <span className="quick-report-trend">Clients with security</span>
            </div>
            <button className="quick-report-btn" onClick={() => handleExport('pdf')}><Download size={16} /></button>
          </div>

          <div className="quick-report-card">
            <div className="quick-report-icon"><TrendingUp /></div>
            <div className="quick-report-details">
              <h4>Growth Rate (YTD)</h4>
              <p className="quick-report-number">{stats.growth}%</p>
              <span className="quick-report-trend positive">vs start of year</span>
            </div>
            <button className="quick-report-btn" onClick={() => handleExport('pdf')}><Download size={16} /></button>
          </div>

          <div className="quick-report-card">
            <div className="quick-report-icon"><Building2 /></div>
            <div className="quick-report-details">
              <h4>Top Locations</h4>
              <p className="quick-report-number">{stats.topLocations}</p>
              <span className="quick-report-trend">Cities / Addresses</span>
            </div>
            <button className="quick-report-btn" onClick={() => handleExport('pdf')}><Download size={16} /></button>
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="export-actions">
        <button className="btn-export pdf" onClick={() => handleExport('pdf')}>Export PDF</button>
        <button className="btn-export excel" onClick={() => handleExport('excel')}>Export Excel</button>
        <button className="btn-export csv" onClick={() => handleExport('csv')}>Export CSV</button>
      </div>
    </div>
  );
};

export default Reports;
