import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useContext } from 'react';

import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import HRDashboard from './pages/HRDashboard';
import JobRoleCreate from './pages/JobRoleCreate';
import EmployeeDashboard from './pages/EmployeeDashboard';
import AnalysisResult from './pages/AnalysisResult';
import WorkforceAnalytics from './pages/WorkforceAnalytics';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function AppLayout({ children }) {
  const { user } = useContext(AuthContext);
  return (
    <div className="flex min-h-screen bg-slate-900 text-white font-sans">
      {user && <Navbar />}
      <div className={`flex-1 ${user ? 'ml-64' : ''} h-screen overflow-y-auto overflow-x-hidden`}>
        {children}
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppLayout>
          <Toaster position="top-right" toastOptions={{
            style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' }
          }} />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route path="/hr" element={<ProtectedRoute role="HR"><HRDashboard /></ProtectedRoute>} />
            <Route path="/hr/roles/create" element={<ProtectedRoute role="HR"><JobRoleCreate /></ProtectedRoute>} />
            <Route path="/hr/analytics" element={<ProtectedRoute role="HR"><WorkforceAnalytics /></ProtectedRoute>} />

            <Route path="/employee" element={<ProtectedRoute role="EMPLOYEE"><EmployeeDashboard /></ProtectedRoute>} />
            <Route path="/employee/results/:id" element={<ProtectedRoute role="EMPLOYEE"><AnalysisResult /></ProtectedRoute>} />
          </Routes>
        </AppLayout>
      </AuthProvider>
    </Router>
  );
}

export default App;
