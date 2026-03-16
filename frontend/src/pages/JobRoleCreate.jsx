import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Plus, X, Briefcase, List, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function JobRoleCreate() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');
  const [currentCategory, setCurrentCategory] = useState('EV Technology');
  const navigate = useNavigate();

  const addSkill = () => {
    if (currentSkill.trim() && !skills.some(s => s.skillName === currentSkill.trim())) {
      setSkills([...skills, { skillName: currentSkill.trim(), skillCategory: currentCategory }]);
      setCurrentSkill('');
    }
  };

  const removeSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skills.length < 3) return toast.error('Please add at least 3 skills');
    
    try {
      await api.post('/roles', { title, description, requiredSkills: skills });
      toast.success('Job Role created successfully');
      navigate('/hr');
    } catch (err) {
      toast.error('Failed to create role');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Create New Job Role</h1>
        <p className="text-slate-400">Define a target role and required skills for your EV workforce</p>
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Briefcase size={16} /> Role Title
              </label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. EV Battery Technician"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                <Info size={16} /> Description
              </label>
              <textarea required value={description} onChange={e => setDescription(e.target.value)} rows="3" placeholder="Brief description of responsibilities..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-700">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-4">
              <List size={16} /> Required Skills (Minimum 3)
            </label>
            
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <input type="text" value={currentSkill} onChange={e => setCurrentSkill(e.target.value)} placeholder="e.g. CAN Bus Protocol"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
              <select value={currentCategory} onChange={e => setCurrentCategory(e.target.value)}
                className="w-full md:w-64 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition">
                {['EV Technology', 'Manufacturing', 'Software', 'Safety', 'Management'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <button type="button" onClick={addSkill} className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-6 font-medium rounded-lg shadow-lg shadow-emerald-500/20 px-4 py-3 flex items-center justify-center gap-2 transition">
                <Plus size={18} /> Add
              </button>
            </div>

            {skills.length > 0 && (
              <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {skill.skillName} <span className="opacity-50 text-xs">({skill.skillCategory})</span>
                    <button type="button" onClick={() => removeSkill(index)} className="hover:text-red-400 ml-1">
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-8 py-3 rounded-lg font-bold shadow-lg shadow-emerald-500/20 transition text-lg">
              Save Job Role
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}