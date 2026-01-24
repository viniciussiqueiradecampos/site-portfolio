import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProjectModal from '../components/ProjectModal';
import { projectsAPI, type Project, type ProjectData } from '../lib/supabase';

export default function Projects() {
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
    const [availableTags, setAvailableTags] = useState<string[]>([]);
    const [activeTag, setActiveTag] = useState('ALL');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    useEffect(() => {
        if (activeTag === 'ALL') {
            setFilteredProjects(projects);
        } else {
            setFilteredProjects(projects.filter(p => p.tags.includes(activeTag)));
        }
    }, [activeTag, projects]);

    const loadProjects = async () => {
        const data = await projectsAPI.getAll();
        setProjects(data);
        setFilteredProjects(data);

        // Extract unique tags and format them
        const tagsSet = new Set<string>();
        data.forEach(p => p.tags.forEach(t => tagsSet.add(t.toUpperCase())));
        setAvailableTags(Array.from(tagsSet).sort());

        setLoading(false);
    };

    const openModal = (project: Project) => {
        const modalData = {
            title: project.title,
            image_url: project.image_url,
            img: project.image_url,
            tags: project.tags,
            gallery_images: project.gallery_images || [],
            gallery: project.gallery_images || [],
            description: project.description,
            type: project.tags?.[0] || 'Project',
            year: project.year || (project.created_at ? new Date(project.created_at).getFullYear().toString() : '2024')
        } as any as ProjectData;
        setSelectedProject(modalData);
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
                    <h1 className="selected-works-title" style={{ fontSize: 'clamp(60px, 8vw, 120px)', marginBottom: '20px', lineHeight: 0.9 }}>
                        SELECTED<br />WORKS <span style={{ fontSize: '20px', verticalAlign: 'middle', letterSpacing: '0.1em' }}>(2023—2025)</span>
                    </h1>
                </div>

                {/* Tag Filter Bar */}
                <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '80px',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '30px'
                }}>
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
                    columns: '3 320px',
                    gap: '40px'
                }}>
                    <AnimatePresence mode="popLayout">
                        {filteredProjects.map((p, i) => (
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
                                    breakInside: 'avoid',
                                    marginBottom: '60px',
                                    position: 'relative'
                                }}
                            >
                                <div style={{
                                    borderRadius: 'var(--radius-md)',
                                    overflow: 'hidden',
                                    height: (i % 2 === 0 ? '400px' : '500px'),
                                    marginBottom: '20px',
                                    background: 'var(--surface-color)',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute', inset: 0, background: '#000', opacity: 0,
                                        zIndex: 2, transition: 'opacity 0.3s'
                                    }} className="hover-overlay" />

                                    <img src={p.image_url} alt={p.title} style={{
                                        width: '100%', height: '100%', objectFit: 'cover',
                                        transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
                                    }} className="card-img" />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h3 style={{ fontSize: '20px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{p.title}</h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{p.tags?.[0] || 'Project'}</p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span style={{ display: 'block', fontSize: '13px', marginBottom: '8px', color: 'var(--accent-color)' }}>{p.year || new Date(p.created_at).getFullYear()}</span>
                                        <div className="project-tags-container" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                            {p.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} className="project-tag" style={{
                                                    fontSize: '10px', padding: '4px 8px',
                                                    border: '1px solid var(--border-color)', borderRadius: '20px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {tag}
                                                </span>
                                            ))}
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
