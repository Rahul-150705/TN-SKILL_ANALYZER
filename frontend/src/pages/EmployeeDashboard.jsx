import { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { UploadCloud, FileText, ArrowRight, History, Settings, Key, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmployeeDashboard() {
  const { user } = useContext(AuthContext);
  const [selectedRoleObj, setSelectedRoleObj] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState([]);

  const [roleCode, setRoleCode] = useState('');
  const [isRoleLinked, setIsRoleLinked] = useState(false);

  const [streamSteps, setStreamSteps] = useState([]);
  const [aiTokens, setAiTokens] = useState('');
  const [liveScores, setLiveScores] = useState(null);
  const [showStreamOverlay, setShowStreamOverlay] = useState(false);

  const terminalEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showStreamOverlay) {
      terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [streamSteps, aiTokens]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const historyRes = await api.get('/analyze/my-results');
      setAnalyses(historyRes.data);
    } catch (err) {
      toast.error('Failed to load history');
    }
  };

  const handleLinkRole = async () => {
    if (!roleCode || roleCode.trim() === '') return toast.error('Please enter a 7-character Role Code');
    try {
      const rolesRes = await api.get(`/roles/code/${roleCode.trim().toUpperCase()}`);
      if (!rolesRes.data || !rolesRes.data.id) {
        toast.error('No role found for this code');
      } else {
        setSelectedRoleObj(rolesRes.data);
        setSelectedRole(rolesRes.data.id);
        setIsRoleLinked(true);
        toast.success(`Role selected: ${rolesRes.data.title}`);
      }
    } catch (err) {
      toast.error('Invalid Role Code or error fetching role details');
    }
  };

  const handleUpload = async () => {
    if (!file || !selectedRole) return toast.error('Please select both a role and a resume');

    setLoading(true);
    setStreamSteps([{ type: 'info', text: 'Preparing analysis system...' }]);
    setAiTokens('');
    setLiveScores(null);
    setShowStreamOverlay(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jobRoleId', selectedRole);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/analyze/resume-stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        buffer = parts.pop();

        for (const part of parts) {
          if (!part.trim()) continue;

          const eventMatch = part.match(/^event: (.*)\r?\ndata: (.*)$/m);
          if (eventMatch) {
            const eventName = eventMatch[1];
            const eventData = eventMatch[2];

            if (eventName === 'step') {
              setStreamSteps(prev => [...prev, { type: 'info', text: eventData }]);
            } else if (eventName === 'token') {
              setAiTokens(prev => {
                const updated = prev + eventData;

                // Granular extraction: find any key-value pair of string : number
                const matches = [...updated.matchAll(/"([^"]+)"\s*:\s*(\d+)/g)];
                if (matches.length > 0) {
                  const scores = {};
                  matches.forEach(m => {
                    const key = m[1];
                    const val = parseInt(m[2]);
                    // Only pick relevant metric keys
                    if (["Certifications", "Responsibilities", "Experience relevance", "Safety knowledge", "Diagnostic tools", "Skills coverage"].includes(key)) {
                      scores[key] = val;
                    }
                  });
                  if (Object.keys(scores).length > 0) setLiveScores(scores);
                }
                return updated;
              });
            } else if (eventName === 'final') {
              toast.success('Analysis complete!');
              setTimeout(() => {
                navigate(`/employee/results/${eventData}`);
              }, 1000);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Analysis failed');
      setLoading(false);
      setShowStreamOverlay(false);
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

          {!isRoleLinked ? (
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Key size={20} /></div>
                Enter Role Code
              </h2>
              <p className="text-slate-400 mb-4">Enter the 7-character Job Role Unique Code provided by your HR to start evaluating your skills.</p>

              <div className="flex gap-4">
                <input type="text" value={roleCode} onChange={e => setRoleCode(e.target.value)}
                  placeholder="e.g. A3B89X1" maxLength={7}
                  className="flex-1 font-mono uppercase tracking-widest bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
                <button onClick={handleLinkRole} disabled={loading} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 font-bold rounded-lg transition shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                  Find Role
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><Settings size={120} /></div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-sm border border-emerald-500/30">1</span>
                  Target Role Discovered
                </h2>
                <div className="mt-4 p-4 rounded-lg bg-slate-900 border border-slate-700 relative z-10">
                  <h3 className="text-emerald-400 font-bold text-xl">{selectedRoleObj?.title}</h3>
                  <p className="text-slate-400 text-sm mt-1 mb-3">{selectedRoleObj?.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedRoleObj?.requiredSkills?.slice(0, 5).map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs border border-slate-700">{skill.skillName}</span>
                    ))}
                    {selectedRoleObj?.requiredSkills?.length > 5 && <span className="px-2 py-1 bg-slate-800 text-emerald-500 rounded text-xs border border-emerald-900">+{selectedRoleObj.requiredSkills.length - 5} more</span>}
                  </div>
                  <button onClick={() => setIsRoleLinked(false)} className="text-xs text-slate-500 hover:text-white mt-4 underline underline-offset-2">Change Role</button>
                </div>
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
            </>
          )}
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

      {showStreamOverlay && (
        <div className="fixed inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-6 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[600px]">
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                <span className="text-slate-400 text-xs font-mono ml-4">AI ANALYZER TERMINAL - SESSION ACTIVE</span>
              </div>
              <div className="animate-pulse text-emerald-400 text-xs font-bold font-mono">LIVE</div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-4">
              {streamSteps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-slate-500">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                  <span className="text-emerald-400"># {step.text}</span>
                </div>
              ))}

              {aiTokens && (
                <div className="mt-6 border-t border-slate-700 pt-6">
                  {liveScores && (
                    <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-4 duration-1000">
                      {Object.entries(liveScores).map(([key, val]) => (
                        <div key={key} className="bg-slate-950/80 border border-emerald-500/20 p-3 rounded-lg flex flex-col items-center">
                          <span className="text-[10px] text-slate-500 uppercase tracking-tighter mb-1 text-center">{key}</span>
                          <span className="text-xl font-bold text-emerald-400">{val}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="text-slate-500 mb-2 flex justify-between items-center text-[10px]">
                    <span>[AI BRAIN FEED]</span>
                    {liveScores && <span className="text-emerald-500 font-bold animate-pulse">SCORES CAPTURED!</span>}
                  </div>
                  <div className="text-slate-300 bg-slate-950/50 p-4 rounded-lg whitespace-pre-wrap leading-relaxed animate-in fade-in duration-500 max-h-40 overflow-y-auto text-xs opacity-60 italic">
                    {aiTokens}
                    <span className="w-2 h-4 bg-emerald-500 inline-block animate-pulse ml-1 align-middle"></span>
                  </div>
                </div>
              )}
              <div ref={terminalEndRef} />
            </div>

            <div className="bg-slate-800/50 px-6 py-4 border-t border-slate-700 text-slate-500 text-xs">
              Note: AI is processing complex semantic mappings. Latency is inherent to model depth.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}