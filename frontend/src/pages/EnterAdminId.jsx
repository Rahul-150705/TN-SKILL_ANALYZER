import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const EnterAdminId = () => {
    const [adminCode, setAdminCode] = useState('');
    const [validating, setValidating] = useState(false);
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!adminCode.trim()) return;

        setValidating(true);
        try {
            const response = await axios.get(`/roles/student/${adminCode}`);
            if (response.data) {
                toast.success('Admin Verified!');
                navigate(`/student/dashboard/${adminCode}`);
            }
        } catch {
            toast.error('Invalid Admin ID. Please check and try again.');
        } finally {
            setValidating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/10 via-gray-900 to-gray-900">
            <div className="max-w-md w-full bg-gray-800 p-12 rounded-[3rem] border border-gray-700 shadow-2xl space-y-10">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-3xl flex items-center justify-center text-emerald-500 text-4xl font-black mx-auto">ID</div>
                    <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Enter Admin ID</h1>
                    <p className="text-gray-500 text-lg">Input the unique code provided by your administrator to access roles.</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <input
                        type="text"
                        className="w-full bg-gray-900 border border-gray-700 p-6 rounded-2xl focus:ring-4 focus:ring-emerald-500/20 text-center text-2xl font-mono font-bold tracking-widest uppercase transition-all"
                        placeholder="ADMIN-XXXX"
                        value={adminCode}
                        onChange={(e) => setAdminCode(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={validating}
                        className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-700 text-white text-xl font-bold rounded-2xl transition-all shadow-xl shadow-emerald-900/40 uppercase tracking-widest"
                    >
                        {validating ? 'Verifying...' : 'Access Roles'}
                    </button>
                </form>

                <p className="text-center text-gray-600 text-sm font-bold uppercase tracking-widest">
                    TN State Skills Platform
                </p>
            </div>
        </div>
    );
};

export default EnterAdminId;
