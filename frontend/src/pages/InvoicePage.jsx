import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import AuthContext from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';

const InvoicePage = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await api.get(`orders/${id}/`);
                setOrder(response.data);
            } catch (error) {
                console.error("Failed to fetch order", error);
            } finally {
                setLoading(false);
            }
        };
        if (user) fetchOrder();
        else setLoading(false);
    }, [id, user]);

    if (loading) return <div className="container section text-center">Loading Invoice...</div>;
    if (!user) return (
        <div className="container section text-center" style={{ padding: '80px 0' }}>
            <h2>Please log in to view this invoice</h2>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px' }}>Sign In</Link>
        </div>
    );
    if (!order) return (
        <div className="container section text-center" style={{ padding: '80px 0' }}>
            <h2>Order not found</h2>
            <Link to="/orders" className="btn btn-primary" style={{ marginTop: '20px' }}>Back to Orders</Link>
        </div>
    );

    const printInvoice = () => {
        window.print();
    };

    const paymentMethod = order.payment_intent_id === 'COD' ? 'Cash on Delivery' : order.payment_intent_id ? 'Online' : 'N/A';

    return (
        <div className="container" style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
            <div className="card animate-slide-up" style={{ padding: '40px', backgroundColor: 'white' }}>
                <div className="no-print" style={{ textAlign: 'right', marginBottom: '25px', display: 'flex', justifyContent: 'space-between' }}>
                    <Link to="/orders" style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
                        <i className="fa-solid fa-arrow-left"></i> Back to Orders
                    </Link>
                    <button onClick={printInvoice} className="btn btn-primary btn-sm">
                        <i className="fa-solid fa-print"></i> Print / Download PDF
                    </button>
                </div>

                <div style={{ borderBottom: '2px solid var(--primary-color)', paddingBottom: '25px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', margin: '0 0 10px 0', color: 'var(--primary-color)' }}>INVOICE</h1>
                        <p style={{ margin: '4px 0', fontWeight: 600 }}>RB Trading</p>
                        <p className="text-muted" style={{ margin: '4px 0' }}>Dhaka, Bangladesh</p>
                        <p className="text-muted" style={{ margin: '4px 0' }}>Email: support@rbtrading.com</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <h3 style={{ margin: '0 0 8px 0' }}>Order #{order.id}</h3>
                        <p className="text-muted" style={{ margin: '4px 0' }}>Date: {new Date(order.created_at).toLocaleDateString()}</p>
                        <p style={{ margin: '4px 0' }}>
                            Status: <span className={`badge ${order.status === 'delivered' ? 'badge-success' : 'badge-info'}`}>{(order.status || 'pending').toUpperCase()}</span>
                        </p>
                        <p style={{ margin: '4px 0' }}>
                            Payment: <span className={`badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-info'}`}>{(order.payment_status || 'pending').toUpperCase()}</span>
                            {paymentMethod !== 'N/A' && <span className="text-muted"> ({paymentMethod})</span>}
                        </p>
                    </div>
                </div>

                <div style={{ marginBottom: '30px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>Ship To</h4>
                    <p style={{ whiteSpace: 'pre-wrap', margin: '4px 0' }}>{order.shipping_address}</p>
                    {user?.email && <p className="text-muted" style={{ margin: '4px 0' }}>{user.email}</p>}
                </div>

                <table style={{ width: '100%', marginBottom: '30px', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                            <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '2px solid var(--border-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Item</th>
                            <th style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '2px solid var(--border-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Qty</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '2px solid var(--border-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Price</th>
                            <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '2px solid var(--border-color)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {order.items.map(item => (
                            <tr key={item.id}>
                                <td style={{ padding: '12px 15px', borderBottom: '1px solid var(--border-color)' }}>{item.product?.name || 'Product'}</td>
                                <td style={{ padding: '12px 15px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>{item.quantity}</td>
                                <td style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '1px solid var(--border-color)' }}>{formatCurrency(item.price)}</td>
                                <td style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '1px solid var(--border-color)', fontWeight: 600 }}>{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div style={{ textAlign: 'right', paddingTop: '15px', borderTop: '2px solid var(--primary-color)' }}>
                    <h3 style={{ color: 'var(--primary-color)' }}>Grand Total: {formatCurrency(order.total)}</h3>
                </div>

                <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <p>Thank you for your business!</p>
                    <p>RB Trading — Dhaka, Bangladesh</p>
                </div>
            </div>

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    nav, footer { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default InvoicePage;
