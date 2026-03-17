import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CartContext from '../context/CartContext';
import AuthContext from '../context/AuthContext';
import api from '../api';
import { formatCurrency } from '../utils/currency';

const CheckoutPage = () => {
    const { cartItems, getCartTotal, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);

    // Redirect if not logged in
    useEffect(() => {
        if (!user) {
            navigate('/login', { state: { from: location } });
        }
    }, [user, navigate, location]);

    // Address Field State
    const [formData, setFormData] = useState({
        address: '',
        city: '',
        postalCode: '',
        country: 'Bangladesh', // Default to Bangladesh
        paymentMethod: 'cod' // Default to Cash on Delivery
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Create Order Payload - Backend calculates total and items from Cart
            const orderData = {
                shipping_address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
                payment_method: formData.paymentMethod
            };

            const response = await api.post('orders/', orderData);

            // Clear cart logic depends on payment method
            // For COD: Order is created immediately
            if (formData.paymentMethod === 'cod') {
                clearCart();
                setLoading(false);
                navigate('/orders');
            }
            // For SSLCommerz: Redirect to Gateway
            else if (formData.paymentMethod === 'sslcommerz' && response.data.payment_url) {
                // Cart clearing happens on success callback or we keep it until then
                // For better UX, we can clear it now or rely on backend to clear it on success
                // unique solution: let's not clear properly until success, but standard flow often clears it.
                // The backend callback logic I saw tries to clear it.
                window.location.href = response.data.payment_url;
            } else {
                // Fallback
                console.error("Unexpected response for online payment", response.data);
                alert("Payment initiation failed.");
                setLoading(false);
            }

        } catch (error) {
            console.error("Checkout failed:", error);
            setLoading(false);
            alert(error.response?.data?.error || "Checkout failed. Please try again.");
        }
    };

    if (!user) return null; // or a loading spinner while redirecting

    if (cartItems.length === 0) {
        return (
            <div className="container section text-center" style={{ padding: '80px 0' }}>
                <h2>Your cart is empty</h2>
                <button onClick={() => navigate('/')} className="btn btn-primary" style={{ marginTop: '20px' }}>Start Shopping</button>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: '60px 0' }}>
            <h1 style={{ marginBottom: '40px', textAlign: 'center' }}>Secure Checkout</h1>

            <div className="checkout-layout" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '50px', alignItems: 'start' }}>
                {/* Information Form */}
                <div className="animate-slide-up">
                    <div className="card" style={{ padding: '30px' }}>
                        <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ background: 'var(--primary-color)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>1</span>
                            Shipping Details
                        </h3>

                        <form id="checkout-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Street Address</label>
                                <input required name="address" value={formData.address} onChange={handleChange} className="form-control" placeholder="123 Main St" />
                            </div>

                            <div className="grid-cols-2">
                                <div className="form-group">
                                    <label className="form-label">City</label>
                                    <input required name="city" value={formData.city} onChange={handleChange} className="form-control" placeholder="City" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Postal Code</label>
                                    <input required name="postalCode" value={formData.postalCode} onChange={handleChange} className="form-control" placeholder="10001" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Country</label>
                                <input required name="country" value={formData.country} onChange={handleChange} className="form-control" placeholder="Country" />
                            </div>
                        </form>
                    </div>

                    <div className="card" style={{ padding: '30px', marginTop: '30px' }}>
                        <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ background: 'var(--primary-color)', color: 'white', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>2</span>
                            Payment Method
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px' }}>
                            {/* Cash on Delivery */}
                            <label className={`card-hover ${formData.paymentMethod === 'cod' ? 'selected-method' : ''}`} style={{
                                padding: '20px',
                                border: `2px solid ${formData.paymentMethod === 'cod' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                borderRadius: '10px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: formData.paymentMethod === 'cod' ? '#f0fdf4' : 'white'
                            }}>
                                <input type="radio" name="paymentMethod" value="cod" checked={formData.paymentMethod === 'cod'} onChange={handleChange} style={{ display: 'none' }} />
                                <i className="fa-solid fa-money-bill-wave" style={{ fontSize: '1.5rem', marginBottom: '10px', color: formData.paymentMethod === 'cod' ? 'var(--accent-color)' : 'var(--text-muted)' }}></i>
                                <div style={{ fontWeight: 600 }}>Cash on Delivery</div>
                            </label>

                            {/* SSLCommerz / Online Payment */}
                            <label className={`card-hover ${formData.paymentMethod === 'sslcommerz' ? 'selected-method' : ''}`} style={{
                                padding: '20px',
                                border: `2px solid ${formData.paymentMethod === 'sslcommerz' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                borderRadius: '10px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                background: formData.paymentMethod === 'sslcommerz' ? '#f0f9ff' : 'white'
                            }}>
                                <input type="radio" name="paymentMethod" value="sslcommerz" checked={formData.paymentMethod === 'sslcommerz'} onChange={handleChange} style={{ display: 'none' }} />
                                <i className="fa-regular fa-credit-card" style={{ fontSize: '1.5rem', marginBottom: '10px', color: formData.paymentMethod === 'sslcommerz' ? 'var(--accent-color)' : 'var(--text-muted)' }}></i>
                                <div style={{ fontWeight: 600 }}>Online Payment</div>
                                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Cards, Mobile Banking</div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Summary Sidebar */}
                <div className="card shadow-lg" style={{ padding: '30px', position: 'sticky', top: '100px', background: 'var(--surface-color)' }}>
                    <h3 style={{ marginBottom: '20px', fontSize: '1.3rem' }}>Order Summary</h3>

                    <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '20px', paddingRight: '5px' }}>
                        {cartItems.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', fontSize: '0.9rem' }}>
                                <div>
                                    <span style={{ fontWeight: 600 }}>{item.quantity}x</span> {item.name || item.product?.name}
                                </div>
                                <span>{formatCurrency((item.has_discount ? item.discounted_price : item.price) * item.quantity)}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-color)', margin: '15px 0' }}></div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontWeight: 700, fontSize: '1.2rem' }}>
                        <span>Total</span>
                        <span className="text-accent">{formatCurrency(getCartTotal())}</span>
                    </div>

                    <button
                        type="submit"
                        form="checkout-form"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '15px', fontSize: '1.1rem', justifyContent: 'center' }}
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (formData.paymentMethod === 'cod' ? 'Place Order' : 'Pay Now')}
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '15px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        <i className="fa-solid fa-lock"></i> Secure Encrypted Payment
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .checkout-layout { grid-template-columns: 1fr !important; }
                    .checkout-layout > div:first-child { order: 2; }
                    .checkout-layout > div:last-child { order: 1; margin-bottom: 30px; }
                }
            `}</style>
        </div>
    );
};

export default CheckoutPage;
