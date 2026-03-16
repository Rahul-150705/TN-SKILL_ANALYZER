import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { UploadCloud, FileText, ArrowRight, History, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeDashboard() {
  const { user } = useContext(AuthContext);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesRes, historyRes] = await Promise.all([
        api.get('/roles'),
        api.get('/analyze/my-results')
      ]);
      setRoles(rolesRes.data);
      setAnalyses(historyRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedRole) return toast.error('Please select both a role and a resume');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobRoleId', selectedRole);

    try {
      const res = await api.post('/analyze/resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Analysis complete!');
      navigate(`/employee/results/${res.data.id}`);
    } catch (err) {
      toast.error('Analysis failed');
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 border-b border-slate-700 pb-6">
        <h1 className="text-3xl font-bold text-white">Hi, {user?.name.split(' ')[0]}</h1>
        <p className="text-slate-400 mt-1">Discover your EV skill gaps and recommended training path.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/30">1</span>
              Select Target Role
            </h2>
            <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition">
              <option value="">Choose a career path...</option>
              {roles.map(r => <option key={r.id} value={r.id}>{r.title}</option>)}
            </select>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/30">2</span>
              Upload Resume
            </h2>
            
            <label className={`w-full block border-2 border-dashed ${file ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-600 bg-slate-900/50 hover:bg-slate-900'} rounded-2xl p-10 cursor-pointer transition flex flex-col items-center justify-center text-center`}>
              <input type="file" accept=".pdf" className="hidden" onChange={e => e.target.files && setFile(e.target.files[0])} />
              {file ? (
                <>
                  <div className="p-4 bg-emerald-500/20 rounded-full mb-4 inline-block"><FileText size={48} className="text-emerald-500" /></div>
                  <p className="text-emerald-400 font-bold text-lg mb-1">{file.name}</p>
                  <p className="text-slate-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-800 rounded-full mb-4 inline-block"><UploadCloud size={48} className="text-slate-400" /></div>
                  <p className="text-white font-medium text-lg mb-1">Upload your resume (PDF)</p>
                  <p className="text-slate-400 text-sm">Drag and drop or click to browse files</p>
                </>
              )}
            </label>

            <button onClick={handleUpload} disabled={!file || !selectedRole || loading}
              className={`w-full mt-6 py-4 rounded-xl font-bold text-lg text-slate-900 shadow-xl transition flex justify-center items-center gap-2 
              ${(!file || !selectedRole || loading) ? 'bg-emerald-500/50 cursor-not-allowed opacity-50' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'}`}>
              {loading ? (
                 <span className="flex items-center gap-2"><div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div> AI processing resume...</span>
              ) : (
                 <>Analyze My Skills <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        </div>

        <div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl sticky top-8">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <History size={18} className="text-emerald-400" /> Past Analyses
            </h3>
            
            {analyses.length === 0 ? (
              <p className="text-slate-400 text-sm italic py-4 text-center">No previous analyses found.</p>
            ) : (
              <div className="space-y-3">
                {analyses.map(a => (
                  <button key={a.id} onClick={() => navigate(`/employee/results/${a.id}`)}
                    className="w-full text-left bg-slate-900 border border-slate-700 hover:border-emerald-500/50 rounded-lg p-4 transition group">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-white group-hover:text-emerald-400 transition truncate pr-2">{a.jobRoleTitle}</h4>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${a.matchPercentage >= 70 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {Math.round(a.matchPercentage)}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{new Date(a.analyzedAt).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}