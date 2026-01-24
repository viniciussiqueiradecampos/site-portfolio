import { useState } from 'react';
import { motion } from 'framer-motion';
import ProjectModal, { type ProjectData } from '../components/ProjectModal';

// Mock list of projects using Unsplash images for Pinterest grid effect
const PROJECTS: ProjectData[] = [
    { title: 'Finance App', type: 'Product Design', year: '2024', tags: ['Figma', 'React', 'Mobile'], img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop' },
    { title: 'Botanical Kit', type: 'Branding', year: '2023', tags: ['Identity', 'Packaging'], img: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?q=80&w=800&auto=format&fit=crop' },
    { title: 'Neon Brand', type: 'Visual Design', year: '2025', tags: ['3D', 'Motion'], img: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop' },
    { title: 'Arch Viz', type: 'Art Direction', year: '2024', tags: ['Photography', 'Layout'], img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop' },
    { title: 'Typo Series', type: 'Typography', year: '2023', tags: ['Editorial', 'Print'], img: 'https://images.unsplash.com/photo-1558655146-d09347e0c7a8?q=80&w=800&auto=format&fit=crop' },
    { title: 'Abstract 3D', type: 'Experimental', year: '2025', tags: ['Blender', 'Generative'], img: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop' },
];

export default function Projects() {
    const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (project: ProjectData) => {
        setSelectedProject(project);
        setIsModalOpen(true);
    };

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
                    {PROJECTS.map((p, i) => (
                        <motion.div
                            key={i}
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

                                <img src={p.img} alt={p.title} style={{
                                    width: '100%', height: '100%', objectFit: 'cover',
                                    transition: 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)'
                                }} className="card-img" />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <h3 style={{ fontSize: '24px', marginBottom: '8px', fontFamily: 'var(--font-display)' }}>{p.title}</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{p.type}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: 'var(--accent-color)' }}>{p.year}</span>
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        {p.tags?.map(tag => (
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
