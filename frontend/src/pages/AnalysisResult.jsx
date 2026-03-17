import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../api/axios';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AnalysisResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResult = useCallback(async () => {
    try {
      const response = await axios.get(`/analyze/result/${id}`);
      setResult(response.data);
    } catch {
      toast.error('Failed to load analysis results');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchResult();
  }, [fetchResult]);

  const handleExport = async () => {
    try {
      const response = await axios.get(`/analyze/export/${id}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Analysis_Report_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch {
      toast.error('Failed to export PDF');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
  );

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-screen bg-gray-900 text-white p-6 md:p-12 pb-24"
    >
      <div className="max-w-6xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tight text-emerald-400 uppercase">{result.jobRoleTitle}</h1>
            <p className="text-gray-400 text-xl font-medium tracking-wide">Analysis Report for {result.studentName}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExport}
            className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl flex items-center gap-3 transition-all border border-gray-700 font-bold group shadow-xl"
          >
            Export Comprehensive Report (PDF)
          </motion.button>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-12 bg-gray-800/40 p-12 rounded-[3.5rem] border border-gray-700/50 backdrop-blur-3xl shadow-2xl">
          <div className="flex flex-col items-center justify-center space-y-6 lg:border-r border-gray-700/50 pr-0 lg:pr-12">
            <div className="w-64 h-64 relative drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]">
              <CircularProgressbar
                value={result.matchPercentage}
                text={`${Math.round(result.matchPercentage)}%`}
                styles={buildStyles({
                  pathColor: result.matchPercentage >= 70 ? '#10b981' : '#f59e0b',
                  textColor: '#fff',
                  trailColor: '#1f2937',
                  textSize: '18px',
                  strokeLinecap: 'round'
                })}
              />
            </div>
            <h3 className="text-2xl font-black text-white uppercase tracking-wider text-center">Overall Match Score</h3>
          </div>

          <div className="lg:col-span-2 space-y-10">
            <h3 className="text-2xl font-bold text-gray-400 flex items-center gap-3">
              AI Assessment Summary
            </h3>
            <p className="text-2xl leading-relaxed text-gray-200 font-medium italic opacity-95">
              "{result.recommendationSummary}"
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Technical Skills', score: result.scores.technicalSkills, color: 'emerald' },
                { label: 'Certifications', score: result.scores.certifications, color: 'blue' },
                { label: 'Creativity', score: result.scores.creativity, color: 'purple' },
                { label: 'Responsiveness', score: result.scores.responsiveness, color: 'amber' }
              ].map(stat => (
                <div key={stat.label} className="bg-gray-800/80 p-6 rounded-3xl border border-gray-700 hover:border-emerald-500/20 transition-all group">
                  <p className="text-xs font-black uppercase text-gray-500 mb-4">{stat.label}</p>
                  <div className="text-3xl font-black mb-1 group-hover:text-white transition-colors">{stat.score}/100</div>
                  <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.score}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={`h-full bg-${stat.color}-500`}
                    ></motion.div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          <section className="bg-gray-800/80 p-10 rounded-[2.5rem] border border-gray-700/50 shadow-xl space-y-8">
            <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-tight flex items-center gap-3">
              Skill Analysis Breakdown
            </h3>

            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest flex justify-between">
                  Matched Skills
                  <span className="text-emerald-500">{result.matchedSkills?.length || 0} found</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.matchedSkills?.map(s => (
                    <span key={s} className="bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl text-sm font-bold border border-emerald-500/20">{s}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest flex justify-between">
                  Missing Skills
                  <span className="text-red-500">{result.missingSkills?.length || 0} gaps</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.missingSkills?.map(s => (
                    <span key={s} className="bg-red-500/10 text-red-500 px-4 py-2 rounded-xl text-sm font-bold border border-red-500/20">{s}</span>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest flex justify-between">
                  Partial Matches
                  <span className="text-amber-500">{result.partialSkills?.length || 0} areas</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.partialSkills?.map(s => (
                    <span key={s} className="bg-amber-500/10 text-amber-500 px-4 py-2 rounded-xl text-sm font-bold border border-amber-500/20">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-8">
            <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-tight flex items-center gap-3 px-4">
              Top 3 Upskilling Recommendations
            </h3>

            <div className="space-y-4">
              {result.recommendedCourses?.map((course, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  key={idx}
                  className="bg-gray-800/80 p-8 rounded-[2.5rem] border border-gray-700/50 hover:border-emerald-500/20 transition-all group flex items-start gap-6 shadow-xl"
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg group-hover:scale-110 transition-all">
                    {idx + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-emerald-500 tracking-[0.2em]">{course.platform}</span>
                      <div className="h-0.5 w-6 bg-emerald-500/20"></div>
                    </div>
                    <h4 className="text-xl font-bold group-hover:text-emerald-400 transition-colors leading-tight uppercase">{course.courseName}</h4>
                    <a
                      href={course.courseLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-emerald-500 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-lg hover:bg-emerald-500 hover:text-white transition-all mt-4"
                    >
                      Explore Course
                    </a>
                  </div>
                </motion.div>
              )) || (
                  <p className="text-gray-500 text-center italic py-20 bg-gray-800/40 rounded-[2.5rem] border border-dashed border-gray-700">No specific courses found for these skills.</p>
                )}
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
};

export default AnalysisResult;