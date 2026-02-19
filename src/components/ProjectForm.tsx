import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
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
        { id: 'basic', label: 'Básico' },
        { id: 'metadata', label: 'Metadados' },
        { id: 'steps', label: 'Etapas' },
        { id: 'gallery', label: 'Galeria' },
        { id: 'highlights', label: 'Destaques' },
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
                        {project.id === 'new' ? 'Novo Projeto' : 'Editar Projeto'}
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
                            <label style={labelStyle}>Foto de Capa *</label>
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
                                <label style={labelStyle}>Título do Projeto *</label>
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
                                placeholder="Nome do projeto"
                                style={modalInputStyle}
                                maxLength={60}
                            />

                            <label style={labelStyle}>Slug (URL amigável)</label>
                            <input
                                value={project.slug || ''}
                                onChange={(e) => onChange({ ...project, slug: e.target.value })}
                                placeholder="projeto-exemplo (deixe vazio para gerar automaticamente)"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Descrição Curta (Home)</label>
                            <textarea
                                value={project.short_description || ''}
                                onChange={(e) => onChange({ ...project, short_description: e.target.value })}
                                placeholder="Texto curto para exibir na home"
                                rows={2}
                                style={modalInputStyle}
                            />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <label style={labelStyle}>Olho / Resumo (Home & Portfolio)</label>
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
                                placeholder="Texto de destaque que aparece abaixo do título (máx. 2 linhas)"
                                rows={2}
                                style={modalInputStyle}
                                maxLength={120}
                            />

                            <label style={labelStyle}>Descrição Completa (Página do Projeto)</label>
                            <textarea
                                value={project.description || ''}
                                onChange={(e) => onChange({ ...project, description: e.target.value })}
                                placeholder="Descrição detalhada do projeto"
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
                                    placeholder="Nova tag"
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
                                    <small style={{ color: 'var(--text-muted)' }}>Tags existentes:</small>
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
                            <label style={labelStyle}>Nome do Cliente</label>
                            <input
                                value={project.client_name || ''}
                                onChange={(e) => onChange({ ...project, client_name: e.target.value })}
                                placeholder="ROCKETSEAT"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Subtítulo do Cliente</label>
                            <input
                                value={project.client_subtitle || ''}
                                onChange={(e) => onChange({ ...project, client_subtitle: e.target.value })}
                                placeholder="Para Empresas"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Título da Página (Value Proposition)</label>
                            <input
                                value={project.page_title || ''}
                                onChange={(e) => onChange({ ...project, page_title: e.target.value })}
                                placeholder="Aumentando a percepção de valor através do novo design"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Local</label>
                            <input
                                value={project.location || ''}
                                onChange={(e) => onChange({ ...project, location: e.target.value })}
                                placeholder="BRASIL BR"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Duração</label>
                            <input
                                value={project.duration || ''}
                                onChange={(e) => onChange({ ...project, duration: e.target.value })}
                                placeholder="DOIS MESES"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Ano</label>
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
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Etapas do Projeto (Máx. 4)</label>
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
                                    Adicionar Etapa
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
                                        <strong>Etapa {index + 1}</strong>
                                        <button onClick={() => removeProjectStep(index)} style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ff4444',
                                            cursor: 'pointer'
                                        }}>
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Número</label>
                                    <input
                                        value={step.number}
                                        onChange={(e) => updateProjectStep(index, 'number', e.target.value)}
                                        placeholder="01"
                                        style={{ ...modalInputStyle, marginBottom: '8px' }}
                                    />

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Nome</label>
                                    <input
                                        value={step.name}
                                        onChange={(e) => updateProjectStep(index, 'name', e.target.value)}
                                        placeholder="DESCOBERTA"
                                        style={{ ...modalInputStyle, marginBottom: '8px' }}
                                    />

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Descrição</label>
                                    <textarea
                                        value={step.description}
                                        onChange={(e) => updateProjectStep(index, 'description', e.target.value)}
                                        placeholder="Definição do escopo, objetivos e entendimento do problema."
                                        rows={3}
                                        style={{ ...modalInputStyle, marginBottom: '8px' }}
                                    />

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Tags (separadas por /)</label>
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
                                    Nenhuma etapa adicionada. Clique em "Adicionar Etapa" para começar.
                                </p>
                            )}
                        </div>
                    )}

                    {/* GALLERY SECTION */}
                    {activeSection === 'gallery' && (
                        <div>
                            <label style={labelStyle}>Imagens da Galeria (Upload ou Link)</label>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    id="manual-gallery-image"
                                    placeholder="URL ou path local (Ex: /img/minha_imagem.jpg)"
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

                            <label style={labelStyle}>Vídeos da Galeria (Upload ou Link)</label>

                            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                                <input
                                    type="text"
                                    id="manual-gallery-video"
                                    placeholder="URL ou path local (Ex: /videos/meu-video.mp4)"
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
                                <label style={{ ...labelStyle, marginBottom: 0 }}>Seções Highlight (70/30)</label>
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
                                    Adicionar Highlight
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
                                        <strong>Highlight {index + 1} {index % 2 === 0 ? '(Imagem à esquerda)' : '(Imagem à direita)'}</strong>
                                        <button onClick={() => removeHighlight(index)} style={{
                                            background: 'transparent',
                                            border: 'none',
                                            color: '#ff4444',
                                            cursor: 'pointer'
                                        }}>
                                            <X size={16} />
                                        </button>
                                    </div>

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Título</label>
                                    <input
                                        value={highlight.title}
                                        onChange={(e) => updateHighlight(index, 'title', e.target.value)}
                                        placeholder="Navegação Intuitiva"
                                        style={{ ...modalInputStyle, marginBottom: '8px' }}
                                    />

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Texto</label>
                                    <textarea
                                        value={highlight.text}
                                        onChange={(e) => updateHighlight(index, 'text', e.target.value)}
                                        placeholder="Implementamos um sistema de filtros avançado..."
                                        rows={4}
                                        style={{ ...modalInputStyle, marginBottom: '8px' }}
                                    />

                                    <label style={{ ...labelStyle, fontSize: '11px' }}>Imagem ou Vídeo</label>
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
                                            placeholder="URL direta ou arquivo (Ex: /videos/file.mp4)"
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
                                    Nenhum highlight adicionado. Clique em "Adicionar Highlight" para começar.
                                </p>
                            )}
                        </div>
                    )}

                    {/* LINKS SECTION */}
                    {activeSection === 'links' && (
                        <div>
                            <label style={labelStyle}>Link do Site (Live URL)</label>
                            <input
                                value={project.live_url || ''}
                                onChange={(e) => onChange({ ...project, live_url: e.target.value })}
                                placeholder="https://exemplo.com"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Rótulo do Botão Site (Ex: Ver Site ao Vivo)</label>
                            <input
                                value={project.live_url_label || ''}
                                onChange={(e) => onChange({ ...project, live_url_label: e.target.value })}
                                placeholder="Ver Site ao Vivo"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Link para Download (Case Study)</label>
                            <input
                                value={project.download_url || ''}
                                onChange={(e) => onChange({ ...project, download_url: e.target.value })}
                                placeholder="https://exemplo.com/case-study.pdf"
                                style={modalInputStyle}
                            />

                            <label style={labelStyle}>Rótulo do Botão Download (Ex: Baixar PDF)</label>
                            <input
                                value={project.download_url_label || ''}
                                onChange={(e) => onChange({ ...project, download_url_label: e.target.value })}
                                placeholder="Baixar Case Study"
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
                                    <strong>Projeto Visível no Portfolio</strong>
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
                        Cancelar
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
                        {saving ? 'Salvando...' : isUploading ? 'Aguarde o Upload...' : 'Salvar Projeto'}
                    </button>
                </div>
            </div>
        </div >
    );
}
