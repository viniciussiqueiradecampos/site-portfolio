import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { contentAPI } from '../lib/supabase';

export default function Layout({ children }: { children: React.ReactNode }) {

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
        }
        return 'dark';
    });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [branding, setBranding] = useState({
        logoText1: 'VINICIUS',
        logoText2: 'CAMPOS',
        accentColor: '#F2A73D',
        bgColor: '#050505',
        lightAccentColor: '#C87A1A',
        lightBgColor: '#FFFFFF',
        navHome: true,
        navCV: true,
        navPortfolio: true,
        navGetInTouch: true,
        navBlog: false,
        navNewsletter: false,
        navAbout: false,
        logoImageUrl: '',
        navOrder: [] as string[]
    });

    useEffect(() => {
        loadBranding();
    }, []);

    const loadBranding = async () => {
        const l1 = await contentAPI.getByKey('general.logo_text1');
        const l2 = await contentAPI.getByKey('general.logo_text2');
        const ac = await contentAPI.getByKey('general.accent_color');
        const bg = await contentAPI.getByKey('general.bg_color');
        const lac = await contentAPI.getByKey('general.light_accent_color');
        const lbg = await contentAPI.getByKey('general.light_bg_color');
        const nh = await contentAPI.getByKey('nav.home');
        const nc = await contentAPI.getByKey('nav.cv');
        const np = await contentAPI.getByKey('nav.portfolio');
        const ng = await contentAPI.getByKey('nav.get_in_touch');
        const nb = await contentAPI.getByKey('nav.blog');
        const na = await contentAPI.getByKey('nav.about');
        const no = await contentAPI.getByKey('nav.order');

        setBranding({
            logoText1: l1?.value || 'VINICIUS',
            logoText2: l2?.value || 'CAMPOS',
            accentColor: ac?.value || '#F2A73D',
            bgColor: bg?.value || '#050505',
            lightAccentColor: lac?.value || '#C87A1A',
            lightBgColor: lbg?.value || '#FFFFFF',
            navHome: nh?.value !== 'false',
            navCV: nc?.value !== 'false',
            navPortfolio: np?.value !== 'false',
            navGetInTouch: ng?.value !== 'false',
            navBlog: nb?.value === 'true',
            navNewsletter: (await contentAPI.getByKey('nav.newsletter'))?.value === 'true',
            navAbout: na?.value === 'true',
            logoImageUrl: (await contentAPI.getByKey('general.logo_image_url'))?.value || '',
            navOrder: (no?.value || 'navHome,navCV,navPortfolio,navAbout,navBlog,navGetInTouch').split(',')
        });
    };

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.style.setProperty('--accent-color', branding.accentColor);
            document.documentElement.style.setProperty('--bg-color', branding.bgColor);
            document.documentElement.style.setProperty('--text-color', '#ffffff');
            document.documentElement.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
        } else {
            document.documentElement.style.setProperty('--accent-color', branding.lightAccentColor);
            document.documentElement.style.setProperty('--bg-color', branding.lightBgColor);
            document.documentElement.style.setProperty('--text-color', '#0a0a0a');
            document.documentElement.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
        }
    }, [theme, branding]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const renderDesktopNav = () => {
        return (
            <ul style={{ display: 'flex', gap: '40px', listStyle: 'none', margin: 0, padding: 0 }}>
                {branding.navHome && (
                    <li>
                        <NavLink
                            to="/"
                            onClick={(e) => { if (window.location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                            className={({ isActive }) => `clickable menu-link ${isActive && window.location.pathname === '/' ? 'active' : ''}`}
                        >
                            HOME
                        </NavLink>
                    </li>
                )}
                <li className="nav-dropdown">
                    <span className="clickable menu-link">ME</span>
                    <ul className="dropdown-menu">
                        {branding.navAbout && <li><NavLink to="/about">ABOUT</NavLink></li>}
                        {branding.navCV && <li><NavLink to="/cv">CV</NavLink></li>}
                        {branding.navPortfolio && <li><NavLink to="/projects">PORTFOLIO</NavLink></li>}
                    </ul>
                </li>
                {branding.navGetInTouch && (
                    <li>
                        <a href="/#contact" className="clickable menu-link" onClick={(e) => { if (window.location.pathname === '/') { e.preventDefault(); const s = document.getElementById('contact'); if (s) s.scrollIntoView({ behavior: 'smooth' }); } }}>
                            GET IN TOUCH
                        </a>
                    </li>
                )}
                {branding.navBlog && (
                    <li>
                        <NavLink to="/blog" className={({ isActive }) => `clickable menu-link ${isActive ? 'active' : ''}`}>
                            BLOG
                        </NavLink>
                    </li>
                )}
            </ul>
        );
    };

    const renderMobileNav = () => {
        const style = { fontSize: '32px', fontFamily: 'var(--font-display)', textDecoration: 'none', color: 'var(--text-color)', letterSpacing: '0', textAlign: 'right' as any, fontWeight: 900 };
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'flex-end' }}>
                {branding.navHome && (
                    <NavLink onClick={toggleMenu} to="/" className="mobile-link" style={style}>HOME</NavLink>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                    <span style={{ ...style, fontSize: '24px', opacity: 0.5 }}>ME</span>
                    <div className="mobile-submenu" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '10px' }}>
                        {branding.navAbout && <NavLink onClick={toggleMenu} to="/about" className="mobile-submenu-link">ABOUT</NavLink>}
                        {branding.navCV && <NavLink onClick={toggleMenu} to="/cv" className="mobile-submenu-link">CV</NavLink>}
                        {branding.navPortfolio && <NavLink onClick={toggleMenu} to="/projects" className="mobile-submenu-link">PORTFOLIO</NavLink>}
                    </div>
                </div>
                {branding.navGetInTouch && (
                    <a href="/#contact" onClick={(e) => { e.preventDefault(); toggleMenu(); setTimeout(() => { const s = document.getElementById('contact'); if (s) s.scrollIntoView({ behavior: 'smooth' }); }, 300); }} className="mobile-link" style={style}>
                        GET IN TOUCH
                    </a>
                )}
                {branding.navBlog && (
                    <NavLink onClick={toggleMenu} to="/blog" className="mobile-link" style={style}>
                        BLOG
                    </NavLink>
                )}
            </div>
        );
    };

    return (
        <>
            <div className={`noise-overlay ${theme === 'light' ? 'light-mode' : ''}`} />

            <header
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    height: 'var(--header-height)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    zIndex: 1000,
                    padding: '0 5%',
                    pointerEvents: 'auto',
                    width: '100%'
                }}
            >
                {/* Header Background Layer - sits between Dropdown and Content */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'var(--header-bg)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid var(--border-color)',
                    zIndex: 5
                }} />

                <div className="logo clickable" style={{ pointerEvents: 'auto', minWidth: '120px', position: 'relative', zIndex: 10 }}>
                    <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: '900', lineHeight: '1.2' }}>{branding.logoText1}</span>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: '900', lineHeight: '1.2' }}>{branding.logoText2}</span>
                        </div>
                    </NavLink>
                </div>

                <nav className="desktop-nav" style={{ pointerEvents: 'auto' }}>
                    {renderDesktopNav()}
                </nav>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>
                    <button
                        onClick={toggleTheme}
                        className="clickable"
                        aria-label="Toggle Theme"
                        style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            width: '40px', height: '40px',
                            color: 'var(--text-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer'
                        }}
                    >
                        {theme === 'dark' ? '☀' : '☾'}
                    </button>

                    <button
                        className="mobile-menu-toggle clickable"
                        onClick={toggleMenu}
                        aria-label="Open Mobile Menu"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-color)',
                            cursor: 'pointer',
                            display: 'none'
                        }}
                    >
                        <Menu size={32} />
                    </button>
                </div>
            </header>

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
                            padding: '60px 40px',
                            alignItems: 'flex-end',
                            textAlign: 'right'
                        }}
                    >
                        <div style={{ display: 'flex', width: '100%', justifyContent: 'flex-end', marginBottom: '60px' }}>
                            <button
                                onClick={toggleMenu}
                                aria-label="Close Mobile Menu"
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}
                            >
                                <X size={40} />
                            </button>
                        </div>
                        <nav style={{ width: '100%' }}>
                            {renderMobileNav()}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>

            <main>{children}</main>
        </>
    );
}
