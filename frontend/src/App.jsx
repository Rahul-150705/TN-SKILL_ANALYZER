import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';

import AdminLogin from './pages/AdminLogin';
import AdminSignup from './pages/AdminSignup';
import StudentLogin from './pages/StudentLogin';
import StudentSignup from './pages/StudentSignup';
import AdminDashboard from './pages/AdminDashboard';
import JobRoleCreate from './pages/JobRoleCreate';
import RoleAnalyticsReport from './pages/RoleAnalyticsReport';
import EnterAdminId from './pages/EnterAdminId';
import StudentDashboard from './pages/StudentDashboard';
import RoleApply from './pages/RoleApply';
import AnalysisResult from './pages/AnalysisResult';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function AppLayout({ children }) {
  const { user } = useContext(AuthContext);
  return (
    <div className="flex min-h-screen bg-gray-900 text-white font-sans">
      {user && <Navbar />}
      <div className={`flex-1 ${user ? 'md:ml-64' : ''} min-h-screen overflow-y-auto overflow-x-hidden`}>
        {children}
      </div>
    </div>
  );
}

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-900 to-gray-900">
      <h1 className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase italic text-center">
        TN SKILL <span className="text-blue-500">ANALYZER</span>
      </h1>
      <p className="text-gray-400 text-xl md:text-2xl mb-16 text-center max-w-3xl font-medium opacity-80 leading-relaxed">
        Next-generation AI workforce development. Bridge the gap between talent and industry requirements with precision.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-5xl">
        <div className="group bg-gray-800/50 p-12 rounded-[3rem] border border-gray-700 hover:border-blue-500/50 transition-all backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-8">
          <div className="w-20 h-20 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 text-4xl font-black group-hover:scale-110 transition-transform">A</div>
          <div className="text-center">
            <h2 className="text-4xl font-black uppercase text-white mb-3">Administrators</h2>
            <p className="text-gray-500 text-lg leading-relaxed">Design skill benchmarks, track student cohorts, and unlock critical workforce insights.</p>
          </div>
          <div className="flex gap-4 w-full pt-4">
            <button onClick={() => navigate('/admin/login')} className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all">Login</button>
            <button onClick={() => navigate('/admin/signup')} className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all">Join</button>
          </div>
        </div>

        <div className="group bg-gray-800/50 p-12 rounded-[3rem] border border-gray-700 hover:border-emerald-500/50 transition-all backdrop-blur-xl shadow-2xl flex flex-col items-center space-y-8">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 text-4xl font-black group-hover:scale-110 transition-transform">S</div>
          <div className="text-center">
            <h2 className="text-4xl font-black uppercase text-white mb-3">Students</h2>
            <p className="text-gray-500 text-lg leading-relaxed">Analyze your resume against precise role metrics and bridge your skill gaps via AI.</p>
          </div>
          <div className="flex gap-4 w-full pt-4">
            <button onClick={() => navigate('/student/login')} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-900/40 transition-all">Login</button>
            <button onClick={() => navigate('/student/signup')} className="flex-1 py-4 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-black uppercase tracking-widest transition-all">Join</button>
          </div>
        </div>
      </div>

      <div className="mt-20 text-gray-600 font-black uppercase tracking-[0.4em] text-xs">
        Powered by TN State Skills Platform
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#111827', color: '#fff', border: '1px solid #374151' }
        }} />
        <Routes>
          <Route path="/" element={<LandingPage />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute role="ADMIN"><AppLayout><AdminDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/roles/create" element={<ProtectedRoute role="ADMIN"><AppLayout><JobRoleCreate /></AppLayout></ProtectedRoute>} />
          <Route path="/admin/analytics/role/:roleId" element={<ProtectedRoute role="ADMIN"><AppLayout><RoleAnalyticsReport /></AppLayout></ProtectedRoute>} />

          {/* Student Routes */}
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/signup" element={<StudentSignup />} />
          <Route path="/student/enter-admin-id" element={<ProtectedRoute role="STUDENT"><EnterAdminId /></ProtectedRoute>} />
          <Route path="/student/dashboard/:adminCode" element={<ProtectedRoute role="STUDENT"><AppLayout><StudentDashboard /></AppLayout></ProtectedRoute>} />
          <Route path="/student/analyze/:roleId" element={<ProtectedRoute role="STUDENT"><AppLayout><RoleApply /></AppLayout></ProtectedRoute>} />
          <Route path="/student/analysis-result/:id" element={<ProtectedRoute role="STUDENT"><AppLayout><AnalysisResult /></AppLayout></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
