import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'EMPLOYEE', companyName: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/signup', formData);
      toast.success('Account created! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-emerald-900/40 to-slate-900 items-center justify-center p-12">
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold text-white mb-6">Join the Future.</h1>
          <p className="text-xl text-emerald-400/80">Analyze your workforce skills against TN Auto tech requirements.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-900 h-screen overflow-y-auto">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl my-auto">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Create Account</h2>
          
          <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700 mb-6">
            <button type="button" onClick={() => setFormData({...formData, role: 'EMPLOYEE'})}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${formData.role === 'EMPLOYEE' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
              Employee
            </button>
            <button type="button" onClick={() => setFormData({...formData, role: 'HR'})}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition ${formData.role === 'HR' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
              HR / Admin
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            
            {(formData.role === 'HR' || formData.role === 'EMPLOYEE') && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{formData.role === 'HR' ? 'New or Existing Company Name' : 'Existing Company Name'}</label>
                <input type="text" required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-4 rounded-lg shadow-lg shadow-emerald-500/20 transition mt-6 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
          <div className="mt-6 text-center text-slate-400">
            Already have an account? <Link to="/login" className="text-emerald-400 font-medium hover:text-emerald-300">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}