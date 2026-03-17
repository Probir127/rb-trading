import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
    return (
        <div className="container section text-center" style={{ padding: '100px 20px' }}>
            <div className="animate-slide-up">
                <h1 style={{ fontSize: '6rem', color: 'var(--primary-light)', marginBottom: '0' }}>404</h1>
                <h2 style={{ marginBottom: '20px' }}>Page Not Found</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '40px', fontSize: '1.1rem' }}>
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link to="/" className="btn btn-primary">
                    <i className="fa-solid fa-home"></i> Go Back Home
                </Link>
            </div>
        </div>
    );
};

export default NotFoundPage;
