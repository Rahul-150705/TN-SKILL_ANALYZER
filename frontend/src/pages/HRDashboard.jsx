import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { Users, BookOpen, AlertCircle, Trash2, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HRDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, rolesRes] = await Promise.all([
        api.get('/analytics/workforce'),
        api.get('/roles')
      ]);
      setStats(statsRes.data);
      setRoles(rolesRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    }
  };

  const deleteRole = async (id) => {
    try {
      await api.delete(`/roles/${id}`);
      setRoles(roles.filter(r => r.id !== id));
      toast.success('Role deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}</h1>
          <p className="text-slate-400 mt-1">{user.companyName} HR Dashboard</p>
        </div>
        <Link to="/hr/analytics" className="bg-slate-800 border border-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition font-medium">
          View Detailed Analytics
        </Link>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg text-blue-400"><BriefcaseIcon size={24} /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Total Roles</p>
                <h3 className="text-3xl font-bold text-white">{roles.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-lg text-purple-400"><Users size={24} /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Analyzed Emps</p>
                <h3 className="text-3xl font-bold text-white">{stats.totalAnalyzed || 0}</h3>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-lg text-emerald-400"><TrendingUp size={24} /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium">Avg Match</p>
                <h3 className="text-3xl font-bold text-white">{stats.averageMatchPercentage || 0}%</h3>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg shadow-black/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-teal-500/10 rounded-lg text-teal-400"><BookOpen size={24} /></div>
              <div>
                <p className="text-slate-400 text-sm font-medium">EV Readiness</p>
                <h3 className="text-3xl font-bold text-white">{stats.evReadinessScore || 0}%</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg shadow-black/20">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Target Job Roles</h2>
          <Link to="/hr/roles/create" className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 px-4 py-2 rounded-lg font-medium shadow-lg shadow-emerald-500/20 transition">
            Create New Role
          </Link>
        </div>

        {roles.length === 0 ? (
          <div className="text-center py-12 text-slate-400 flex flex-col items-center">
            <AlertCircle size={48} className="mb-4 text-slate-600" />
            <p>No job roles defined yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-sm uppercase tracking-wider">
                  <th className="py-4 px-4 font-medium">Role Title</th>
                  <th className="py-4 px-4 font-medium">Role Code (Share this!)</th>
                  <th className="py-4 px-4 font-medium">Skills Required</th>
                  <th className="py-4 px-4 font-medium">Created At</th>
                  <th className="py-4 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {roles.map(role => (
                  <tr key={role.id} className="hover:bg-slate-700/20 transition">
                    <td className="py-4 px-4">
                      <div className="font-medium text-white">{role.title}</div>
                      <div className="text-xs text-slate-400 truncate max-w-xs">{role.description}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-md text-sm font-bold tracking-widest uppercase shadow-sm">
                        {role.uniqueId || '------'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                        {role.requiredSkills?.length || 0} skills
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400 text-sm">
                      {new Date(role.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button onClick={() => deleteRole(role.id)} className="text-slate-400 hover:text-red-400 transition p-2">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const BriefcaseIcon = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;