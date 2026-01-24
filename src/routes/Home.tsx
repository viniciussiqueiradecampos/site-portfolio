import { useState, useRef, useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { useScroll, useTransform, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CreativeToolbar from '../components/CreativeToolbar';
import ProjectModal, { type ProjectData } from '../components/ProjectModal';
import RevealText from '../components/RevealText';
import { contentAPI, projectsAPI, type Project } from '../lib/supabase';

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
    }, []);

    const loadData = async () => {
        // Load Content
        const tTitle = await contentAPI.getByKey('hero.title');
        if (tTitle) setHeroTitle(tTitle.value);

        const tDesc = await contentAPI.getByKey('hero.description');
        if (tDesc) setHeroDesc(tDesc.value);

        const tStory = await contentAPI.getByKey('storytelling.main');
        if (tStory) setStoryText(tStory.value);

        // Load Projects
        const projs = await projectsAPI.getAll();
        setProjects(projs);
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

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = (window.innerWidth * 0.55) + 50;
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
        const modalProject: ProjectData = {
            title: project.title,
            img: project.image_url,
            tags: project.tags || [],
            // Add description/content if the modal supports it, using description from DB
            // Assuming Modal expects 'img', 'title', 'tags' mainly.
        };
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
    // Range [0, 0.35] must cover the full exit of the text before 0.4 (when description starts).
    // Start at 60% (off-center right), End at -100% (fully off-screen left or just past center) to ensure "last word" behavior.
    const heroTextX = useTransform(heroProgress, [0, 0.38], ['60%', '-100%']);

    // Description: Starts at 0.4
    const descriptionText = heroDesc.split(" ");

    // --- STORYTELLING ANIMATIONS ---
    const storyWords = storyText.split(" ");

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <CreativeToolbar />
            <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* HERO SECTION - Sticky Scrollytelling */}
            <section ref={heroRef} className="hero-section" style={{ height: '300vh', position: 'relative' }}>
                <div className="sticky-wrapper" style={{
                    position: 'sticky', top: 0, height: '100vh',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    justifyContent: 'center', alignItems: 'flex-end', // Flexbox to prevent overlap
                    paddingRight: '5%', paddingLeft: '5%'
                }}>

                    {/* Main Title - Horizontal Scroll Animation (Previous Style) */}
                    <motion.div
                        style={{
                            width: '100%',
                            textAlign: 'right',
                            x: isMobile ? 0 : heroTextX, // No scroll on mobile
                            opacity: 1, // Always visible
                            marginBottom: '80px'
                        }}
                    >
                        <h1 className="hero-title" style={{ fontSize: '11vw', lineHeight: '0.9', margin: 0, whiteSpace: 'nowrap' }}>
                            {heroTitle}
                        </h1>
                    </motion.div>

                    {/* Description - Appears below Title word by word */}
                    <div style={{ maxWidth: '600px', textAlign: 'right' }}>
                        <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'var(--text-muted)', fontFamily: 'var(--font-body)', display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', gap: '6px' }}>
                            {descriptionText.map((word, i) => {
                                // Start after title is done (0.4)
                                const step = 0.5 / descriptionText.length;
                                const start = 0.4 + (i * step);
                                const end = start + step;
                                const opacity = useTransform(heroProgress, [start, end], [0.1, 1]);

                                return (
                                    <motion.span key={i} style={{ opacity }}>
                                        {word}
                                    </motion.span>
                                )
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
                                const opacity = useTransform(storyProgress, [start, end], [0.1, 1]);

                                return (
                                    <motion.span
                                        key={i}
                                        style={{
                                            opacity,
                                            fontSize: 'clamp(40px, 5vw, 90px)',
                                            fontWeight: 900,
                                            fontFamily: 'var(--font-display)',
                                            lineHeight: 1.1
                                        }}
                                    >
                                        {word}
                                    </motion.span>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3: PORTFOLIO */}
            <section id="portfolio" className="portfolio-section" style={{ padding: '100px 0', background: 'var(--bg-color)', position: 'relative', zIndex: 10 }}>
                <div className="container" style={{ maxWidth: '100%', padding: '0 5%', position: 'relative' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '80px', paddingBottom: '20px', borderBottom: '1px solid var(--border-color)' }}>
                        <RevealText><h2 style={{ fontSize: '80px', margin: 0 }}>PORTFOLIO</h2></RevealText>
                        <Link to="/projects" className="clickable" style={{ fontSize: '20px', textDecoration: 'none', color: 'var(--text-color)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            VIEW ALL <span style={{ fontSize: '24px' }}>→</span>
                        </Link>
                    </div>

                    {/* Navigation Buttons for Carousel */}
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

                    <div className="horizontal-scroll-container" ref={scrollContainerRef}>
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
                                    <RevealText><h3 style={{ fontSize: '24px', color: 'var(--accent-color)', margin: 0 }}>{item.title}</h3></RevealText>
                                    <RevealText>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '24px', fontWeight: 'bold' }}>
                                            Learn More <span>→</span>
                                        </div>
                                    </RevealText>
                                </div>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    {item.tags?.map(tag => (
                                        <RevealText key={tag}>
                                            <div style={{
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
                                KEEP IN TOUCH •
                            </span>
                        ))}
                    </motion.div>
                </div>
                <div className="container" style={{ marginTop: '100px', paddingBottom: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div className="contact-links" style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontFamily: 'var(--font-body)' }}>
                        <RevealText><a href="#" className="clickable" style={{ fontSize: '24px', color: 'var(--text-color)', textDecoration: 'none' }}>Linkedin ↗</a></RevealText>
                        <RevealText><a href="mailto:email@example.com" className="clickable" style={{ fontSize: '40px', fontWeight: 'bold', color: 'var(--accent-color)', textDecoration: 'none' }}>vinisiqueiradecampos@gmail.com</a></RevealText>
                        <RevealText><a href="#" className="clickable" style={{ fontSize: '24px', color: 'var(--text-color)', textDecoration: 'none' }}>+351 920 196 634</a></RevealText>
                    </div>
                </div>
            </section>
        </div>
    );
}
