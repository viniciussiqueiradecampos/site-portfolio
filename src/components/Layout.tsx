import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, Mail, Linkedin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { contentAPI } from '../lib/supabase';

// FontAwesome WhatsApp Brand Icon
const WhatsappIcon = ({ size = 20, color = 'currentColor' }: { size?: number, color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 448 512" fill={color} xmlns="http://www.w3.org/2000/svg">
        <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7 .9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z" />
    </svg>
);

export default function Layout({ children }: { children: React.ReactNode }) {

    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        if (typeof window !== 'undefined') {
            return (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
        }
        return 'dark';
    });
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
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
        navBlog: true,
        navNewsletter: false,
        navAbout: true,
        logoImageUrl: '',
        navOrder: ['navHome', 'navCV', 'navPortfolio', 'navAbout', 'navBlog', 'navGetInTouch'],
        socialEmail: '',
        socialPhone: '',
        socialLinkedin: ''
    });

    useEffect(() => {
        console.log("Layout Loaded v2.3 - Cache Buster");
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

        // Fetch using the footer keys
        const sEmail = await contentAPI.getByKey('social.footer_email');
        const sPhone = await contentAPI.getByKey('social.phone');
        const sLinkedin = await contentAPI.getByKey('social.linkedin');

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
            navOrder: (no?.value || 'navHome,navCV,navPortfolio,navAbout,navBlog,navGetInTouch').split(','),
            socialEmail: sEmail?.value || '',
            socialPhone: sPhone?.value || '',
            socialLinkedin: sLinkedin?.value || ''
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

    const sanitizePhone = (phone: string) => {
        if (!phone) return '';
        return phone.replace(/[^\d+]/g, '').replace('+', '');
    };

    const renderDesktopNav = () => {
        return (
            <ul style={{ display: 'flex', gap: '40px', listStyle: 'none', margin: 0, padding: 0, height: '100%' }}>
                {branding.navHome && (
                    <li>
                        <NavLink
                            to="/"
                            onClick={(e) => { if (window.location.pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } }}
                            className={({ isActive }) => `clickable menu-link ${isActive && window.location.pathname === '/' ? 'active' : ''}`}
                        >
                            {t('nav.home')}
                        </NavLink>
                    </li>
                )}
                <li className="nav-dropdown" onMouseLeave={() => setIsDropdownOpen(false)}>
                    <span
                        className="clickable menu-link"
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        ABOUT ME
                        <ChevronDown
                            size={14}
                            style={{
                                transition: 'transform 0.3s ease',
                                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                            }}
                        />
                    </span>
                    <ul className={`dropdown-menu ${isDropdownOpen ? 'dropdown-open' : ''}`}>
                        {branding.navAbout && <li><NavLink to="/about" onClick={() => setIsDropdownOpen(false)}>{t('nav.about')}</NavLink></li>}
                        {branding.navCV && <li><NavLink to="/cv" onClick={() => setIsDropdownOpen(false)}>{t('nav.cv')}</NavLink></li>}
                        {branding.navPortfolio && <li><NavLink to="/projects" onClick={() => setIsDropdownOpen(false)}>{t('nav.portfolio')}</NavLink></li>}
                    </ul>
                </li>
                {branding.navGetInTouch && (
                    <li>
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
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                        >
                            {t('nav.contact')}
                        </button>
                    </li>
                )}
                {branding.navBlog && (
                    <li>
                        <NavLink to="/blog" className={({ isActive }) => `clickable menu-link ${isActive ? 'active' : ''}`}>
                            {t('nav.blog')}
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
                    <NavLink onClick={toggleMenu} to="/" className="mobile-link" style={style}>{t('nav.home')}</NavLink>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end' }}>
                    <button
                        onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
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
            <div className={`noise-overlay ${theme === 'light' ? 'light-mode' : ''}`} />

            <header
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0,
                    height: 'var(--header-height)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'stretch', // Use stretch to allow nav items to fill height
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

                <div className="logo clickable" style={{ pointerEvents: 'auto', minWidth: '120px', position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
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
