import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
    const { loginUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await loginUser(email, password);

        if (result?.success) {
            // Redirect to intended page or home
            const from = location.state?.from?.pathname || '/';
            navigate(from);
        } else {
            const errorMsg = result?.error || 'Invalid credentials. Please try again.';
            // Detect inactive account
            if (typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('no active account')) {
                navigate('/verify-email', { state: { email } });
            } else {
                setError(errorMsg);
            }
        }
        setLoading(false);
    };

    return (
        <div style={{
            minHeight: '80vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Contextual Background Shapes */}
            <div style={{ position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', filter: 'blur(50px)' }}></div>
            <div style={{ position: 'absolute', bottom: '10%', left: '10%', width: '400px', height: '400px', background: 'rgba(15, 23, 42, 0.05)', borderRadius: '50%', filter: 'blur(50px)' }}></div>

            <div className="card glass animate-slide-up" style={{ width: '100%', maxWidth: '450px', padding: '40px', position: 'relative', zIndex: 2 }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Welcome Back</h2>
                    <p className="text-muted">Enter your credentials to access your account.</p>
                </div>

                {error && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 16px',
                        marginBottom: '20px',
                        color: 'var(--error)',
                        fontSize: '0.9rem'
                    }}>
                        <i className="fa-solid fa-circle-exclamation"></i> {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-regular fa-envelope" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            <input
                                type="email"
                                className="form-control"
                                style={{ paddingLeft: '45px' }}
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div style={{ position: 'relative' }}>
                            <i className="fa-solid fa-lock" style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            <input
                                type="password"
                                className="form-control"
                                style={{ paddingLeft: '45px' }}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div style={{ textAlign: 'right', marginTop: '10px' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.9rem', color: 'var(--accent-color)' }}>Forgot Password?</Link>
                        </div>
                    </div>

                    <button className="btn btn-primary" disabled={loading} style={{ width: '100%', padding: '12px', fontSize: '1.1rem', marginTop: '10px' }}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.95rem', color: 'var(--text-secondary)' }}>
                    Don't have an account? <Link to="/register" style={{ fontWeight: 600, color: 'var(--primary-color)' }}>Sign Up</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
