import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, AlertCircle, CheckCircle2, FileText, Info } from 'lucide-react';
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
    formData.append('groupId', 'primary-group-id'); 

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
    <div className="import-page app-container">
      <header className="page-header">
        <div>
          <Link to="/" className="btn-text" style={{ marginBottom: '1rem' }}>
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <h1>Import Expenses</h1>
        </div>
      </header>

      {!report ? (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '4rem 2rem' }}>
          <div style={{ background: '#e0e7ff', width: '80px', height: '80px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyItems: 'center', margin: '0 auto 2rem' }}>
             <UploadCloud size={40} style={{ color: '#4f46e5', margin: '0 auto' }} />
          </div>
          <h2 style={{ marginBottom: '1rem' }}>Upload CSV</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem', fontSize: '1.1rem' }}>Upload your <code>expenses_export.csv</code> file to begin the two-step import process.</p>
          
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label className="card" style={{ borderStyle: 'dashed', cursor: 'pointer', display: 'block', padding: '2rem', background: file ? '#f0fdf4' : 'rgba(255,255,255,0.5)' }}>
              <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: 'none' }} />
              <FileText size={24} style={{ color: file ? '#10b981' : '#cbd5e1', marginBottom: '0.5rem' }} />
              <div style={{ fontWeight: 600, color: file ? '#10b981' : '#475569' }}>
                {file ? file.name : 'Select or drop CSV file'}
              </div>
            </label>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleAnalyze} 
            disabled={!file || analyzing}
            style={{ width: '100%', padding: '1rem' }}
          >
            {analyzing ? 'Analyzing Data...' : 'Analyze CSV Content'}
          </button>
          {error && <p className="error-text" style={{ marginTop: '1rem' }}>{error}</p>}
        </div>
      ) : (
        <div className="report-container" style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <div className="card summary-card" style={{ marginBottom: '3rem' }}>
            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Analysis Summary</h2>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '3rem' }}>
              <div className="stat-item">
                <span className="stat-label">Total Rows</span>
                <span className="stat-value">{report.processedData.length + report.anomalies.filter((a: any) => a.actionTaken === 'SKIPPED').length}</span>
              </div>
              <div className="stat-item" style={{ borderColor: '#10b981', background: '#ecfdf5' }}>
                <span className="stat-label" style={{ color: '#059669' }}>Ready to Import</span>
                <span className="stat-value" style={{ color: '#10b981' }}>{report.processedData.length}</span>
              </div>
              <div className="stat-item" style={{ borderColor: '#f59e0b', background: '#fffbeb' }}>
                <span className="stat-label" style={{ color: '#d97706' }}>Anomalies</span>
                <span className="stat-value" style={{ color: '#f59e0b' }}>{report.anomalies.length}</span>
              </div>
            </div>
            
            <div className="approval-actions" style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem' }}>
              <button 
                className="btn-primary" 
                onClick={handleExecute} 
                disabled={executing}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 3rem' }}
              >
                {executing ? 'Processing...' : <><CheckCircle2 size={20} /> Approve & Import All</>}
              </button>
              <button className="btn-outline" onClick={() => setReport(null)} style={{ padding: '1rem 2rem' }}>Cancel</button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={24} style={{ color: '#f59e0b' }} />
            <h2 style={{ margin: 0 }}>Anomaly Report</h2>
          </div>
          <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '3rem' }}>
             <div style={{ padding: '1.5rem', background: '#f8fafc', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
               <Info size={18} style={{ color: '#64748b' }} />
               <p className="meera-quote" style={{ margin: 0 }}>"I want to approve anything the app deletes or changes." — Meera</p>
             </div>
             <div style={{ overflowX: 'auto' }}>
               <table className="report-table">
                 <thead>
                   <tr>
                     <th style={{ paddingLeft: '1.5rem' }}>Row</th>
                     <th>Issue Type</th>
                     <th>Description</th>
                     <th style={{ paddingRight: '1.5rem' }}>Action Taken</th>
                   </tr>
                 </thead>
                 <tbody>
                   {report.anomalies.map((a: any, idx: number) => (
                     <tr key={idx} className={a.actionTaken.toLowerCase()}>
                       <td style={{ paddingLeft: '1.5rem', fontWeight: 700 }}>{a.rowNumber}</td>
                       <td><code style={{ fontSize: '0.75rem', color: '#4f46e5' }}>{a.type}</code></td>
                       <td>{a.description}</td>
                       <td style={{ paddingRight: '1.5rem' }}>
                         <span style={{ 
                           padding: '0.25rem 0.75rem', 
                           borderRadius: '99px', 
                           fontSize: '0.75rem', 
                           fontWeight: 700,
                           background: a.actionTaken === 'SKIPPED' ? '#fee2e2' : a.actionTaken === 'ADJUSTED' ? '#fefce8' : '#ecfdf5',
                           color: a.actionTaken === 'SKIPPED' ? '#ef4444' : a.actionTaken === 'ADJUSTED' ? '#d97706' : '#10b981'
                         }}>
                           {a.actionTaken}
                         </span>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <CheckCircle2 size={24} style={{ color: '#10b981' }} />
            <h2 style={{ margin: 0 }}>Preview Data</h2>
          </div>
          <div className="card">
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {report.processedData.slice(0, 10).map((item: any, idx: number) => (
                <div key={idx} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>Row {item.rowNum} • {item.type}</span>
                    <span style={{ fontWeight: 600 }}>{item.data.description}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: '#1e293b' }}>₹{item.data.amount.toLocaleString()}</span>
                </div>
              ))}
              {report.processedData.length > 10 && (
                 <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginTop: '1rem' }}>
                   ... and {report.processedData.length - 10} more expenses
                 </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Import;
