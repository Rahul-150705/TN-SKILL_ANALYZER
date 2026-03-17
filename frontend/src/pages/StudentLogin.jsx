import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const StudentLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/auth/login', { email, password });
            login(data);
            toast.success('Ready to analyze, Student!');
            navigate('/student/enter-admin-id');
        } catch (_err) {
            toast.error('Login failed. Check credentials.');
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
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 text-2xl font-black mx-auto mb-6">S</div>
                    <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Student Login</h2>
                    <p className="text-gray-500 mt-2">Access your personalized skill analysis.</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl focus:ring-4 focus:ring-emerald-500/20 text-white transition-all font-medium"
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full bg-gray-900 border border-gray-700 p-4 rounded-xl focus:ring-4 focus:ring-emerald-500/20 text-white transition-all font-medium"
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-900/40 transition-all"
                    >
                        Login to Dashboard
                    </motion.button>
                </form>
                <p className="text-center text-gray-500 font-medium">
                    New here? <Link to="/student/signup" className="text-emerald-400 font-black hover:underline uppercase tracking-widest text-xs">Join Student Pool</Link>
                </p>
                <div className="text-center">
                    <Link to="/" className="text-gray-600 hover:text-gray-400 text-xs font-black uppercase tracking-widest">← Back to Portal</Link>
                </div>
            </motion.div>
        </div>
    );
};

export default StudentLogin;
