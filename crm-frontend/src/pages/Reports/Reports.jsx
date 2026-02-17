import { useState, useEffect } from "react";
import axios from "axios";
import {
  Download, FileText, Calendar, Users, TrendingUp, 
  Shield, Building2, Search, Filter
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "./Reports.css";

const API_URL = "https://crm-system-staging-626e.up.railway.app";

const Reports = () => {
  const [clients, setClients] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState("month");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0, newClients: 0, activeClients: 0, growth: 0, topLocations: 0
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dateRange, clients]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClients(res.data || []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const now = new Date();
    const filtered = clients.filter(c => {
      const created = new Date(c.created_at);
      switch (dateRange) {
        case "today": return created.toDateString() === now.toDateString();
        case "week":
          const weekStart = new Date(now).setDate(now.getDate() - 7);
          return created >= weekStart;
        case "month":
          return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
        case "year":
          return created.getFullYear() === now.getFullYear();
        default: return true;
      }
    });

    setFilteredData(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const active = data.filter(c => c.security_complement).length;
    const locations = new Set(data.map(c => c.physical_address).filter(Boolean)).size;
    
    // Simple YTD Growth calculation
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const oldClients = clients.filter(c => new Date(c.created_at) < startOfYear).length;
    const growth = oldClients === 0 ? data.length * 100 : Math.round(((clients.length - oldClients) / oldClients) * 100);

    setStats({
      totalClients: data.length,
      newClients: data.filter(c => new Date(c.created_at) > new Date().setDate(new Date().getDate() - 30)).length,
      activeClients: active,
      growth: growth,
      topLocations: locations
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(18);
    doc.text("Client Summary Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    const tableColumn = ["Business Name", "Owner", "Phone", "Security", "Address", "Status"];
    const tableRows = filteredData.map(c => [
      c.business_name,
      c.owner_name,
      c.owner_phone,
      c.security_complement || "None",
      c.physical_address || "N/A",
      c.security_complement ? "Active" : "Inactive"
    ]);

    doc.autoTable({
      startY: 30,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185] }
    });
    doc.save(`Report_${dateRange}.pdf`);
  };

  return (
    <div className="reports-container">
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon"><FileText /></div>
          <div>
            <h1 className="page-title">Reports & Analytics</h1>
            <p className="page-subtitle">Period: <span className="capitalize">{dateRange}</span></p>
          </div>
        </div>
        <div className="header-actions">
            <select 
              className="date-select" 
              value={dateRange} 
              onChange={(e) => setDateRange(e.target.value)}
            >
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
            </select>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={<Users />} label="Total Clients" value={stats.totalClients} trend={`${stats.growth}% YTD`} color="blue" />
        <StatCard icon={<TrendingUp />} label="New (30d)" value={stats.newClients} trend="Recent" color="green" />
        <StatCard icon={<Shield />} label="Active Security" value={stats.activeClients} trend="Protective" color="purple" />
        <StatCard icon={<Building2 />} label="Unique Locations" value={stats.topLocations} trend="Geographic" color="amber" />
      </div>

      <div className="report-preview">
        <div className="preview-header">
          <h3>Data Preview ({filteredData.length} records)</h3>
          <div className="export-btns">
            <button className="btn-mini" onClick={exportToPDF}><Download size={14}/> PDF</button>
          </div>
        </div>
        <div className="preview-content">
          <table className="preview-table">
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Security</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Loading reports...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map(c => (
                  <tr key={c.id}>
                    <td><strong>{c.business_name}</strong></td>
                    <td>{c.owner_name}</td>
                    <td>{c.owner_phone}</td>
                    <td>{c.security_complement || "—"}</td>
                    <td>
                      <span className={`status-badge ${c.security_complement ? "active" : "inactive"}`}>
                        {c.security_complement ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="empty-row">No records found for this period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ icon, label, value, trend, color }) => (
  <div className="stat-card">
    <div className={`stat-icon ${color}`}>{icon}</div>
    <div className="stat-details">
      <h3>{label}</h3>
      <p className="stat-number">{value}</p>
      <span className="stat-trend">{trend}</span>
    </div>
  </div>
);

export default Reports;