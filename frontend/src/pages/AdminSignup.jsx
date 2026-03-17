import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminSignup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        setLoading(true);
        try {
            await axios.post('/auth/signup', { name, email, password, role: 'ADMIN' });
            toast.success('Admin registered successfully!');
            navigate('/admin/login');
        } catch (err) {
            // FIXED: now shows real backend error
            toast.error(err.response?.data?.message || 'Signup failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full space-y-10 bg-gray-800 p-12 rounded-[3rem] shadow-2xl border border-gray-700"
            >
                <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 text-2xl font-black mx-auto mb-6">A</div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Admin Signup</h2>
                    <p className="text-gray-500 mt-2">Become a coordinator for talent discovery.</p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <input type="text" placeholder="Coordinator Name" value={name}
                        className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-white transition-all font-medium"
                        onChange={(e) => setName(e.target.value)} required />
                    <input type="email" placeholder="Work Email" value={email}
                        className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-white transition-all font-medium"
                        onChange={(e) => setEmail(e.target.value)} required />
                    <div className="space-y-1">
                        <input type="password" placeholder="Secure Password (min 6 chars)" value={password}
                            className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl focus:ring-4 focus:ring-blue-500/20 text-white transition-all font-medium"
                            onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                        {password.length > 0 && password.length < 6 && (
                            <p className="text-red-400 text-xs font-bold px-1">
                                {6 - password.length} more characters needed
                            </p>
                        )}
                    </div>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        type="submit" disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-900/40 transition-all">
                        {loading ? 'Creating Account...' : 'Create Admin Account'}
                    </motion.button>
                </form>
                <p className="text-center text-gray-500 font-medium">
                    Already an Admin? <Link to="/admin/login" className="text-blue-400 font-black hover:underline uppercase tracking-widest text-xs">Admin Login</Link>
                </p>
                <div className="text-center">
                    <Link to="/" className="text-gray-600 hover:text-gray-400 text-xs font-black uppercase tracking-widest">← Back to Portal</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default AdminSignup;