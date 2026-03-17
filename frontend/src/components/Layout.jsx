import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
};

const Layout = () => {
    return (
        <>
            <ScrollToTop />
            <Navbar />
            <main style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', paddingTop: 'var(--header-height)' }}>
                <div className="animate-fade-in" style={{ flex: 1, width: '100%' }}>
                    <Outlet />
                </div>
            </main>
            <Footer />
        </>
    );
};

export default Layout;
