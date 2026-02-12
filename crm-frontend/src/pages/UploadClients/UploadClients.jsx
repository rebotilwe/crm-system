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
  Trash2
} from "lucide-react";
import "./UploadClients.css";

const UploadClients = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
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
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a CSV file first");
    
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post("http://localhost:5000/api/clients/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setResult(res.data);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Upload failed");
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
    
    const csvContent = headers.join(',') + '\n' + 
      'ABC Corporation,John Doe,0777 123 456,,john@example.com,123 Main St,P.O. Box 123,24/7 Surveillance,';
    
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
      <div className="page-header">
        <h1 className="page-title">Bulk Client Upload</h1>
        <p className="page-subtitle">Import multiple clients at once using a CSV file</p>
      </div>

      <div className="upload-card">
        <div className="card-header">
          <UploadCloud />
          <div className="header-text">
            <h2>CSV Upload</h2>
            <p>Upload your CSV file with client data</p>
          </div>
        </div>

        <div className="card-content">
          {/* Upload Area */}
          <div 
            className={`upload-area ${file ? 'has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <UploadCloud className="upload-icon" />
            <h3 className="upload-title">
              {file ? 'File ready to upload' : 'Drag & drop or click to browse'}
            </h3>
            <p className="upload-hint">
              {file ? (
                <>Selected: <strong>{file.name}</strong></>
              ) : (
                <>Supported format: <strong>.CSV</strong> (Max size: 10MB)</>
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
                <File />
                <div>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{formatFileSize(file.size)}</p>
                </div>
              </div>
              <button onClick={removeFile} className="btn-remove">
                <Trash2 />
              </button>
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
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud />
                Upload and Process CSV
              </>
            )}
          </button>

          {/* Result Section */}
          {result && (
            <div className="result-card">
              <div className={`result-header ${result.failed?.length > 0 ? 'warning' : 'success'}`}>
                {result.failed?.length > 0 ? <AlertCircle /> : <CheckCircle />}
                <h3>Upload Complete</h3>
              </div>
              <div className="result-content">
                <div className="success-stats">
                  <div className="stat-item">
                    <div className="stat-label">Successfully Imported</div>
                    <div className="stat-value success">{result.inserted || 0}</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-label">Failed Rows</div>
                    <div className="stat-value warning">{result.failed?.length || 0}</div>
                  </div>
                </div>

                {result.failed?.length > 0 && (
                  <div className="failed-rows">
                    <div className="failed-title">
                      <XCircle />
                      Failed Rows ({result.failed.length})
                    </div>
                    <div className="failed-list">
                      {result.failed.map((f, i) => (
                        <div key={i} className="failed-item">
                          <div className="failed-row">
                            Row {i + 1}: {JSON.stringify(f.row)}
                          </div>
                          <div className="failed-reason">
                            <AlertCircle size={12} />
                            {f.reason}
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

      {/* CSV Template Section */}
      <div className="template-section">
        <div className="template-header">
          <Info />
          <h4>CSV Format Requirements</h4>
        </div>
        <div className="template-content">
          <div className="template-columns">
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
          <button onClick={downloadTemplate} className="btn-download">
            <Download size={16} />
            Download Template
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '1rem' }}>
          * Required fields. The CSV file must include the header row with exact column names shown above.
        </p>
      </div>
    </div>
  );
};

export default UploadClients;