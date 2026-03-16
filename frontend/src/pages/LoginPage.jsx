import { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      toast.success('Login successful!');
      login(data);
    } catch (err) {
      toast.error('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-900">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-emerald-900/40 to-slate-900 items-center justify-center p-12">
        <div className="max-w-lg">
          <h1 className="text-5xl font-bold text-white mb-6">Powering the EV Transition.</h1>
          <p className="text-xl text-emerald-400/80">AI-driven workforce analytics to close the skill gap in automotive manufacturing.</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-slate-900">
        <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">Welcome Back</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 px-4 rounded-lg shadow-lg shadow-emerald-500/20 transition disabled:opacity-50">
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center text-slate-400">
            Don't have an account? <Link to="/signup" className="text-emerald-400 font-medium hover:text-emerald-300">Sign Up</Link>
          </div>
        </div>
      </div>
    </div>
  );
}