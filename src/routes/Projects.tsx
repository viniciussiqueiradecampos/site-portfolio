import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectModal from '../components/ProjectModal';
import { projectsAPI, type Project } from '../lib/supabase';
import { trackPageView, trackProjectClick } from '../lib/analytics';
import { Eye } from 'lucide-react';

export default function Projects() {
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [activeTag, setActiveTag] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        loadProjects();
        trackPageView('/projects');
    }, []);

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
        const data = await projectsAPI.getAll();
        setProjects(data);
        setFilteredProjects(data);

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

    const openModal = (project: Project) => {
        trackProjectClick(project.id, project.title);
        setSelectedProject(project);
        setIsModalOpen(true);
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
            <ProjectModal project={selectedProject} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <div className="container">
                <div style={{ marginBottom: '60px', borderBottom: '1px solid var(--border-color)', paddingBottom: '40px' }}>
                    <h1 className="selected-works-title" style={{ fontSize: isMobile ? '40px' : '60px', marginBottom: '20px', lineHeight: 0.9 }}>
                        SELECTED<br />WORKS
                    </h1>
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
                    }}>FILTER BY:</span>
                    <button
                        onClick={() => setActiveTag('ALL')}
                        style={{
                            padding: '10px 24px',
                            background: activeTag === 'ALL' ? 'var(--accent-color)' : 'transparent',
                            color: activeTag === 'ALL' ? '#000' : 'var(--text-color)',
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
                                color: activeTag === tag ? '#000' : 'var(--text-color)',
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
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: '40px'
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
                                onClick={() => openModal(p)}
                                style={{
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                    height: '320px',
                                    marginBottom: '20px',
                                    background: 'var(--surface-color)',
                                    position: 'relative'
                                }} className="project-image-wrapper">
                                    <div style={{
                                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                        gap: '12px', opacity: 0, transition: '0.3s ease', zIndex: 5
                                    }} className="card-hover-overlay">
                                        <div style={{ padding: '20px', background: '#fff', borderRadius: '50%', color: '#000' }}>
                                            <Eye size={32} />
                                        </div>
                                        <span style={{ color: '#fff', fontWeight: 'bold', fontSize: '14px', letterSpacing: '2px', fontFamily: 'var(--font-display)' }}>VIEW PROJECT</span>
                                    </div>

                                    <img src={p.image_url} alt={p.title} loading="lazy" decoding="async" style={{
                                        width: '100%', height: '100%', objectFit: 'contain',
                                        transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)',
                                        position: 'relative', zIndex: 1
                                    }} className="card-img" />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: 1, minWidth: '150px' }}>
                                        <h3 style={{ fontSize: '20px', marginBottom: '12px', fontFamily: 'var(--font-display)' }}>{p.title}</h3>
                                        <div className="project-tags-container" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                            {p.tags?.map(tag => (
                                                <span key={tag} className="project-tag" style={{
                                                    fontSize: '10px', padding: '4px 10px',
                                                    border: '1px solid var(--border-color)', borderRadius: '20px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
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
                                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                                            transition: 'all 0.3s'
                                        }} className="learn-more-btn-pill">
                                            LEARN MORE →
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
