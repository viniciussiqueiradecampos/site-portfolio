import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProjectModal from '../components/ProjectModal';
import RevealText from '../components/RevealText';
import DriftWall from '../components/DriftWall';
import { contentAPI, projectsAPI, type Project } from '../lib/supabase';
import { trackPageView, trackProjectClick } from '../lib/analytics';
import { parseTranslatable } from '../lib/i18n-utils';


export default function Home() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Data State
    const [heroTitle, setHeroTitle] = useState('figma • UI DESIGN • AI • WEB DESIGN');
    const [heroDesc, setHeroDesc] = useState(' ');
    const [storyText, setStoryText] = useState('Experience designing products for ambitious companies');

    const formatWithLineBreaks = (text: string) => {
        if (!text) return text;
        const regex = /(8\s*(?:years|anos|YEARS|ANOS))/gi;
        if (regex.test(text)) {
            const parts = text.split(regex);
            return parts.map((part, index) => {
                if (regex.test(part)) {
                    return (
                        <React.Fragment key={index}>
                            <br />
                            <span style={{ display: 'inline-block' }}>{part}</span>
                        </React.Fragment>
                    );
                }
                return part;
            });
        }
        return text;
    };

    const [storytellingVisible, setStorytellingVisible] = useState(true);
    const [pitchData, setPitchData] = useState({
        description: '',
        btnText: "LET'S WORK TOGETHER",
        btnLink: "#contact"
    });
    const [projects, setProjects] = useState<Project[]>([]);
    const [socials, setSocials] = useState({
        linkedin: '#',
        instagram: '#',
        footerEmail: 'vinisiqueiradecampos@gmail.com',
        phone: '+351 920 196 634'
    });
    const [footerText, setFooterText] = useState('VINICIUS CAMPOS &copy; 2026 • PORTUGAL');

    // Refs for Sticky Sections
    const heroRef = useRef(null);
    const storyRef = useRef(null);

    // Initial load and hash scroll handling
    useEffect(() => {
        trackPageView('/');
        loadData();
        document.title = "Vinicius Campos | Graphic and Digital Designer Senior";
    }, [i18n.language]);

    // Handle hash scroll after projects (layout) are loaded
    useEffect(() => {
        if (window.location.hash === '#contact' && projects.length > 0) {
            // Slight delay to ensure DOM render after state update
            setTimeout(() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 800);
        }
    }, [window.location.hash, projects]);

    const loadData = async () => {
        const lang = i18n.language;

        // Fetch all projects and content in parallel
        const [allContent, projs] = await Promise.all([
            contentAPI.getAll(),
            projectsAPI.getAll()
        ]);

        // Helper to find value by key in the fetched content array
        const getV = (key: string) => allContent.find(c => c.key === key)?.value;

        // Apply content
        const title = getV('hero.title');
        if (title) setHeroTitle(parseTranslatable(title, lang));

        const desc = getV('hero.description');
        if (desc) setHeroDesc(parseTranslatable(desc, lang));

        const story = getV('storytelling.main');
        if (story) setStoryText(parseTranslatable(story, lang));

        const storyVisible = getV('storytelling.visible');
        setStorytellingVisible(storyVisible !== 'false');

        setPitchData({
            description: parseTranslatable(getV('storytelling.description') || '', lang),
            btnText: parseTranslatable(getV('storytelling.button_text') || "LET'S WORK TOGETHER", lang),
            btnLink: getV('storytelling.button_link') || "#contact"
        });

        // Load Projects - Limited to Home display
        setProjects(projs.slice(0, 8).map(p => ({
            ...p,
            title: parseTranslatable(p.title, lang),
            description: parseTranslatable(p.description || '', lang),
            summary: parseTranslatable(p.summary || '', lang),
            short_description: parseTranslatable(p.short_description || '', lang)
        })));

        // Load Socials & Footer
        setSocials({
            linkedin: getV('social.linkedin') || '#',
            instagram: getV('social.instagram') || '#',
            footerEmail: getV('social.footer_email') || 'vinisiqueiradecampos@gmail.com',
            phone: getV('social.phone') || '+351 920 196 634'
        });

        const ft = getV('general.footer_text');
        if (ft) setFooterText(parseTranslatable(ft, lang));
    };

    // Hero Section references and scrolling were simplified

    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

    const handleCarouselScroll = () => {
        if (!scrollContainerRef.current) return;

        // Use requestAnimationFrame to avoid blocking the main thread
        requestAnimationFrame(() => {
            if (!scrollContainerRef.current) return;
            const { scrollLeft } = scrollContainerRef.current;
            const cards = scrollContainerRef.current.children;
            const gap = isMobile ? 20 : 50;

            let cumulativeWidth = 0;
            let index = 0;

            for (let i = 0; i < cards.length; i++) {
                const cardWidth = (cards[i] as HTMLElement).clientWidth;
                if (scrollLeft < cumulativeWidth + cardWidth / 2) {
                    index = i;
                    break;
                }
                cumulativeWidth += cardWidth + gap;
                index = i;
            }
            if (index !== currentProjectIndex) {
                setCurrentProjectIndex(index);
            }
        });
    };

    const scrollToProject = (index: number) => {
        if (scrollContainerRef.current) {
            const cards = Array.from(scrollContainerRef.current.querySelectorAll('.home-project-card'));
            const gap = isMobile ? 20 : 50;

            let targetScroll = 0;
            for (let i = 0; i < index; i++) {
                targetScroll += cards[i].clientWidth + gap;
            }

            scrollContainerRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
            setCurrentProjectIndex(index);
        }
    };

    const nextProject = () => {
        const nextIndex = (currentProjectIndex + 1) % projects.length;
        scrollToProject(nextIndex);
    };

    const prevProject = () => {
        const prevIndex = (currentProjectIndex - 1 + projects.length) % projects.length;
        scrollToProject(prevIndex);
    };

    // Auto-scroll effect
    useEffect(() => {
        if (projects.length === 0) return;
        const interval = setInterval(() => {
            const nextIndex = (currentProjectIndex + 1) % projects.length;
            scrollToProject(nextIndex);
        }, 7000);

        return () => clearInterval(interval);
    }, [currentProjectIndex, projects.length]);

    // Modal State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // --- RESPONSIVE --- (Listeners already set up above)

    // Mouse Drag to Scroll
    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftValue = useRef(0);

    useEffect(() => {
        const slider = scrollContainerRef.current;
        if (!slider || isMobile) return;

        const handleMouseDown = (e: MouseEvent) => {
            isDragging.current = true;
            slider.style.cursor = 'grabbing';
            slider.style.userSelect = 'none';
            startX.current = e.pageX - slider.offsetLeft;
            scrollLeftValue.current = slider.scrollLeft;
        };

        const handleMouseLeave = () => {
            isDragging.current = false;
            slider.style.cursor = 'grab';
        };

        const handleMouseUp = () => {
            isDragging.current = false;
            slider.style.cursor = 'grab';
            slider.style.removeProperty('user-select');
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging.current) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX.current) * 1.5; // Scroll speed
            slider.scrollLeft = scrollLeftValue.current - walk;
        };

        slider.style.cursor = 'grab';
        slider.addEventListener('mousedown', handleMouseDown);
        slider.addEventListener('mouseleave', handleMouseLeave);
        slider.addEventListener('mouseup', handleMouseUp);
        slider.addEventListener('mousemove', handleMouseMove);

        return () => {
            slider.removeEventListener('mousedown', handleMouseDown);
            slider.removeEventListener('mouseleave', handleMouseLeave);
            slider.removeEventListener('mouseup', handleMouseUp);
            slider.removeEventListener('mousemove', handleMouseMove);
        };
    }, [isMobile]);

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* HERO SECTION - Drift Wall Left, Text Right */}
            <section ref={heroRef} className="hero-section" style={{
                height: isMobile ? 'auto' : '100vh',
                minHeight: isMobile ? '100vh' : 'auto',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                padding: isMobile ? '100px 20px 60px' : '0 5%'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '1400px',
                    margin: '0 auto',
                    height: '100%',
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
                    gap: isMobile ? '32px' : '60px',
                    alignItems: 'center'
                }}>
                    {/* Left Column: Drift Wall */}
                    <div style={{
                        height: isMobile ? '45vh' : 'calc(100vh - 120px)',
                        width: '100%',
                        position: 'relative',
                        borderRadius: '24px',
                        overflow: 'hidden'
                    }}>
                        <DriftWall
                            projects={projects}
                            columns={3}
                            speed={45}
                            rotateAngle={-45}
                            onProjectClick={(proj) => {
                                if (proj.slug || proj.id) {
                                    navigate(`/project/${proj.slug || proj.id}`);
                                } else {
                                    setSelectedProject(proj);
                                    setIsModalOpen(true);
                                }
                            }}
                        />
                    </div>

                    {/* Right Column: Hero Text */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: isMobile ? 'center' : 'flex-start',
                        textAlign: isMobile ? 'center' : 'left',
                        gap: isMobile ? '16px' : '24px',
                        paddingRight: isMobile ? '0' : '20px'
                    }}>
                        {/* Main Title */}
                        <motion.h1
                            ref={titleRef}
                            className="hero-title"
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
                            style={{
                                fontSize: isMobile ? 'clamp(26px, 7vw, 36px)' : 'clamp(32px, 4.2vw, 58px)',
                                lineHeight: '1.15',
                                margin: 0,
                                wordBreak: isMobile ? 'break-word' : 'normal',
                                maxWidth: '650px'
                            }}
                        >
                            {formatWithLineBreaks(heroTitle)}
                        </motion.h1>

                        {/* Description below */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                            style={{
                                fontSize: isMobile ? '14px' : 'clamp(14px, 1.1vw, 17px)',
                                lineHeight: '1.7',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-body)',
                                maxWidth: '520px'
                            }}
                        >
                            {formatWithLineBreaks(heroDesc)}
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.45 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                flexWrap: 'wrap',
                                marginTop: '8px',
                                justifyContent: isMobile ? 'center' : 'flex-start'
                            }}
                        >
                            <a
                                href="#portfolio"
                                className="clickable"
                                style={{
                                    padding: isMobile ? '12px 28px' : '16px 36px',
                                    backgroundColor: 'var(--text-color)',
                                    color: 'var(--bg-color)',
                                    borderRadius: '100px',
                                    fontSize: isMobile ? '12px' : '14px',
                                    fontWeight: 800,
                                    fontFamily: 'var(--font-display)',
                                    textDecoration: 'none',
                                    letterSpacing: '0.5px',
                                    transition: 'transform 0.3s ease, opacity 0.3s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                VIEW PORTFOLIO ↓
                            </a>
                            <Link
                                to="/cv"
                                className="clickable"
                                style={{
                                    padding: isMobile ? '12px 28px' : '16px 36px',
                                    backgroundColor: 'transparent',
                                    color: 'var(--text-color)',
                                    border: '1.5px solid var(--text-color)',
                                    borderRadius: '100px',
                                    fontSize: isMobile ? '12px' : '14px',
                                    fontWeight: 800,
                                    fontFamily: 'var(--font-display)',
                                    textDecoration: 'none',
                                    letterSpacing: '0.5px',
                                    transition: 'all 0.3s ease',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                VIEW CV
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* SECTION 2: STORYTELLING */}
            {storytellingVisible && (
            <section ref={storyRef} className="story-section" style={{ padding: isMobile ? '40px 20px' : '140px 0', background: 'var(--bg-color)', zIndex: 10 }}>
                <div className="container" style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: isMobile ? '20px' : '40px'
                    }}>
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            style={{
                                maxWidth: isMobile ? '100%' : '800px',
                                margin: '0 auto',
                                fontSize: isMobile ? 'clamp(24px, 7vw, 36px)' : 'clamp(32px, 5vw, 64px)',
                                fontWeight: 800,
                                fontFamily: 'var(--font-display)',
                                lineHeight: 1.2,
                                textAlign: 'center',
                                color: 'var(--text-color)'
                            }}
                        >
                            {storyText}
                        </motion.div>

                        {/* FADE IN PITCH CONTENT */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            style={{
                                maxWidth: '600px',
                                margin: '0 auto'
                            }}
                        >
                                    <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                                        {pitchData.description}
                                    </p>
                                    <a href={pitchData.btnLink} className="clickable" style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '15px',
                                        padding: isMobile ? '14px 30px' : '18px 40px',
                                        border: '1px solid var(--accent-color)',
                                        borderRadius: '100px',
                                        color: 'var(--accent-color)',
                                        textDecoration: 'none',
                                        fontFamily: 'var(--font-display)',
                                        fontSize: isMobile ? '12px' : '14px',
                                        letterSpacing: '1px'
                                    }}>
                                        {pitchData.btnText} →
                                    </a>
                                </motion.div>
                    </div>
                </div>
            </section>
            )}


            {/* SECTION 3: PORTFOLIO */}
            <section id="portfolio" className="portfolio-section" style={{ padding: isMobile ? '20px 0 80px' : '60px 0 120px', background: 'var(--bg-color)', position: 'relative', zIndex: 10 }}>
                <div className="container" style={{ maxWidth: '100%', padding: '0 5%', position: 'relative' }}>
                    <div className="portfolio-title-row" style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'center' : 'flex-end',
                        marginBottom: isMobile ? '40px' : '80px',
                        paddingBottom: '20px',
                        borderBottom: isMobile ? 'none' : '1px solid var(--border-color)',
                        width: '100%',
                        gap: isMobile ? '20px' : '0'
                    }}>
                        <RevealText><h2 style={{ fontSize: isMobile ? 'clamp(40px, 8vw, 50px)' : 'clamp(40px, 8vw, 80px)', margin: 0, textAlign: isMobile ? 'center' : 'left' }}>{t('nav.portfolio')}</h2></RevealText>
                        <Link to="/projects" className="clickable view-all-btn" style={{
                            padding: '12px 35px',
                            background: 'var(--accent-color)',
                            color: 'var(--accent-contrast)',
                            borderRadius: '100px',
                            textDecoration: 'none',
                            fontSize: '12px',
                            fontWeight: '900',
                            fontFamily: 'var(--font-display)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: 'none',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            letterSpacing: '1px',
                            transition: 'all 0.3s ease'
                        }}>
                            {t('portfolio.view_all', 'VIEW ALL')} →
                        </Link>
                    </div>

                    {/* Scroll Container Wrapper for Arrow Centering */}
                    <div style={{ position: 'relative', width: '100%' }}>
                        <div className="horizontal-scroll-container" ref={scrollContainerRef} onScroll={handleCarouselScroll} style={{ paddingLeft: '0' }}>
                            {projects.map((item, i) => (
                                <motion.div
                                    key={i}
                                    className="home-project-card clickable"
                                    initial={{ opacity: 0, y: 30, filter: 'none' }}
                                    whileInView={{ opacity: 1, y: 0, filter: 'none' }}
                                    viewport={{ once: true, amount: 0.1, margin: "0px" }}
                                    transition={{ duration: 0.6, delay: (i % 3) * 0.1, ease: [0.16, 1, 0.3, 1] }}
                                    onClick={(e) => {
                                        if (isDragging.current) e.preventDefault();
                                        trackProjectClick(item.id, item.title);
                                        navigate(`/project/${item.slug || item.id}`);
                                    }}
                                    style={{
                                        width: isMobile ? '85vw' : '750px',
                                        marginLeft: '0px',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        display: 'block'
                                    }}
                                >
                                    <div className="project-image-wrapper" style={{
                                        width: '100%', height: isMobile ? '300px' : '480px', overflow: 'hidden',
                                        borderRadius: 'var(--radius-md)', border: 'none',
                                        padding: '0', background: 'transparent',
                                        position: 'relative'
                                    }}>
                                        <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'var(--radius-md)', position: 'relative' }}>
                                            <img src={item.image_url} alt={item.image_alt || item.title} loading={i === 0 ? "eager" : "lazy"} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    </div>
                                    <div style={{ width: '100%', marginTop: '25px' }}>
                                        <h3 className="project-title" style={{ fontSize: '28px', color: 'var(--accent-color)', margin: '0 0 10px 0', fontFamily: 'var(--font-display)', fontWeight: 800 }}>{item.title}</h3>
                                        <p style={{
                                            fontSize: '16px',
                                            color: 'var(--text-muted)',
                                            lineHeight: '1.6',
                                            margin: 0,
                                            display: isMobile ? 'block' : '-webkit-box',
                                            WebkitLineClamp: isMobile ? 'none' : 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: isMobile ? 'visible' : 'hidden',
                                            maxWidth: '700px'
                                        }}>
                                            {(item.summary || '').replace(/<[^>]*>?/gm, '')}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Navigation Arrows (Sides) - Centered with Image (400px height) */}
                        {!isMobile && (
                            <>
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); prevProject(); }}
                                    className="clickable"
                                    style={{
                                        position: 'absolute',
                                        left: '-30px',
                                        top: '240px',
                                        transform: 'translateY(-50%)',
                                        zIndex: 100,
                                        background: 'var(--surface-color)',
                                        backdropFilter: 'blur(15px)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-color)',
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    <ChevronLeft size={24} />
                                </button>

                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); nextProject(); }}
                                    className="clickable"
                                    style={{
                                        position: 'absolute',
                                        right: '-30px',
                                        top: '240px',
                                        transform: 'translateY(-50%)',
                                        zIndex: 100,
                                        background: 'var(--surface-color)',
                                        backdropFilter: 'blur(15px)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-color)',
                                        width: '60px',
                                        height: '60px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}

                        {/* Mobile Swipe Indicator Arrow */}
                        {isMobile && (
                            <motion.div
                                animate={{ x: [0, 10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                style={{
                                    position: 'absolute',
                                    right: '5px',
                                    top: '150px',
                                    zIndex: 100,
                                    background: 'var(--accent-color)',
                                    color: 'var(--accent-contrast)',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                                    pointerEvents: 'none'
                                }}
                            >
                                <ChevronRight size={20} />
                            </motion.div>
                        )}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <section className="footer-section" style={{ marginTop: '200px', paddingBottom: '100px', overflow: 'hidden' }}>
                <div className="ticker-wrapper" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '40px 0' }}>
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                        style={{ display: 'flex', whiteSpace: 'nowrap', gap: '50px' }}
                    >
                        {[...Array(10)].map((_, i) => (
                            <span key={i} style={{ fontSize: '120px', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'transparent', WebkitTextStroke: '2px var(--text-muted)' }}>
                                {t('nav.contact')} •
                            </span>
                        ))}
                    </motion.div>
                </div>
                <div id="contact" className="container" style={{ scrollMarginTop: '150px', marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div className="contact-links" style={{ display: 'flex', flexDirection: 'column', gap: '40px', fontFamily: 'var(--font-body)' }}>
                        <RevealText>
                            <a href={`mailto:${socials.footerEmail}`} className="clickable footer-email-link" style={{
                                fontSize: 'clamp(20px, 3.5vw, 40px)',
                                fontWeight: 600,
                                color: 'var(--accent-color)',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-display)',
                                lineBreak: 'anywhere'
                            }}>
                                {socials.footerEmail}
                            </a>
                        </RevealText>

                        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
                            <RevealText><a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="clickable footer-sub-link">LINKEDIN ↗</a></RevealText>
                            <RevealText><a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="clickable footer-sub-link">INSTAGRAM ↗</a></RevealText>
                            <RevealText><a href={`tel:${socials.phone}`} className="clickable footer-sub-link">{socials.phone}</a></RevealText>
                        </div>
                    </div>
                </div>

                <div className="footer-credits" style={{ marginTop: '150px', opacity: 0.3, fontSize: '12px', letterSpacing: '2px', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: footerText }} />
            </section>
        </div>
    );
}
