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
} from "lucide-react";

import "./Search.css";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);

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

      {/* Header */}
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
            Add Client
          </button>

          <label className="btn-success">
            <UploadCloud />
            Upload CSV

            <input
              type="file"
              accept=".csv"
              hidden
              onChange={handleCsvChange}
            />
          </label>
        </div>

        <div className="total-badge">
          <span className="total-label">Total:</span>
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
              {csvData.length} rows
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
              onClick={handleCsvSubmit}
              className="btn-submit-csv"
            >
              <UploadCloud size={16} />
              Submit CSV
            </button>
          </div>

        </div>
      )}

      {/* Search */}
      <div className="search-card">

        <div className="search-wrapper">
          <SearchIcon className="search-icon" size={20} />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search clients..."
            className="search-input"
          />

          {query && (
            <button
              onClick={clearSearch}
              className="clear-search"
            >
              <XCircle size={18} />
            </button>
          )}
        </div>

        <div className="search-stats">

          <div className="total-badge">
            <span className="total-label">Showing:</span>
            <span className="total-count">
              {results.length}
            </span>
          </div>

          {query && (
            <div className="search-query">
              Results for <strong>{query}</strong>
            </div>
          )}

        </div>
      </div>

      {/* Results */}
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

            <h3>No clients found</h3>

            <button
              onClick={() => navigate("/add-client")}
              className="btn-primary"
            >
              <UserPlus />
              Add Client
            </button>

          </div>

        ) : (

          <>
            {/* Desktop */}
            <div className="desktop-table">

              <table className="client-table">

                <thead>
                  <tr>
                    <th>#</th>
                    <th>
                      <Building2 size={14} /> Business
                    </th>
                    <th>
                      <User size={14} /> Owner
                    </th>
                    <th>
                      <Phone size={14} /> Phone
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {results.map((c, i) => (
                    <tr key={c.id}>

                      <td>{i + 1}</td>

                      <td>
                        <button
                          onClick={() => navigate(`/client/${c.id}`)}
                          className="business-name"
                        >
                          {c.business_name}
                        </button>
                      </td>

                      <td>{c.owner_name}</td>

                      <td>
                        <a
                          href={`tel:${c.owner_phone}`}
                          className="phone-link"
                        >
                          <Phone size={14} />
                          {c.owner_phone}
                        </a>
                      </td>

                      <td>
                        <div className="action-group">

                          <button
                            onClick={() =>
                              navigate(`/edit-client/${c.id}`)
                            }
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
                      </td>

                    </tr>
                  ))}
                </tbody>

              </table>

            </div>

            {/* Mobile */}
            <div className="mobile-cards">

              {results.map((c, i) => (
                <div key={c.id} className="client-card">

                  <div className="card-header">

                    <span className="client-number">
                      #{i + 1}
                    </span>

                    <button
                      onClick={() => navigate(`/client/${c.id}`)}
                      className="client-name-mobile"
                    >
                      {c.business_name}
                    </button>

                  </div>

                  <div className="client-details">

                    <div className="detail-item">
                      <User size={16} />
                      {c.owner_name}
                    </div>

                    <div className="detail-item">
                      <Phone size={16} />
                      {c.owner_phone}
                    </div>

                  </div>

                  <div className="mobile-actions">

                    <button
                      onClick={() =>
                        navigate(`/edit-client/${c.id}`)
                      }
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
          </>
        )}

      </div>

    </div>
  );
};

export default Search;
