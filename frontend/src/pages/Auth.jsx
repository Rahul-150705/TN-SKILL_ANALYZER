import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, Building2, ArrowRight } from 'lucide-react';
import '../index.css';

export default function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'EMPLOYEE',
        companyName: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Connect to backend API
        console.log("Submit form", formData);

        // Mock user login directing to correct dashboard
        if (formData.role === 'HR') {
            navigate('/hr');
        } else {
            navigate('/employee');
        }
    };

    return (
        <div className="auth-container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

            {/* Background glowing effects */}
            <div style={{ position: 'absolute', top: '10%', left: '20%', width: '300px', height: '300px', background: 'var(--primary-color)', filter: 'blur(150px)', opacity: '0.15', zIndex: -1, borderRadius: '50%' }}></div>
            <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: '400px', height: '400px', background: '#0055ff', filter: 'blur(150px)', opacity: '0.15', zIndex: -1, borderRadius: '50%' }}></div>

            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '2.5rem', position: 'relative', overflow: 'hidden' }}>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 className="glowing-text" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {isLogin ? 'Welcome Back' : 'Join the Future'}
                    </h2>
                    <p style={{ color: 'var(--text-muted)' }}>
                        {isLogin ? 'Enter your credentials to access your dashboard' : 'Create an account to analyze EV workforce skills'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                    {!isLogin && (
                        <div className="input-group" style={{ position: 'relative' }}>
                            <User style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                            <input type="text" name="name" placeholder="Full Name" value={formData.name} onChange={handleChange} required style={{ paddingLeft: '3rem' }} />
                        </div>
                    )}

                    <div className="input-group" style={{ position: 'relative' }}>
                        <Mail style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required style={{ paddingLeft: '3rem' }} />
                    </div>

                    <div className="input-group" style={{ position: 'relative' }}>
                        <Lock style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required style={{ paddingLeft: '3rem' }} />
                    </div>

                    <div className="input-group" style={{ position: 'relative' }}>
                        <Briefcase style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                        <select name="role" value={formData.role} onChange={handleChange} style={{ paddingLeft: '3rem', appearance: 'none' }}>
                            <option value="EMPLOYEE">Login as Employee</option>
                            <option value="HR">Login as HR / Admin</option>
                        </select>
                    </div>

                    {!isLogin && (
                        <div className="input-group" style={{ position: 'relative' }}>
                            <Building2 style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
                            <input type="text" name="companyName" placeholder="Company Name" value={formData.companyName} onChange={handleChange} required style={{ paddingLeft: '3rem' }} />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <ArrowRight size={20} />
                    </button>
                </form>

                <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)' }}>
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontWeight: '500', fontSize: '1rem' }}
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
