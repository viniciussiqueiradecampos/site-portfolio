import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ChevronDown, Download, ArrowRight, Maximize2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { projectsAPI, type Project } from '../lib/supabase';
import { parseTranslatable } from '../lib/i18n-utils';

// Helper to clean Word/Office artifacts from HTML
const cleanWordHTML = (html: string) => {
    if (!html) return '';
    return html
        .replace(/class=["']?Mso[^"']*["']?/gi, '')
        .replace(/lang=["']?[a-zA-Z-]+["']?/gi, '')
        .replace(/style=["']?[^"']*["']?/gi, '')
        .replace(/<o:p>.*?<\/o:p>/gi, '')
        .replace(/<!--[\s\S]*?-->/g, '');
};

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        {children}
    </motion.div>
);

const isVideoUrl = (url: string) => {
    if (!url) return false;
    // Standard extensions or explicitly containing 'video' in the path/query
    return /\.(mp4|webm|ogg|mov|avi|m4v|quicktime)($|\?)/i.test(url) || url.toLowerCase().includes('video_');
};

console.log('🚀 ProjectPage component initialized - Build: 2026-02-19-15-55');

const HighlightItem = ({ section, idx, mutedColor }: { section: any, idx: number, mutedColor: string }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const textLimit = 300;
    const shouldTruncate = section.text && section.text.length > textLimit;

    const mediaStyle: React.CSSProperties = {
        width: '100%',
        height: 'auto',
        borderRadius: '12px',
        display: 'block'
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
            gap: '80px',
            alignItems: 'center',
            flexWrap: 'wrap'
        }}>
            {/* Media Part (70%) */}
            <div style={{ flex: '1 1 65%', minWidth: '300px' }}>
                <Reveal>
                    <div style={{
                        borderRadius: '12px',
                        overflow: 'hidden',
                        height: 'auto',
                        background: 'transparent',
                        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.06)'
                    }}>
                        {section.image && isVideoUrl(section.image) ? (
                            <video
                                src={section.image}
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={mediaStyle}
                            />
                        ) : (
                            <img src={section.image} alt={section.title} style={mediaStyle} />
                        )}
                    </div>
                </Reveal>
            </div>

            {/* Text Part (30%) */}
            <div style={{ flex: '1 1 25%', minWidth: '250px', maxWidth: '100%' }}>
                <Reveal delay={0.2}>
                    <div style={{ paddingTop: '0' }}>
                        <h3 style={{
                            fontSize: '28px',
                            fontWeight: 800,
                            marginBottom: '20px',
                            color: 'var(--text-color)',
                            fontFamily: 'var(--font-display)',
                            textTransform: 'none',
                            letterSpacing: '-0.02em',
                            overflowWrap: 'break-word'
                        }}>{section.title}</h3>
                        <div style={{ position: 'relative' }}>
                            <p style={{
                                color: mutedColor,
                                lineHeight: 1.6,
                                fontSize: '18px',
                                fontWeight: 400,
                                fontFamily: 'var(--font-body)',
                                margin: 0,
                                overflowWrap: 'anywhere',
                                wordBreak: 'break-word'
                            }}>
                                {shouldTruncate && !isExpanded
                                    ? section.text.slice(0, textLimit) + '...'
                                    : section.text}
                            </p>
                            {shouldTruncate && (
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="clickable"
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--accent-color)',
                                        padding: '10px 0',
                                        fontSize: '14px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        textTransform: 'uppercase'
                                    }}
                                >
                                    {isExpanded ? 'Show less' : 'Read all'}
                                    <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
                                        <ChevronDown size={16} />
                                    </motion.div>
                                </button>
                            )}
                        </div>
                    </div>
                </Reveal>
            </div>
        </div>
    );
};

const ImageCarousel = ({ images }: { images: string[] }) => {
    const [index, setIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const next = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIndex((prev) => (prev + 1) % images.length);
    };
    const prev = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    // Close fullscreen on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsFullscreen(false);
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };
        if (isFullscreen) {
            window.addEventListener('keydown', handleKeyDown);
            return () => window.removeEventListener('keydown', handleKeyDown);
        }
    }, [isFullscreen]);

    if (!images || images.length === 0) return null;

    if (images.length > 2) {
        // Triple the images to ensure no gaps on wide screens and smooth looping
        const displayImages = [...images, ...images, ...images];

        return (
            <div
                style={{
                    width: '100%',
                    height: 'auto',
                    overflowX: 'hidden',
                    overflowY: 'visible',
                    position: 'relative',
                    padding: '30px 0'
                }}
            >
                <motion.div
                    animate={{ x: ["0%", "-33.333%"] }}
                    transition={{
                        x: {
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: images.length * 30, // Faster as requested
                            ease: "linear",
                        },
                    }}
                    style={{
                        display: 'flex',
                        gap: '40px',
                        width: 'max-content',
                        padding: '0 20px',
                        alignItems: 'center',
                        willChange: 'transform'
                    }}
                >
                    {displayImages.map((img, i) => {
                        const isVideo = isVideoUrl(img);
                        return (
                            <div
                                key={i}
                                style={{
                                    flex: '0 0 auto',
                                    height: 'clamp(300px, 50vh, 600px)',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    position: 'relative',
                                    background: 'transparent',
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.06)'
                                }}
                            >
                                {isVideo ? (
                                    <video
                                        src={img}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        style={{
                                            height: '100%',
                                            width: 'auto',
                                            objectFit: 'contain',
                                            display: 'block'
                                        }}
                                    />
                                ) : (
                                    <img
                                        src={img}
                                        alt={`Gallery ${i}`}
                                        style={{
                                            height: '100%',
                                            width: 'auto',
                                            objectFit: 'contain',
                                            display: 'block'
                                        }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </motion.div>
            </div>
        );
    }

    const currentItem = images[index];
    const isCurrentVideo = isVideoUrl(currentItem);

    return (
        <>
            <div style={{ position: 'relative', width: '100%', height: '70vh', overflow: 'hidden', borderRadius: 'var(--radius-lg)', background: 'transparent' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ width: '100%', height: '100%', position: 'relative' }}
                    >
                        {isCurrentVideo ? (
                            <video
                                src={currentItem}
                                autoPlay
                                loop
                                muted
                                playsInline
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}
                            />
                        ) : (
                            <img
                                src={currentItem}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    objectFit: 'contain',
                                    borderRadius: 'var(--radius-lg)',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation and Controls */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    zIndex: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    {/* Fullscreen Toggle (Top Right) */}
                    <div style={{ position: 'absolute', top: '20px', right: '20px', pointerEvents: 'auto' }}>
                        <button
                            onClick={() => setIsFullscreen(true)}
                            className="clickable"
                            style={{
                                background: 'var(--surface-color)', // Solid background for AAA contrast
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-color)', // High contrast text/icon
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                        >
                            <Maximize2 size={20} />
                        </button>
                    </div>

                    {/* Arrows (Closer to center) */}
                    {images.length > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            width: '100%',
                            maxWidth: '960px', // Constrain width to bring arrows closer
                            margin: '0 auto',
                            padding: '0 20px'
                        }}>
                            <button
                                onClick={prev}
                                className="clickable"
                                style={{
                                    pointerEvents: 'auto',
                                    background: 'var(--surface-color)', // Solid background for AAA contrast
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-color)', // High contrast
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={next}
                                className="clickable"
                                style={{
                                    pointerEvents: 'auto',
                                    background: 'var(--surface-color)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-color)',
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)';
                                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                }}
                            >
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Indicators */}
                {images.length > 1 && (
                    <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
                        {images.map((_, i) => (
                            <div
                                key={i}
                                style={{
                                    width: i === index ? '24px' : '8px',
                                    height: '8px',
                                    borderRadius: '10px',
                                    background: i === index ? '#fff' : 'rgba(255,255,255,0.3)',
                                    transition: 'all 0.3s ease',
                                    cursor: 'pointer'
                                }}
                                onClick={() => setIndex(i)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Fullscreen Modal */}
            <AnimatePresence>
                {isFullscreen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 9999,
                            background: 'rgba(5, 5, 5, 0.98)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <button
                            onClick={() => setIsFullscreen(false)}
                            style={{
                                position: 'absolute',
                                top: '30px',
                                right: '30px',
                                background: 'transparent',
                                border: 'none',
                                color: '#fff',
                                cursor: 'pointer',
                                zIndex: 10000
                            }}
                        >
                            <X size={32} />
                        </button>

                        {/* Fullscreen Navigation */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    style={{
                                        position: 'absolute',
                                        left: '30px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        zIndex: 10000
                                    }}
                                >
                                    <ChevronLeft size={48} />
                                </button>
                                <button
                                    onClick={next}
                                    style={{
                                        position: 'absolute',
                                        right: '30px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        cursor: 'pointer',
                                        zIndex: 10000
                                    }}
                                >
                                    <ChevronRight size={48} />
                                </button>
                            </>
                        )}

                        <motion.div
                            key={index}
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {isCurrentVideo ? (
                                <video
                                    src={currentItem}
                                    controls
                                    autoPlay
                                    style={{
                                        maxWidth: '95vw',
                                        maxHeight: '95vh',
                                        objectFit: 'contain',
                                        borderRadius: '16px',
                                        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                                    }}
                                />
                            ) : (
                                <img
                                    src={currentItem}
                                    style={{
                                        maxWidth: '95vw',
                                        maxHeight: '95vh',
                                        objectFit: 'contain',
                                        borderRadius: '16px',
                                        boxShadow: '0 0 50px rgba(0,0,0,0.5)'
                                    }}
                                />
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default function ProjectPage() {
    const { slug } = useParams<{ slug: string }>();
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const [project, setProject] = useState<Project | null>(null);
    const [nextProject, setNextProject] = useState<Project | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const checkTheme = () => {
            setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        loadProject();
    }, [slug, i18n.language]);

    const loadProject = async () => {
        if (!slug) {
            navigate('/projects');
            return;
        }

        setLoading(true);
        console.log('🔍 Fetching project with slug:', slug);
        const data = await projectsAPI.getBySlug(slug);
        console.log('📊 Raw Project Data from Supabase:', data);

        if (!data) {
            console.warn('⚠️ Project not found for slug:', slug);
            navigate('/projects');
            return;
        }

        console.log('📽️ Gallery Images:', data.gallery_images);
        console.log('📽️ Gallery Videos:', data.gallery_videos);

        const lang = i18n.language;
        setProject({
            ...data,
            title: parseTranslatable(data.title, lang),
            description: parseTranslatable(data.description || '', lang),
            summary: parseTranslatable(data.summary || '', lang),
            short_description: parseTranslatable(data.short_description || '', lang),
            page_title: parseTranslatable(data.page_title || '', lang),
            client_name: parseTranslatable(data.client_name || '', lang),
            client_subtitle: parseTranslatable(data.client_subtitle || '', lang),
            my_role: parseTranslatable(data.my_role || '', lang),
        });

        // Load random next project
        const allProjects = await projectsAPI.getAll();
        const otherProjects = allProjects.filter(p => p.id !== data.id);
        if (otherProjects.length > 0) {
            const randomNext = otherProjects[Math.floor(Math.random() * otherProjects.length)];
            setNextProject({
                ...randomNext,
                title: parseTranslatable(randomNext.title, lang)
            });
            document.title = `${data.title} | Vinicius Campos`;
        }

        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-color)',
                paddingTop: 'var(--header-height)'
            }}>
                <p style={{ color: 'var(--text-muted)' }}>Carregando...</p>
            </div>
        );
    }

    if (!project) return null;

    const mutedColor = isDarkMode ? '#E5E5E5' : '#1F1F1F';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';

    return (
        <div style={{
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            fontFamily: 'var(--font-body)',
            minHeight: '100vh',
            paddingTop: 'var(--header-height)',
            transition: 'background-color 0.5s ease, color 0.5s ease',
            overflowX: 'hidden'
        }}>
            {/* Hero Section */}
            {/* Hero Section */}
            {/* Hero Section */}
            <section style={{
                position: 'relative',
                height: 'calc(100vh - var(--header-height))', // Precise height between header and bottom
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '0 5%',
                overflow: 'hidden',
                color: '#FFFFFF',
                backgroundColor: '#000000',
                borderBottom: '1px solid rgba(255,255,255,0.1)'
            }}>
                {/* Background Image & Overlay */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0
                }}>
                    <img
                        src={project.image_url}
                        alt="Project Cover"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center',
                            opacity: 0.25
                        }}
                    />
                    {/* Dark overlay always on */}
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(0,0,0,0.65)'
                    }} />
                </div>

                {/* Content Container */}
                <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: '60px', flexWrap: 'wrap' }}>
                        {/* Left: Client Name + Title + Tags */}
                        <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {project.client_name && (
                                <Reveal>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', color: '#FFFFFF' }}>{project.client_name}</span>
                                        {project.client_subtitle && <span style={{ fontSize: '18px', fontWeight: 500, color: 'rgba(255,255,255,0.6)' }}>{project.client_subtitle}</span>}
                                    </div>
                                </Reveal>
                            )}
                            <Reveal delay={0.1}>
                                <h1 className="hero-title-inter" style={{
                                    fontSize: 'clamp(18px, 1.8vw, 24px)',
                                    margin: 0,
                                    color: '#FFFFFF',
                                    lineHeight: 1.4,
                                    fontWeight: 400
                                }}>
                                    {project.short_description || project.page_title || project.title}
                                </h1>
                            </Reveal>

                            {/* Portfolio Tags */}
                            {project.tags && project.tags.length > 0 && (
                                <Reveal delay={0.2}>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {project.tags.map((tag) => (
                                            <span key={tag} style={{
                                                padding: '8px 20px',
                                                backgroundColor: 'rgba(255,255,255,0.1)',
                                                borderRadius: '50px',
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                letterSpacing: '0.5px',
                                                color: '#FFFFFF',
                                                textTransform: 'uppercase'
                                            }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </Reveal>
                            )}
                        </div>

                        {/* Right: Metadata Grid */}
                        {(() => {
                            const metadata = [
                                { label: 'MY ROLE', value: project.my_role },
                                { label: 'LOCATION', value: project.location },
                                { label: 'DURATION', value: project.duration },
                                { label: 'YEAR', value: project.year }
                            ].filter(item => item.value);

                            if (metadata.length === 0) return null;

                            return (
                                <div style={{ flex: '1 1 280px', borderTop: `1.5px solid rgba(255,255,255,0.2)` }}>
                                    {metadata.map((item, i) => (
                                        <Reveal key={i} delay={0.3 + i * 0.1}>
                                            <div style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                padding: '24px 0',
                                                borderBottom: `1.5px solid rgba(255,255,255,0.2)`
                                            }}>
                                                <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                                                <span style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: '#FFFFFF' }}>{item.value}</span>
                                            </div>
                                        </Reveal>
                                    ))}
                                </div>
                            );
                        })()}
                    </div>
                </div>
            </section>

            {/* Description */}
            {project.description && (
                <section style={{ padding: '80px 5% 40px', maxWidth: '1000px' }}>
                    <Reveal>
                        <div
                            className="rich-text"
                            style={{
                                fontSize: 'clamp(18px, 3vw, 24px)',
                                lineHeight: 1.5,
                                fontWeight: 400,
                                letterSpacing: '-0.01em',
                                color: 'var(--text-color)',
                                fontFamily: '"Inter", sans-serif !important',
                                textTransform: 'none'
                            }}
                            dangerouslySetInnerHTML={{ __html: cleanWordHTML(project.description) }}
                        />
                    </Reveal>
                </section>
            )}

            {/* Project Steps Section */}
            {project.project_steps && project.project_steps.filter(s => s.name || s.description).length > 0 && (
                <section style={{ padding: '120px 12%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px' }}>
                        {project.project_steps.filter(s => s.name || s.description).map((step, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div style={{
                                    padding: 0,
                                    backgroundColor: 'transparent',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    maxWidth: isMobile ? '100%' : '70%',
                                    width: isMobile ? '90%' : 'auto',
                                    margin: isMobile ? '0 auto' : '0'
                                }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        backgroundColor: 'var(--text-color)',
                                        color: 'var(--bg-color)',
                                        padding: '8px 20px',
                                        borderRadius: '50px',
                                        alignSelf: 'flex-start'
                                    }}>
                                        {step.number && <span style={{ fontSize: '13px', fontWeight: 900 }}>{step.number}</span>}
                                        {step.name && <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px' }}>{step.name}</span>}
                                    </div>
                                    {step.description && (
                                        <div
                                            className="rich-text"
                                            style={{
                                                fontSize: '16px',
                                                fontWeight: 400,
                                                lineHeight: 1.7,
                                                color: 'var(--text-color)',
                                                fontFamily: '"Inter", sans-serif !important'
                                            }}
                                            dangerouslySetInnerHTML={{ __html: cleanWordHTML(step.description) }}
                                        />
                                    )}
                                    {step.tags && (
                                        <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', color: mutedColor, textTransform: 'uppercase', margin: 0 }}>
                                            {step.tags}
                                        </p>
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </section>
            )}

            {/* Gallery */}
            {(() => {
                const allMedia = [
                    ...(project.gallery_images || []),
                    ...(project.gallery_videos || [])
                ];
                return allMedia.length > 0 ? (
                    <section style={{ margin: '60px 0', backgroundColor: 'transparent' }}>
                        <ImageCarousel images={allMedia} />
                    </section>
                ) : null;
            })()}

            {/* Highlights Sections (Alternating 70/30) */}
            {project.highlights && project.highlights.length > 0 && (
                <section style={{ padding: '60px 5% 120px' }}>
                    <Reveal>
                        <h2 className="hero-title-inter" style={{
                            fontSize: 'clamp(32px, 5vw, 56px)',
                            margin: '0 0 80px 0',
                            color: 'var(--text-color)'
                        }}>Results</h2>
                    </Reveal>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '150px' }}>
                        {project.highlights.map((section, idx) => (
                            <HighlightItem
                                key={idx}
                                section={section}
                                idx={idx}
                                mutedColor={mutedColor}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* Action Buttons Section */}
            {(project.live_url || project.download_url) && (
                <section style={{ padding: '80px 5%', display: 'flex', justifyContent: 'center' }}>
                    <Reveal>
                        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                            {project.live_url && (
                                <a
                                    href={project.live_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="clickable"
                                    style={{
                                        padding: '18px 42px',
                                        backgroundColor: 'var(--text-color)',
                                        color: 'var(--bg-color)',
                                        borderRadius: '50px',
                                        fontSize: '16px',
                                        fontWeight: 800,
                                        textDecoration: 'none',
                                        transition: 'transform 0.3s ease',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    {project.live_url_label || 'View Live Site'}
                                    <ArrowRight size={20} />
                                </a >
                            )}
                            {project.download_url && (
                                <a
                                    href={project.download_url}
                                    className="clickable"
                                    style={{
                                        padding: '18px 42px',
                                        backgroundColor: 'transparent',
                                        color: 'var(--text-color)',
                                        border: `2px solid var(--text-color)`,
                                        borderRadius: '50px',
                                        fontSize: '16px',
                                        fontWeight: 800,
                                        textDecoration: 'none',
                                        transition: 'all 0.3s ease',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}
                                >
                                    <Download size={20} />
                                    {project.download_url_label || 'Download Case Study'}
                                </a >
                            )}
                        </div>
                    </Reveal>
                </section>
            )}

            {/* Split CTA/Footer Section */}
            <section style={{
                padding: '80px 5% 80px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px'
            }}>
                {/* Left Card: Contact */}
                <div style={{
                    padding: '100px 8%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 'var(--radius-lg)',
                    border: `1.5px solid ${borderColor}`,
                    minHeight: '500px'
                }}>
                    <Reveal>
                        <h2 style={{
                            fontSize: 'clamp(32px, 4vw, 56px)',
                            fontWeight: 800,
                            lineHeight: 1,
                            marginBottom: '40px',
                            color: 'var(--text-color)'
                        }}>
                            Want to know more<br />about my journey?
                        </h2>
                        <Link
                            to="/cv"
                            className="clickable"
                            style={{
                                fontSize: '20px',
                                fontWeight: 800,
                                color: 'var(--text-color)',
                                textDecoration: 'none',
                                borderBottom: '3px solid var(--text-color)',
                                paddingBottom: '8px',
                                display: 'inline-block'
                            }}
                        >
                            View Curriculum →
                        </Link>
                    </Reveal>
                </div>

                {/* Right Card: Next Project */}
                {nextProject && (
                    <Link
                        to={`/project/${nextProject.slug || nextProject.id}`}
                        style={{
                            position: 'relative',
                            minHeight: '500px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'flex-start',
                            padding: '100px 8%',
                            overflow: 'hidden',
                            borderRadius: 'var(--radius-lg)',
                            border: `1.5px solid ${borderColor}`,
                            textDecoration: 'none'
                        }}
                        className="clickable"
                    >
                        <img
                            src={nextProject.image_url}
                            alt={nextProject.title}
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                zIndex: 1
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.85)',
                            zIndex: 2
                        }} />

                        <div style={{ position: 'relative', zIndex: 3 }}>
                            <Reveal delay={0.1}>
                                <p style={{
                                    fontSize: '12px',
                                    textTransform: 'uppercase',
                                    letterSpacing: '2px',
                                    color: '#FFFFFF',
                                    marginBottom: '24px',
                                    fontWeight: 900
                                }}>
                                    NEXT PROJECT
                                </p>
                                <h2 style={{
                                    fontSize: 'clamp(32px, 4vw, 56px)',
                                    fontWeight: 800,
                                    lineHeight: 1,
                                    marginBottom: '40px',
                                    color: '#FFFFFF'
                                }}>
                                    {nextProject.title}
                                </h2>
                                <span style={{
                                    fontSize: '20px',
                                    fontWeight: 800,
                                    color: '#FFFFFF',
                                    borderBottom: '4px solid #FFFFFF',
                                    paddingBottom: '8px',
                                    display: 'inline-block'
                                }}>
                                    View Project →
                                </span>
                            </Reveal>
                        </div>
                    </Link>
                )}
            </section>

            {/* Custom Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hero-title-inter {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 400 !important;
                    text-transform: none !important;
                    letter-spacing: -0.02em !important;
                    line-height: 1.1 !important;
                    word-break: break-word;
                    overflow-wrap: break-word;
                }
                @media (max-width: 768px) {
                    .step-item { max-width: 100% !important; }
                /* Add styles for rich text content */
                .rich-text p { margin-bottom: 1em; }
                .rich-text ul, .rich-text ol { margin-left: 1.5em; margin-bottom: 1em; }
                .rich-text b, .rich-text strong { font-weight: 700; }
            `}} />
        </div>
    );
}
