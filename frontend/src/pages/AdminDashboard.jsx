import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const AdminDashboard = () => {
    const { user } = useContext(AuthContext);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRoles = useCallback(async () => {
        try {
            const response = await axios.get('/roles/admin/me');
            setRoles(response.data);
        } catch {
            toast.error('Failed to fetch roles');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRoles();
    }, [fetchRoles]);

    const deleteRole = async (id) => {
        if (!window.confirm('Are you sure you want to delete this role?')) return;
        try {
            await axios.delete(`/roles/${id}`);
            toast.success('Role deleted');
            setRoles(roles.filter(r => r.id !== id));
        } catch {
            toast.error('Failed to delete role');
        }
    };

    const copyAdminCode = () => {
        navigator.clipboard.writeText(user?.adminCode || '');
        toast.success('Admin code copied!');
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-gray-900 text-white p-8"
        >
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-extrabold text-blue-400">Admin Command Center</h1>
                        <p className="text-gray-400 mt-2 text-lg">Manage your roles and view student analytics.</p>
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-800 p-4 rounded-xl border border-gray-700 flex items-center gap-4 shadow-xl"
                    >
                        <div>
                            <p className="text-xs uppercase text-gray-500 font-bold tracking-wider">Your Admin ID</p>
                            <p className="text-2xl font-mono text-white font-bold tracking-widest">{user?.adminCode}</p>
                        </div>
                        <button
                            onClick={copyAdminCode}
                            className="p-3 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all underline decoration-dotted"
                        >
                            Copy ID
                        </button>
                    </motion.div>
                </header>

                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2 uppercase tracking-tighter">
                            Active Job Roles
                        </h2>
                        <Link
                            to="/admin/roles/create"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all"
                        >
                            + Create New Role
                        </Link>
                    </div>

                    {loading ? (
                        <div className="text-center py-20 bg-gray-800 rounded-2xl border border-dashed border-gray-700">
                            <p className="text-gray-500 text-xl font-medium">Loading your roles...</p>
                        </div>
                    ) : roles.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {roles.map((role, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={role.id}
                                    className="bg-gray-800 p-6 rounded-2xl border border-gray-700 hover:border-blue-500/50 transition-all group shadow-lg"
                                >
                                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors uppercase">{role.title}</h3>
                                    <p className="text-gray-400 text-sm line-clamp-3 mb-6 h-15">{role.description}</p>

                                    <div className="flex gap-3">
                                        <Link
                                            to={`/admin/analytics/role/${role.id}`}
                                            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-center font-bold text-sm transition-colors text-blue-400 border border-gray-600 uppercase"
                                        >
                                            Analytics
                                        </Link>
                                        <button
                                            onClick={() => deleteRole(role.id)}
                                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-red-500/20"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-800 rounded-2xl border border-dashed border-gray-700">
                            <p className="text-gray-400 text-lg mb-4">No job roles created yet.</p>
                            <Link to="/admin/roles/create" className="text-blue-400 hover:underline">Create your first role now →</Link>
                        </div>
                    )}
                </section>
            </div>
        </motion.div>
    );
};

export default AdminDashboard;
