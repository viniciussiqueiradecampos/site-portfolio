import { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Mail, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Lenis from '@studio-freight/lenis';
import { contentAPI } from '../lib/supabase';

// FontAwesome WhatsApp Brand Icon
const WhatsappIcon = ({ size = 20, color = 'currentColor' }: { size?: number, color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 448 512" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
);

export default function Layout({ children }: { children: React.ReactNode }) {
    const { pathname } = useLocation();
    const lenisRef = useRef<Lenis | null>(null);

    // Lenis Smooth Scroll
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        lenisRef.current = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            lenisRef.current = null;
        };
    }, []);

    // Reset scroll on route change
    useEffect(() => {
        window.scrollTo(0, 0);
        if (lenisRef.current) {
            lenisRef.current.scrollTo(0, { immediate: true });
        }
    }, [pathname]);

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'dark' | 'light') || 'light';
        }
        return 'light';
    });
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
    const timeoutRef = useRef<any>(null);
    const [branding, setBranding] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('site_branding');
            if (cached) return JSON.parse(cached);
        }
        return {
            logoText1: 'VINICIUS',
            logoText2: 'CAMPOS',
            accentColor: '#F2A73D',
            bgColor: '#050505',
            lightAccentColor: '#4A2F12',
            lightBgColor: '#FFFFFF',
            navHome: true,
            navCV: true,
            navPortfolio: true,
            navGetInTouch: true,
            navBlog: true,
            navNewsletter: false,
            navAbout: true,
            logoImageUrl: '',
            navOrder: ['navHome', 'navCV', 'navPortfolio', 'navAbout', 'navBlog', 'navGetInTouch'],
            socialEmail: '',
            socialPhone: '',
            socialLinkedin: ''
        };
    });

    useEffect(() => {
        console.log("Layout Loaded v2.5 - Performance Optimized");
        loadBranding();
    }, []);

    const loadBranding = async () => {
        const allContent = await contentAPI.getAll();

        const getV = (key: string) => allContent.find(c => c.key === key)?.value;

        const newBranding = {
            logoText1: getV('general.logo_text1') || 'VINICIUS',
            logoText2: getV('general.logo_text2') || 'CAMPOS',
            accentColor: getV('general.accent_color') || '#F2A73D',
            bgColor: getV('general.bg_color') || '#050505',
            lightAccentColor: getV('general.light_accent_color') || '#4A2F12',
            lightBgColor: getV('general.light_bg_color') || '#FFFFFF',
            navHome: getV('nav.home') !== 'false',
            navCV: getV('nav.cv') !== 'false',
            navPortfolio: getV('nav.portfolio') !== 'false',
            navGetInTouch: getV('nav.get_in_touch') !== 'false',
            navBlog: getV('nav.blog') === 'true',
            navNewsletter: getV('nav.newsletter') === 'true',
            navAbout: getV('nav.about') === 'true',
            logoImageUrl: getV('general.logo_image_url') || '',
            navOrder: (getV('nav.order') || 'navHome,navCV,navPortfolio,navAbout,navBlog,navGetInTouch').split(','),
            socialEmail: getV('social.footer_email') || '',
            socialPhone: getV('social.phone') || '',
            socialLinkedin: getV('social.linkedin') || ''
        };

        setBranding(newBranding);
        localStorage.setItem('site_branding', JSON.stringify(newBranding));
    };

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.style.setProperty('--accent-color', branding.accentColor);
            root.style.setProperty('--bg-color', branding.bgColor);
            root.style.setProperty('--text-color', '#ffffff');
            root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.1)');
            root.style.setProperty('--header-bg', 'rgba(5, 5, 5, 0.85)');
            root.setAttribute('data-theme', 'dark');
        } else {
            root.style.setProperty('--accent-color', branding.lightAccentColor);
            root.style.setProperty('--bg-color', branding.lightBgColor);
            root.style.setProperty('--text-color', '#000000'); // Pure black for max contrast
            root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.2)');
            root.style.setProperty('--header-bg', 'rgba(255, 255, 255, 0.95)');
            root.setAttribute('data-theme', 'light');
        }
    }, [theme, branding]);

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    const toggleMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const sanitizePhone = (phone: string) => {
        if (!phone) return '';
        return phone.replace(/[^\d+]/g, '').replace('+', '');
    };

    const renderDesktopNav = () => {
        const items = [];

        if (branding.navHome) {
            items.push(
                <li key="home">
                    <NavLink
                        to="/"
                        onClick={(e) => { if (window.location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                        className={({ isActive }) => `clickable menu-link ${isActive && window.location.pathname === '/' ? 'active' : ''}`}
                        style={{ textTransform: 'lowercase' }}
                    >
                        {t('nav.home')}
                    </NavLink>
                </li>
            );
        }

        items.push(
            <li
                key="about"
                className="nav-dropdown"
                onMouseEnter={() => {
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    setIsDropdownOpen(true);
                }}
                onMouseLeave={() => {
                    timeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 300);
                }}
            >
                <span
                    className="clickable menu-link"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', textTransform: 'lowercase', cursor: 'pointer' }}
                >
                    about me
                    <ChevronDown
                        size={14}
                        style={{
                            transition: 'transform 0.3s ease',
                            transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                        }}
                    />
                </span>
                <ul
                    className={`dropdown-menu ${isDropdownOpen ? 'dropdown-open' : ''}`}
                    onMouseEnter={() => {
                        if (timeoutRef.current) clearTimeout(timeoutRef.current);
                    }}
                    onMouseLeave={() => {
                        timeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 300);
                    }}
                >
                    {branding.navAbout && <li><NavLink to="/about" onClick={() => setIsDropdownOpen(false)} style={{ textTransform: 'lowercase' }}>{t('nav.about')}</NavLink></li>}
                    {branding.navCV && <li><NavLink to="/cv" onClick={() => setIsDropdownOpen(false)} style={{ textTransform: 'lowercase' }}>{t('nav.cv')}</NavLink></li>}
                    {branding.navPortfolio && <li><NavLink to="/projects" onClick={() => setIsDropdownOpen(false)} style={{ textTransform: 'lowercase' }}>{t('nav.portfolio')}</NavLink></li>}
                </ul>
            </li>
        );

        if (branding.navGetInTouch) {
            items.push(
                <li key="contact">
                    <button
                        className="clickable menu-link"
                        onClick={() => {
                            if (window.location.pathname === '/') {
                                const s = document.getElementById('contact');
                                if (s) s.scrollIntoView({ behavior: 'smooth' });
                            } else {
                                navigate('/#contact');
                            }
                        }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textTransform: 'lowercase' }}
                    >
                        {t('nav.contact')}
                    </button>
                </li>
            );
        }

        if (branding.navBlog) {
            items.push(
                <li key="blog">
                    <NavLink to="/blog" className={({ isActive }) => `clickable menu-link ${isActive ? 'active' : ''}`} style={{ textTransform: 'lowercase' }}>
                        {t('nav.blog')}
                    </NavLink>
                </li>
            );
        }

        return (
            <ul style={{ display: 'flex', gap: '20px', listStyle: 'none', margin: 0, padding: 0, height: '100%', alignItems: 'center' }}>
                {items.flatMap((item, index) =>
                    index < items.length - 1
                        ? [item, <li key={`sep-${index}`} style={{ opacity: 0.2, userSelect: 'none', color: 'var(--text-color)', fontFamily: 'sans-serif', fontSize: '10px', lineHeight: 0, display: 'flex', alignItems: 'center', padding: '0 8px' }}>•</li>]
                        : [item]
                )}
            </ul>
        );
    };

    const renderMobileNav = () => {
        const style = { fontSize: '32px', fontFamily: 'var(--font-display)', textDecoration: 'none', color: 'var(--text-color)', letterSpacing: '0', textAlign: 'right' as any, fontWeight: 900 };
        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', alignItems: 'flex-end' }}>
                {branding.navHome && (
                    <NavLink onClick={toggleMenu} to="/" className="mobile-link" style={style}>{t('nav.home')}</NavLink>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                    <button
                        onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                        className="mobile-link"
                        style={{
                            ...style,
                            fontSize: '32px',
                            opacity: 1,
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: 0,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}
                    >
                        ABOUT ME
                        <ChevronDown
                            size={24}
                            style={{
                                transition: 'transform 0.3s ease',
                                transform: isMobileDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                        />
                    </button>
                    <div
                        className="mobile-submenu"
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px',
                            marginTop: '10px',
                            maxHeight: isMobileDropdownOpen ? '500px' : '0',
                            overflow: 'hidden',
                            transition: 'max-height 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease',
                            opacity: isMobileDropdownOpen ? 1 : 0
                        }}
                    >
                        {branding.navAbout && <NavLink onClick={() => { toggleMenu(); setIsMobileDropdownOpen(false); }} to="/about" className="mobile-submenu-link">{t('nav.about')}</NavLink>}
                        {branding.navCV && <NavLink onClick={() => { toggleMenu(); setIsMobileDropdownOpen(false); }} to="/cv" className="mobile-submenu-link">{t('nav.cv')}</NavLink>}
                        {branding.navPortfolio && <NavLink onClick={() => { toggleMenu(); setIsMobileDropdownOpen(false); }} to="/projects" className="mobile-submenu-link">{t('nav.portfolio')}</NavLink>}
                    </div>
                </div>
                {branding.navGetInTouch && (
                    <button
                        onClick={() => {
                            toggleMenu();
                            if (window.location.pathname === '/') {
                                setTimeout(() => {
                                    const s = document.getElementById('contact');
                                    if (s) s.scrollIntoView({ behavior: 'smooth' });
                                }, 300);
                            } else {
                                navigate('/#contact');
                            }
                        }}
                        className="mobile-link"
                        style={{ ...style, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                        {t('nav.contact')}
                    </button>
                )}
                {branding.navBlog && (
                    <NavLink onClick={toggleMenu} to="/blog" className="mobile-link" style={style}>
                        {t('nav.blog')}
                    </NavLink>
                )}

                <div style={{ marginTop: '20px', display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
                    {/* Mobile Social Icons */}
                    {(branding.socialEmail || !branding.socialEmail) && ( // Always show for now to let user see them
                        <a href={branding.socialEmail ? `mailto:${branding.socialEmail}` : '#'} className="clickable" style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            width: '40px', height: '40px',
                            color: 'var(--text-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Mail size={20} />
                        </a>
                    )}
                    {(branding.socialPhone || !branding.socialPhone) && (
                        <a href={branding.socialPhone ? `https://wa.me/${sanitizePhone(branding.socialPhone)}` : '#'} target="_blank" rel="noopener noreferrer" className="clickable" style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            width: '40px', height: '40px',
                            color: 'var(--text-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <WhatsappIcon size={20} />
                        </a>
                    )}
                    {(branding.socialLinkedin || !branding.socialLinkedin) && (
                        <a href={branding.socialLinkedin || '#'} target="_blank" rel="noopener noreferrer" className="clickable" style={{
                            background: 'transparent',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            width: '40px', height: '40px',
                            color: 'var(--text-color)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Linkedin size={20} />
                        </a>
                    )}
                </div>
            </div>
        );
    };

    const SocialButton = ({ children, href, target }: { children: React.ReactNode, href: string, target?: string }) => (
        <a
            href={href}
            target={target}
            rel={target === '_blank' ? "noopener noreferrer" : undefined}
            className="clickable"
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
            {children}
        </a>
    );

    return (
        <>

            <header
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    height: 'var(--header-height)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'stretch',
                    zIndex: 1000,
                    padding: '0 5%',
                    pointerEvents: 'auto'
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


                <div className="logo clickable" style={{ pointerEvents: 'auto', minWidth: '120px', position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
                    <NavLink to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {branding.logoImageUrl ? (
                            <img
                                src={branding.logoImageUrl}
                                alt="Logo"
                                style={{
                                    height: '32px',
                                    width: 'auto',
                                    objectFit: 'contain',
                                    filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'none',
                                    transition: 'filter 0.5s ease'
                                }}
                            />
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span style={{ fontFamily: 'var(--font-logo)', fontSize: '14px', fontWeight: '900', lineHeight: '1.2' }}>{branding.logoText1}</span>
                                <span style={{ fontFamily: 'var(--font-logo)', fontSize: '14px', fontWeight: '900', lineHeight: '1.2' }}>{branding.logoText2}</span>
                            </div>
                        )}
                    </NavLink>
                </div>

                <nav className="desktop-nav" style={{ pointerEvents: 'auto' }}>
                    {renderDesktopNav()}
                </nav>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center', pointerEvents: 'auto', position: 'relative', zIndex: 10 }}>

                    {/* Desktop Social Icons */}
                    <div className="desktop-nav" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {(branding.socialEmail || !branding.socialEmail) && (
                            <SocialButton href={branding.socialEmail ? `mailto:${branding.socialEmail}` : '#'}>
                                <Mail size={20} />
                            </SocialButton>
                        )}
                        {(branding.socialPhone || !branding.socialPhone) && (
                            <SocialButton href={branding.socialPhone ? `https://wa.me/${sanitizePhone(branding.socialPhone)}` : '#'} target="_blank">
                                <WhatsappIcon size={20} />
                            </SocialButton>
                        )}
                        {(branding.socialLinkedin || !branding.socialLinkedin) && (
                            <SocialButton href={branding.socialLinkedin || '#'} target="_blank">
                                <Linkedin size={20} />
                            </SocialButton>
                        )}
                    </div>

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
                            padding: '60px 5%',
                            alignItems: 'flex-end',
                            textAlign: 'right',
                            overflowX: 'hidden'
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
