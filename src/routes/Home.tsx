import { useState, useRef, useEffect } from 'react';
// import Lenis from '@studio-freight/lenis'; 
import { useScroll, useTransform, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CreativeToolbar from '../components/CreativeToolbar';
import ProjectModal from '../components/ProjectModal';
import RevealText from '../components/RevealText';
import { contentAPI, projectsAPI, type Project, type ProjectData } from '../lib/supabase';

// Helper component to fix Rule of Hooks (useTransform inside loop)
const ScrollyWord = ({ word, progress, start, end, style }: { word: string, progress: any, start: number, end: number, style?: any }) => {
    const opacity = useTransform(progress, [start, end], [0.1, 1]);
    return <motion.span style={{ ...style, opacity }}>{word}</motion.span>;
};

export default function Home() {
    const containerRef = useRef(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    // Data State
    const [heroTitle, setHeroTitle] = useState('figma • UI DESIGN • AI • WEB DESIGN');
    const [heroDesc, setHeroDesc] = useState('Loading description...');
    const [storyText, setStoryText] = useState('Experience designing products for ambitious companies');
    const [projects, setProjects] = useState<Project[]>([]);

    // Refs for Sticky Sections
    const heroRef = useRef(null);
    const storyRef = useRef(null);

    useEffect(() => {
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

        // Load Projects - Limited to 4 for Home
        const projs = await projectsAPI.getAll();
        setProjects(projs.slice(0, 4));
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

    const [activeProjectIndex, setActiveProjectIndex] = useState(0);

    const handleCarouselScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft } = scrollContainerRef.current;
            const scrollAmount = (window.innerWidth * (isMobile ? 0.85 : 0.55)) + (isMobile ? 15 : 50);
            const index = Math.round(scrollLeft / scrollAmount);
            setActiveProjectIndex(index);
        }
    };

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = (window.innerWidth * (isMobile ? 0.85 : 0.55)) + (isMobile ? 15 : 50);
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    // Modal State
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (project: any) => {
        // Adapt DB project to Modal ProjectData if needed
        const modalProject = {
            title: project.title,
            image_url: project.image_url,
            img: project.image_url,
            tags: project.tags || [],
            gallery_images: project.gallery_images || [],
            gallery: project.gallery_images || [],
            description: project.description,
            type: project.tags?.[0] || 'Project',
            year: project.year || (project.created_at ? new Date(project.created_at).getFullYear().toString() : '2024'),
            live_url: project.live_url,
            button_text: project.button_text
        } as any as ProjectData;
        setSelectedProject(modalProject);
        setIsModalOpen(true);
    };


    // Lenis Disabled for stability check
    /*
    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            smoothWheel: true,
        });
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);
    */

    // --- HERO ANIMATIONS ---
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Title Slides: 100% visible from start. Scrolls horizontally.
    // Ensure it stops exactly when the text ends. 
    // We use a container width of 90vw (5% padding each side).
    const heroTextX = useTransform(heroProgress, [0, 0.6], ['0px', 'calc(90vw - 100%)']);

    // Description: Starts at 0.45
    const descriptionText = heroDesc.split(" ");

    // --- STORYTELLING ANIMATIONS ---
    const storyWords = storyText.split(" ");

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            {!isMobile && <CreativeToolbar />}
            <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* HERO SECTION - Sticky Scrollytelling */}
            <section ref={heroRef} className="hero-section" style={{ height: '300vh', position: 'relative' }}>
                <div className="sticky-wrapper" style={{
                    position: 'sticky', top: 0, height: '100vh',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'flex-start', // Changed to flex-start for easier scroll calculation
                    paddingRight: '5%', paddingLeft: '5%'
                }}>

                    {/* Main Title - Horizontal Scroll Animation */}
                    <motion.div
                        initial={{ opacity: 1 }}
                        style={{
                            width: 'max-content',
                            textAlign: 'left',
                            x: isMobile ? 0 : heroTextX, // No scroll transform on mobile, just wrap
                            opacity: 1,
                            marginBottom: '40px',
                            whiteSpace: isMobile ? 'normal' : 'nowrap'
                        }}
                    >
                        <h1 className="hero-title" style={{ fontSize: isMobile ? '10vw' : '11vw', lineHeight: '0.9', margin: 0, textAlign: isMobile ? 'center' : 'left' }}>
                            {heroTitle}
                        </h1>
                    </motion.div>

                    {/* Description - Narrower container for more line breaks */}
                    <div style={{ maxWidth: isMobile ? '90%' : '450px', width: '100%', alignSelf: isMobile ? 'center' : 'flex-end', textAlign: isMobile ? 'center' : 'right' }}>
                        <p style={{ fontSize: 'clamp(14px, 2vw, 20px)', lineHeight: '1.6', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', display: 'flex', flexWrap: 'wrap', justifyContent: isMobile ? 'center' : 'flex-end', gap: '6px' }}>
                            {isMobile ? heroDesc : descriptionText.map((word, i) => {
                                // Start after title is done (0.45)
                                const step = 0.45 / descriptionText.length;
                                const start = 0.5 + (i * step);
                                const end = start + step;

                                return (
                                    <ScrollyWord
                                        key={`hero-${i}`}
                                        word={word}
                                        progress={heroProgress}
                                        start={start}
                                        end={end}
                                    />
                                );
                            })}
                        </p>
                    </div>

                </div>
            </section>

            {/* Gap removed */}

            {/* SECTION 2: STORYTELLING - Sticky Scrollytelling (Same Effect) */}
            <section ref={storyRef} className="story-section" style={{ height: '300vh', position: 'relative', background: 'var(--bg-color)', zIndex: 10 }}>
                <div className="sticky-wrapper" style={{
                    position: 'sticky', top: 0, height: '100vh',
                    display: 'flex', alignItems: 'start', justifyContent: 'center',
                    paddingTop: '20vh'
                }}>
                    <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '15px' }}>
                            {storyWords.map((word, i) => {
                                // Map whole duration (0.1 -> 0.9)
                                const step = 0.8 / storyWords.length;
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
                    </div>
                </div>
            </section>

            {/* SECTION 3: PORTFOLIO */}
            <section id="portfolio" className="portfolio-section" style={{ padding: '100px 0', background: 'var(--bg-color)', position: 'relative', zIndex: 10 }}>
                <div className="container" style={{ maxWidth: '100%', padding: '0 5%', position: 'relative' }}>
                    <div className="portfolio-title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                        <RevealText><h2 style={{ fontSize: '80px', margin: 0 }}>PORTFOLIO</h2></RevealText>
                        <Link to="/projects" className="clickable" style={{ fontSize: '20px', textDecoration: 'none', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span className="view-all-text">VIEW ALL</span> <span style={{ fontSize: '24px' }}>→</span>
                        </Link>
                    </div>

                    {/* Navigation Buttons for Carousel (Desktop Only) */}
                    {!isMobile && (
                        <>
                            <button onClick={() => scroll('left')} className="clickable" style={{
                                position: 'absolute', top: '480px', left: '12%', transform: 'translateY(-50%)',
                                zIndex: 20, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '50%', width: '60px', height: '60px',
                                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(5px)'
                            }}>
                                <ChevronLeft size={30} />
                            </button>
                            <button onClick={() => scroll('right')} className="clickable" style={{
                                position: 'absolute', top: '480px', right: '12%', transform: 'translateY(-50%)',
                                zIndex: 20, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '50%', width: '60px', height: '60px',
                                color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(5px)'
                            }}>
                                <ChevronRight size={30} />
                            </button>
                        </>
                    )}

                    <div className="horizontal-scroll-container" ref={scrollContainerRef} onScroll={handleCarouselScroll}>
                        {projects.map((item, i) => (
                            <div key={i} className="home-project-card clickable" onClick={() => openModal(item)}>
                                <div style={{
                                    width: '100%', height: '500px', overflow: 'hidden',
                                    borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)',
                                    padding: '15px', background: 'rgba(255,255,255,0.03)'
                                }}>
                                    <div style={{ width: '100%', height: '100%', overflow: 'hidden', borderRadius: 'var(--radius-sm)' }}>
                                        <img src={item.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </div>
                                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <RevealText><h3 className="project-title" style={{ fontSize: '24px', color: 'var(--accent-color)', margin: 0 }}>{item.title}</h3></RevealText>
                                    <RevealText>
                                        <div className="learn-more-text" style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold' }}>
                                            Learn More <span>→</span>
                                        </div>
                                    </RevealText>
                                </div>
                                <div className="project-tags-container" style={{ display: 'flex', gap: '15px' }}>
                                    {item.tags?.map(tag => (
                                        <RevealText key={tag}>
                                            <div className="project-tag" style={{
                                                padding: '10px 20px', border: '1px solid var(--border-color)',
                                                borderRadius: '50px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px'
                                            }}>
                                                {tag}
                                            </div>
                                        </RevealText>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Carousel Dots (especially for Mobile) */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '40px' }}>
                        {projects.map((_, i) => (
                            <div
                                key={i}
                                className="clickable"
                                onClick={() => {
                                    if (scrollContainerRef.current) {
                                        const scrollAmount = (window.innerWidth * (isMobile ? 0.85 : 0.55)) + (isMobile ? 15 : 50);
                                        scrollContainerRef.current.scrollTo({
                                            left: i * scrollAmount,
                                            behavior: 'smooth'
                                        });
                                    }
                                }}
                                style={{
                                    width: '10px', height: '10px',
                                    borderRadius: '50%',
                                    background: 'var(--text-color)',
                                    opacity: activeProjectIndex === i ? 1 : 0.3,
                                    transition: 'all 0.3s',
                                    transform: activeProjectIndex === i ? 'scale(1.2)' : 'scale(1)'
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
                            <a href="mailto:vinisiqueiradecampos@gmail.com" className="clickable footer-email-link" style={{
                                fontSize: 'clamp(32px, 5vw, 64px)',
                                fontWeight: 900,
                                color: 'var(--accent-color)',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-display)',
                                lineBreak: 'anywhere'
                            }}>
                                vinisiqueiradecampos@gmail.com
                            </a>
                        </RevealText>

                        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '20px' }}>
                            <RevealText><a href="#" className="clickable footer-sub-link">LINKEDIN ↗</a></RevealText>
                            <RevealText><a href="#" className="clickable footer-sub-link">INSTAGRAM ↗</a></RevealText>
                            <RevealText><a href="#" className="clickable footer-sub-link">+351 920 196 634</a></RevealText>
                        </div>
                    </div>
                </div>

                <div className="footer-credits" style={{ marginTop: '150px', opacity: 0.3, fontSize: '12px', letterSpacing: '2px', textAlign: 'center' }}>
                    VINICIUS CAMPOS &copy; 2026 • PORTUGAL
                </div>
            </section>
        </div>
    );
}
