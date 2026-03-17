import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

const ProductCard = ({ product }) => {
    if (!product) return null;

    return (
        <div className="card card-hover group" style={{ position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Discount Badge */}
            {product.has_discount && (
                <div className="badge badge-error" style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    zIndex: 10,
                    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.3)',
                    animation: 'pulse 2s infinite'
                }}>
                    -{Math.round(product.discount_percentage)}% OFF
                </div>
            )}

            {/* Image Container */}
            <Link to={`/product/${product.id}`} style={{
                position: 'relative',
                paddingTop: '100%',
                overflow: 'hidden',
                background: '#f1f5f9'
            }}>
                <img
                    src={product.image || "https://placehold.co/400?text=No+Image"}
                    alt={product.name}
                    loading="lazy"
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease'
                    }}
                    className="product-img"
                />

                {/* Overlay on hover */}
                <div className="overlay" style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(15, 23, 42, 0.1)',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <span className="btn btn-sm btn-primary" style={{ transform: 'translateY(10px)', transition: 'transform 0.3s ease' }}>
                        View Details
                    </span>
                </div>
            </Link>

            {/* Details */}
            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-light)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {product.brand?.name || 'Generic'}
                </div>

                <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    marginBottom: '10px',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: '2',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    height: '3em'
                }}>
                    <Link to={`/product/${product.id}`} style={{ color: 'var(--text-main)' }}>
                        {product.name}
                    </Link>
                </h3>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {product.has_discount ? (
                            <>
                                <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                                    {formatCurrency(product.discounted_price)}
                                </span>
                                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                                    {formatCurrency(product.price)}
                                </span>
                            </>
                        ) : (
                            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)' }}>
                                {formatCurrency(product.price)}
                            </span>
                        )}
                    </div>

                    <Link to={`/product/${product.id}`} className="btn-icon" style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--background-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary-color)',
                        transition: 'all 0.2s ease',
                        border: '1px solid var(--border-color)'
                    }}>
                        <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                </div>
            </div>

            <style>{`
                .card:hover .product-img { transform: scale(1.05); }
                .card:hover .overlay { opacity: 1; }
                .card:hover .overlay span { transform: translateY(0); }
                .btn-icon:hover { background: var(--primary-color); color: white; border-color: var(--primary-color); }
            `}</style>
        </div>
    );
};

export default ProductCard;
