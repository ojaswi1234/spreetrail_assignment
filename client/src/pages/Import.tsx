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
    <div className="max-w-7xl mx-auto p-6 md:p-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-8 border-black pb-8 gap-8">
        <div>
          <Link to="/" className="brutal-btn brutal-btn-outline py-2 px-4 shadow-[4px_4px_0px_#000] text-sm mb-4">
            <ArrowLeft size={16} strokeWidth={3} /> ABORT IMPORT
          </Link>
          <div className="flex items-center gap-4 mt-4">
            <div className="bg-black text-white p-3 border-3 border-black">
              <Cpu size={32} strokeWidth={3} />
            </div>
            <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter uppercase leading-[0.8]">
              DATA INGEST
            </h1>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {!report ? (
          <motion.div 
            key="upload"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="max-w-3xl mx-auto"
          >
            <div className="brutal-card bg-white p-12 text-center space-y-10">
              <div className="bg-brutal-yellow inline-block p-8 border-4 border-black shadow-[12px_12px_0px_#000]">
                 <UploadCloud size={64} strokeWidth={3} />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase italic">Initialize Feed</h2>
                <p className="font-bold text-xl text-slate-500 uppercase">Input source: <code>expenses_export.csv</code></p>
              </div>

              <div className="relative group">
                <label className="brutal-card block border-dashed border-4 cursor-pointer p-16 hover:bg-slate-50 transition-colors">
                  <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
                  <FileText size={40} className={`mx-auto mb-4 ${file ? 'text-brutal-green' : 'text-slate-300'}`} />
                  <div className="text-2xl font-black uppercase">
                    {file ? file.name : 'Select data packet'}
                  </div>
                </label>
              </div>

              <button 
                className="brutal-btn brutal-btn-primary w-full text-3xl py-6 hover:translate-x-2 hover:translate-y-2 hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={handleAnalyze} 
                disabled={!file || analyzing}
              >
                {analyzing ? 'SCANNING SECTORS...' : 'START SYSTEM ANALYSIS'}
              </button>
              
              {error && (
                <div className="bg-black text-white p-6 font-black uppercase text-center border-4 border-brutal-pink">
                  FATAL ERROR: {error}
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="report"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-12"
          >
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="brutal-card bg-white p-8 text-center border-b-[12px] border-b-black shadow-none!">
                <span className="text-sm font-black uppercase tracking-widest text-slate-400">Total Scan</span>
                <div className="text-7xl font-black italic">{report.processedData.length + report.anomalies.filter((a: any) => a.actionTaken === 'SKIPPED').length}</div>
              </div>
              <div className="brutal-card bg-brutal-green! p-8 text-center border-b-[12px] border-b-black shadow-none!">
                <span className="text-sm font-black uppercase tracking-widest text-black/60">Integrity Verified</span>
                <div className="text-7xl font-black italic">{report.processedData.length}</div>
              </div>
              <div className="brutal-card bg-brutal-pink! p-8 text-center border-b-[12px] border-b-black shadow-none!">
                <span className="text-sm font-black uppercase tracking-widest text-black/60">Data Exceptions</span>
                <div className="text-7xl font-black italic">{report.anomalies.length}</div>
              </div>
            </section>

            <section className="brutal-card bg-black text-white py-12 px-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-[12px_12px_0px_#fde047]">
              <div className="space-y-2">
                <h2 className="text-4xl font-black uppercase italic italic leading-none">Awaiting Clearance</h2>
                <p className="font-bold text-brutal-yellow uppercase tracking-widest">Final validation required from terminal: Meera</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button 
                  className="brutal-btn bg-brutal-green! text-black text-2xl py-5 px-12 hover:shadow-[4px_4px_0px_white]" 
                  onClick={handleExecute} 
                  disabled={executing}
                >
                  {executing ? 'WRITING TO DISK...' : 'APPROVE & COMMIT'}
                </button>
                <button className="brutal-btn bg-white text-black text-2xl py-5 px-12" onClick={() => setReport(null)}>REJECT</button>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <ShieldAlert size={32} strokeWidth={3} />
                <h2 className="text-4xl font-black uppercase italic">Exception Manifest</h2>
              </div>
              <div className="brutal-card p-0 overflow-hidden bg-white">
                 <table className="report-table">
                   <thead>
                     <tr>
                       <th>Index</th>
                       <th>Class</th>
                       <th>Diagnostic Log</th>
                       <th>Resolution</th>
                     </tr>
                   </thead>
                   <tbody>
                     {report.anomalies.map((a: any, idx: number) => (
                       <tr key={idx}>
                         <td className="font-black text-xl italic">#{a.rowNumber}</td>
                         <td><code className="bg-black text-white px-2 py-1 text-xs">{a.type}</code></td>
                         <td className="font-bold">{a.description}</td>
                         <td>
                           <span className={`brutal-badge text-lg ${
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

            <section className="space-y-6">
               <div className="flex items-center gap-3">
                <CheckCircle2 size={32} strokeWidth={3} className="text-brutal-green" />
                <h2 className="text-4xl font-black uppercase italic text-brutal-green drop-shadow-[2px_2px_0px_black]">Transaction Preview</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {report.processedData.slice(0, 12).map((item: any, idx: number) => (
                  <div key={idx} className="brutal-card bg-white p-4 flex justify-between items-center group hover:bg-black hover:text-white">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase group-hover:text-brutal-yellow">LOG: {item.rowNum} // TYPE: {item.type}</span>
                      <span className="text-xl font-black uppercase tracking-tighter italic">{item.data.description}</span>
                    </div>
                    <div className="text-3xl font-black italic tracking-tighter">₹{item.data.amount.toLocaleString()}</div>
                  </div>
                ))}
              </div>
              {report.processedData.length > 12 && (
                 <div className="text-center font-black uppercase italic text-slate-400 py-10 border-t-4 border-black border-dashed">
                   [ STREAM TRUNCATED: {report.processedData.length - 12} ADDITIONAL ENTRIES ]
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
