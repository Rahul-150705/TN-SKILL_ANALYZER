import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const CourseCard = ({ course, index }) => (
    <div className="bg-gray-800/80 p-6 rounded-3xl border border-gray-700 hover:border-blue-500/30 transition-all group flex gap-5 shadow-lg">
        <div className="w-12 h-12 shrink-0 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-500 text-sm font-black border border-blue-500/20">
            {index + 1}
        </div>
        <div className="flex-1">
            <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-widest">
                {course.platform}
            </p>
            <h4 className="font-bold group-hover:text-blue-400 transition-colors uppercase leading-tight text-sm mb-2">
                {course.courseName}
            </h4>
            {course.courseLink && (
                <a href={course.courseLink} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-400 hover:text-blue-300 underline font-bold uppercase tracking-widest">
                    View Course
                </a>
            )}
        </div>
    </div>
);

const RoleAnalyticsReport = () => {
    const { roleId } = useParams();
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchReport = useCallback(async () => {
        try {
            const response = await axios.get(`/analytics/role/${roleId}`);
            setReport(response.data);
        } catch {
            toast.error('Failed to load analytics report');
        } finally {
            setLoading(false);
        }
    }, [roleId]);

    useEffect(() => {
        fetchReport();
    }, [fetchReport]);

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
    );

    if (!report) return null;

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-gray-900 text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                    <div className="space-y-4">
                        <Link to="/admin/dashboard" className="text-gray-500 hover:text-blue-400 font-bold flex items-center gap-2 transition-colors uppercase text-xs tracking-widest">
                            Back to Command Center
                        </Link>
                        <h1 className="text-5xl font-black text-white uppercase tracking-tight leading-none">
                            {report.roleTitle} <span className="text-blue-500">Report</span>
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-gray-800/80 p-8 rounded-[2rem] border border-gray-700 shadow-xl flex flex-col items-center justify-center min-w-[160px]">
                            <span className="text-5xl font-black text-blue-500 mb-1">{report.totalStudents}</span>
                            <span className="text-xs font-black uppercase text-gray-500 tracking-widest text-center">Total Students</span>
                        </div>
                        <div className="bg-gray-800/80 p-8 rounded-[2rem] border border-gray-700 shadow-xl flex flex-col items-center justify-center min-w-[160px]">
                            <span className="text-5xl font-black text-red-500 mb-1">{report.studentsNeedingImprovement}</span>
                            <span className="text-xs font-black uppercase text-gray-500 tracking-widest text-center">Need Improvement</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-gray-800/80 rounded-[3rem] border border-gray-700 overflow-hidden shadow-2xl">
                            <div className="p-10 border-b border-gray-700 flex justify-between items-center bg-gray-800/40">
                                <h3 className="text-2xl font-black uppercase tracking-tight text-blue-400">
                                    Student Assessment Pool
                                </h3>
                            </div>
                            {report.studentScores.length === 0 ? (
                                <div className="p-10 text-center text-gray-500 font-bold uppercase tracking-widest">
                                    No students have submitted resumes for this role yet.
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-900/50 text-gray-500 text-[10px] uppercase font-black tracking-widest">
                                                <th className="py-6 px-10">Student</th>
                                                <th className="py-6 px-10 text-center">Score</th>
                                                <th className="py-6 px-10">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-700/50">
                                            {report.studentScores.map((s, idx) => (
                                                <motion.tr key={idx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className="hover:bg-blue-500/5 transition-colors group">
                                                    <td className="py-8 px-10">
                                                        <p className="text-xl font-bold group-hover:text-blue-400 transition-colors uppercase">{s.studentName}</p>
                                                    </td>
                                                    <td className="py-8 px-10 text-center">
                                                        <span className={`text-2xl font-black ${s.matchPercentage >= 70 ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                            {Math.round(s.matchPercentage)}%
                                                        </span>
                                                    </td>
                                                    <td className="py-8 px-10">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${s.matchPercentage >= 60 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                                                            {s.matchPercentage >= 60 ? 'Qualified' : 'Re-Skill'}
                                                        </span>
                                                    </td>
                                                </motion.tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>

                    <aside className="space-y-12">
                        <section className="bg-gray-800/80 p-10 rounded-[2.5rem] border border-gray-700 shadow-xl space-y-8">
                            <h3 className="text-2xl font-black text-blue-400 uppercase tracking-tight">Critical Skill Gaps</h3>
                            {report.aggregatedMissingSkills.length === 0 ? (
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">No skill gaps identified yet.</p>
                            ) : (
                                <div className="flex flex-wrap gap-3">
                                    {report.aggregatedMissingSkills.map((skill, idx) => (
                                        <span key={idx} className="bg-red-500/10 text-red-500 px-5 py-2.5 rounded-2xl text-sm font-black border border-red-500/20 uppercase tracking-tighter">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-2xl font-black text-blue-400 uppercase tracking-tight px-4">Training Solutions</h3>
                            {report.topRecommendedCourses.length === 0 ? (
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest px-4">No courses found for current skill gaps.</p>
                            ) : (
                                <div className="space-y-4">
                                    {report.topRecommendedCourses.map((c, idx) => (
                                        <CourseCard key={idx} course={c} index={idx} />
                                    ))}
                                </div>
                            )}
                        </section>
                    </aside>

                </div>
            </div>
        </motion.div>
    );
};

export default RoleAnalyticsReport;