import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Project } from '../lib/supabase';


interface ProjectModalProps {
    project: Project | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCurrentMediaIndex(0);
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!project) return null;

    // Combine all media and detect videos
    const allMedia = [
        { type: 'image', url: project.image_url },
        ...(project.gallery_images || []).map(url => {
            const isVideo = url.match(/\.(mp4|webm|ogg|mov|avi)($|\?)/i);
            return { type: isVideo ? 'video' : 'image', url };
        }),
        ...(project.gallery_videos || []).map(url => ({ type: 'video', url }))
    ].filter(m => m.url);

    const hasMultipleMedia = allMedia.length > 1;

    const nextMedia = () => {
        setCurrentMediaIndex((prev) => (prev + 1) % allMedia.length);
    };

    const prevMedia = () => {
        setCurrentMediaIndex((prev) => (prev - 1 + allMedia.length) % allMedia.length);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="clickable"
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(10px)', zIndex: 20000 }}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: 'fixed',
                            inset: isMobile ? '0' : '5%',
                            background: 'var(--surface-color)',
                            borderRadius: isMobile ? '0' : '32px',
                            border: '1px solid var(--border-color)',
                            zIndex: 20001,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row'
                        }}
                    >
                        {/* CLOSE BUTTON */}
                        <button
                            onClick={onClose}
                            aria-label="Close Project Details"
                            style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 100, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '44px', height: '44px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                        {/* MEDIA LEFT */}
                        <div style={{ flex: isMobile ? 'none' : 1.6, height: isMobile ? '40%' : '100%', position: 'relative', background: '#000', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', inset: 0, overflowY: 'auto', overflowX: 'hidden' }} className="hide-scrollbar">
                                {allMedia[currentMediaIndex].type === 'image' ? (
                                    <img
                                        src={allMedia[currentMediaIndex].url}
                                        alt={project.title}
                                        loading="lazy"
                                        decoding="async"
                                        style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <video src={allMedia[currentMediaIndex].url} controls autoPlay muted loop style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                )}
                            </div>

                            {hasMultipleMedia && (
                                <>
                                    <button
                                        onClick={prevMedia}
                                        aria-label="Previous Media"
                                        style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', cursor: 'pointer' }}
                                    >
                                        <ChevronLeft size={24} />
                                    </button>
                                    <button
                                        onClick={nextMedia}
                                        aria-label="Next Media"
                                        style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '48px', height: '48px', color: '#fff', cursor: 'pointer' }}
                                    >
                                        <ChevronRight size={24} />
                                    </button>                                    <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.6)', padding: '6px 16px', borderRadius: '100px', fontSize: '11px', color: '#fff' }}>
                                        {currentMediaIndex + 1} / {allMedia.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* CONTENT RIGHT */}
                        <div style={{ flex: 1, padding: isMobile ? '32px' : '80px 60px', overflowY: 'auto' }} className="hide-scrollbar">
                            <h2 style={{ fontSize: isMobile ? '32px' : '48px', fontWeight: '800', fontFamily: 'var(--font-display)', marginBottom: '24px', lineHeight: 1.1 }}>{project.title}</h2>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '40px' }}>
                                {project.tags?.map(tag => (
                                    <span key={tag} style={{ padding: '6px 16px', border: '1px solid var(--border-color)', borderRadius: '100px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>{tag}</span>
                                ))}
                            </div>

                            <div
                                className="project-markdown-desc"
                                style={{ fontSize: '18px', lineHeight: 1.8, color: 'var(--text-muted)', marginBottom: '60px' }}
                                dangerouslySetInnerHTML={{ __html: project.description || '' }}
                            />


                            {project.live_url && (
                                <a href={project.live_url} target="_blank" rel="noopener noreferrer" className="clickable" style={{ display: 'flex', width: '100%', padding: '24px', background: 'var(--accent-color)', color: '#000', borderRadius: '16px', fontSize: '16px', fontWeight: '800', justifyContent: 'center', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
                                    {project.button_text || 'VIEW LIVE PROJECT'} <ExternalLink size={20} />
                                </a>
                            )}

                            {project.download_url && (
                                <a href={project.download_url} target="_blank" rel="noopener noreferrer" className="clickable" style={{ display: 'flex', width: '100%', padding: '24px', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '16px', fontSize: '16px', fontWeight: '800', justifyContent: 'center', alignItems: 'center', gap: '12px', textDecoration: 'none', marginTop: '16px' }}>
                                    DOWNLOAD PROJECT <Download size={20} />
                                </a>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
