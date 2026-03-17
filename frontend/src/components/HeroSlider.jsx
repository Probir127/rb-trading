import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/currency';

const HeroSlider = ({ products }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    // Auto-advance
    useEffect(() => {
        if (!products || products.length === 0) return;
        const interval = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(interval);
    }, [products, currentIndex]); // depend on currentIndex to reset timer on interaction

    if (!products || products.length === 0) return (
        <div className="hero-slider-container" style={{ height: '500px', background: '#1e293b', marginBottom: '60px', position: 'relative', overflow: 'hidden' }}>
            <div className="skeleton" style={{ width: '100%', height: '100%', opacity: 0.1 }}></div>
        </div>
    );

    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev + 1) % products.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prev) => (prev - 1 + products.length) % products.length);
        setTimeout(() => setIsAnimating(false), 500);
    };

    const currentProduct = products[currentIndex];

    return (
        <div className="hero-slider-container" style={{
            position: 'relative',
            height: '500px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            overflow: 'hidden',
            borderRadius: '0 0 30px 30px',
            marginBottom: '60px',
            boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.5)'
        }}>
            {/* Background Abstract Shapes */}
            <div className="absolute-bg" style={{
                position: 'absolute',
                top: '-50%',
                right: '-10%',
                width: '800px',
                height: '800px',
                background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, rgba(0,0,0,0) 70%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />

            <div className="absolute-bg-2" style={{
                position: 'absolute',
                bottom: '-20%',
                left: '-10%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, rgba(0,0,0,0) 70%)',
                zIndex: 1,
                pointerEvents: 'none'
            }} />

            {/* Slides */}
            <div className="container" style={{ height: '100%', position: 'relative', zIndex: 2 }}>
                {products.map((product, idx) => (
                    <div
                        key={product.id}
                        className="slide"
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            opacity: idx === currentIndex ? 1 : 0,
                            visibility: idx === currentIndex ? 'visible' : 'hidden',
                            transition: 'opacity 0.6s ease-in-out, visibility 0.6s',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0 20px'
                        }}
                    >
                        {/* Text Content */}
                        <div className={`slide-content ${idx === currentIndex ? 'animate-slide-up' : ''}`} style={{ flex: 1, maxWidth: '600px', color: 'white', paddingRight: '40px' }}>
                            <div className="badge badge-accent" style={{ marginBottom: '20px', display: 'inline-block' }}>
                                {product.brand?.name || 'Featured'}
                            </div>

                            <h1 style={{
                                fontSize: '3.5rem',
                                fontWeight: 800,
                                marginBottom: '15px',
                                lineHeight: '1.1',
                                background: 'linear-gradient(to right, #ffffff, #94a3b8)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>
                                {product.name}
                            </h1>

                            <p style={{
                                fontSize: '1.2rem',
                                color: '#cbd5e1',
                                marginBottom: '30px',
                                display: '-webkit-box',
                                WebkitLineClamp: '2',
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                lineHeight: '1.6'
                            }}>
                                {product.description}
                            </p>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <Link
                                    to={`/product/${product.id}`}
                                    className="btn btn-primary"
                                    style={{ padding: '15px 40px', fontSize: '1.1rem' }}
                                >
                                    Shop Now
                                </Link>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {product.has_discount && (
                                        <span style={{ fontSize: '0.9rem', color: '#94a3b8', textDecoration: 'line-through' }}>
                                            {formatCurrency(product.price)}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                                        {formatCurrency(product.discounted_price || product.price)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Image */}
                        <div className={`slide-image ${idx === currentIndex ? 'animate-fade-in' : ''}`} style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            {product.image ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    style={{
                                        maxHeight: '400px',
                                        maxWidth: '100%',
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))',
                                        animation: 'float 6s ease-in-out infinite'
                                    }}
                                />
                            ) : (
                                <div className="glass" style={{ width: '300px', height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '20px', color: 'rgba(255,255,255,0.5)' }}>
                                    No Image
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <button onClick={handlePrev} className="slider-btn prev">❮</button>
            <button onClick={handleNext} className="slider-btn next">❯</button>

            {/* Dots */}
            <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '12px',
                zIndex: 10
            }}>
                {products.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        style={{
                            width: idx === currentIndex ? '30px' : '10px',
                            height: '10px',
                            borderRadius: '10px',
                            background: idx === currentIndex ? 'var(--accent-color)' : 'rgba(255,255,255,0.2)',
                            border: 'none',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease'
                        }}
                    />
                ))}
            </div>

            <style>{`
                .slider-btn {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.1);
                    backdrop-filter: blur(5px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    color: white;
                    font-size: 1.2rem;
                    cursor: pointer;
                    z-index: 10;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .slider-btn:hover { background: var(--accent-color); border-color: var(--accent-color); }
                .slider-btn.prev { left: 20px; }
                .slider-btn.next { right: 20px; }
                
                @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                }

                @media (max-width: 768px) {
                    .hero-slider-container { height: auto; min-height: 600px; padding: 40px 0; }
                    .slide { position: relative; flex-direction: column-reverse; text-align: center; opacity: 1; visibility: visible; display: none; }
                    .slide[style*="opacity: 1"] { display: flex; }
                    .slide-content { padding-right: 0; margin-top: 30px; }
                    .slide-image img { max-height: 250px; }
                    h1 { font-size: 2.2rem !important; }
                    .slider-btn { display: none; } /* Hide arrows on mobile, use dots/swipe */
                }
            `}</style>
        </div>
    );
};

export default HeroSlider;
