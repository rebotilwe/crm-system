import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState([]);

  const navigate = useNavigate();

  // Get token
  const token = localStorage.getItem("token");

  // If no token → redirect
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  // ===============================
  // FETCH ALL CLIENTS
  // ===============================
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
      console.error("Fetch All Error:", err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // SEARCH CLIENTS
  // ===============================
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
      console.error("Search Error:", err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // DELETE CLIENT
  // ===============================
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
      console.error("Delete Error:", err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        alert("Failed to delete client");
      }
    }
  };

  // ===============================
  // CSV FILE CHANGE
  // ===============================
  const handleCsvChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setCsvFile(file);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split("\n").map((row) => row.split(","));
      setCsvData(rows);
    };

    reader.readAsText(file);
  };

  // ===============================
  // UPLOAD CSV
  // ===============================
  const handleCsvSubmit = async () => {
    if (!csvFile) {
      alert("Please select a CSV file first!");
      return;
    }

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

      alert("Clients uploaded successfully!");

      setCsvFile(null);
      setCsvData([]);

      fetchAllClients();
    } catch (err) {
      console.error("CSV Upload Error:", err);

      if (err.response?.status === 401) {
        localStorage.clear();
        navigate("/login");
      } else {
        alert("Error uploading CSV");
      }
    }
  };

  // ===============================
  // LOAD ON PAGE OPEN
  // ===============================
  useEffect(() => {
    fetchAllClients();
  }, []);

  // ===============================
  // HANDLE SEARCH INPUT
  // ===============================
  const handleSearchChange = (e) => {
    const value = e.target.value;

    setSearchTerm(value);
    fetchClients(value);
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="p-6">

      <h2 className="text-2xl font-bold mb-4">Search Clients</h2>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name, email, phone..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="border p-2 w-full mb-4 rounded"
      />

      {/* CSV Upload */}
      <div className="mb-6">
        <input
          type="file"
          accept=".csv"
          onChange={handleCsvChange}
          className="mb-2"
        />

        <button
          onClick={handleCsvSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded ml-2"
        >
          Upload CSV
        </button>
      </div>

      {/* Loading */}
      {loading && <p>Loading...</p>}

      {/* Results Table */}
      {!loading && results.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border">

            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">ID</th>
                <th className="border p-2">Business Name</th>
                <th className="border p-2">Owner</th>
                <th className="border p-2">Phone</th>
                <th className="border p-2">Email</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {results.map((client) => (
                <tr key={client.id}>
                  <td className="border p-2">{client.id}</td>
                  <td className="border p-2">{client.business_name}</td>
                  <td className="border p-2">{client.owner_name}</td>
                  <td className="border p-2">{client.owner_phone}</td>
                  <td className="border p-2">{client.owner_email}</td>

                  <td className="border p-2 text-center">
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      )}

      {!loading && results.length === 0 && (
        <p>No clients found.</p>
      )}

    </div>
  );
};

export default Search;
