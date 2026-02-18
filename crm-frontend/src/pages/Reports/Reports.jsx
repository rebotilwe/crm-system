import { useState, useEffect } from "react";
import axios from "axios";
import {
  Download,
  FileText,
  Users,
  TrendingUp,
  Shield,
  Building2,
  Search
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./Reports.css";

const API_URL = "https://crm-system-staging-626e.up.railway.app";

const Reports = () => {
  const [clients, setClients] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState("month");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalClients: 0,
    newClients: 0,
    activeClients: 0,
    growth: 0,
    topLocations: 0
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [dateRange, searchTerm, clients]);

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
    const filtered = clients.filter((c) => {
      const matchesSearch = c.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            c.owner_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const created = new Date(c.created_at);
      let matchesDate = false;

      switch (dateRange) {
        case "today": matchesDate = created.toDateString() === now.toDateString(); break;
        case "week":
          const weekStart = new Date();
          weekStart.setDate(now.getDate() - 7);
          matchesDate = created >= weekStart;
          break;
        case "month":
          matchesDate = created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
          break;
        case "year": matchesDate = created.getFullYear() === now.getFullYear(); break;
        case "all": matchesDate = true; break;
        default: matchesDate = true;
      }
      return matchesSearch && matchesDate;
    });

    setFilteredData(filtered);
    calculateStats(filtered);
  };

  const calculateStats = (data) => {
    const active = data.filter(c => c.security_complement).length;
    const locations = new Set(data.map(c => c.physical_address).filter(Boolean)).size;
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const clientsAtStart = clients.filter(c => new Date(c.created_at) < startOfYear).length;
    const growth = clientsAtStart === 0 ? data.length * 100 : Math.round(((clients.length - clientsAtStart) / clientsAtStart) * 100);

    setStats({
      totalClients: data.length,
      newClients: data.filter(c => {
        const d = new Date(c.created_at);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return d > thirtyDaysAgo;
      }).length,
      activeClients: active,
      growth: growth,
      topLocations: locations
    });
  };

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    autoTable(doc, {
      startY: 30,
      head: [["Business Name", "Owner", "Phone", "Security", "Address", "Status"]],
      body: filteredData.map(c => [c.business_name, c.owner_name, c.owner_phone, c.security_complement || "None", c.physical_address || "N/A", c.security_complement ? "Active" : "Inactive"]),
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }
    });
    doc.save(`Report_${dateRange}.pdf`);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");
    XLSX.writeFile(workbook, `CRM_Export_${dateRange}.xlsx`);
  };

  return (
    <div className="reports-container">
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon"><FileText /></div>
          <div className="header-text">
            <h1 className="page-title">Analytics</h1>
            <p className="page-subtitle">Export client data</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="report-search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="date-select" value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="all">All Records</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon={<Users />} label="Total" value={stats.totalClients} trend={`${stats.growth}% Growth`} color="blue" />
        <StatCard icon={<TrendingUp />} label="New" value={stats.newClients} trend="30 days" color="green" />
        <StatCard icon={<Shield />} label="Active" value={stats.activeClients} trend="Protected" color="purple" />
        <StatCard icon={<Building2 />} label="Areas" value={stats.topLocations} trend="Locations" color="amber" />
      </div>

      <div className="report-preview">
        <div className="preview-header">
          <h3>Records ({filteredData.length})</h3>
          <div className="export-btns">
            <button className="btn-mini" onClick={exportToPDF}><Download size={14}/> PDF</button>
            <button className="btn-mini" onClick={exportToExcel}><Download size={14}/> Excel</button>
          </div>
        </div>
        <div className="table-wrapper">
          <table className="preview-table">
            <thead>
              <tr>
                <th>Business</th>
                <th>Owner</th>
                <th>Phone</th>
                <th>Security</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="loading-row">Processing...</td></tr>
              ) : filteredData.length > 0 ? (
                filteredData.map(c => (
                  <tr key={c.id}>
                    <td data-label="Business"><strong>{c.business_name}</strong></td>
                    <td data-label="Owner">{c.owner_name}</td>
                    <td data-label="Phone">{c.owner_phone}</td>
                    <td data-label="Security">{c.security_complement || "—"}</td>
                    <td data-label="Status">
                      <span className={`status-badge ${c.security_complement ? "active" : "inactive"}`}>
                        {c.security_complement ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="empty-row">No records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

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