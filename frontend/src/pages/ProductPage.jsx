import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import CartContext from '../context/CartContext';
import { formatCurrency } from '../utils/currency';

const ProductPage = () => {
    const { id } = useParams();
    const { addToCart } = useContext(CartContext);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const response = await api.get(`products/${id}/`);
                setProduct(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching product:", error);
                setLoading(false);
            }
        };

        fetchProduct();
        window.scrollTo(0, 0);
    }, [id]);

    const handleQuantityChange = (val) => {
        if (val < 1) return;
        if (product && val > product.stock) return;
        setQuantity(val);
    };

    const handleAddToCart = () => {
        addToCart(product, quantity);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    if (loading) return (
        <div className="container" style={{ padding: '80px 0', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px' }}>
            <div className="skeleton" style={{ height: '500px' }}></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="skeleton" style={{ height: '40px', width: '70%' }}></div>
                <div className="skeleton" style={{ height: '20px', width: '40%' }}></div>
                <div className="skeleton" style={{ height: '100px' }}></div>
                <div className="skeleton" style={{ height: '60px', width: '50%' }}></div>
            </div>
        </div>
    );

    if (!product) return <div className="container section text-center"><h3>Product not found</h3></div>;

    return (
        <div className="container" style={{ padding: '60px 0 100px' }}>
            {/* Breadcrumb */}
            <div style={{ marginBottom: '30px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <Link to="/" className="hover:text-accent">Home</Link> /
                <Link to={`/category?category=${product.category?.slug}`} className="hover:text-accent" style={{ margin: '0 5px' }}>{product.category?.name}</Link> /
                <span style={{ marginLeft: '5px', color: 'var(--text-main)', fontWeight: 600 }}>{product.name}</span>
            </div>

            <div className="product-layout" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '60px', alignItems: 'start' }}>
                {/* Image Section */}
                <div className="card" style={{ padding: '0', border: 'none', background: 'transparent', boxShadow: 'none' }}>
                    <div className="glass" style={{
                        borderRadius: '20px',
                        overflow: 'hidden',
                        padding: '40px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '500px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <img
                            src={product.image || "https://placehold.co/600?text=No+Image"}
                            alt={product.name}
                            style={{
                                maxHeight: '450px',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.2))'
                            }}
                            className="zoom-hover"
                        />
                    </div>
                </div>

                {/* Info Section */}
                <div className="animate-slide-up" style={{ position: 'sticky', top: '100px' }}>

                    <div className="badge badge-accent" style={{ marginBottom: '15px' }}>
                        {product.brand?.name}
                    </div>

                    <h1 style={{ fontSize: '2.5rem', marginBottom: '15px', lineHeight: '1.1' }}>{product.name}</h1>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-color)' }}>
                                {formatCurrency(product.has_discount ? product.discounted_price : product.price)}
                            </span>
                            {product.has_discount && (
                                <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                    {formatCurrency(product.price)}
                                </span>
                            )}
                        </div>
                        {product.has_discount && (
                            <span className="badge badge-error">Save {Math.round(product.discount_percentage)}%</span>
                        )}
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ fontSize: '1rem', marginBottom: '10px' }}>Description</h4>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', fontSize: '1.05rem' }}>
                            {product.description}
                        </p>
                    </div>

                    {product.in_stock ? (
                        <div className="actions-card cardglass" style={{
                            padding: '30px',
                            background: 'white',
                            border: '1px solid var(--border-color)',
                            borderRadius: '20px',
                            boxShadow: 'var(--shadow-lg)'
                        }}>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <span className={`badge ${product.in_stock ? 'badge-success' : 'badge-error'}`}>
                                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                                </span>
                                <span className="text-muted" style={{ fontSize: '0.9rem' }}>Fast Delivery Available</span>
                            </div>

                            <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '2px solid var(--border-color)',
                                    borderRadius: '50px',
                                    padding: '5px'
                                }}>
                                    <button
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'var(--background-color)', cursor: 'pointer', fontSize: '1.2rem' }}
                                    >-</button>
                                    <input
                                        type="text"
                                        value={quantity}
                                        readOnly
                                        style={{ width: '50px', textAlign: 'center', border: 'none', fontWeight: 600, fontSize: '1.1rem', outline: 'none' }}
                                    />
                                    <button
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'var(--background-color)', cursor: 'pointer', fontSize: '1.2rem' }}
                                    >+</button>
                                </div>

                                <button
                                    onClick={handleAddToCart}
                                    className="btn btn-primary"
                                    style={{ flex: 1, padding: '15px 30px', fontSize: '1.1rem' }}
                                >
                                    {added ? <><i className="fa-solid fa-check"></i> Added</> : 'Add to Cart'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="alert alert-error">
                            <i className="fa-solid fa-circle-exclamation"></i>
                            This item is currently out of stock.
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .zoom-hover:hover { transform: scale(1.1); transition: transform 0.5s ease; }
                @media (max-width: 900px) {
                    .product-layout { grid-template-columns: 1fr !important; gap: 40px !important; }
                    .glass { min-height: 300px !important; }
                }
            `}</style>
        </div>
    );
};

export default ProductPage;
