import { useState, useEffect } from "react";
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
  FileText,
  UploadCloud,
  CheckCircle,
  XCircle
} from "lucide-react";
import "./Search.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllClients();
  }, []);

  const fetchAllClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/api/clients");
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async (searchTerm) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://localhost:5000/api/clients?search=${searchTerm}`
      );
      setResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!query) {
      fetchAllClients();
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchClients(query);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this client?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/clients/${id}`);
      setResults(results.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Error deleting client");
    }
  };

  const handleCsvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCsvFile(file);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        const rows = text.split("\n").map((row) => row.split(","));
        const headers = rows.shift();
        const data = rows.map((row) =>
          headers.reduce((obj, header, i) => {
            obj[header.trim()] = row[i]?.trim() || "";
            return obj;
          }, {})
        ).filter(row => Object.values(row).some(val => val !== ""));
        setCsvData(data);
      };
      reader.readAsText(file);
    }
  };

  const handleCsvSubmit = async () => {
    if (!csvFile) return alert("Please select a CSV file first!");

    try {
      const formData = new FormData();
      formData.append("file", csvFile);

      await axios.post("http://localhost:5000/api/clients/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      alert("Clients uploaded successfully!");
      setCsvFile(null);
      setCsvData([]);
      fetchAllClients();
    } catch (err) {
      console.error(err);
      alert("Error uploading CSV");
    }
  };

  const clearSearch = () => {
    setQuery("");
  };

  return (
    <div className="search-container">
      <div className="page-header">
        <h1 className="page-title">Client Directory</h1>
        <p className="page-subtitle">
          <span className="status-dot"></span>
          Manage and search your client database
        </p>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <div className="action-buttons">
          <button
            onClick={() => navigate("/add-client")}
            className="btn-primary"
          >
            <UserPlus />
            Add New Client
          </button>

          <label className="btn-success">
            <UploadCloud />
            Upload CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvChange}
              hidden
            />
          </label>
        </div>

        <div className="total-badge">
          <span className="total-label">Total Clients:</span>
          <span className="total-count">{results.length}</span>
        </div>
      </div>

      {/* CSV Preview */}
      {csvData.length > 0 && (
        <div className="csv-preview">
          <div className="preview-header">
            <div className="preview-title">
              <CheckCircle />
              <h3>CSV Preview</h3>
            </div>
            <span className="preview-stats">
              {csvData.length} rows ready
            </span>
          </div>
          
          <div className="preview-table-container">
            <table className="preview-table">
              <thead>
                <tr>
                  {Object.keys(csvData[0]).map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.slice(0, 5).map((row, index) => (
                  <tr key={index}>
                    {Object.values(row).map((val, i) => (
                      <td key={i}>{val}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {csvData.length > 5 && (
            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.75rem', textAlign: 'center' }}>
              Showing first 5 rows of {csvData.length} total rows
            </p>
          )}
          
          <div className="preview-actions">
            <button onClick={handleCsvSubmit} className="btn-submit-csv">
              <UploadCloud size={16} />
              Submit CSV
            </button>
          </div>
        </div>
      )}

      {/* Search Card */}
      <div className="search-card">
        <div className="search-wrapper">
          <SearchIcon className="search-icon" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by business name, owner name or phone number..."
            className="search-input"
          />
          {query && (
            <button onClick={clearSearch} className="clear-search">
              <XCircle size={18} />
            </button>
          )}
        </div>
        
        <div className="search-stats">
          <div className="total-badge">
            <span className="total-label">Showing:</span>
            <span className="total-count">{results.length} clients</span>
          </div>
          {query && (
            <div className="search-query">
              Results for "<strong>{query}</strong>"
            </div>
          )}
        </div>
      </div>

      {/* Results Card */}
      <div className="results-card">
        {loading ? (
          <div className="loading-state">
            <div className="spinner-large"></div>
            <p>Loading clients...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Users />
            </div>
            <h3>No clients yet</h3>
            <p>Add your first client to get started</p>
            <button
              onClick={() => navigate("/add-client")}
              className="btn-primary"
            >
              <UserPlus />
              Add New Client
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="desktop-table">
              <table className="client-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Building2 size={16} /> Business Name
                      </div>
                    </th>
                    <th>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={16} /> Owner
                      </div>
                    </th>
                    <th>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Phone size={16} /> Phone
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((client, index) => (
                    <tr key={client.id}>
                      <td style={{ color: '#64748b', fontWeight: 500 }}>{index + 1}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/client/${client.id}`)}
                          className="business-name"
                        >
                          {client.business_name}
                        </button>
                      </td>
                      <td>{client.owner_name}</td>
                      <td>
                        <a href={`tel:${client.owner_phone}`} className="phone-link">
                          <Phone size={14} />
                          {client.owner_phone}
                        </a>
                      </td>
                      <td>
                        <div className="action-group">
                          <button
                            onClick={() => navigate(`/edit-client/${client.id}`)}
                            className="btn-edit"
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(client.id)}
                            className="btn-delete"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="mobile-cards">
              {results.map((client, index) => (
                <div key={client.id} className="client-card">
                  <div className="card-header">
                    <span className="client-number">#{index + 1}</span>
                    <button
                      onClick={() => navigate(`/client/${client.id}`)}
                      className="client-name-mobile"
                    >
                      {client.business_name}
                    </button>
                  </div>
                  
                  <div className="client-details">
                    <div className="detail-item">
                      <User size={16} />
                      <span className="detail-label">Owner:</span>
                      <span>{client.owner_name}</span>
                    </div>
                    <div className="detail-item">
                      <Phone size={16} />
                      <span className="detail-label">Phone:</span>
                      <a href={`tel:${client.owner_phone}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        {client.owner_phone}
                      </a>
                    </div>
                  </div>
                  
                  <div className="mobile-actions">
                    <button
                      onClick={() => navigate(`/edit-client/${client.id}`)}
                      className="btn-edit"
                    >
                      <Edit size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="btn-delete"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Search;