import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

// Define the interface for the modal props
export interface ProjectData {
    title: string;
    type?: string;
    year?: string;
    tags?: string[];
    img: string; // Main image
    gallery?: string[]; // Gallery images for carousel
    description?: string; // Optional full description
}

interface ProjectModalProps {
    project: ProjectData | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProjectModal({ project, isOpen, onClose }: ProjectModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
    const allImages = [project.img, ...(project.gallery || [])];
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
                            background: 'rgba(0,0,0,0.8)',
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
                            top: '5%', left: '5%', right: '5%', bottom: '5%',
                            background: 'var(--surface-color)',
                            borderRadius: '24px',
                            border: '1px solid var(--border-color)',
                            zIndex: 9999,
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}
                    >
                        {/* Header Actions */}
                        <div style={{ padding: '30px', display: 'flex', justifyContent: 'flex-end', position: 'absolute', top: 0, right: 0, zIndex: 10, width: '100%' }}>
                            <button
                                onClick={onClose}
                                className="clickable"
                                style={{
                                    background: 'rgba(255,255,255,0.1)', border: 'none',
                                    borderRadius: '50%', width: '40px', height: '40px',
                                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', height: '100%', flexDirection: 'row' }}>
                            {/* Left: Image Area with Carousel */}
                            <div style={{ flex: 1.5, position: 'relative', overflow: 'hidden', borderRight: '1px solid var(--border-color)' }}>
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
                                                left: '20px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'rgba(0,0,0,0.5)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '50px',
                                                height: '50px',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                backdropFilter: 'blur(5px)'
                                            }}
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={nextImage}
                                            className="clickable"
                                            style={{
                                                position: 'absolute',
                                                right: '20px',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'rgba(0,0,0,0.5)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '50px',
                                                height: '50px',
                                                color: 'white',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                backdropFilter: 'blur(5px)'
                                            }}
                                        >
                                            <ChevronRight size={24} />
                                        </button>

                                        {/* Image Counter */}
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '20px',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            background: 'rgba(0,0,0,0.7)',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '20px',
                                            fontSize: '14px',
                                            backdropFilter: 'blur(5px)'
                                        }}>
                                            {currentImageIndex + 1} / {allImages.length}
                                        </div>
                                    </>
                                )}

                                <div style={{
                                    position: 'absolute', bottom: 0, left: 0, width: '100%',
                                    padding: '40px', background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                                }}>
                                    <h2 style={{ fontSize: '40px', marginBottom: '10px' }}>{project.title}</h2>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        {project.tags?.map(tag => (
                                            <span key={tag} style={{ border: '1px solid white', borderRadius: '20px', padding: '5px 15px', fontSize: '12px' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Right: Content Area */}
                            <div style={{ flex: 1, padding: '60px 40px', overflowY: 'auto' }}>
                                <div style={{ marginBottom: '40px' }}>
                                    <h4 style={{ color: 'var(--accent-color)', marginBottom: '10px' }}>DESCRIPTION</h4>
                                    <p style={{ fontSize: '18px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                                        {project.description || "Lorem ipsum dolor sit amet consectetur. Lorem morbi adipiscing netus nibh ut vel ipsum fringilla cursus. Neque blandit vestibulum sem eu viverra. Massa lorem nisl ultrices ultricies diam vitae nunc. Tristique in blandit imperdiet ante viverra tempus."}
                                    </p>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '40px' }}>
                                    <div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '5px' }}>Year</div>
                                        <div style={{ fontSize: '20px' }}>{project.year || '2024'}</div>
                                    </div>
                                    <div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '5px' }}>Role</div>
                                        <div style={{ fontSize: '20px' }}>{project.type || 'Product Design'}</div>
                                    </div>
                                </div>

                                <button
                                    className="clickable"
                                    style={{
                                        width: '100%', padding: '20px',
                                        background: 'var(--accent-color)', color: 'black',
                                        border: 'none', borderRadius: '8px',
                                        fontSize: '18px', fontWeight: 'bold',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px'
                                    }}
                                >
                                    VIEW LIVE PROJECT <ExternalLink size={20} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
