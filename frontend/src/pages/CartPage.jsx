import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartContext from '../context/CartContext';
import { formatCurrency } from '../utils/currency';

const CartPage = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useContext(CartContext);
    const navigate = useNavigate();

    // Check if cartItems is available and an array
    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="container sections animate-slide-up" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '5rem', color: 'var(--border-color)', marginBottom: '30px' }}>
                    <i className="fa-solid fa-cart-shopping"></i>
                </div>
                <h2 style={{ marginBottom: '20px' }}>Your cart is empty</h2>
                <p className="text-muted" style={{ marginBottom: '40px' }}>Looks like you haven't added anything to your cart yet.</p>
                <Link to="/" className="btn btn-primary" style={{ padding: '15px 40px' }}>Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '60px 0' }}>
            <h1 style={{ marginBottom: '40px' }}>Shopping Cart ({cartItems.length})</h1>

            <div className="cart-layout" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '50px', alignItems: 'start' }}>
                {/* Cart Items */}
                <div className="cart-items animate-fade-in">
                    {cartItems.map(item => (
                        <div key={item.id} className="card" style={{
                            display: 'flex',
                            gap: '20px',
                            padding: '20px',
                            marginBottom: '20px',
                            alignItems: 'center'
                        }}>
                            <img
                                src={item.image || "https://placehold.co/100"}
                                alt={item.name}
                                style={{ width: '100px', height: '100px', objectFit: 'contain', borderRadius: '10px', background: '#f8fafc' }}
                            />

                            <div style={{ flex: 1 }}>
                                <Link to={`/product/${item.id}`} style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                    {item.name}
                                </Link>
                                <div className="text-muted" style={{ fontSize: '0.9rem', marginTop: '5px' }}>
                                    {item.brand?.name}
                                </div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-color)', marginTop: '10px' }}>
                                    {formatCurrency(item.has_discount ? item.discounted_price : item.price)}
                                </div>
                                {item.stock < item.quantity && (
                                    <div className="badge badge-error" style={{ marginTop: '10px', display: 'inline-block' }}>
                                        <i className="fa-solid fa-triangle-exclamation"></i> Only {item.stock} left!
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--background-color)', borderRadius: '50px', padding: '5px' }}>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: 'white', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                                    >-</button>
                                    <span style={{ fontWeight: 600, width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        style={{ width: '30px', height: '30px', borderRadius: '50%', border: 'none', background: 'white', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
                                    >+</button>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="text-muted"
                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="card shadow-lg" style={{ padding: '30px', position: 'sticky', top: '100px', background: 'var(--surface-color)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>Order Summary</h3>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-secondary)' }}>
                        <span>Subtotal</span>
                        <span>{formatCurrency(getCartTotal())}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-secondary)' }}>
                        <span>Shipping</span>
                        <span>Calculated at checkout</span>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '20px 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontWeight: 700, fontSize: '1.2rem' }}>
                        <span>Total</span>
                        <span className="text-accent">{formatCurrency(getCartTotal())}</span>
                    </div>

                    <button
                        onClick={() => navigate('/checkout')}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '15px', fontSize: '1.1rem', justifyContent: 'center' }}
                    >
                        Proceed to Checkout
                    </button>

                    <Link to="/" style={{ display: 'block', textAlign: 'center', marginTop: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        <i className="fa-solid fa-arrow-left"></i> Continue Shopping
                    </Link>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .cart-layout { grid-template-columns: 1fr !important; }
                    .cart-items .card { flex-direction: column; text-align: center; }
                    .cart-items .card > div { width: 100%; align-items: center !important; }
                }
            `}</style>
        </div>
    );
};

export default CartPage;
