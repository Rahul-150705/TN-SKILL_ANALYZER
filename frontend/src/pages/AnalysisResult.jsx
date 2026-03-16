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
    } catch(err) {
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
    } catch(err) {
      toast.error('Export failed');
    }
  };

  if (loading) return <Spinner />;
  if (!data) return null;

  const matchColor = data.matchPercentage >= 70 ? '#10b981' : data.matchPercentage >= 40 ? '#f59e0b' : '#ef4444';
  
  const gaugeOptions = {
    chart: { type: 'radialBar', background: 'transparent' },
    plotOptions: {
      radialBar: {
        hollow: { size: '65%' },
        track: { background: '#1e293b' },
        dataLabels: {
          name: { offsetY: -10, color: '#94a3b8', fontSize: '13px' },
          value: { offsetY: 5, color: '#f8fafc', fontSize: '36px', fontWeight: 700, formatter: val => val + '%' }
        }
      }
    },
    fill: { type: 'solid', colors: [matchColor] },
    stroke: { lineCap: 'round' },
    labels: ['Readiness Score'],
  };

  return (
    <div className="p-8 max-w-6xl mx-auto pb-20">
      <div className="flexjustify-between items-start mb-8 flex">
        <div>
          <button onClick={() => navigate('/employee')} className="text-slate-400 hover:text-white flex items-center gap-2 mb-4 transition text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-white">{data.jobRoleTitle}</h1>
          <p className="text-slate-400 mt-1">Analysis for {data.employeeName} • {new Date(data.analyzedAt).toLocaleDateString()}</p>
        </div>
        <button onClick={handleDownloadReport} className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ml-auto">
          <Download size={18} /> Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl flex flex-col items-center justify-center">
          <Chart options={gaugeOptions} series={[Math.round(data.matchPercentage)]} type="radialBar" height={300} />
          {data.matchPercentage >= 70 ? (
            <div className="flex items-center gap-2 text-emerald-400 font-medium mt-[-20px]"><Trophy size={18} /> Highly Ready</div>
          ) : (
             <div className="flex items-center gap-2 text-red-400 font-medium mt-[-20px]"><AlertTriangle size={18} /> Needs Training</div>
          )}
        </div>
        
        <div className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold text-emerald-400 border-b border-emerald-900 pb-3 mb-4">Detected Skills</h3>
              {data.detectedSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.detectedSkills.map(s => <SkillBadge key={s} skill={s} variant="success" />)}
                </div>
              ) : <p className="text-slate-500 italic text-sm">No technical skills detected.</p>}
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-red-400 border-b border-red-900 pb-3 mb-4">Missing Skills</h3>
              {data.missingSkills?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.missingSkills.map(s => <SkillBadge key={s} skill={s} variant="danger" />)}
                </div>
              ) : <p className="text-emerald-500 italic text-sm">All required skills met!</p>}
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-700">
            <h3 className="text-lg font-bold text-teal-400 mb-4">Matched Role Skills</h3>
            {data.matchedSkills?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {data.matchedSkills.map(s => <SkillBadge key={s} skill={s} variant="match" />)}
              </div>
            ) : <p className="text-slate-500 italic text-sm">No required skills matched.</p>}
          </div>
        </div>
      </div>

      {data.recommendedCourses?.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white border-b border-slate-700 pb-4 mb-6 mt-12 flex items-center gap-3">
            <BookOpen className="text-emerald-400" /> Recommended Training Path
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