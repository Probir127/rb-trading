import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import ProductCard from '../components/ProductCard';
import { useSearchParams } from 'react-router-dom';

const CategoryPage = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

    // Filter states
    const categorySlug = searchParams.get('category') || '';
    const searchQuery = searchParams.get('search') || '';
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    // Moved fetch functions up and wrapped in useCallback to avoid infinite loops
    const fetchCategories = useCallback(async () => {
        try {
            const response = await api.get('categories/');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }, []);

    const fetchBrands = useCallback(async () => {
        try {
            const response = await api.get('brands/');
            setBrands(response.data);
        } catch (error) {
            console.error("Error fetching brands:", error);
        }
    }, []);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (searchQuery) params.search = searchQuery;
            if (minPrice) params.price__gte = minPrice;
            if (maxPrice) params.price__lte = maxPrice;
            if (categorySlug) params.category__slug = categorySlug;

            const response = await api.get('products/', { params });
            let fetchedProducts = response.data;

            if (selectedBrands.length > 0) {
                fetchedProducts = fetchedProducts.filter(p =>
                    p.brand && selectedBrands.includes(p.brand.name)
                );
            }

            setProducts(fetchedProducts);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products:", error);
            setLoading(false);
        }
    }, [categorySlug, searchQuery, selectedBrands, minPrice, maxPrice]);

    useEffect(() => {
        const initData = async () => {
            await Promise.all([fetchCategories(), fetchBrands()]);
        };
        initData();
    }, [fetchCategories, fetchBrands]);

    useEffect(() => {
        fetchProducts();
    }, [categorySlug, searchQuery, selectedBrands, minPrice, maxPrice, fetchProducts]); // Added fetchProducts dependency



    const handleCategoryClick = (slug) => {
        const newParams = {};
        if (slug) newParams.category = slug;
        if (searchQuery) newParams.search = searchQuery;
        setSearchParams(newParams);
        setMobileFiltersOpen(false);
    };

    const handleBrandToggle = (brandName) => {
        setSelectedBrands(prev =>
            prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
        );
    };

    return (
        <div className="container" style={{ padding: '60px 0' }}>
            {/* Page Header */}
            <div className="section-header animate-slide-up">
                <h1 style={{ marginBottom: '10px' }}>
                    {categorySlug ? categories.find(c => c.slug === categorySlug)?.name || 'Category' : 'All Products'}
                </h1>
                <p className="text-muted" style={{ fontSize: '1.2rem' }}>
                    {searchQuery ? `Search results for "${searchQuery}"` : 'Explore our premium collection of devices'}
                </p>

                {/* Mobile Filter Toggle */}
                <button
                    className="btn btn-outline"
                    style={{ margin: '20px auto 0', display: 'none' }}
                    onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                >
                    <i className="fa-solid fa-filter"></i> Filters
                </button>
                <style>{`@media(max-width: 1024px) { .btn-outline { display: inline-flex !important; } }`}</style>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '50px', alignItems: 'start' }} className="shop-layout">
                {/* Sidebar */}
                <aside className={`filters-sidebar ${mobileFiltersOpen ? 'open' : ''}`} style={{
                    transition: 'all 0.3s ease'
                }}>
                    <div className="card" style={{ padding: '30px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Filters</h3>
                            <button
                                onClick={() => setMobileFiltersOpen(false)}
                                style={{ background: 'none', border: 'none', display: 'none' }}
                                className="close-filters"
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>

                        {/* Search in sidebar */}
                        <div className="form-group">
                            <label className="form-label">Search</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Keyword..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchParams(prev => {
                                        const p = new URLSearchParams(prev);
                                        if (e.target.value) p.set('search', e.target.value);
                                        else p.delete('search');
                                        return p;
                                    })}
                                />
                                <i className="fa-solid fa-search" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}></i>
                            </div>
                        </div>

                        {/* Categories */}
                        <div style={{ marginBottom: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '15px' }}>Categories</h4>
                            <ul style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <li
                                    onClick={() => handleCategoryClick('')}
                                    style={{
                                        cursor: 'pointer',
                                        color: !categorySlug ? 'var(--accent-color)' : 'var(--text-muted)',
                                        fontWeight: !categorySlug ? 600 : 400,
                                        display: 'flex', alignItems: 'center', gap: '10px'
                                    }}
                                >
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: !categorySlug ? 'var(--accent-color)' : 'transparent', border: '1px solid var(--border-color)' }}></div>
                                    All Categories
                                </li>
                                {categories.map(cat => (
                                    <li
                                        key={cat.id}
                                        onClick={() => handleCategoryClick(cat.slug)}
                                        style={{
                                            cursor: 'pointer',
                                            color: categorySlug === cat.slug ? 'var(--accent-color)' : 'var(--text-muted)',
                                            fontWeight: categorySlug === cat.slug ? 600 : 400,
                                            display: 'flex', alignItems: 'center', gap: '10px'
                                        }}
                                    >
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: categorySlug === cat.slug ? 'var(--accent-color)' : 'transparent', border: '1px solid var(--border-color)' }}></div>
                                        {cat.name}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Brands */}
                        <div style={{ marginBottom: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '15px' }}>Brands</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {brands.map(brand => (
                                    <label key={brand.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedBrands.includes(brand.name)}
                                            onChange={() => handleBrandToggle(brand.name)}
                                            style={{ accentColor: 'var(--accent-color)', width: '16px', height: '16px' }}
                                        />
                                        {brand.name}
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                            <h4 style={{ fontSize: '1rem', marginBottom: '15px' }}>Price Range</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={minPrice}
                                    onChange={(e) => setMinPrice(e.target.value)}
                                    className="form-control"
                                    style={{ padding: '8px 12px' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="form-control"
                                    style={{ padding: '8px 12px' }}
                                />
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Product Grid */}
                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <span className="text-muted">
                            Showing <strong>{products.length}</strong> results
                        </span>
                        {/* Could add Sort By dropdown here */}
                    </div>

                    {loading ? (
                        <div className="products-grid" style={{ marginTop: 0 }}>
                            {[1, 2, 3, 4, 5, 6].map(n => (
                                <div key={n} className="skeleton" style={{ height: '350px' }}></div>
                            ))}
                        </div>
                    ) : products.length > 0 ? (
                        <div className="products-grid animate-fade-in" style={{ marginTop: 0 }}>
                            {products.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
                            <i className="fa-solid fa-search" style={{ fontSize: '3rem', color: 'var(--border-color)', marginBottom: '20px' }}></i>
                            <h3>No products found</h3>
                            <p className="text-muted">Try adjusting your filters or search terms.</p>
                            <button
                                onClick={() => {
                                    setSearchParams({});
                                    setMinPrice('');
                                    setMaxPrice('');
                                    setSelectedBrands([]);
                                }}
                                className="btn btn-outline"
                                style={{ marginTop: '20px' }}
                            >
                                Clear All Filters
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @media (max-width: 1024px) {
                    .shop-layout { grid-template-columns: 1fr !important; }
                    .filters-sidebar {
                        position: fixed;
                        top: 0;
                        left: -100%;
                        width: 300px;
                        height: 100vh;
                        background: white;
                        z-index: 2000;
                        overflow-y: auto;
                        box-shadow: 10px 0 30px rgba(0,0,0,0.1);
                        padding: 0 !important;
                    }
                    .filters-sidebar.open { left: 0; }
                    .filters-sidebar .card { border: none; box-shadow: none; height: 100%; border-radius: 0; }
                    .close-filters { display: block !important; }
                }
            `}</style>
        </div>
    );
};

export default CategoryPage;
