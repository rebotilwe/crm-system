// src/pages/UploadClients/UploadClients.jsx
import { useState, useRef } from "react";
import axios from "axios";
import { 
  UploadCloud, 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Download,
  Info,
  File,
  Trash2,
  Shield,
  Database,
  Users,
  ChevronRight,
  Clock,
  Lock
} from "lucide-react";
import "./UploadClients.css";

const UploadClients = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type !== "text/csv" && !selectedFile.name.endsWith('.csv')) {
      alert("Please select a valid CSV file");
      return;
    }
    setFile(selectedFile);
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === "text/csv" || droppedFile.name.endsWith('.csv'))) {
      setFile(droppedFile);
      setResult(null);
    } else {
      alert("Please drop a valid CSV file");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "https://crm-system-staging-626e.up.railway.app/api/clients/upload",
        formData,
        {
          headers: { 
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`
          }
        }
      );

      setResult(res.data);
    } catch (err) {
      console.error(err);
      
      if (err.response?.status === 401) {
        alert("Session expired. Please login again.");
        localStorage.clear();
        navigate("/login");
      } else {
        alert(err.response?.data?.error || "Upload failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadTemplate = () => {
    const headers = [
      'business_name',
      'owner_name',
      'owner_phone',
      'landline',
      'owner_email',
      'physical_address',
      'postal_address',
      'security_complement',
      'additional_requirements'
    ];
    
    const exampleData = [
      'ABC Corporation,John Doe,0777 123 456,,john@example.com,123 Main St,P.O. Box 123,24/7 Surveillance,',
      'XYZ Security,Jane Smith,0888 987 654,0112 345 678,jane@xyz.com,456 Oak Ave,P.O. Box 456,Armed Response,After hours access required'
    ];
    
    const csvContent = headers.join(',') + '\n' + exampleData.join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="upload-clients-container">
      {/* Security Background Elements */}
      <div className="security-elements">
        <div className="element element-1"><Shield /></div>
        <div className="element element-2"><Database /></div>
        <div className="element element-3"><Users /></div>
        <div className="element element-4"><Lock /></div>
      </div>

      {/* Page Header */}
      <div className="page-header">
        <div className="header-left">
          <div className="header-icon">
            <UploadCloud size={28} />
          </div>
          <div>
            <h1 className="page-title">Bulk Client Upload</h1>
            <p className="page-subtitle">
              <span className="security-badge">
                <Shield size={12} />
                Secure Import
              </span>
              <span className="info-badge">
                <Database size={12} />
                CSV Format Only
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Upload Card */}
      <div className="upload-card">
        <div className="card-header">
          <div className="card-header-left">
            <div className="card-icon">
              <UploadCloud size={24} />
            </div>
            <div className="header-text">
              <h2>CSV Import Wizard</h2>
              <p>Upload and validate your client data</p>
            </div>
          </div>
          <div className="card-badge">
            <Clock size={14} />
            <span>Real-time validation</span>
          </div>
        </div>

        <div className="card-content">
          {/* Upload Area */}
          <div 
            className={`upload-area ${file ? 'has-file' : ''} ${dragActive ? 'drag-active' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <UploadCloud className="upload-icon" />
            <h3 className="upload-title">
              {file ? 'File ready for import' : 'Drag & drop or click to browse'}
            </h3>
            <p className="upload-hint">
              {file ? (
                <>
                  <CheckCircle size={14} />
                  <span>Selected: <strong>{file.name}</strong></span>
                </>
              ) : (
                <>
                  Supported format: <strong>.CSV</strong> (Max size: 10MB)
                </>
              )}
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden-input"
          />

          {/* File Info */}
          {file && (
            <div className="file-info">
              <div className="file-details">
                <div className="file-icon">
                  <FileText size={24} />
                </div>
                <div className="file-meta">
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <div className="file-actions">
                <button onClick={removeFile} className="btn-remove" title="Remove file">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Upload Button */}
          <button
            onClick={handleUpload}
            disabled={!file || loading}
            className="btn-upload"
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Processing Upload...
              </>
            ) : (
              <>
                <UploadCloud size={20} />
                Import {file ? file.name : 'CSV'} File
                <ChevronRight size={20} />
              </>
            )}
          </button>

          {/* Result Section */}
          {result && (
            <div className="result-card">
              <div className={`result-header ${result.failed?.length > 0 ? 'warning' : 'success'}`}>
                {result.failed?.length > 0 ? (
                  <AlertCircle size={24} />
                ) : (
                  <CheckCircle size={24} />
                )}
                <div>
                  <h3>Upload Complete</h3>
                  <p>
                    {result.failed?.length > 0 
                      ? 'Some rows could not be imported' 
                      : 'All clients imported successfully'}
                  </p>
                </div>
              </div>

              <div className="result-content">
                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-box">
                    <div className="stat-label">Total Processed</div>
                    <div className="stat-value primary">
                      {(result.inserted || 0) + (result.failed?.length || 0)}
                    </div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Successfully Imported</div>
                    <div className="stat-value success">{result.inserted || 0}</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-label">Failed Rows</div>
                    <div className="stat-value warning">{result.failed?.length || 0}</div>
                  </div>
                </div>

                {/* Failed Rows */}
                {result.failed?.length > 0 && (
                  <div className="failed-rows">
                    <div className="failed-title">
                      <XCircle size={18} />
                      <span>Failed Rows ({result.failed.length})</span>
                    </div>
                    <div className="failed-list">
                      {result.failed.map((f, i) => (
                        <div key={i} className="failed-item">
                          <div className="failed-row">
                            <span className="row-number">Row {f.rowNumber || i + 1}</span>
                            <code>{JSON.stringify(f.row)}</code>
                          </div>
                          <div className="failed-reason">
                            <AlertCircle size={12} />
                            <span>{f.reason}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Template Section */}
      <div className="template-section">
        <div className="template-header">
          <div className="template-icon">
            <FileText size={20} />
          </div>
          <div>
            <h3>CSV Template & Requirements</h3>
            <p>Download our template to ensure correct formatting</p>
          </div>
        </div>

        <div className="template-content">
          <div className="columns-list">
            <h4>Required Columns:</h4>
            <div className="column-tags">
              <span className="column-tag required">business_name *</span>
              <span className="column-tag required">owner_name *</span>
              <span className="column-tag required">owner_phone *</span>
              <span className="column-tag">landline</span>
              <span className="column-tag">owner_email</span>
              <span className="column-tag">physical_address</span>
              <span className="column-tag">postal_address</span>
              <span className="column-tag">security_complement</span>
              <span className="column-tag">additional_requirements</span>
            </div>
          </div>

          <div className="template-actions">
            <button onClick={downloadTemplate} className="btn-download">
              <Download size={16} />
              Download Template CSV
            </button>
          </div>
        </div>

        <div className="template-footer">
          <Info size={14} />
          <span>
            The CSV file must include a header row with exact column names as shown above. 
            Fields marked with * are required.
          </span>
        </div>
      </div>

      {/* Security Note */}
      <div className="security-note">
        <Lock size={14} />
        <span>All uploaded data is encrypted and processed securely</span>
      </div>
    </div>
  );
};

export default UploadClients;