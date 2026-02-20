import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Search as SearchIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Project, ProjectStep, ProjectHighlight } from '../lib/supabase';
import { storageAPI } from '../lib/storage';

const modalInputStyle = {
    width: '100%',
    padding: '12px',
    background: 'var(--bg-color)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-color)',
    fontSize: '14px',
    marginBottom: '10px',
    fontFamily: 'var(--font-body)'
};

const labelStyle = {
    display: 'block',
    fontSize: '13px',
    color: 'var(--text-muted)',
    marginBottom: '8px',
    fontWeight: '700',
    fontFamily: 'var(--font-body)',
    textTransform: 'uppercase' as any,
    letterSpacing: '1px'
};

const ProgressBar = ({ progress }: { progress: number }) => (
    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', margin: '15px 0', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent-color), #fff)', boxShadow: '0 0 10px var(--accent-color)' }}
        />
    </div>
);

const isVideoUrl = (url: string) => {
    if (!url) return false;
    // Check by extension anywhere in the path (handles Supabase URLs with query params)
    return /\.(mp4|webm|ogg|mov|avi|m4v)([?#]|$)/i.test(url);
};

interface ProjectFormProps {
    project: Project;
    onChange: (project: Project) => void;
    onSave: () => void;
    onCancel: () => void;
    allTags: string[];
    saving: boolean;
}

export default function ProjectForm({ project, onChange, onSave, onCancel, allTags, saving }: ProjectFormProps) {
    const [tagInput, setTagInput] = useState('');
    const [activeSection, setActiveSection] = useState<'basic' | 'metadata' | 'steps' | 'gallery' | 'highlights' | 'links'>('basic');
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [isUploading, setIsUploading] = useState(false);
    const [iconPickerTarget, setIconPickerTarget] = useState<'live' | 'download' | null>(null);
    const [iconSearch, setIconSearch] = useState('');

    const COMMON_ICONS = [
        'ExternalLink', 'Globe', 'Link', 'ArrowUpRight', 'Play', 'Download',
        'FileText', 'Figma', 'Github', 'Dribbble', 'Linkedin', 'Instagram',
        'Youtube', 'Twitter', 'Chrome', 'Monitor', 'Smartphone', 'Tablet',
        'Star', 'Heart', 'Bookmark', 'Eye', 'Share2', 'Send', 'Mail',
        'Rocket', 'Zap', 'Target', 'Award', 'Trophy', 'Coffee', 'Code',
        'Layers', 'Package', 'Box', 'Archive', 'Folder', 'File', 'Image',
        'Video', 'Music', 'Mic', 'Camera', 'Cpu', 'Database', 'Server',
        'ShoppingCart', 'ShoppingBag', 'Tag', 'Ticket', 'CreditCard',
        'Map', 'MapPin', 'Navigation', 'Compass', 'Globe2', 'Wifi',
    ];

    const filteredIcons = COMMON_ICONS.filter(name =>
        name.toLowerCase().includes(iconSearch.toLowerCase())
    );

    const addTag = (tag?: string) => {
        const value = tag || tagInput.trim();
        if (value) {
            const newTags = [...(project.tags || [])];
            if (!newTags.includes(value.toUpperCase())) {
                newTags.push(value.toUpperCase());
                onChange({ ...project, tags: newTags });
            }
            if (!tag) setTagInput('');
        }
    };

    const removeTag = (tag: string) => {
        onChange({ ...project, tags: project.tags?.filter(t => t !== tag) || [] });
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const fileId = 'cover';
            setIsUploading(true);
            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

            const url = await storageAPI.uploadImage(file, 'projects', (p) => {
                setUploadProgress(prev => ({ ...prev, [fileId]: p }));
            });

            if (url) onChange({ ...project, image_url: url });

            setIsUploading(false);
            setUploadProgress(prev => {
                const next = { ...prev };
                delete next[fileId];
                return next;
            });
        }
    };

    const addGalleryImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const fileId = `gal_${Date.now()}`;
            setIsUploading(true);
            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

            const url = await storageAPI.uploadImage(file, 'projects', (p) => {
                setUploadProgress(prev => ({ ...prev, [fileId]: p }));
            });

            if (url) {
                const newGallery = [...(project.gallery_images || []), url];
                onChange({ ...project, gallery_images: newGallery });
            }

            setIsUploading(false);
            setUploadProgress(prev => {
                const next = { ...prev };
                delete next[fileId];
                return next;
            });
        }
    };

    const removeGalleryImage = (index: number) => {
        const newGallery = [...(project.gallery_images || [])];
        newGallery.splice(index, 1);
        onChange({ ...project, gallery_images: newGallery });
    };

    const addGalleryVideo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const fileId = `vid_${Date.now()}`;
            setIsUploading(true);
            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

            const url = await storageAPI.uploadImage(file, 'projects', (progress) => {
                setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
            });

            if (url) {
                console.log('✅ Video upload success:', url);
                const currentVideos = project.gallery_videos || [];
                const newVideos = [...currentVideos, url];
                onChange({ ...project, gallery_videos: newVideos });
            } else {
                console.error('❌ Video upload failed URL is null');
                alert('Falha no upload do vídeo. Verifique se o arquivo não é muito grande ou se há erro de conexão.');
            }

            setIsUploading(false);
            setUploadProgress(prev => {
                const next = { ...prev };
                delete next[fileId];
                return next;
            });
        }
    };

    const removeGalleryVideo = (index: number) => {
        const newVideos = [...(project.gallery_videos || [])];
        newVideos.splice(index, 1);
        onChange({ ...project, gallery_videos: newVideos });
    };

    const addProjectStep = () => {
        const steps = project.project_steps || [];
        if (steps.length >= 4) {
            alert('Máximo de 4 etapas permitidas');
            return;
        }
        const newStep: ProjectStep = {
            number: `0${steps.length + 1} `,
            name: '',
            description: '',
            tags: ''
        };
        onChange({ ...project, project_steps: [...steps, newStep] });
    };

    const updateProjectStep = (index: number, field: keyof ProjectStep, value: string) => {
        const steps = [...(project.project_steps || [])];
        steps[index] = { ...steps[index], [field]: value };
        onChange({ ...project, project_steps: steps });
    };

    const removeProjectStep = (index: number) => {
        const steps = [...(project.project_steps || [])];
        steps.splice(index, 1);
        onChange({ ...project, project_steps: steps });
    };

    const addHighlight = () => {
        const newHighlight: ProjectHighlight = {
            title: '',
            text: '',
            image: ''
        };
        onChange({ ...project, highlights: [...(project.highlights || []), newHighlight] });
    };

    const updateHighlight = (index: number, field: keyof ProjectHighlight, value: string) => {
        const highlights = [...(project.highlights || [])];
        highlights[index] = { ...highlights[index], [field]: value };
        onChange({ ...project, highlights });
    };

    const removeHighlight = (index: number) => {
        const highlights = [...(project.highlights || [])];
        highlights.splice(index, 1);
        onChange({ ...project, highlights });
    };

    const uploadHighlightMedia = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const fileId = `highlight_${index}_${Date.now()}`;
            setIsUploading(true);
            setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));

            const url = await storageAPI.uploadImage(file, 'projects', (progress) => {
                setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
            });

            if (url) updateHighlight(index, 'image', url);

            setIsUploading(false);
            setUploadProgress(prev => {
                const next = { ...prev };
                delete next[fileId];
                return next;
            });
        }
    };

    const sections = [
        { id: 'basic', label: 'Basic' },
        { id: 'metadata', label: 'Metadata' },
        { id: 'steps', label: 'Explanation' },
        { id: 'gallery', label: 'Gallery' },
        { id: 'highlights', label: 'Results' },
        { id: 'links', label: 'Links' }
    ];

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px',
            overflow: 'auto'
        }}>
            <div style={{
                background: 'var(--surface-color)',
                borderRadius: '16px',
                maxWidth: '900px',
                width: '100%',
                maxHeight: '90vh',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>
                        {project.id === 'new' ? 'New Project' : 'Edit Project'}
                    </h2>
                    <button onClick={onCancel} style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer'
                    }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Section Tabs */}
                <div className="hide-scrollbar" style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--border-color)',
                    overflowX: 'auto',
                    alignItems: 'center',
                    minHeight: '70px'
                }}>
                    {sections.map(section => (
                        <button
                            key={section.id}
                            onClick={() => setActiveSection(section.id as any)}
                            style={{
                                padding: '12px 24px',
                                background: activeSection === section.id ? 'var(--accent-color)' : 'rgba(0,0,0,0.03)',
                                border: `1px solid ${activeSection === section.id ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                borderRadius: '12px',
                                color: activeSection === section.id ? '#FFFFFF' : 'var(--text-color)',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '800',
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s ease',
                                flexShrink: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {section.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
                    {/* BASIC SECTION */}
                    {activeSection === 'basic' && (
                        <div>
                            <label style={labelStyle}>Cover Photo *</label>
                            {project.image_url && (
                                <img src={project.image_url} alt="Cover" style={{
                                    width: '100%',
                                    height: '200px',
                                    objectFit: 'cover',
                                    borderRadius: '8px',
                                    marginBottom: '12px'
                                }} />
                            )}
                            <input type="file" accept="image/*" onChange={handleCoverUpload} style={modalInputStyle} />
                            {uploadProgress['cover'] !== undefined && (
                                <div style={{ marginBottom: '20px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-color)' }}>UPLOADING COVER: {Math.round(uploadProgress['cover'])}%</span>
                                    <ProgressBar progress={uploadProgress['cover']} />
                                </div>
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <label style={labelStyle}>Project Title *</label>
                                <span style={{ fontSize: '11px', color: (project.title?.length || 0) > 60 ? 'red' : 'var(--text-muted)' }}>
                                    {(project.title?.length || 0)}/60
                                </span>
                            </div>
                            <input
                                value={project.title || ''}
                                onChange={(e) => {
                                    if (e.target.value.length <= 60) {
                                        onChange({ ...project, title: e.target.value });
                                    }
                                }}
                                placeholder="Project Name"
                                style={modalInputStyle}
                                maxLength={60}
                            />

                            <label style={labelStyle}>Slug (Friendly URL)</label>
                            <input
                                value={project.slug || ''}
                                onChange={(e) => onChange({ ...project, slug: e.target.value })}
                                placeholder="example-project (leave empty for automatic generation)"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Short Description (Home)</label>
                            <textarea
                                value={project.short_description || ''}
                                onChange={(e) => onChange({ ...project, short_description: e.target.value })}
                                placeholder="Short text for Home display"
                                rows={2}
                                style={modalInputStyle}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <label style={labelStyle}>Eye-catcher / Summary (Home & Portfolio)</label>
                                <span style={{ fontSize: '11px', color: (project.summary?.length || 0) > 120 ? 'red' : 'var(--text-muted)' }}>
                                    {(project.summary?.length || 0)}/120
                                </span>
                            </div>
                            <textarea
                                value={project.summary || ''}
                                onChange={(e) => {
                                    if (e.target.value.length <= 120) {
                                        onChange({ ...project, summary: e.target.value });
                                    }
                                }}
                                placeholder="Highlight text appearing below the title (max 2 lines)"
                                rows={2}
                                style={modalInputStyle}
                                maxLength={120}
                            />

                            <label style={labelStyle}>Full Description (Project Page)</label>
                            <textarea
                                value={project.description || ''}
                                onChange={(e) => onChange({ ...project, description: e.target.value })}
                                placeholder="Detailed project description"
                                rows={5}
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Tags</label>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                {project.tags?.map(tag => (
                                    <span key={tag} style={{
                                        padding: '6px 12px',
                                        background: 'var(--accent-color)',
                                        color: 'var(--accent-contrast)',
                                        borderRadius: '20px',
                                        fontSize: '12px',
                                        fontWeight: '700',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {tag}
                                        <X size={14} onClick={() => removeTag(tag)} style={{ cursor: 'pointer' }} />
                                    </span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                                    placeholder="New tag"
                                    style={{ ...modalInputStyle, marginBottom: 0 }}
                                />
                                <button onClick={() => addTag()} style={{
                                    padding: '12px 24px',
                                    background: 'var(--accent-color)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'var(--accent-contrast)',
                                    cursor: 'pointer',
                                    fontWeight: '700'
                                }}>
                                    <Plus size={16} />
                                </button>
                            </div>
                            {allTags.length > 0 && (
                                <div style={{ marginTop: '12px' }}>
                                    <small style={{ color: 'var(--text-muted)' }}>Existing tags:</small>
                                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
                                        {allTags.map(tag => (
                                            <button
                                                key={tag}
                                                onClick={() => addTag(tag)}
                                                style={{
                                                    padding: '4px 10px',
                                                    background: 'transparent',
                                                    border: '1px solid var(--border-color)',
                                                    borderRadius: '12px',
                                                    fontSize: '11px',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* METADATA SECTION */}
                    {activeSection === 'metadata' && (
                        <div>
                            <label style={labelStyle}>Client Name</label>
                            <input
                                value={project.client_name || ''}
                                onChange={(e) => onChange({ ...project, client_name: e.target.value })}
                                placeholder="ROCKETSEAT"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Client Subtitle</label>
                            <input
                                value={project.client_subtitle || ''}
                                onChange={(e) => onChange({ ...project, client_subtitle: e.target.value })}
                                placeholder="Para Empresas"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Location</label>
                            <input
                                value={project.location || ''}
                                onChange={(e) => onChange({ ...project, location: e.target.value })}
                                placeholder="BRASIL BR"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Duration</label>
                            <input
                                value={project.duration || ''}
                                onChange={(e) => onChange({ ...project, duration: e.target.value })}
                                placeholder="DOIS MESES"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Year</label>
                            <input
                                value={project.year || ''}
                                onChange={(e) => onChange({ ...project, year: e.target.value })}
                                placeholder="2025"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>My Role</label>
                            <input
                                value={project.my_role || ''}
                                onChange={(e) => onChange({ ...project, my_role: e.target.value })}
                                placeholder="UI DESIGNER / DEVELOPER"
                                style={modalInputStyle}
                            />
                        </div>
                    )}

                    {/* STEPS SECTION */}
                    {activeSection === 'steps' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Project Steps (Max 4)</label>
                                <button
                                    onClick={addProjectStep}
                                    disabled={(project.project_steps?.length || 0) >= 4}
                                    style={{
                                        padding: '8px 16px',
                                        background: 'var(--accent-color)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'var(--accent-contrast)',
                                        cursor: (project.project_steps?.length || 0) >= 4 ? 'not-allowed' : 'pointer',
                                        fontWeight: '700',
                                        fontSize: '12px',
                                        opacity: (project.project_steps?.length || 0) >= 4 ? 0.5 : 1
                                    }}
                                >
                                    <Plus size={14} style={{ marginRight: '4px', display: 'inline' }} />
                                    Add Step
                                </button>
                            </div>

                            {project.project_steps?.map((step, index) => (
                                <div key={index} style={{
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <strong>Step {index + 1}</strong>
                                        <button onClick={() => removeProjectStep(index)} style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ff4444',
                                            cursor: 'pointer'
                                        }}>
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Number</label>
                                    <input
                                        value={step.number}
                                        onChange={(e) => updateProjectStep(index, 'number', e.target.value)}
                                        placeholder="01"
                                        style={{ ...modalInputStyle, marginBottom: '8px' }}
                                    />

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Name</label>
                                    <input
                                        value={step.name}
                                        onChange={(e) => updateProjectStep(index, 'name', e.target.value)}
                                        placeholder="DISCOVERY"
                                        style={{ ...modalInputStyle, marginBottom: '8px' }}
                                    />

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Description</label>
                                    <textarea
                                        value={step.description}
                                        onChange={(e) => updateProjectStep(index, 'description', e.target.value)}
                                        placeholder="Definition of scope, goals and problem understanding."
                                        rows={3}
                                        style={{ ...modalInputStyle, marginBottom: '8px' }}
                                    />

                                    <input
                                        value={step.tags}
                                        onChange={(e) => updateProjectStep(index, 'tags', e.target.value)}
                                        placeholder="BRIEFING / PESQUISAS / IMERSÃO"
                                        style={modalInputStyle}
                                    />
                                </div>
                            ))}

                            {(!project.project_steps || project.project_steps.length === 0) && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                                    No steps added. Click "Add Step" to start.
                                </p>
                            )}
                        </div>
                    )}

                    {/* GALLERY SECTION */}
                    {activeSection === 'gallery' && (
                        <div>
                            <label style={labelStyle}>Gallery Images (Upload or Link)</label>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    id="manual-gallery-image"
                                    placeholder="URL or local path (Ex: /img/my_image.jpg)"
                                    style={{ ...modalInputStyle, marginBottom: 0, flex: 1 }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            const input = e.currentTarget;
                                            if (input.value) {
                                                const currentImages = project.gallery_images || [];
                                                onChange({ ...project, gallery_images: [...currentImages, input.value] });
                                                input.value = '';
                                            }
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('manual-gallery-image') as HTMLInputElement;
                                        if (input && input.value) {
                                            const currentImages = project.gallery_images || [];
                                            onChange({ ...project, gallery_images: [...currentImages, input.value] });
                                            input.value = '';
                                        }
                                    }}
                                    style={{
                                        padding: '0 20px',
                                        background: 'var(--accent-color)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'var(--accent-contrast)',
                                        cursor: 'pointer',
                                        fontWeight: '700'
                                    }}
                                >
                                    ADD
                                </button>
                            </div>
                            <input type="file" accept="image/*" onChange={addGalleryImage} style={modalInputStyle} />
                            {Object.entries(uploadProgress).filter(([k]) => k.startsWith('gal_')).map(([k, v]) => (
                                <div key={k} style={{ marginBottom: '20px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-color)' }}>UPLOADING IMAGE: {Math.round(v)}%</span>
                                    <ProgressBar progress={v} />
                                </div>
                            ))}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px', marginTop: '16px' }}>
                                {project.gallery_images?.map((img, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <img src={img} alt={`Gallery ${index} `} style={{
                                            width: '100%',
                                            height: '150px',
                                            objectFit: 'cover',
                                            borderRadius: '8px'
                                        }} />
                                        <button
                                            onClick={() => removeGalleryImage(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'rgba(0,0,0,0.8)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '28px',
                                                height: '28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <label style={labelStyle}>Gallery Videos (Upload or Link)</label>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    id="manual-gallery-video"
                                    placeholder="URL or local path (Ex: /videos/my-video.mp4)"
                                    style={{ ...modalInputStyle, marginBottom: 0, flex: 1 }}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            const input = e.currentTarget;
                                            if (input.value) {
                                                const currentVideos = project.gallery_videos || [];
                                                onChange({ ...project, gallery_videos: [...currentVideos, input.value] });
                                                input.value = '';
                                            }
                                        }
                                    }}
                                />
                                <button
                                    onClick={() => {
                                        const input = document.getElementById('manual-gallery-video') as HTMLInputElement;
                                        if (input && input.value) {
                                            const currentVideos = project.gallery_videos || [];
                                            onChange({ ...project, gallery_videos: [...currentVideos, input.value] });
                                            input.value = '';
                                        }
                                    }}
                                    style={{
                                        padding: '0 20px',
                                        background: 'var(--accent-color)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'var(--accent-contrast)',
                                        cursor: 'pointer',
                                        fontWeight: '700'
                                    }}
                                >
                                    ADD
                                </button>
                            </div>
                            <input type="file" accept="video/*" onChange={addGalleryVideo} style={modalInputStyle} />
                            {Object.entries(uploadProgress).filter(([k]) => k.startsWith('vid_')).map(([k, v]) => (
                                <div key={k} style={{ marginBottom: '20px' }}>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-color)' }}>UPLOADING VIDEO: {Math.round(v)}%</span>
                                    <ProgressBar progress={v} />
                                </div>
                            ))}

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginTop: '16px' }}>
                                {project.gallery_videos?.map((vid, index) => (
                                    <div key={index} style={{ position: 'relative' }}>
                                        <video
                                            src={vid}
                                            controls={true}
                                            muted={true}
                                            preload="metadata"
                                            style={{
                                                width: '100%',
                                                height: '120px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                background: '#111'
                                            }}
                                            ref={(el) => {
                                                if (el) {
                                                    el.defaultMuted = true;
                                                    el.muted = true;
                                                }
                                            }}
                                        />
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', wordBreak: 'break-all', padding: '0 2px' }}>
                                            {vid.split('/').pop()?.split('?')[0]}
                                        </div>
                                        <button
                                            onClick={() => removeGalleryVideo(index)}
                                            style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                background: 'rgba(0,0,0,0.8)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: '28px',
                                                height: '28px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#fff',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            {(!project.gallery_videos || project.gallery_videos.length === 0) && (
                                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>Nenhum vídeo. Faça upload para exibir vídeo nos highlights.</p>
                            )}
                        </div>
                    )}



                    {/* HIGHLIGHTS SECTION */}
                    {activeSection === 'highlights' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Project Results (70/30)</label>
                                <button onClick={addHighlight} style={{
                                    padding: '8px 16px',
                                    background: 'var(--accent-color)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: 'var(--accent-contrast)',
                                    cursor: 'pointer',
                                    fontWeight: '700',
                                    fontSize: '12px'
                                }}>
                                    <Plus size={14} style={{ marginRight: '4px', display: 'inline' }} />
                                    Add Result
                                </button>
                            </div>

                            {project.highlights?.map((highlight, index) => (
                                <div key={index} style={{
                                    padding: '16px',
                                    background: 'rgba(255,255,255,0.02)',
                                    borderRadius: '8px',
                                    marginBottom: '12px',
                                    border: '1px solid var(--border-color)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                                        <strong>Result {index + 1} {index % 2 === 0 ? '(Image on left)' : '(Image on right)'}</strong>
                                        <button onClick={() => removeHighlight(index)} style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ff4444',
                                            cursor: 'pointer'
                                        }}>
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Title</label>
                                    <input
                                        value={highlight.title}
                                        onChange={(e) => updateHighlight(index, 'title', e.target.value)}
                                        placeholder="Intuitive Navigation"
                                        style={{ ...modalInputStyle, marginBottom: '8px' }}
                                    />

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Text</label>
                                    <textarea
                                        value={highlight.text}
                                        onChange={(e) => updateHighlight(index, 'text', e.target.value)}
                                        placeholder="We implemented an advanced filtering system..."
                                        rows={4}
                                        style={{ ...modalInputStyle, marginBottom: '8px' }}
                                    />

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Image or Video</label>
                                    {!!highlight.image && (
                                        <div style={{ marginBottom: '8px' }}>
                                            {isVideoUrl(highlight.image) ? (
                                                <video
                                                    src={highlight.image}
                                                    autoPlay={true}
                                                    loop={true}
                                                    muted={true}
                                                    playsInline={true}
                                                    preload="auto"
                                                    style={{
                                                        width: '100%',
                                                        height: '150px',
                                                        objectFit: 'cover',
                                                        borderRadius: '8px',
                                                        background: '#111'
                                                    }}
                                                    ref={(el) => {
                                                        if (el) {
                                                            el.defaultMuted = true;
                                                            el.muted = true;
                                                            el.play().catch(err => console.log('Autoplay prevented on form:', err));
                                                        }
                                                    }}
                                                    onError={(e) => console.error(`❌ Video load error for highlight[${index}]:`, (e.target as HTMLVideoElement).error)}
                                                />
                                            ) : (
                                                <img src={highlight.image} alt={highlight.title} style={{
                                                    width: '100%',
                                                    height: '150px',
                                                    objectFit: 'cover',
                                                    borderRadius: '8px',
                                                }} />
                                            )}
                                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', wordBreak: 'break-all' }}>
                                                {highlight.image}
                                            </div>
                                        </div>
                                    )}

                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <input
                                            type="text"
                                            value={highlight.image}
                                            onChange={(e) => updateHighlight(index, 'image', e.target.value)}
                                            placeholder="Direct URL or file (Ex: /videos/file.mp4)"
                                            style={{ ...modalInputStyle, marginBottom: 0, flex: 1 }}
                                        />
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/*,video/*"
                                        onChange={(e) => uploadHighlightMedia(index, e)}
                                        style={modalInputStyle}
                                    />
                                    {Object.entries(uploadProgress).filter(([k]) => k.startsWith(`highlight_${index}_`)).map(([k, v]) => (
                                        <div key={k} style={{ marginTop: '10px' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--accent-color)' }}>UPLOADING MEDIA: {Math.round(v)}%</span>
                                            <ProgressBar progress={v} />
                                        </div>
                                    ))}
                                </div>
                            ))}

                            {(!project.highlights || project.highlights.length === 0) && (
                                <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>
                                    No results added. Click "Add Result" to start.
                                </p>
                            )}
                        </div>
                    )}

                    {/* LINKS SECTION */}
                    {activeSection === 'links' && (
                        <div>
                            {/* Icon Picker Modal */}
                            {iconPickerTarget && (
                                <div style={{
                                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
                                    zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                                }} onClick={() => setIconPickerTarget(null)}>
                                    <div style={{
                                        background: 'var(--surface-color)', borderRadius: '16px', padding: '24px',
                                        maxWidth: '560px', width: '100%', maxHeight: '70vh', overflow: 'hidden',
                                        display: 'flex', flexDirection: 'column'
                                    }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800' }}>Select Icon (Lucide)</h4>
                                            <button onClick={() => setIconPickerTarget(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={20} /></button>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: 'var(--bg-color)', borderRadius: '8px', padding: '8px 12px', border: '1px solid var(--border-color)' }}>
                                            <SearchIcon size={16} color="var(--text-muted)" />
                                            <input
                                                autoFocus
                                                value={iconSearch}
                                                onChange={e => setIconSearch(e.target.value)}
                                                placeholder="Search icon... (ex: globe, link, play)"
                                                style={{ border: 'none', background: 'transparent', flex: 1, fontSize: '14px', color: 'var(--text-color)', outline: 'none' }}
                                            />
                                        </div>
                                        <div style={{ overflow: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                                            {filteredIcons.map(iconName => {
                                                const IconComp = (LucideIcons as any)[iconName];
                                                if (!IconComp) return null;
                                                const currentVal = iconPickerTarget === 'live'
                                                    ? (project as any).live_url_icon
                                                    : (project as any).download_url_icon;
                                                const isSelected = currentVal === iconName;
                                                return (
                                                    <button
                                                        key={iconName}
                                                        onClick={() => {
                                                            if (iconPickerTarget === 'live') {
                                                                onChange({ ...project, live_url_icon: iconName } as any);
                                                            } else {
                                                                onChange({ ...project, download_url_icon: iconName } as any);
                                                            }
                                                            setIconPickerTarget(null);
                                                            setIconSearch('');
                                                        }}
                                                        style={{
                                                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                                            padding: '10px 6px', border: `1px solid ${isSelected ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                                            borderRadius: '10px', background: isSelected ? 'var(--accent-color)' : 'var(--bg-color)',
                                                            color: isSelected ? '#fff' : 'var(--text-color)', cursor: 'pointer', fontSize: '10px',
                                                            fontWeight: '600', textAlign: 'center', transition: 'all 0.15s'
                                                        }}
                                                    >
                                                        <IconComp size={20} />
                                                        <span style={{ wordBreak: 'break-all', lineHeight: 1.2 }}>{iconName}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <label style={labelStyle}>Live Site Link (Live URL)</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                <input
                                    value={project.live_url || ''}
                                    onChange={(e) => onChange({ ...project, live_url: e.target.value })}
                                    placeholder="https://example.com"
                                    style={{ ...modalInputStyle, marginBottom: 0, flex: 1 }}
                                />
                                <button
                                    onClick={() => { setIconPickerTarget('live'); setIconSearch(''); }}
                                    title="Select icon"
                                    style={{
                                        padding: '0 14px', background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                        color: 'var(--text-color)', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap'
                                    }}
                                >
                                    {(project as any).live_url_icon && (() => {
                                        const IC = (LucideIcons as any)[(project as any).live_url_icon];
                                        return IC ? <IC size={16} /> : null;
                                    })()}
                                    {!(project as any).live_url_icon && <LucideIcons.Smile size={16} />}
                                    Icon
                                </button>
                            </div>
                            <div style={{ marginBottom: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                Icon selected: <strong>{(project as any).live_url_icon || 'none'}</strong>
                            </div>

                            <label style={labelStyle}>Live Site Button Label (Ex: Visit Live Site)</label>
                            <input
                                value={project.live_url_label || ''}
                                onChange={(e) => onChange({ ...project, live_url_label: e.target.value })}
                                placeholder="Visit Live Site"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Download Link (Case Study)</label>
                            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                                <input
                                    value={project.download_url || ''}
                                    onChange={(e) => onChange({ ...project, download_url: e.target.value })}
                                    placeholder="https://example.com/case-study.pdf"
                                    style={{ ...modalInputStyle, marginBottom: 0, flex: 1 }}
                                />
                                <button
                                    onClick={() => { setIconPickerTarget('download'); setIconSearch(''); }}
                                    title="Select icon"
                                    style={{
                                        padding: '0 14px', background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                                        borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                                        color: 'var(--text-color)', fontSize: '12px', fontWeight: '700', whiteSpace: 'nowrap'
                                    }}
                                >
                                    {(project as any).download_url_icon && (() => {
                                        const IC = (LucideIcons as any)[(project as any).download_url_icon];
                                        return IC ? <IC size={16} /> : null;
                                    })()}
                                    {!(project as any).download_url_icon && <LucideIcons.Smile size={16} />}
                                    Icon
                                </button>
                            </div>
                            <div style={{ marginBottom: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
                                Icon selected: <strong>{(project as any).download_url_icon || 'none'}</strong>
                            </div>

                            <label style={labelStyle}>Download Button Label (Ex: Download PDF)</label>
                            <input
                                value={project.download_url_label || ''}
                                onChange={(e) => onChange({ ...project, download_url_label: e.target.value })}
                                placeholder="Download Case Study"
                                style={modalInputStyle}
                            />

                            <div style={{ marginTop: '20px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', fontSize: '14px', color: 'var(--text-color)' }}>
                                    <input
                                        type="checkbox"
                                        checked={project.visible !== false}
                                        onChange={(e) => onChange({ ...project, visible: e.target.checked })}
                                        style={{ marginRight: '10px' }}
                                    />
                                    <strong>Project Visible in Portfolio</strong>
                                </label>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '24px',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'flex-end'
                }}>
                    <button onClick={onCancel} style={{
                        padding: '12px 24px',
                        background: 'transparent',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-color)',
                        cursor: 'pointer',
                        fontWeight: '700'
                    }}>
                        Cancel
                    </button>
                    <button onClick={onSave} disabled={saving || isUploading} style={{
                        padding: '12px 24px',
                        background: 'var(--accent-color)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'var(--accent-contrast)',
                        cursor: (saving || isUploading) ? 'not-allowed' : 'pointer',
                        fontWeight: '700',
                        opacity: (saving || isUploading) ? 0.6 : 1
                    }}>
                        {saving ? 'Saving...' : isUploading ? 'Wait for Upload...' : 'Save Project'}
                    </button>
                </div>
            </div>
        </div >
    );
}
