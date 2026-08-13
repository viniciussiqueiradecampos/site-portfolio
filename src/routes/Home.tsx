import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProjectModal from '../components/ProjectModal';
import DriftWall from '../components/DriftWall';
import { contentAPI, projectsAPI, type Project } from '../lib/supabase';
import { trackPageView } from '../lib/analytics';
import { parseTranslatable } from '../lib/i18n-utils';

export default function Home() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth <= 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Data State with Instant Cache Fallbacks
    const [heroTitle, setHeroTitle] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('cache_hero_title');
            if (cached) return cached;
        }
        return '10+ years in Design. 8 years as CEO.';
    });
    const [heroDesc, setHeroDesc] = useState(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('cache_hero_desc');
            if (cached) return cached;
        }
        return 'More than creating visuals, I understand business. Having run an agency for 8 years taught me that strategic design goes far beyond aesthetics. Today, I combine that executive mindset with my background in UI, Digital, and Branding to pinpoint the actual challenge and deliver design solutions that move the needle.';
    });
    const [projects, setProjects] = useState<Project[]>(() => {
        if (typeof window !== 'undefined') {
            const cached = localStorage.getItem('cache_hero_projects');
            if (cached) {
                try { return JSON.parse(cached); } catch (e) {}
            }
        }
        return [];
    });

    // Helper to add line break for "8 years" or "8 anos" in main title only
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

    // Hero Section Ref
    const heroRef = useRef(null);

    // Initial load handling
    useEffect(() => {
        trackPageView('/');
        loadData();
        document.title = "Vinicius Campos | Graphic and Digital Designer Senior";
    }, [i18n.language]);

    const loadData = async () => {
        const lang = i18n.language;

        // Fetch content and projects
        const [allContent, projs] = await Promise.all([
            contentAPI.getAll(),
            projectsAPI.getAll()
        ]);

        const getV = (key: string) => allContent.find(c => c.key === key)?.value;

        const title = getV('hero.title');
        if (title) {
            const parsed = parseTranslatable(title, lang);
            setHeroTitle(parsed);
            localStorage.setItem('cache_hero_title', parsed);
        }

        const desc = getV('hero.description');
        if (desc) {
            const parsed = parseTranslatable(desc, lang);
            setHeroDesc(parsed);
            localStorage.setItem('cache_hero_desc', parsed);
        }

        const mappedProjects = projs.slice(0, 8).map(p => ({
            ...p,
            title: parseTranslatable(p.title, lang),
            description: parseTranslatable(p.description || '', lang),
            summary: parseTranslatable(p.summary || '', lang),
            short_description: parseTranslatable(p.short_description || '', lang)
        }));
        setProjects(mappedProjects);
        localStorage.setItem('cache_hero_projects', JSON.stringify(mappedProjects));
    };

    // Modal State
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div ref={containerRef} style={{ position: 'relative' }}>
            <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            {/* HERO SECTION - First Fold Only */}
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
                        overflow: 'hidden',
                        marginTop: isMobile ? '0' : '20px'
                    }}>
                        <DriftWall
                            projects={projects}
                            columns={isMobile ? 2 : 3}
                            speed={100}
                            rotateAngle={0}
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
                        <h1
                            ref={titleRef}
                            className="hero-title"
                            style={{
                                fontSize: isMobile ? 'clamp(26px, 7vw, 36px)' : 'clamp(32px, 4.2vw, 58px)',
                                lineHeight: '1.15',
                                margin: 0,
                                wordBreak: isMobile ? 'break-word' : 'normal',
                                maxWidth: '650px'
                            }}
                        >
                            {formatWithLineBreaks(heroTitle)}
                        </h1>

                        {/* Description below */}
                        <div
                            style={{
                                fontSize: isMobile ? '14px' : 'clamp(14px, 1.1vw, 17px)',
                                lineHeight: '1.7',
                                color: 'var(--text-muted)',
                                fontFamily: 'var(--font-body)',
                                maxWidth: '520px'
                            }}
                        >
                            {heroDesc}
                        </div>

                        {/* CTA Buttons */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                flexWrap: 'wrap',
                                marginTop: '8px',
                                justifyContent: isMobile ? 'center' : 'flex-start'
                            }}
                        >
                            <Link
                                to="/projects"
                                className="clickable"
                                style={{
                                    height: isMobile ? '46px' : '54px',
                                    padding: isMobile ? '0 24px' : '0 36px',
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
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    gap: '8px'
                                }}
                            >
                                {t('hero.view_portfolio', 'VIEW PORTFOLIO →')}
                            </Link>
                            <Link
                                to="/cv"
                                className="clickable"
                                style={{
                                    height: isMobile ? '46px' : '54px',
                                    padding: isMobile ? '0 24px' : '0 36px',
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
                                    justifyContent: 'center',
                                    boxSizing: 'border-box',
                                    gap: '8px'
                                }}
                            >
                                {t('hero.view_cv', 'VIEW CV')}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
