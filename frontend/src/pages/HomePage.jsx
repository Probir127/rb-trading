import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';

const HomePage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prodRes, catRes] = await Promise.all([
                    api.get('products/'),
                    api.get('categories/')
                ]);
                setProducts(prodRes.data);
                setCategories(catRes.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const featuredProducts = products.filter(p => p.featured).slice(0, 5);
    const specialOffers = products.filter(p => p.has_discount);
    const newArrivals = products.slice(0, 8); // Assuming backend returns newest first or mix

    // Slider uses featured or fallback
    const sliderProducts = featuredProducts.length > 0 ? featuredProducts : products.slice(0, 3);

    return (
        <>
            <HeroSlider products={sliderProducts} />

            {/* Category Quick Links */}
            <div className="container" style={{ marginBottom: '80px', overflowX: 'auto', paddingBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '20px', minWidth: 'max-content', padding: '0 5px' }}>
                    {categories.map(cat => (
                        <Link
                            key={cat.id}
                            to={`/category?category=${cat.slug}`}
                            className="glass"
                            style={{
                                padding: '15px 30px',
                                borderRadius: '50px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                fontWeight: 600,
                                color: 'var(--text-main)',
                                transition: 'all 0.3s ease',
                                border: '1px solid var(--border-color)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'var(--primary-color)';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateY(-5px)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'var(--glass-bg)';
                                e.currentTarget.style.color = 'var(--text-main)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}
                        >
                            <span>{cat.name}</span>
                            <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="container" style={{ paddingBottom: '100px' }}>
                {/* Special Offers Section */}
                {specialOffers.length > 0 && (
                    <div className="section animate-slide-up">
                        <div className="section-header">
                            <span className="text-accent" style={{ fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Don't Miss Out</span>
                            <h2 style={{ fontSize: '2.5rem', marginTop: '10px' }}>Special Offers</h2>
                            <p className="text-muted" style={{ fontSize: '1.1rem' }}>
                                Grab the best deals on premium gadgets before they're gone.
                            </p>
                        </div>

                        <div className="products-grid">
                            {specialOffers.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '50px' }}>
                            <Link to="/category?filter=sale" className="btn btn-outline" style={{ padding: '15px 40px' }}>View All Offers</Link>
                        </div>
                    </div>
                )}

                {/* Decorative Divider */}
                <div style={{
                    height: '1px',
                    background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)',
                    margin: '80px 0'
                }} />

                {/* New Arrivals Section */}
                <div className="section animate-slide-up" style={{ animationDelay: '0.2s' }}>
                    <div className="section-header">
                        <span className="text-accent" style={{ fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Fresh Stock</span>
                        <h2 style={{ fontSize: '2.5rem', marginTop: '10px' }}>New Arrivals</h2>
                        <p className="text-muted" style={{ fontSize: '1.1rem' }}>
                            Discover the latest technology added to our collection.
                        </p>
                    </div>

                    {loading ? (
                        <div className="products-grid">
                            {[1, 2, 3, 4].map(n => (
                                <div key={n} className="skeleton" style={{ height: '400px' }}></div>
                            ))}
                        </div>
                    ) : (
                        <div className="products-grid">
                            {newArrivals.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </div>

                {/* CTA Banner */}
                <div className="card glass" style={{
                    marginTop: '100px',
                    background: 'linear-gradient(135deg, var(--primary-color), var(--primary-light))',
                    padding: '60px 40px',
                    textAlign: 'center',
                    color: 'white',
                    borderRadius: '30px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h2 style={{ color: 'white', fontSize: '3rem', marginBottom: '20px' }}>Upgrade Your Tech Today</h2>
                        <p style={{ fontSize: '1.2rem', color: '#cbd5e1', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
                            Experience the difference with our premium selection of devices. Quality guaranteed, fast shipping, and 24/7 support.
                        </p>
                        <Link to="/category" className="btn btn-accent" style={{ padding: '18px 50px', fontSize: '1.2rem' }}>Start Shopping</Link>
                    </div>

                    {/* Abstract Circle */}
                    <div style={{
                        position: 'absolute',
                        top: '-50%',
                        right: '-10%',
                        width: '600px',
                        height: '600px',
                        borderRadius: '50%',
                        border: '40px solid rgba(255,255,255,0.03)',
                        pointerEvents: 'none'
                    }}></div>
                </div>
            </div>
        </>
    );
};

export default HomePage;
