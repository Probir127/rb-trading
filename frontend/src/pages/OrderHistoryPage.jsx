import React, { useState, useEffect, useContext } from 'react';
import api from '../api';
import { formatCurrency } from '../utils/currency';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const OrderHistoryPage = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await api.get('orders/');
                setOrders(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders:", error);
                setLoading(false);
            }
        };

        if (user) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [user, setOrders, setLoading]);

    if (loading) return (
        <div className="container" style={{ padding: '60px 0' }}>
            <div className="skeleton" style={{ height: '50px', width: '300px', marginBottom: '40px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {[1, 2, 3].map(n => (
                    <div key={n} className="card" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                            <div className="skeleton" style={{ height: '24px', width: '150px' }}></div>
                            <div className="skeleton" style={{ height: '24px', width: '100px' }}></div>
                        </div>
                        <div className="skeleton" style={{ height: '100px', width: '100%' }}></div>
                    </div>
                ))}
            </div>
        </div>
    );

    if (!user) return (
        <div className="container section text-center animate-slide-up" style={{ padding: '80px 0' }}>
            <h2>Please log in to view your orders</h2>
            <Link to="/login" className="btn btn-primary" style={{ marginTop: '20px' }}>Sign In</Link>
        </div>
    );

    if (orders.length === 0) return (
        <div className="container section text-center animate-slide-up" style={{ padding: '80px 0' }}>
            <h2>No orders yet</h2>
            <Link to="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Start Shopping</Link>
        </div>
    );

    return (
        <div className="container" style={{ padding: '60px 0' }}>
            <h1 style={{ marginBottom: '40px' }}>Order History</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {orders.map((order, idx) => (
                    <div key={order.id} className="card animate-slide-up" style={{ padding: '30px', animationDelay: `${idx * 0.1}s` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h4 style={{ margin: 0, fontSize: '1.1rem' }}>Order #{order.id}</h4>
                                <div className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    Placed on {new Date(order.created_at).toLocaleDateString()}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <div className={`badge ${order.status === 'delivered' ? 'badge-success' : 'badge-info'}`}>
                                    {order.status || 'Processing'}
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--primary-color)' }}>
                                    {formatCurrency(order.total)}
                                </span>
                            </div>
                        </div>

                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
                                {order.items.map(item => (
                                    <div key={item.id} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <img
                                            src={item.product?.image || "https://placehold.co/60"}
                                            alt={item.product?.name || 'Product'}
                                            style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{item.product?.name || 'Product'}</div>
                                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                Qty: {item.quantity} × {formatCurrency(item.price)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                            <Link to={`/invoice/${order.id}`} className="btn btn-sm btn-outline">View Invoice</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default OrderHistoryPage;
