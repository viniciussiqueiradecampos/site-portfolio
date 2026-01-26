import { useState, useRef, useEffect } from 'react';
import { useScroll, useTransform, motion, AnimatePresence } from 'framer-motion';
import { Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProjectModal from '../components/ProjectModal';
import RevealText from '../components/RevealText';
import { contentAPI, projectsAPI, analyticsAPI, type Project } from '../lib/supabase';

// Helper component to fix Rule of Hooks (useTransform inside loop)
const ScrollyWord = ({ word, progress, start, end, style }: { word: string, progress: any, start: number, end: number, style?: any }) => {
    const opacity = useTransform(progress, [start, end], [0.1, 1]);
    return <motion.span style={{ ...style, opacity }}>{word}</motion.span>;
};

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [maxX, setMaxX] = useState(0);

    // Data State
    const [heroTitle, setHeroTitle] = useState('figma • UI DESIGN • AI • WEB DESIGN');
    const [heroDesc, setHeroDesc] = useState('Loading description...');
    const [storyText, setStoryText] = useState('Experience designing products for ambitious companies');
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

    useEffect(() => {
        analyticsAPI.logEvent({ event_type: 'page_view', page_path: '/' });
        loadData();
        // Handle hash scroll
        if (window.location.hash === '#contact') {
            setTimeout(() => {
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500);
        }
    }, []);

    const loadData = async () => {
        // Load Content
        const tTitle = await contentAPI.getByKey('hero.title');
        if (tTitle) setHeroTitle(tTitle.value);

        const tDesc = await contentAPI.getByKey('hero.description');
        if (tDesc) setHeroDesc(tDesc.value);

        const tStory = await contentAPI.getByKey('storytelling.main');
        if (tStory) setStoryText(tStory.value);

        const tPitchDesc = await contentAPI.getByKey('storytelling.description');
        const tPitchBtnText = await contentAPI.getByKey('storytelling.button_text');
        const tPitchBtnLink = await contentAPI.getByKey('storytelling.button_link');

        setPitchData({
            description: tPitchDesc?.value || '',
            btnText: tPitchBtnText?.value || "LET'S WORK TOGETHER",
            btnLink: tPitchBtnLink?.value || "#contact"
        });

        // Load Projects - Limited to 4 for Home
        const projs = await projectsAPI.getAll();
        setProjects(projs.slice(0, 4));

        // Load Socials & Footer
        const ln = await contentAPI.getByKey('social.linkedin');
        const ig = await contentAPI.getByKey('social.instagram');
        const em = await contentAPI.getByKey('social.footer_email');
        const ph = await contentAPI.getByKey('social.phone');
        const ft = await contentAPI.getByKey('general.footer_text');

        setSocials({
            linkedin: ln?.value || '#',
            instagram: ig?.value || '#',
            footerEmail: em?.value || 'vinisiqueiradecampos@gmail.com',
            phone: ph?.value || '+351 920 196 634'
        });
        if (ft) setFooterText(ft.value);
    };

    // Hero Section Scroll Progress
    const { scrollYProgress: heroProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end end"]
    });

    // Storytelling Section Scroll Progress
    const { scrollYProgress: storyProgress } = useScroll({
        target: storyRef,
        offset: ["start start", "end end"]
    });

    const [showPitch, setShowPitch] = useState(false);

    useEffect(() => {
        const unsubscribe = storyProgress.on("change", (latest) => {
            setShowPitch(latest > 0.8);
        });
        return () => unsubscribe();
    }, [storyProgress]);

    const [currentProjectIndex, setCurrentProjectIndex] = useState(0);

    const handleCarouselScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft } = scrollContainerRef.current;
            const cardWidth = isMobile ? window.innerWidth * 0.85 : window.innerWidth * 0.48;
            const gap = isMobile ? 20 : 50;
            const scrollAmount = cardWidth + gap;
            const calculatedIndex = Math.round(scrollLeft / scrollAmount);
            setCurrentProjectIndex(calculatedIndex);
        }
    };

    const scrollToProject = (index: number) => {
        if (scrollContainerRef.current) {
            const cardWidth = isMobile ? window.innerWidth * 0.85 : window.innerWidth * 0.48;
            const gap = isMobile ? 20 : 50;
            const scrollAmount = cardWidth + gap;
            scrollContainerRef.current.scrollTo({
                left: index * scrollAmount,
                behavior: 'smooth'
            });
            setCurrentProjectIndex(index);
        }
    };

    // Auto-scroll effect
    useEffect(() => {
        const interval = setInterval(() => {
            const nextIndex = (currentProjectIndex + 1) % projects.length;
            scrollToProject(nextIndex);
        }, 7000);

        return () => clearInterval(interval);
    }, [currentProjectIndex, projects.length]);

    // Modal State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (project: Project) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    // --- RESPONSIVE ---
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Calculate Dynamic Marquee Translation
    useEffect(() => {
        const calculateMaxX = () => {
            if (titleRef.current) {
                const titleWidth = titleRef.current.scrollWidth;
                const windowWidth = window.innerWidth;
                const padding = windowWidth * 0.1; // 5% each side
                const visibleWidth = windowWidth - padding;

                if (titleWidth > visibleWidth) {
                    // Move the title left until its end aligns with the right padding
                    setMaxX(-(titleWidth - visibleWidth));
                } else {
                    setMaxX(0);
                }
            }
        };

        // Initial calculation with a slight delay to ensure fonts/layout are ready
        const timer = setTimeout(calculateMaxX, 100);
        window.addEventListener('resize', calculateMaxX);
        return () => {
            clearTimeout(timer);
            window.removeEventListener('resize', calculateMaxX);
        };
    }, [heroTitle, isMobile]);

    // Marquee scrolls left dynamically based on content width
    const heroTextX = useTransform(heroProgress, [0, 0.7], [0, isMobile ? 0 : maxX]);
    const descriptionText = heroDesc.split(" ");
    const storyWords = storyText.split(" ");

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* HERO SECTION - Sticky Scrollytelling */}
            <section ref={heroRef} className="hero-section" style={{ height: '300vh', position: 'relative' }}>
                <div className="sticky-wrapper" style={{
                    position: 'sticky', top: 0, height: '100vh',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'flex-start',
                    paddingRight: '5%', paddingLeft: '5%'
                }}>

                    {/* Main Title - Horizontal Scroll Animation */}
                    <motion.div
                        initial={{ opacity: 1 }}
                        style={{
                            width: 'max-content',
                            textAlign: 'left',
                            x: isMobile ? 0 : heroTextX,
                            opacity: 1,
                            marginBottom: isMobile ? '20px' : '40px',
                            whiteSpace: isMobile ? 'normal' : 'nowrap',
                            maxWidth: isMobile ? '100%' : 'none'
                        }}
                    >
                        <h1 ref={titleRef} className="hero-title" style={{
                            fontSize: isMobile ? 'clamp(32px, 12vw, 42px)' : '11vw',
                            lineHeight: '0.9',
                            margin: 0,
                            textAlign: isMobile ? 'center' : 'left',
                            wordBreak: isMobile ? 'break-word' : 'normal'
                        }}>
                            {heroTitle}
                        </h1>
                    </motion.div>

                    {/* Description */}
                    <div style={{
                        maxWidth: isMobile ? '100%' : '450px',
                        width: '100%',
                        alignSelf: isMobile ? 'center' : 'flex-end',
                        textAlign: isMobile ? 'center' : 'right',
                        marginTop: isMobile ? '20px' : '0'
                    }}>
                        <p style={{
                            fontSize: isMobile ? '16px' : 'clamp(14px, 2vw, 20px)',
                            lineHeight: '1.6',
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-body)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: isMobile ? 'center' : 'flex-end',
                            gap: '6px'
                        }}>
                            {isMobile ? heroDesc : descriptionText.map((word, i) => {
                                const step = 0.45 / descriptionText.length;
                                const start = 0.5 + (i * step);
                                const end = start + step;
                                return <ScrollyWord key={`hero-${i}`} word={word} progress={heroProgress} start={start} end={end} />;
                            })}
                        </p>
                    </div>

                </div>
            </section>

            {/* SECTION 2: STORYTELLING */}
            <section ref={storyRef} className="story-section" style={{ height: '350vh', position: 'relative', background: 'var(--bg-color)', zIndex: 10 }}>
                <div className="sticky-wrapper" style={{
                    position: 'sticky', top: 'var(--header-height)', height: 'calc(100vh - var(--header-height))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: isMobile ? '0 20px' : '0'
                }}>
                    <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                            gap: '15px',
                            transition: 'all 0.5s ease',
                            opacity: showPitch ? 1 : 1, // Keep fully visible even when pitch appears
                            transform: `translateY(${showPitch ? '-20px' : '0'})`
                        }}>
                            {storyWords.map((word, i) => {
                                const step = 0.6 / storyWords.length;
                                const start = 0.1 + (i * step);
                                const end = start + step;
                                return (
                                    <ScrollyWord
                                        key={`story-${i}`}
                                        word={word}
                                        progress={storyProgress}
                                        start={start}
                                        end={end}
                                        style={{
                                            fontSize: 'clamp(40px, 5vw, 90px)',
                                            fontWeight: 900,
                                            fontFamily: 'var(--font-display)',
                                            lineHeight: 1.1
                                        }}
                                    />
                                );
                            })}
                        </div>

                        {/* FADE IN PITCH CONTENT - DELAYED UNTIL SCROLLY WORDS FINISH */}
                        <AnimatePresence>
                            {showPitch && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 30 }}
                                    transition={{ duration: 0.8, ease: "easeOut" }}
                                    style={{
                                        marginTop: '40px',
                                        paddingBottom: '120px' // Margin of 120px to portfolio
                                    }}
                                >
                                    <p style={{ fontSize: '20px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto 40px', lineHeight: 1.6 }}>
                                        {pitchData.description}
                                    </p>
                                    <a href={pitchData.btnLink} className="clickable" style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '15px',
                                        padding: '18px 40px',
                                        border: '1px solid var(--accent-color)',
                                        borderRadius: '100px',
                                        color: 'var(--accent-color)',
                                        textDecoration: 'none',
                                        fontFamily: 'var(--font-display)',
                                        fontSize: '14px',
                                        letterSpacing: '2px'
                                    }}>
                                        {pitchData.btnText} →
                                    </a>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </section>

            {/* SECTION 3: PORTFOLIO */}
            <section id="portfolio" className="portfolio-section" style={{ padding: '60px 0 120px', background: 'var(--bg-color)', position: 'relative', zIndex: 10 }}>
                <div className="container" style={{ maxWidth: '100%', padding: '0 5%', position: 'relative' }}>
                    <div className="portfolio-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)', width: '100%' }}>
                        <RevealText><h2 style={{ fontSize: 'clamp(40px, 8vw, 80px)', margin: 0 }}>PORTFOLIO</h2></RevealText>
                        <Link to="/projects" className="clickable" style={{ fontSize: '20px', textDecoration: 'none', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="view-all-text">VIEW ALL</span> <span style={{ fontSize: '24px' }}>→</span>
                        </Link>
                    </div>

                    <div className="horizontal-scroll-container" ref={scrollContainerRef} onScroll={handleCarouselScroll} style={{ paddingLeft: '0' }}>
                        {projects.map((item, i) => (
                            <div
                                key={i}
                                className="home-project-card clickable"
                                onClick={() => openModal(item)}
                                style={{
                                    marginLeft: i === 0 ? '0px' : '0px' // Initial state, will adjust if needed
                                }}
                            >
                                <div className="project-image-wrapper" style={{
                                    width: '100%', height: '400px', overflow: 'hidden',
                                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                                    padding: '15px', background: 'rgba(255,255,255,0.03)',
                                    position: 'relative'
                                }}>
                                    <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'var(--radius-sm)', position: 'relative' }}>
                                        <img src={item.image_url} alt={item.image_alt || item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                                        {/* HOVER OVERLAY WITH EYE ICON */}
                                        <div className="card-hover-overlay" style={{
                                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                            gap: '12px', opacity: 0, transition: '0.3s ease'
                                        }}>
                                            <div style={{ padding: '20px', background: '#fff', borderRadius: '50%', color: '#000' }}>
                                                <Eye size={32} />
                                            </div>
                                            <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px', fontFamily: 'var(--font-display)' }}>VIEW PROJECT</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap', marginTop: '20px' }}>
                                    <div style={{ flex: 1, minWidth: '200px' }}>
                                        <RevealText><h3 className="project-title" style={{ fontSize: '24px', color: 'var(--accent-color)', margin: '0 0 10px 0' }}>{item.title}</h3></RevealText>
                                        <div className="project-tags-container" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                            {item.tags?.map(tag => (
                                                <RevealText key={tag}>
                                                    <div className="project-tag" style={{
                                                        padding: '8px 16px', border: '1px solid var(--border-color)',
                                                        borderRadius: '50px', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px'
                                                    }}>
                                                        {tag}
                                                    </div>
                                                </RevealText>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <RevealText>
                                            <div style={{
                                                padding: '12px 32px',
                                                background: '#fff',
                                                border: '1px solid #ddd',
                                                borderRadius: '100px',
                                                fontSize: '11px',
                                                fontWeight: '900',
                                                color: '#000',
                                                letterSpacing: '1px',
                                                textTransform: 'uppercase',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px',
                                                boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                                            }} className="learn-more-btn-pill">
                                                LEARN MORE →
                                            </div>
                                        </RevealText>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Dots */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '40px' }}>
                        {projects.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => scrollToProject(idx)}
                                className="clickable"
                                style={{
                                    width: currentProjectIndex === idx ? '32px' : '12px',
                                    height: '12px',
                                    borderRadius: '100px',
                                    background: currentProjectIndex === idx ? 'var(--accent-color)' : 'var(--border-color)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease'
                                }}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <section id="contact" className="footer-section" style={{ marginTop: '200px', paddingBottom: '100px', overflow: 'hidden' }}>
                <div className="ticker-wrapper" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '40px 0' }}>
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                        style={{ display: 'flex', whiteSpace: 'nowrap', gap: '50px' }}
                    >
                        {[...Array(10)].map((_, i) => (
                            <span key={i} style={{ fontSize: '120px', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'transparent', WebkitTextStroke: '2px var(--text-muted)' }}>
                                KEEP IN TOUCH •
                            </span>
                        ))}
                    </motion.div>
                </div>
                <div className="container" style={{ marginTop: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
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
