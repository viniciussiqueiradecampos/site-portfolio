import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { contentAPI } from '../lib/supabase';

export default function Layout({ children }: { children: React.ReactNode }) {

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [branding, setBranding] = useState({
        logoText1: 'VINICIUS',
        logoText2: 'CAMPOS'
    });

    useEffect(() => {
        loadBranding();
    }, []);

    const loadBranding = async () => {
        const l1 = await contentAPI.getByKey('general.logo_text1');
        const l2 = await contentAPI.getByKey('general.logo_text2');
        const ac = await contentAPI.getByKey('general.accent_color');
        const bg = await contentAPI.getByKey('general.bg_color');

        if (l1 || l2) {
            setBranding({
                logoText1: l1?.value || 'VINICIUS',
                logoText2: l2?.value || 'CAMPOS'
            });
        }

        if (ac) {
            document.documentElement.style.setProperty('--accent-color', ac.value);
        }
        if (bg) {
            document.documentElement.style.setProperty('--bg-color', bg.value);
        }
    };


    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    return (
        <>
            {/* Noise Overlay Persistent */}
            <div className="noise-overlay" />

            {/* Global Header */}
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    height: 'var(--header-height)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    zIndex: 1000,
                    padding: '0 5%',
                    background: 'rgba(5, 5, 5, 0.9)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: '1px solid var(--border-color)',
                    pointerEvents: 'auto',
                    width: '100%'
                }}
            >
                <div className="logo clickable" style={{ pointerEvents: 'auto', width: '120px' }}>
                    <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <svg viewBox="0 0 120 40" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: 'auto', display: 'block' }}>
                            <text x="0" y="15" fontFamily="var(--font-display)" fontSize="16" fontWeight="900" fill="currentColor">{branding.logoText1}</text>
                            <text x="0" y="32" fontFamily="var(--font-display)" fontSize="16" fontWeight="900" fill="currentColor">{branding.logoText2}</text>
                        </svg>
                    </NavLink>
                </div>

                {/* Desktop Nav */}
                <nav className="desktop-nav" style={{ pointerEvents: 'auto' }}>
                    <ul style={{ display: 'flex', gap: '40px', listStyle: 'none', margin: 0, padding: 0 }}>
                        <li><NavLink to="/" className={({ isActive }) => `clickable menu-link ${isActive ? 'active' : ''}`}>HOME</NavLink></li>
                        <li><NavLink to="/cv" className={({ isActive }) => `clickable menu-link ${isActive ? 'active' : ''}`}>CV</NavLink></li>
                        <li><NavLink to="/projects" className={({ isActive }) => `clickable menu-link ${isActive ? 'active' : ''}`}>PORTFOLIO</NavLink></li>
                        <li>
                            <a
                                href="/#contact"
                                className="clickable menu-link"
                                onClick={(e) => {
                                    if (window.location.pathname === '/') {
                                        e.preventDefault();
                                        const contactSection = document.getElementById('contact');
                                        if (contactSection) {
                                            contactSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }
                                }}
                            >
                                GET IN TOUCH
                            </a>
                        </li>

                    </ul>
                </nav>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', pointerEvents: 'auto' }}>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="mobile-menu-toggle clickable"
                        onClick={toggleMenu}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-color)',
                            cursor: 'pointer',
                            display: 'none' // Hidden by default, shown via CSS
                        }}
                    >
                        <Menu size={32} />
                    </button>
                </div>
            </motion.header>

            {/* Mobile Nav Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: 'tween', duration: 0.3 }}
                        className="mobile-nav-overlay"
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'var(--bg-color)',
                            zIndex: 2000,
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '30px'
                        }}
                    >
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', marginBottom: '60px' }}>
                            <button onClick={toggleMenu} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}>
                                <X size={40} />
                            </button>
                        </div>
                        <nav style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '40px', width: '100%' }}>
                            <NavLink onClick={toggleMenu} to="/" className="mobile-link" style={{ fontSize: '40px', fontFamily: 'var(--font-display)', textDecoration: 'none', color: 'var(--text-color)' }}>HOME</NavLink>
                            <NavLink onClick={toggleMenu} to="/cv" className="mobile-link" style={{ fontSize: '40px', fontFamily: 'var(--font-display)', textDecoration: 'none', color: 'var(--text-color)' }}>CV</NavLink>
                            <NavLink onClick={toggleMenu} to="/projects" className="mobile-link" style={{ fontSize: '40px', fontFamily: 'var(--font-display)', textDecoration: 'none', color: 'var(--text-color)' }}>PORTFOLIO</NavLink>
                            <a
                                href="/#contact"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleMenu();
                                    setTimeout(() => {
                                        const contactSection = document.querySelector('.footer-section');
                                        if (contactSection) {
                                            contactSection.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }, 300);
                                }}
                                className="mobile-link get-in-touch-mobile"
                                style={{ fontSize: '40px', fontFamily: 'var(--font-display)', textDecoration: 'none', color: 'var(--text-color)' }}
                            >
                                GET IN TOUCH
                            </a>

                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Page Content */}
            <main>
                {children}
            </main>
        </>
    );
}
