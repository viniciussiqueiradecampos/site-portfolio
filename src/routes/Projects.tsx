import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ProjectModal, { type ProjectData } from '../components/ProjectModal';
import { projectsAPI, type Project } from '../lib/supabase';

export default function Projects() {
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        const data = await projectsAPI.getAll();
        setProjects(data);
        setLoading(false);
    };

    const openModal = (project: Project) => {
        // Map DB Project to Modal ProjectData
        const modalData: ProjectData = {
            title: project.title,
            image_url: project.image_url,
            img: project.image_url,
            tags: project.tags,
            gallery_images: project.gallery_images || [],
            gallery: project.gallery_images || [],
            description: project.description,
            type: project.tags?.[0] || 'Project',
            year: project.created_at ? new Date(project.created_at).getFullYear().toString() : '2024'
        };
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
                <div style={{ marginBottom: '100px', borderBottom: '1px solid var(--border-color)', paddingBottom: '40px' }}>
                    <h1 style={{ fontSize: 'clamp(60px, 8vw, 120px)', marginBottom: '20px', lineHeight: 0.9 }}>
                        SELECTED<br />WORKS <span style={{ fontSize: '20px', verticalAlign: 'middle', letterSpacing: '0.1em' }}>(2023—2025)</span>
                    </h1>
                </div>

                <div style={{
                    columns: '3 320px',
                    gap: '40px'
                }}>
                    {projects.map((p, i) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                            viewport={{ once: true, margin: "-50px" }}
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
                                height: (i % 2 === 0 ? '400px' : '500px'), // Simple staggered height
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
                                    <h3 style={{ fontSize: '24px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{p.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{p.tags?.[0] || 'Project'}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--accent-color)' }}>{new Date(p.created_at).getFullYear()}</span>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                        {p.tags?.slice(0, 3).map(tag => (
                                            <span key={tag} style={{
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
                </div>
            </div>
        </div>
    );
}
