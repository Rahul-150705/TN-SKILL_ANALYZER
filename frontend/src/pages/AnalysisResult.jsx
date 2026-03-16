import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Chart from 'react-apexcharts';
import CourseCard from '../components/CourseCard';
import SkillBadge from '../components/SkillBadge';
import Spinner from '../components/Spinner';
import { Download, ArrowLeft, Trophy, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalysisResult() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const res = await api.get(`/analyze/result/${id}`);
      setData(res.data);
    } catch (err) {
      toast.error('Failed to load results');
      navigate('/employee');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const res = await api.get(`/analyze/export/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Skill_Gap_Report.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error('Export failed');
    }
  };

  if (loading) return <Spinner />;
  if (!data) return null;

  const matchColor = data.matchPercentage >= 70 ? '#10b981' : data.matchPercentage >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="p-8 max-w-5xl mx-auto pb-20">
      {/* Header Profile Section */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition text-sm">
            <ArrowLeft size={16} /> Back
          </button>
          <h1 className="text-4xl font-bold text-white mb-2">{data.employeeName}</h1>
          <p className="text-emerald-400 font-medium text-lg">
            {data.jobRoleTitle} • <span className="text-slate-400 text-base font-normal">Analyzed on {new Date(data.analyzedAt).toLocaleDateString()}</span>
          </p>
        </div>
        <button onClick={handleDownloadReport} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2">
          <Download size={18} /> Download
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Overall Score & Categories */}
        <div className="space-y-6">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <h3 className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-4">Overall Match Score</h3>
            <div className="flex items-end gap-3 mb-2">
              <span className="text-5xl font-black text-white">{Math.round(data.matchPercentage)}%</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-bold ${data.matchPercentage >= 70 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                data.matchPercentage >= 40 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}>
              {data.matchCategory || (data.matchPercentage >= 70 ? 'Strong match' : data.matchPercentage >= 40 ? 'Moderate match' : 'Weak match')}
            </div>
            {/* Visual background gradient flavor */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full"></div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl">
            <h3 className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-6">Category Scores</h3>
            <div className="space-y-4">
              {data.categoryScores && Object.keys(data.categoryScores).length > 0 ? (
                Object.entries(data.categoryScores).map(([category, score]) => (
                  <div key={category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300 font-medium">{category}</span>
                      <span className="text-white font-bold">{score}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-2">
                      <div className={`h-2 rounded-full ${score >= 80 ? 'bg-emerald-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${score}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic text-sm">No categorical breakdown available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Skills Analysis & Text Assessment */}
        <div className="lg:col-span-2 space-y-6">

          {/* Skills Analysis */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
            <h3 className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-6">Skills Analysis</h3>

            <div className="space-y-6">
              <div>
                <h4 className="text-teal-400 font-bold mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-teal-400"></div> MATCHED</h4>
                {data.matchedSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.matchedSkills.map(s => <SkillBadge key={s} skill={s} variant="matched" />)}
                  </div>
                ) : <p className="text-slate-500 italic text-sm">No exact matches found.</p>}
              </div>

              <div>
                <h4 className="text-amber-400 font-bold mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-400"></div> PARTIAL</h4>
                {data.partialSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.partialSkills.map(s => <SkillBadge key={s} skill={s} variant="partial" />)}
                  </div>
                ) : <p className="text-slate-500 italic text-sm">No partial matches found.</p>}
              </div>

              <div>
                <h4 className="text-red-400 font-bold mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-400"></div> MISSING</h4>
                {data.missingSkills?.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {data.missingSkills.map(s => <SkillBadge key={s} skill={s} variant="missing" />)}
                  </div>
                ) : <p className="text-emerald-500 italic text-sm">All missing skills covered!</p>}
              </div>
            </div>
          </div>

          {/* AI Assessment & Recommendation */}
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl space-y-8">
            <div>
              <h3 className="text-slate-400 text-sm font-bold tracking-wider uppercase mb-4">Assessment</h3>
              <p className="text-slate-300 leading-relaxed text-lg">
                {data.assessment || "No detailed assessment provided for this analysis."}
              </p>
            </div>

            <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50">
              <h3 className="text-emerald-400 text-sm font-bold tracking-wider uppercase mb-3">Recommendation</h3>
              <p className="text-white font-medium text-lg">
                {data.recommendation || "Pending manual human review."}
              </p>
            </div>
          </div>

        </div>
      </div>

      {data.recommendedCourses?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-4 mb-6 flex items-center gap-3">
            Recommended Training Path
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.recommendedCourses.map((course, idx) => (
              <CourseCard key={idx} course={course} />
            ))}
          </div>
        </div>
      )}

    </div>
  );
}