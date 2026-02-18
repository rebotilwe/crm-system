// src/pages/Clients/Clients.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Phone, MapPin, Mail, Shield, Building2 } from "lucide-react";
import "./Clients.css";

const Clients = () => {
  const { id } = useParams(); // Grabs the ID from the URL (/clients/123)
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const res = await axios.get(
          `https://crm-system-staging-626e.up.railway.app/api/clients/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setClient(res.data);
      } catch (err) {
        console.error("Error fetching client details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClientDetails();
  }, [id, token]);

  if (loading) return <div className="loading">Loading Client Details...</div>;
  if (!client) return <div className="error">Client not found.</div>;

  return (
    <div className="client-details-page">
    {/* Back Button */}
<button
  className="back-btn"
  onClick={() => navigate("/search")}
  aria-label="Go back"
>
  <ArrowLeft size={22} />
</button>

      <div className="details-card">
        <header className="details-header">
          <h1>{client.business_name}</h1>
          <span className="id-badge">ID: {id}</span>
        </header>

        <div className="details-grid">
          <section className="info-section">
            <h3><Building2 size={18} /> Business Information</h3>
            <p><strong>Owner:</strong> {client.owner_name}</p>
            <p><strong>Phone:</strong> {client.owner_phone}</p>
            <p><strong>Email:</strong> {client.email || "N/A"}</p>
          </section>

          <section className="info-section">
            <h3><Shield size={18} /> Security Details</h3>
            <p><strong>Security Level:</strong> {client.security_complement || "Standard"}</p>
            <p><strong>Status:</strong> Active</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Clients;