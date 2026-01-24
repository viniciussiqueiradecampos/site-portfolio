import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ProjectData } from '../lib/supabase';

interface ProjectModalProps {
    project: ProjectData | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            setCurrentImageIndex(0); // Reset to first image
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!project) return null;

    // Combine main image with gallery images
    const mainImg = project.image_url || project.img || '';
    const galleryItems = project.gallery_images || project.gallery || [];
    const allImages = [mainImg, ...galleryItems].filter(Boolean);
    const hasMultipleImages = allImages.length > 1;

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="clickable"
                        style={{
                            position: 'fixed', inset: 0,
                            background: 'rgba(0,0,0,0.85)',
                            backdropFilter: 'blur(10px)',
                            zIndex: 9998
                        }}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            position: 'fixed',
                            top: isMobile ? '2%' : '5%',
                            left: isMobile ? '2%' : '5%',
                            right: isMobile ? '2%' : '5%',
                            bottom: isMobile ? '2%' : '5%',
                            background: 'var(--surface-color)',
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            zIndex: 9999,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: isMobile ? 'column' : 'row'
                        }}
                    >
                        {/* Header Actions */}
                        <div style={{ padding: '20px', display: 'flex', justifyContent: 'flex-end', position: 'absolute', top: 0, right: 0, zIndex: 100, pointerEvents: 'none' }}>
                            <button
                                onClick={onClose}
                                className="clickable"
                                style={{
                                    background: 'rgba(0,0,0,0.5)', border: 'none',
                                    borderRadius: '50%', width: '40px', height: '40px',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Left/Top: Image Area with Carousel */}
                        <div style={{
                            flex: isMobile ? 'none' : 1.5,
                            height: isMobile ? '40%' : '100%',
                            position: 'relative',
                            overflow: 'hidden',
                            borderRight: isMobile ? 'none' : '1px solid var(--border-color)',
                            borderBottom: isMobile ? '1px solid var(--border-color)' : 'none'
                        }}>
                            <img
                                src={allImages[currentImageIndex]}
                                alt={project.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />

                            {/* Carousel Navigation */}
                            {hasMultipleImages && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="clickable"
                                        style={{
                                            position: 'absolute',
                                            left: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(0,0,0,0.5)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            backdropFilter: 'blur(5px)'
                                        }}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="clickable"
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'rgba(0,0,0,0.5)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '40px',
                                            height: '40px',
                                            color: 'white',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            backdropFilter: 'blur(5px)'
                                        }}
                                    >
                                        <ChevronRight size={20} />
                                    </button>

                                    {/* Image Counter */}
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '20px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        background: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        backdropFilter: 'blur(5px)'
                                    }}>
                                        {currentImageIndex + 1} / {allImages.length}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right/Bottom: Content Area */}
                        <div style={{ flex: 1, padding: isMobile ? '30px' : '60px 40px', overflowY: 'auto' }}>
                            <div style={{ marginBottom: '30px' }}>
                                <h2 style={{ fontSize: isMobile ? '32px' : '48px', marginBottom: '10px', fontFamily: 'var(--font-display)' }}>{project.title}</h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '30px' }}>
                                    {project.tags?.map(tag => (
                                        <span key={tag} style={{ border: '1px solid var(--border-color)', borderRadius: '20px', padding: '4px 12px', fontSize: '11px', textTransform: 'uppercase' }}>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <h4 style={{ color: 'var(--accent-color)', marginBottom: '10px', fontSize: '12px', fontFamily: 'var(--font-display)' }}>DESCRIPTION</h4>
                                <p style={{ fontSize: isMobile ? '16px' : '18px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                    {project.description || "Project details coming soon..."}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '40px' }}>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '5px' }}>YEAR</div>
                                    <div style={{ fontSize: '18px' }}>{project.year || '2024'}</div>
                                </div>
                                <div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '5px' }}>ROLE</div>
                                    <div style={{ fontSize: '18px' }}>{project.type || 'Product Design'}</div>
                                </div>
                            </div>

                            <button
                                className="clickable"
                                style={{
                                    width: '100%', padding: '16px',
                                    background: 'var(--accent-color)', color: 'black',
                                    border: 'none', borderRadius: '8px',
                                    fontSize: '16px', fontWeight: 'bold',
                                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                                }}
                            >
                                VIEW LIVE PROJECT <ExternalLink size={20} />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
