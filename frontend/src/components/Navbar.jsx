import React, { useState, useContext, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import CartContext from '../context/CartContext';
import SiteSettingsContext from '../context/SiteSettingsContext';


const Navbar = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const { getCartCount } = useContext(CartContext);
    const { siteSettings } = useContext(SiteSettingsContext); // Added context usage
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // Renamed state
    const navigate = useNavigate();
    const location = useLocation();

    // Search State
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setMobileMenuOpen(false); // Updated state name
    }, [location]);

    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen); // Updated state name

    const handleSearch = (e) => { // Renamed function
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/category?search=${encodeURIComponent(searchQuery)}`);
            setMobileMenuOpen(false);
        }
    };

    const handleLogout = () => {
        logoutUser();
        navigate('/login');
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="container navbar-container">
                <Link to="/" className="navbar-logo">
                    <span className="text-gradient">{siteSettings.site_name}</span>
                </Link>

                {/* Mobile Menu Toggle */}
                <div className="menu-toggle" onClick={toggleMenu}>
                    <i className={`fa-solid ${mobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                </div>

                <div className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="search-bar">
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit">
                            <i className="fa-solid fa-search"></i>
                        </button>
                    </form>

                    <ul className="nav-links">
                        <li><NavLink to="/" className={({ isActive }) => isActive ? 'active-link' : ''}>Home</NavLink></li>
                        <li><NavLink to="/category" className={({ isActive }) => isActive ? 'active-link' : ''}>Shop</NavLink></li>

                        {user ? (
                            <>
                                <li><NavLink to="/orders" className={({ isActive }) => isActive ? 'active-link' : ''}>Orders</NavLink></li>
                                <li className="user-dropdown">
                                    <span style={{ cursor: 'pointer', fontWeight: 500 }}>
                                        <i className="fa-regular fa-user" style={{ marginRight: '5px' }}></i>
                                        {user.username}
                                    </span>
                                    <div className="dropdown-content">
                                        <button onClick={handleLogout}>Logout</button>
                                    </div>
                                </li>
                            </>
                        ) : (
                            <li><NavLink to="/login" className="btn btn-primary btn-sm">Login</NavLink></li>
                        )}

                        <li>
                            <NavLink to="/cart" className="cart-icon">
                                <i className="fa-solid fa-shopping-cart"></i>
                                {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
                            </NavLink>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
