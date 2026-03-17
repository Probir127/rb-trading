import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyEmailPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resendDisabled, setResendDisabled] = useState(false);
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        // Get email from navigation state or localStorage
        const stateEmail = location.state?.email;
        if (stateEmail) {
            setEmail(stateEmail);
            // Automatically send verification code
            sendCode(stateEmail);
        }
    }, [location.state]);

    useEffect(() => {
        // Countdown timer for resend button
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setResendDisabled(false);
        }
    }, [countdown]);

    const sendCode = useCallback(async (emailToSend) => {
        try {
            setLoading(true);
            setError('');
            const response = await api.post('auth/send-verification/', {
                email: emailToSend || email
            });
            setMessage(response.data.message);
            // If in dev mode, show the code
            if (response.data.dev_code) {
                setMessage(`${response.data.message} (DEV CODE: ${response.data.dev_code})`);
            }
            setResendDisabled(true);
            setCountdown(60);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send verification code');
        } finally {
            setLoading(false);
        }
    }, [email]);

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await api.post('auth/verify-email/', { email, code });
            setMessage(response.data.message);

            // Redirect to login after a short delay
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container" style={{ maxWidth: '500px', marginTop: '50px', marginBottom: '80px' }}>
            <div className="card" style={{ padding: '30px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>Verify Your Email</h2>
                <p style={{ textAlign: 'center', color: '#666', marginBottom: '30px' }}>
                    We've sent a 6-digit verification code to your email.
                </p>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-error">{error}</div>}

                <form onSubmit={handleVerify}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={!!location.state?.email}
                        />
                    </div>
                    <div className="form-group">
                        <label>Verification Code</label>
                        <input
                            type="text"
                            className="form-control"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter 6-digit code"
                            maxLength={6}
                            required
                            style={{ fontSize: '24px', letterSpacing: '8px', textAlign: 'center' }}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || code.length !== 6}
                        style={{ width: '100%', marginTop: '20px' }}
                    >
                        {loading ? 'Verifying...' : 'Verify Email'}
                    </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button
                        type="button"
                        onClick={() => sendCode()}
                        disabled={resendDisabled || loading}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: resendDisabled ? '#999' : 'var(--accent-color)',
                            cursor: resendDisabled ? 'default' : 'pointer',
                            textDecoration: resendDisabled ? 'none' : 'underline'
                        }}
                    >
                        {resendDisabled
                            ? `Resend code in ${countdown}s`
                            : "Didn't receive the code? Resend"
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
