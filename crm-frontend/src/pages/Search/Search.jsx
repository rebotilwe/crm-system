// src/pages/Search/Search.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Search as SearchIcon,
  UserPlus,
  Edit,
  Trash2,
  Users,
  Phone,
  Building2,
  User,
  UploadCloud,
  CheckCircle,
  XCircle,
  Shield,
  Briefcase,
  Mail,
  MapPin,
  FileText,
  Download,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  AlertCircle
} from "lucide-react";
import "./Search.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedClients, setSelectedClients] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ============================
     AUTH CHECK
  ============================ */
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  /* ============================
     FETCH ALL CLIENTS
  ============================ */
  const fetchAllClients = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "https://crm-system-staging-626e.up.railway.app/api/clients",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults(res.data);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     SEARCH CLIENTS
  ============================ */
  const fetchClients = async (term) => {
    if (!term.trim()) {
      fetchAllClients();
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `https://crm-system-staging-626e.up.railway.app/api/clients?search=${term}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults(res.data);
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     DELETE CLIENT
  ============================ */
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await axios.delete(
        `https://crm-system-staging-626e.up.railway.app/api/clients/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResults(results.filter((c) => c.id !== id));
      setSelectedClients(selectedClients.filter(clientId => clientId !== id));
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        alert("Failed to delete client");
      }
    }
  };

  /* ============================
     BULK DELETE
  ============================ */
  const handleBulkDelete = () => {
    if (selectedClients.length === 0) return;
    
    if (!window.confirm(`Are you sure you want to delete ${selectedClients.length} clients?`)) return;
    
    // Delete each selected client
    selectedClients.forEach(id => handleDelete(id));
  };

  /* ============================
     CSV CHANGE
  ============================ */
  const handleCsvChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setCsvFile(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;

      const rows = text
        .split("\n")
        .map((row) => row.split(","))
        .filter((r) => r.length > 1);

      const headers = rows.shift();

      const data = rows.map((row) =>
        headers.reduce((obj, header, i) => {
          obj[header.trim()] = row[i]?.trim() || "";
          return obj;
        }, {})
      );

      setCsvData(data);
    };

    reader.readAsText(file);
  };

  /* ============================
     CSV UPLOAD
  ============================ */
  const handleCsvSubmit = async () => {
    if (!csvFile) return alert("Select a CSV file first!");

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      await axios.post(
        "https://crm-system-staging-626e.up.railway.app/api/clients/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      alert("Upload successful!");

      setCsvFile(null);
      setCsvData([]);

      fetchAllClients();
    } catch (err) {
      console.error(err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        alert("CSV upload failed");
      }
    }
  };

  /* ============================
     SORTING
  ============================ */
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedResults = React.useMemo(() => {
    let sortableItems = [...results];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [results, sortConfig]);

  /* ============================
     FILTERING
  ============================ */
  const filteredResults = React.useMemo(() => {
    if (filterStatus === 'all') return sortedResults;
    // Add your filtering logic here based on client status
    return sortedResults;
  }, [sortedResults, filterStatus]);

  /* ============================
     PAGINATION
  ============================ */
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

  /* ============================
     SELECT ALL
  ============================ */
  const handleSelectAll = () => {
    if (selectedClients.length === currentItems.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(currentItems.map(c => c.id));
    }
  };

  const handleSelectClient = (id) => {
    if (selectedClients.includes(id)) {
      setSelectedClients(selectedClients.filter(clientId => clientId !== id));
    } else {
      setSelectedClients([...selectedClients, id]);
    }
  };

  /* ============================
     INITIAL LOAD
  ============================ */
  useEffect(() => {
    fetchAllClients();
  }, []);

  /* ============================
     SEARCH CHANGE
  ============================ */
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchClients(query);
    }, 300);

    return () => clearTimeout(delay);
  }, [query]);

  const clearSearch = () => {
    setQuery("");
  };

  /* ============================
     UI
  ============================ */
  return (
    <div className="search-container">
      {/* Security Background Elements */}
      <div className="security-elements">
        <div className="element element-1"><Shield /></div>
        <div className="element element-2"><Briefcase /></div>
        <div className="element element-3"><Users /></div>
        <div className="element element-4"><FileText /></div>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <Users size={28} />
          </div>
          <div>
            <h1 className="page-title">Client Directory</h1>
            <p className="page-subtitle">
              <span className="security-badge">
                <Shield size={12} />
                Secure Database
              </span>
              <span className="status-badge">
                <span className="status-dot"></span>
                {results.length} Total Records
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-buttons">
          <button
            onClick={() => navigate("/add-client")}
            className="btn-primary"
          >
            <UserPlus size={18} />
            Add Client
          </button>

          <label className="btn-success">
            <UploadCloud size={18} />
            Upload CSV
            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleCsvChange}
            />
          </label>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-filter ${showFilters ? 'active' : ''}`}
          >
            <Filter size={18} />
            Filters
          </button>

          {selectedClients.length > 0 && (
            <button
              onClick={handleBulkDelete}
              className="btn-danger"
            >
              <Trash2 size={18} />
              Delete Selected ({selectedClients.length})
            </button>
          )}
        </div>

        <div className="action-info">
          <div className="total-badge">
            <span className="total-label">Total Records:</span>
            <span className="total-count">{results.length}</span>
          </div>
          <button className="btn-export">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* CSV Preview */}
      {csvData.length > 0 && (
        <div className="csv-preview">
          <div className="preview-header">
            <div className="preview-title">
              <CheckCircle size={20} />
              <h3>CSV Preview</h3>
            </div>
            <span className="preview-stats">
              {csvData.length} rows ready to import
            </span>
          </div>

          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  {Object.keys(csvData[0]).map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((v, x) => (
                      <td key={x}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="preview-actions">
            <button
              onClick={() => {
                setCsvFile(null);
                setCsvData([]);
              }}
              className="btn-cancel"
            >
              Cancel
            </button>
            <button
              onClick={handleCsvSubmit}
              className="btn-submit-csv"
            >
              <UploadCloud size={16} />
              Import {csvData.length} Clients
            </button>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div className="filters-panel">
          <div className="filters-header">
            <h3>Filter Clients</h3>
            <button onClick={() => setShowFilters(false)}>
              <XCircle size={18} />
            </button>
          </div>
          <div className="filters-grid">
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Clients</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Security Level</label>
              <select className="filter-select">
                <option>All Levels</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Date Added</label>
              <select className="filter-select">
                <option>Any Time</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Last 90 days</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-card">
        <div className="search-wrapper">
          <SearchIcon className="search-icon" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by business name, owner name, or phone number..."
            className="search-input"
          />
          {query && (
            <button onClick={clearSearch} className="clear-search">
              <XCircle size={18} />
            </button>
          )}
        </div>

        <div className="search-stats">
          <div className="search-info">
            <Clock size={14} />
            <span>
              Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredResults.length)} of {filteredResults.length} results
            </span>
          </div>
          {query && (
            <div className="search-query">
              Results for "<strong>{query}</strong>"
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="results-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading client database...</p>
            <p className="loading-hint">Please wait</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users size={48} />
            </div>
            <h3>No clients found</h3>
            <p>Try adjusting your search or add a new client</p>
            <button
              onClick={() => navigate("/add-client")}
              className="btn-primary"
            >
              <UserPlus size={18} />
              Add New Client
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="desktop-table">
              <table className="client-table">
                <thead>
                  <tr>
                    <th className="checkbox-cell">
                      <input
                        type="checkbox"
                        checked={selectedClients.length === currentItems.length && currentItems.length > 0}
                        onChange={handleSelectAll}
                        className="checkbox"
                      />
                    </th>
                    <th onClick={() => requestSort('id')} className="sortable">
                      # <ArrowUpDown size={12} />
                    </th>
                    <th onClick={() => requestSort('business_name')} className="sortable">
                      <Building2 size={14} /> Business <ArrowUpDown size={12} />
                    </th>
                    <th onClick={() => requestSort('owner_name')} className="sortable">
                      <User size={14} /> Owner <ArrowUpDown size={12} />
                    </th>
                    <th>
                      <Phone size={14} /> Phone
                    </th>
                    <th>
                      <Shield size={14} /> Security
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((c, i) => (
                    <tr key={c.id} className={selectedClients.includes(c.id) ? 'selected' : ''}>
                      <td className="checkbox-cell">
                        <input
                          type="checkbox"
                          checked={selectedClients.includes(c.id)}
                          onChange={() => handleSelectClient(c.id)}
                          className="checkbox"
                        />
                      </td>
                      <td className="client-id">{String(c.id).slice(0, 4)}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/clients/${c.id}`)}
                          className="business-name"
                        >
                          {c.business_name}
                        </button>
                      </td>
                      <td>{c.owner_name}</td>
                      <td>
                        <a href={`tel:${c.owner_phone}`} className="phone-link">
                          <Phone size={14} />
                          {c.owner_phone}
                        </a>
                      </td>
                      <td>
                        <span className="security-tag">
                          <Shield size={12} />
                          {c.security_complement || 'Standard'}
                        </span>
                      </td>
                      <td>
                        <div className="action-group">
                          <button
                            onClick={() => navigate(`/clients/${c.id}`)}
                            className="btn-view"
                            title="View Profile"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => navigate(`/edit-client/${c.id}`)}
                            className="btn-edit"
                            title="Edit Client"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="btn-delete"
                            title="Delete Client"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="mobile-cards">
              {currentItems.map((c, i) => (
                <div key={c.id} className="client-card">
                  <div className="card-header">
                    <div className="card-header-left">
                      <input
                        type="checkbox"
                        checked={selectedClients.includes(c.id)}
                        onChange={() => handleSelectClient(c.id)}
                        className="checkbox"
                      />
                      <span className="client-number">#{String(c.id).slice(0, 4)}</span>
                    </div>
                    <span className="security-tag">
                      <Shield size={12} />
                      {c.security_complement || 'Standard'}
                    </span>
                  </div>

                  <div className="card-body">
                    <button
                      onClick={() => navigate(`/clients/${c.id}`)}
                      className="client-name-mobile"
                    >
                      {c.business_name}
                    </button>

                    <div className="client-details">
                      <div className="detail-item">
                        <User size={16} />
                        <span>{c.owner_name}</span>
                      </div>
                      <div className="detail-item">
                        <Phone size={16} />
                        <a href={`tel:${c.owner_phone}`}>{c.owner_phone}</a>
                      </div>
                    </div>
                  </div>

                  <div className="mobile-actions">
                    <button
                      onClick={() => navigate(`/clients/${c.id}`)}
                      className="btn-view"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/edit-client/${c.id}`)}
                      className="btn-edit"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="btn-delete"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  <ChevronLeft size={16} />
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`pagination-btn ${currentPage === i + 1 ? 'active' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Stats */}
      <div className="search-footer">
        <div className="footer-stats">
          <div className="stat-item">
            <Users size={14} />
            <span>{results.length} Total Clients</span>
          </div>
          <div className="stat-item">
            <Shield size={14} />
            <span>Encrypted Database</span>
          </div>
          <div className="stat-item">
            <Clock size={14} />
            <span>Updated in real-time</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;