import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import SiteSettingsContext from '../context/SiteSettingsContext';

const Footer = () => {
    const { siteSettings } = useContext(SiteSettingsContext);


    // Use default if context is loading or empty (context provides defaults initially)
    const settings = siteSettings || {
        site_name: 'RB Trading',
        contact_email: 'support@rbtrading.com',
        contact_phone: '+880 1234-567890',
        address: 'Dhaka, Bangladesh'
    };

    const currentYear = new Date().getFullYear();
    const siteName = settings?.site_name || 'RB Trading';

    return (
        <footer style={{ background: 'var(--primary-color)', color: '#cbd5e1', paddingTop: '80px', marginTop: 'auto' }}>
            {/* Newsletter Section */}
            <div className="container" style={{ marginBottom: '60px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '60px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <h3 style={{ color: 'white', marginBottom: '10px', fontSize: '2rem' }}>Join our Newsletter</h3>
                    <p style={{ maxWidth: '500px', marginBottom: '30px', color: '#94a3b8', fontSize: '1.1rem' }}>
                        Subscribe to get the latest updates on new gadgets and exclusive offers.
                    </p>
                    <div className="newsletter-form" style={{ display: 'flex', gap: '10px', width: '100%', maxWidth: '400px', flexWrap: 'wrap' }}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            style={{
                                flex: 1,
                                minWidth: '200px',
                                padding: '14px 20px',
                                borderRadius: '50px',
                                border: '1px solid rgba(255,255,255,0.1)',
                                outline: 'none',
                                background: 'rgba(255,255,255,0.05)',
                                color: 'white',
                                fontSize: '15px'
                            }}
                        />
                        <button className="btn btn-accent" style={{ padding: '14px 30px', flexShrink: 0 }}>Subscribe</button>
                    </div>
                </div>
            </div>

            <div className="container">
                <div className="footer-content" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '50px', marginBottom: '60px' }}>
                    {/* Brand Col */}
                    <div className="footer-col">
                        <Link to="/" className="logo" style={{ fontSize: '1.8rem', fontWeight: 700, color: 'white', marginBottom: '20px', display: 'block' }}>
                            RB<span className="text-accent">Trading</span>
                        </Link>
                        <p style={{ lineHeight: '1.7', marginBottom: '25px', color: '#94a3b8' }}>
                            Your premium destination for quality electronics and gadgets.
                            Experience the future of shopping today.
                        </p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            {settings?.facebook_link && <SocialLink href={settings.facebook_link} icon="facebook-f" />}
                            {settings?.twitter_link && <SocialLink href={settings.twitter_link} icon="twitter" />}
                            {settings?.instagram_link && <SocialLink href={settings.instagram_link} icon="instagram" />}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-col">
                        <h4 style={{ color: 'white', marginBottom: '25px', fontSize: '1.2rem' }}>Shop</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <FooterLink to="/category">All Products</FooterLink>
                            <FooterLink to="/category?filter=featured">Featured</FooterLink>
                            <FooterLink to="/category?filter=new">New Arrivals</FooterLink>
                            <FooterLink to="/category?filter=sale">Discounts</FooterLink>
                        </div>
                    </div>

                    {/* Customer Service */}
                    <div className="footer-col">
                        <h4 style={{ color: 'white', marginBottom: '25px', fontSize: '1.2rem' }}>Support</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <FooterLink to="/contact">Contact Us</FooterLink>
                            <FooterLink to="/faq">FAQs</FooterLink>
                            <FooterLink to="/shipping">Shipping Info</FooterLink>
                            <FooterLink to="/returns">Returns Policy</FooterLink>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-col">
                        <h4 style={{ color: 'white', marginBottom: '25px', fontSize: '1.2rem' }}>Contact</h4>
                        {settings ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                                    <i className="fa-solid fa-location-dot text-accent" style={{ marginTop: '5px' }}></i>
                                    <span style={{ color: '#94a3b8' }}>{settings.address}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <i className="fa-solid fa-phone text-accent"></i>
                                    <span style={{ color: '#94a3b8' }}>{settings.contact_phone}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <i className="fa-solid fa-envelope text-accent"></i>
                                    <span style={{ color: '#94a3b8' }}>{settings.contact_email}</span>
                                </div>
                            </div>
                        ) : (
                            <div style={{ color: '#94a3b8' }}>Loading contact info...</div>
                        )}
                    </div>
                </div>

                <div className="copyright" style={{
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    padding: '30px 0',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.9rem'
                }}>
                    <p>&copy; {currentYear} {siteName}. All Rights Reserved.</p>
                </div>
            </div>
            <style>{`
                .footer-link:hover { color: white !important; transform: translateX(5px); }
                .social-link:hover { background: var(--accent-color) !important; color: white !important; transform: translateY(-3px); }
            `}</style>
        </footer>
    );
};

const FooterLink = ({ to, children }) => (
    <Link to={to} className="footer-link" style={{
        color: '#94a3b8',
        transition: 'all 0.3s ease',
        display: 'inline-block',
        textDecoration: 'none'
    }}>
        {children}
    </Link>
);

const SocialLink = ({ href, icon }) => (
    <a href={href} target="_blank" rel="noreferrer" className="social-link" style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        transition: 'all 0.3s ease'
    }}>
        <i className={`fa-brands fa-${icon}`}></i>
    </a>
);

export default Footer;
