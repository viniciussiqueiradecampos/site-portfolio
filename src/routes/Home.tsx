import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ProjectModal from '../components/ProjectModal';
import DriftWall from '../components/DriftWall';
import { contentAPI, projectsAPI, type Project } from '../lib/supabase';
import { trackPageView } from '../lib/analytics';
import { parseTranslatable } from '../lib/i18n-utils';

export default function Home() {
    const { i18n } = useTranslation();
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

    // Data State
    const [heroTitle, setHeroTitle] = useState('figma • UI DESIGN • AI • WEB DESIGN');
    const [heroDesc, setHeroDesc] = useState(' ');
    const [projects, setProjects] = useState<Project[]>([]);

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
        if (title) setHeroTitle(parseTranslatable(title, lang));

        const desc = getV('hero.description');
        if (desc) setHeroDesc(parseTranslatable(desc, lang));

        setProjects(projs.slice(0, 8).map(p => ({
            ...p,
            title: parseTranslatable(p.title, lang),
            description: parseTranslatable(p.description || '', lang),
            summary: parseTranslatable(p.summary || '', lang),
            short_description: parseTranslatable(p.short_description || '', lang)
        })));
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
                            columns={3}
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
                        {/* Main Title - line breaks only here */}
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
                            {heroDesc}
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
                            <Link
                                to="/projects"
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
                                VIEW PORTFOLIO →
                            </Link>
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
        </div>
    );
}
