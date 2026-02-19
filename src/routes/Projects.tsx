import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { projectsAPI, type Project } from '../lib/supabase';
import { trackPageView, trackProjectClick } from '../lib/analytics';
import { useTranslation } from 'react-i18next';
import { parseTranslatable } from '../lib/i18n-utils';

export default function Projects() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [activeTag, setActiveTag] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        loadProjects();
        trackPageView('/projects');
        document.title = `${t('nav.portfolio')} | Vinicius Campos`;
    }, [i18n.language, t]);

    useEffect(() => {
        // Show all visible projects
        const visibleProjects = projects;

        if (activeTag === 'ALL') {
            setFilteredProjects(visibleProjects);
        } else {
            // Filter projects that explicitly contain the active tag
            const results = visibleProjects.filter(p => p.tags && Array.isArray(p.tags) && p.tags.map(t => t.toUpperCase()).includes(activeTag));

            // Reassurance: If for some reason the tag selection leads to nothing, 
            // but the UI allowed selecting it, we show all (though extraction prevents this).
            if (results.length === 0) {
                setFilteredProjects(visibleProjects);
            } else {
                setFilteredProjects(results);
            }
        }
    }, [activeTag, projects]);

    const loadProjects = async () => {
        const lang = i18n.language;
        const data = await projectsAPI.getAll();
        const translatedData = data.map(p => ({
            ...p,
            title: parseTranslatable(p.title, lang),
            description: parseTranslatable(p.description || '', lang),
            summary: parseTranslatable(p.summary || '', lang),
            short_description: parseTranslatable(p.short_description || '', lang),
            button_text: parseTranslatable(p.button_text || '', lang)
        }));
        setProjects(translatedData);
        setFilteredProjects(translatedData);

        // Extract unique tags and format them (from all visible projects)
        const tagsSet = new Set<string>();
        data.forEach(p => {
            if (p.tags && p.tags.length > 0) {
                p.tags.forEach(t => {
                    if (t && t.trim() !== '') {
                        tagsSet.add(t.trim().toUpperCase());
                    }
                });
            }
        });
        setAvailableTags(Array.from(tagsSet).sort());

        setLoading(false);
    };

    if (loading) {
        return (
            <div style={{ paddingTop: '150px', paddingBottom: '150px', textAlign: 'center' }}>
                <div className="container">Loading projects...</div>
            </div>
        );
    }

    return (
        <div style={{ paddingTop: '150px', paddingBottom: '150px' }}>
            <div style={{ maxWidth: '1600px', margin: '0 auto', padding: isMobile ? '0 20px' : '0 60px' }}>
                <div style={{ marginBottom: '80px', borderBottom: '1px solid var(--border-color)', paddingBottom: '40px' }}>
                    <h1 className="selected-works-title" style={{ fontSize: isMobile ? '20px' : '60px', marginBottom: '20px', lineHeight: 1.1 }} dangerouslySetInnerHTML={{ __html: t('portfolio.title', 'SELECTED<br />WORKS') }} />
                </div>

                {/* Tag Filter Bar */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '80px',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '30px'
                }}>
                    <span style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-display)',
                        color: 'var(--text-muted)',
                        marginRight: '15px',
                        letterSpacing: '1px'
                    }}>{t('portfolio.filter_by', 'FILTER BY:')}:</span>
                    <button
                        onClick={() => setActiveTag('ALL')}
                        style={{
                            padding: '10px 24px',
                            background: activeTag === 'ALL' ? 'var(--accent-color)' : 'transparent',
                            color: activeTag === 'ALL' ? '#fff' : 'var(--text-color)',
                            border: activeTag === 'ALL' ? 'none' : '1px solid var(--border-color)',
                            borderRadius: '50px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            fontFamily: 'var(--font-display)',
                            transition: 'all 0.3s'
                        }}
                    >
                        ALL
                    </button>
                    {availableTags.map(tag => (
                        <button
                            key={tag}
                            onClick={() => setActiveTag(tag)}
                            style={{
                                padding: '10px 24px',
                                background: activeTag === tag ? 'var(--accent-color)' : 'transparent',
                                color: activeTag === tag ? '#fff' : 'var(--text-color)',
                                border: activeTag === tag ? 'none' : '1px solid var(--border-color)',
                                borderRadius: '50px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                fontFamily: 'var(--font-display)',
                                transition: 'all 0.3s'
                            }}
                        >
                            {tag}
                        </button>
                    ))}
                </div>

                <div className="projects-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                    columnGap: '40px',
                    rowGap: '120px',
                    width: '100%'
                }}>
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.map((p) => (
                            <motion.div
                                key={p.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                className="clickable project-card"
                                onClick={() => {
                                    trackProjectClick(p.id, p.title);
                                    navigate(`/project/${p.slug || p.id}`);
                                }}
                                style={{
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    borderRadius: 'var(--radius-lg)',
                                    overflow: 'hidden',
                                    height: isMobile ? '350px' : '480px',
                                    marginBottom: '24px',
                                    background: 'transparent',
                                    position: 'relative'
                                }} className="project-image-wrapper">
                                    <img src={p.image_url} alt={p.title} loading="lazy" decoding="async" style={{
                                        width: '100%', height: '100%', objectFit: 'cover',
                                        transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                                        position: 'relative', zIndex: 1,
                                        background: 'transparent'
                                    }} className="card-img" />
                                </div>

                                <div style={{ padding: '0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <h3 style={{ fontSize: '20px', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>{p.title}</h3>
                                        <p style={{
                                            fontSize: '14px',
                                            color: 'var(--text-muted)',
                                            lineHeight: '1.4',
                                            margin: '0',
                                            display: isMobile ? 'block' : '-webkit-box',
                                            WebkitLineClamp: isMobile ? 'none' : 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: isMobile ? 'visible' : 'hidden',
                                            marginTop: '4px'
                                        }}>
                                            {p.summary || ''}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div >
    );
}
