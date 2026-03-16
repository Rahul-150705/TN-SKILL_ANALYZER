import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Home, Briefcase, PlusCircle, PieChart } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-700 h-screen flex flex-col p-4 fixed left-0 top-0">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
          <span className="text-white font-bold text-sm">EV</span>
        </div>
        <h1 className="text-white font-bold text-lg">Skill Gap Analyzer</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {user.role === 'HR' ? (
          <>
            <Link to="/hr" className="flex items-center gap-3 text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition">
              <Home size={18} /> Dashboard
            </Link>
            <Link to="/hr/roles/create" className="flex items-center gap-3 text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition">
              <PlusCircle size={18} /> Create Role
            </Link>
            <Link to="/hr/analytics" className="flex items-center gap-3 text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition">
              <PieChart size={18} /> Analytics
            </Link>
          </>
        ) : (
          <>
            <Link to="/employee" className="flex items-center gap-3 text-slate-300 hover:text-white p-2 rounded hover:bg-slate-800 transition">
              <Home size={18} /> Dashboard
            </Link>
          </>
        )}
      </nav>

      <div className="mt-auto border-t border-slate-700 pt-4">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-xs uppercase">{user.name.substring(0,2)}</span>
          </div>
          <div className="text-sm">
            <p className="text-white font-medium">{user.name}</p>
            <p className="text-slate-400 text-xs">{user.companyName}</p>
          </div>
        </div>
        <button onClick={logout} className="flex items-center gap-3 text-red-400 hover:text-red-300 w-full p-2 hover:bg-slate-800 rounded transition">
          <LogOut size={18} /> Logout
        </button>
      </div>
    </div>
  );
}