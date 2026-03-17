import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';

const PaymentSuccessPage = () => {
    const [searchParams] = useSearchParams();
    const orderId = searchParams.get('order_id');

    return (
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
            <div className="animate-slide-up">
                <div style={{
                    background: '#ecfdf5',
                    color: '#047857',
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    margin: '0 auto 20px'
                }}>
                    <i className="fa-solid fa-check"></i>
                </div>
                <h1 style={{ color: '#047857', marginBottom: '15px' }}>Payment Successful!</h1>
                <p style={{ fontSize: '18px', color: 'var(--text-color)', marginBottom: '30px' }}>
                    Thank you for your purchase. Your order <strong>#{orderId}</strong> has been confirmed.
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                    <Link to="/" className="btn btn-outline">Continue Shopping</Link>
                    {orderId && (
                        <Link to={`/invoice/${orderId}`} className="btn btn-primary">
                            View Invoice <i className="fa-solid fa-arrow-right" style={{ marginLeft: '8px' }}></i>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccessPage;
