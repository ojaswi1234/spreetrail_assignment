import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';

const Import = () => {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('groupId', 'primary-group-id'); // For demo, using the seeded group

    try {
      const res = await api.post('/imports/analyze', formData);
      setReport(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleExecute = async () => {
    if (!report) return;
    setExecuting(true);
    try {
      await api.post('/imports/execute', {
        importLogId: report.importLogId,
        groupId: 'primary-group-id',
        processedData: report.processedData
      });
      navigate('/groups/primary-group-id');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Execution failed');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="import-page">
      <header className="page-header">
        <Link to="/" className="btn-text">← Back to Dashboard</Link>
        <h1>Import Expenses</h1>
      </header>

      {!report ? (
        <div className="card upload-card">
          <p>Upload your <code>expenses_export.csv</code> file to begin the two-step import process.</p>
          <input type="file" accept=".csv" onChange={handleFileChange} />
          <button 
            className="btn-primary" 
            onClick={handleAnalyze} 
            disabled={!file || analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Analyze CSV'}
          </button>
          {error && <p className="error-text">{error}</p>}
        </div>
      ) : (
        <div className="report-container">
          <div className="card summary-card">
            <h2>Analysis Summary</h2>
            <div className="stats grid">
              <div className="stat-item">
                <span className="stat-label">Total Rows:</span>
                <span className="stat-value">{report.processedData.length + report.anomalies.filter((a: any) => a.actionTaken === 'SKIPPED').length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Ready to Import:</span>
                <span className="stat-value">{report.processedData.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Anomalies Detected:</span>
                <span className="stat-value">{report.anomalies.length}</span>
              </div>
            </div>
            
            <div className="approval-actions">
              <button 
                className="btn-primary" 
                onClick={handleExecute} 
                disabled={executing}
              >
                {executing ? 'Executing...' : 'Approve & Import All'}
              </button>
              <button className="btn-outline" onClick={() => setReport(null)}>Cancel</button>
            </div>
          </div>

          <h2>Anomaly Report</h2>
          <div className="card report-card">
             <p className="meera-quote">Meera: "I want to approve anything the app deletes or changes."</p>
             <table className="report-table">
               <thead>
                 <tr>
                   <th>Row</th>
                   <th>Type</th>
                   <th>Description</th>
                   <th>Action Taken</th>
                 </tr>
               </thead>
               <tbody>
                 {report.anomalies.map((a: any, idx: number) => (
                   <tr key={idx} className={a.actionTaken.toLowerCase()}>
                     <td>{a.rowNumber}</td>
                     <td><code>{a.type}</code></td>
                     <td>{a.description}</td>
                     <td><strong>{a.actionTaken}</strong></td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>

          <h2>Data to be Imported</h2>
          <div className="card data-card">
            <ul className="preview-list">
              {report.processedData.map((item: any, idx: number) => (
                <li key={idx}>
                  <strong>Row {item.rowNum}</strong>: {item.type} - {item.data.description} (₹{item.data.amount.toLocaleString()})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Import;
