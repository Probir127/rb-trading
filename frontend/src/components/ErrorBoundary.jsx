import React, { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '50px',
                    textAlign: 'center',
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f8fafc',
                    color: '#334155'
                }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#ef4444' }}>Something went wrong</h1>
                    <p style={{ fontSize: '1.1rem', marginBottom: '30px', maxWidth: '600px' }}>
                        We're sorry, but an unexpected error has occurred. Please try refreshing the page.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn btn-primary"
                        style={{ padding: '12px 30px', cursor: 'pointer' }}
                    >
                        Refresh Page
                    </button>
                    {import.meta.env.DEV && this.state.error && (
                        <div style={{ marginTop: '40px', textAlign: 'left', background: '#333', color: '#fff', padding: '20px', borderRadius: '8px', maxWidth: '800px', overflow: 'auto' }}>
                            <code style={{ fontFamily: 'monospace' }}>
                                {this.state.error.toString()}
                                <br />
                                {this.state.errorInfo.componentStack}
                            </code>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
