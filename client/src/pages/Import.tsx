import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, UploadCloud, AlertCircle, CheckCircle2, FileText, Info, ShieldAlert, Cpu } from 'lucide-react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-black pb-4 gap-4">
        <div>
          <Link to="/" className="brutal-btn brutal-btn-outline py-1 px-3 shadow-[2px_2px_0px_#000] text-[10px] mb-2">
            <ArrowLeft size={12} strokeWidth={3} /> ABORT
          </Link>
          <div className="flex items-center gap-3 mt-2">
            <div className="bg-black text-white p-2 border-2 border-black">
              <Cpu size={24} strokeWidth={3} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter uppercase leading-[0.8]">
              IMPORT CSV
            </h1>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!report ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="max-w-xl mx-auto"
          >
            <div className="brutal-card bg-white p-8 text-center space-y-6">
              <div className="bg-brutal-yellow inline-block p-4 border-2 border-black shadow-[6px_6px_0px_#000]">
                 <UploadCloud size={32} strokeWidth={3} />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase italic">Upload Data</h2>
                <p className="font-bold text-sm text-slate-500 uppercase">Input source: <code>expenses_export.csv</code></p>
              </div>

              <div className="relative group">
                <label className="brutal-card block border-dashed border-2 cursor-pointer p-8 hover:bg-slate-50 transition-colors">
                  <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                  <FileText size={24} className={`mx-auto mb-2 ${file ? 'text-brutal-green' : 'text-slate-300'}`} />
                  <div className="text-lg font-black uppercase">
                    {file ? file.name : 'Select file'}
                  </div>
                </label>
              </div>

              <button 
                className="brutal-btn brutal-btn-primary w-full text-xl py-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleAnalyze} 
                disabled={!file || analyzing}
              >
                {analyzing ? 'ANALYZING...' : 'ANALYZE CONTENT'}
              </button>
              
              {error && (
                <div className="bg-black text-white p-4 text-xs font-black uppercase text-center border-2 border-brutal-pink">
                  ERROR: {error}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="report"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="brutal-card bg-white p-4 text-center border-b-[8px] border-b-black shadow-none!">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Scan</span>
                <div className="text-5xl font-black italic">{report.processedData.length + report.anomalies.filter((a: any) => a.actionTaken === 'SKIPPED').length}</div>
              </div>
              <div className="brutal-card bg-brutal-green! p-4 text-center border-b-[8px] border-b-black shadow-none!">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Ready</span>
                <div className="text-5xl font-black italic">{report.processedData.length}</div>
              </div>
              <div className="brutal-card bg-brutal-pink! p-4 text-center border-b-[8px] border-b-black shadow-none!">
                <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Anomalies</span>
                <div className="text-5xl font-black italic">{report.anomalies.length}</div>
              </div>
            </section>

            <section className="brutal-card bg-black text-white py-8 px-6 flex flex-col md:flex-row justify-between items-center gap-6 shadow-[8px_8px_0px_#fde047]">
              <div className="space-y-1">
                <h2 className="text-2xl font-black uppercase italic leading-none">Awaiting Approval</h2>
                <p className="font-bold text-xs text-brutal-yellow uppercase tracking-widest">User Meera must approve these changes</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button 
                  className="brutal-btn bg-brutal-green! text-black text-lg py-3 px-8 hover:shadow-[2px_2px_0px_white]" 
                  onClick={handleExecute} 
                  disabled={executing}
                >
                  {executing ? 'IMPORTING...' : 'APPROVE & IMPORT'}
                </button>
                <button className="brutal-btn bg-white text-black text-lg py-3 px-8" onClick={() => setReport(null)}>CANCEL</button>
              </div>
            </section>

            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <ShieldAlert size={24} strokeWidth={3} />
                <h2 className="text-2xl font-black uppercase italic">Anomaly Log</h2>
              </div>
              <div className="brutal-card p-0 overflow-hidden bg-white">
                 <table className="report-table text-xs">
                   <thead>
                     <tr>
                       <th>Row</th>
                       <th>Type</th>
                       <th>Description</th>
                       <th>Action</th>
                     </tr>
                   </thead>
                   <tbody>
                     {report.anomalies.map((a: any, idx: number) => (
                       <tr key={idx}>
                         <td className="font-black text-lg italic">#{a.rowNumber}</td>
                         <td><code className="bg-black text-white px-1.5 py-0.5 text-[8px]">{a.type}</code></td>
                         <td className="font-bold">{a.description}</td>
                         <td>
                           <span className={`brutal-badge text-[10px] ${
                             a.actionTaken === 'SKIPPED' ? 'bg-brutal-pink' : 
                             a.actionTaken === 'ADJUSTED' ? 'bg-brutal-orange' : 'bg-brutal-green'
                           }`}>
                             {a.actionTaken}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </div>
            </section>

            <section className="space-y-4">
               <div className="flex items-center gap-2">
                <CheckCircle2 size={24} strokeWidth={3} className="text-brutal-green" />
                <h2 className="text-2xl font-black uppercase italic text-brutal-green drop-shadow-[1px_1px_0px_black]">Data Preview</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.processedData.slice(0, 10).map((item: any, idx: number) => (
                  <div key={idx} className="brutal-card bg-white p-3 flex justify-between items-center group hover:bg-black hover:text-white">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black uppercase group-hover:text-brutal-yellow">LOG: {item.rowNum} • {item.type}</span>
                      <span className="text-base font-black uppercase tracking-tighter italic">{item.data.description}</span>
                    </div>
                    <div className="text-2xl font-black italic tracking-tighter">₹{item.data.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              {report.processedData.length > 10 && (
                 <div className="text-center font-black uppercase italic text-slate-400 py-6 border-t-2 border-black border-dashed text-xs">
                   [ + {report.processedData.length - 10} MORE ENTRIES ]
                 </div>
              )}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Import;
