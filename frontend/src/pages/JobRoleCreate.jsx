import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const JobRoleCreate = () => {
  const [formData, setFormData] = useState({
    title: '',
    basicRequirements: '',
    description: '',
    minSkills: []
  });
  const [currentSkill, setCurrentSkill] = useState({ skillName: '', skillCategory: 'Technical' });
  const navigate = useNavigate();

  const addSkill = () => {
    if (!currentSkill.skillName.trim()) return;
    setFormData(prev => ({ ...prev, minSkills: [...prev.minSkills, currentSkill] }));
    setCurrentSkill({ ...currentSkill, skillName: '' });
  };

  const removeSkill = (index) => {
    setFormData(prev => ({ ...prev, minSkills: prev.minSkills.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.minSkills.length < 3) {
      toast.error('Please add at least 3 minimum skills');
      return;
    }

    try {
      await axios.post('/roles', formData);
      toast.success('Job Role created successfully!');
      navigate('/admin/dashboard');
    } catch (_err) {
      toast.error('Failed to create role. Try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-900 text-white p-6 md:p-12 pb-32"
    >
      <div className="max-w-4xl mx-auto bg-gray-800/80 p-10 rounded-[3rem] border border-gray-700 shadow-2xl backdrop-blur-xl">
        <h1 className="text-4xl font-black mb-10 text-blue-400 uppercase tracking-tighter">Post New Job Role</h1>

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Official Job Title</label>
            <input
              type="text"
              className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl focus:ring-4 focus:ring-blue-500/20 text-xl font-bold transition-all placeholder:text-gray-700"
              placeholder="e.g. Lead Technical Architect"
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Education & Experience Requirements</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl focus:ring-4 focus:ring-blue-500/20 h-24 transition-all placeholder:text-gray-700"
              placeholder="e.g. B.Tech Computer Science, 3+ years in React.js..."
              onChange={(e) => setFormData({ ...formData, basicRequirements: e.target.value })}
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Detailed Scope of Work</label>
            <textarea
              className="w-full bg-gray-900 border border-gray-700 p-5 rounded-2xl focus:ring-4 focus:ring-blue-500/20 h-40 transition-all placeholder:text-gray-700"
              placeholder="Outline the core responsibilities and expectations..."
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-6">
            <label className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 block">Critical Skill Benchmarks (Min 3)</label>
            <div className="flex flex-col md:flex-row gap-4 bg-gray-900/50 p-6 rounded-3xl border border-gray-700/50">
              <input
                type="text"
                className="flex-1 bg-gray-900 border border-gray-700 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20"
                placeholder="Skill Label (e.g. Docker)"
                value={currentSkill.skillName}
                onChange={(e) => setCurrentSkill({ ...currentSkill, skillName: e.target.value })}
              />
              <select
                className="bg-gray-900 border border-gray-700 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 font-bold text-sm uppercase tracking-widest cursor-pointer"
                value={currentSkill.skillCategory}
                onChange={(e) => setCurrentSkill({ ...currentSkill, skillCategory: e.target.value })}
              >
                <option>Technical</option>
                <option>Soft Skill</option>
                <option>Management</option>
              </select>
              <button
                type="button"
                onClick={addSkill}
                className="px-10 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold transition-all shadow-xl shadow-blue-900/40 uppercase text-xs tracking-widest"
              >
                Add Skill
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {formData.minSkills.map((skill, index) => (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    key={index}
                    className="flex items-center gap-3 bg-blue-500/10 text-blue-400 px-5 py-3 rounded-2xl border border-blue-500/20 group shadow-lg"
                  >
                    <div>
                      <span className="font-black uppercase text-xs block leading-none mb-1 text-blue-500/50">{skill.skillCategory}</span>
                      <span className="font-bold text-lg tracking-tight">{skill.skillName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center font-black ml-4"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {formData.minSkills.length < 3 && (
                <div className="text-gray-600 text-xs font-black uppercase tracking-widest py-4 bg-gray-900/30 px-6 rounded-2xl italic border border-dashed border-gray-700">
                  ⚠️ Minimum 3 skills required to validate assessments ({3 - formData.minSkills.length} remaining)
                </div>
              )}
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white text-xl font-black rounded-[2rem] transition-all shadow-2xl shadow-blue-900/30 uppercase tracking-[0.2em]"
          >
            Deploy Job Role
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default JobRoleCreate;