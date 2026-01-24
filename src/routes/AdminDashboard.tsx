import { useState, useEffect } from 'react';
import {
    supabase,
    contentAPI,
    projectsAPI,
    cvAPI,
    apiConfigAPI,
    type Project,
    type CVSection,
    type APIConfiguration
} from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Save, Plus, Trash2, Settings, X,
    Image as ImageIcon, LayoutDashboard, FolderKanban,
    FileText, Palette, ChevronRight
} from 'lucide-react';
import { storageAPI } from '../lib/storage';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'content' | 'projects' | 'cv' | 'settings'>('content');

    // Content State
    const [heroTitle, setHeroTitle] = useState('');
    const [heroDesc, setHeroDesc] = useState('');
    const [storyText, setStoryText] = useState('');
    const [cvUrl, setCvUrl] = useState('');

    // Projects State
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [availableTags, setAvailableTags] = useState<string[]>([]);

    // CV State
    const [cvSections, setCvSections] = useState<CVSection[]>([]);
    const [editingCV, setEditingCV] = useState<CVSection | null>(null);

    // Settings State
    const [apiConfigs, setApiConfigs] = useState<APIConfiguration[]>([]);
    const [branding, setBranding] = useState({
        logoText1: 'VINICIUS',
        logoText2: 'CAMPOS',
        accentColor: '#F2A73D',
        bgColor: '#050505'
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadContent();
        loadProjects();
        loadCV();
        loadSettings();
    }, []);

    useEffect(() => {
        // Update available tags from projects
        const tags = new Set<string>();
        projects.forEach(p => p.tags.forEach(t => tags.add(t)));
        setAvailableTags(Array.from(tags).sort());
    }, [projects]);

    const loadContent = async () => {
        const title = await contentAPI.getByKey('hero.title');
        const desc = await contentAPI.getByKey('hero.description');
        const story = await contentAPI.getByKey('storytelling.main');
        const cvLink = await contentAPI.getByKey('cv.pdf_url');

        if (title) setHeroTitle(title.value);
        if (desc) setHeroDesc(desc.value);
        if (story) setStoryText(story.value);
        if (cvLink) setCvUrl(cvLink.value);
    };

    const loadProjects = async () => {
        const data = await projectsAPI.getAll();
        setProjects(data);
    };

    const loadCV = async () => {
        const data = await cvAPI.getAll();
        setCvSections(data);
    };

    const loadSettings = async () => {
        const configsData = await apiConfigAPI.getAll();
        setApiConfigs(configsData);

        const l1 = await contentAPI.getByKey('general.logo_text1');
        const l2 = await contentAPI.getByKey('general.logo_text2');
        const ac = await contentAPI.getByKey('general.accent_color');
        const bg = await contentAPI.getByKey('general.bg_color');

        setBranding({
            logoText1: l1?.value || 'VINICIUS',
            logoText2: l2?.value || 'CAMPOS',
            accentColor: ac?.value || '#F2A73D',
            bgColor: bg?.value || '#050505'
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin');
    };

    const saveContent = async () => {
        setSaving(true);
        try {
            await Promise.all([
                contentAPI.update('hero.title', heroTitle, 'hero'),
                contentAPI.update('hero.description', heroDesc, 'hero'),
                contentAPI.update('storytelling.main', storyText, 'storytelling'),
                contentAPI.update('cv.pdf_url', cvUrl, 'cv')
            ]);
            setMessage('✅ Conteúdo salvo com sucesso!');
        } catch (err) {
            setMessage('❌ Erro ao salvar conteúdo.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const saveProject = async () => {
        if (!editingProject) return;
        setSaving(true);
        try {
            const { id, created_at, updated_at, ...projectData } = editingProject as any;
            if (id && id !== '') {
                await projectsAPI.update(id, projectData);
            } else {
                await projectsAPI.create(projectData);
            }
            await loadProjects();
            setEditingProject(null);
            setMessage('✅ Projeto salvo!');
        } catch (err) {
            setMessage('❌ Erro ao salvar projeto.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const deleteProject = async (id: string) => {
        if (confirm('Excluir este projeto?')) {
            await projectsAPI.delete(id);
            await loadProjects();
        }
    };

    const saveCV = async () => {
        if (!editingCV) return;
        setSaving(true);
        try {
            const { id, created_at, updated_at, ...cvData } = editingCV as any;
            if (id && id !== '') {
                await cvAPI.update(id, cvData);
            } else {
                await cvAPI.create(cvData);
            }
            await loadCV();
            setEditingCV(null);
            setMessage('✅ Seção do CV salva!');
        } catch (err) {
            setMessage('❌ Erro ao salvar CV.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const deleteCV = async (id: string) => {
        if (confirm('Excluir esta seção?')) {
            await cvAPI.delete(id);
            await loadCV();
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            for (const config of apiConfigs) {
                await apiConfigAPI.update(config.id, { api_key: config.api_key, is_active: config.is_active });
            }
            await contentAPI.update('general.logo_text1', branding.logoText1, 'general');
            await contentAPI.update('general.logo_text2', branding.logoText2, 'general');
            await contentAPI.update('general.accent_color', branding.accentColor, 'general');
            await contentAPI.update('general.bg_color', branding.bgColor, 'general');
            setMessage('✅ Configurações salvas!');
        } catch (err) {
            setMessage('❌ Erro ao salvar configurações.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const toggleTag = (tag: string) => {
        if (!editingProject) return;
        const currentTags = editingProject.tags || [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter(t => t !== tag)
            : [...currentTags, tag];
        setEditingProject({ ...editingProject, tags: newTags });
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingProject) return;
        setSaving(true);
        const url = await storageAPI.uploadImage(file, 'covers');
        if (url) setEditingProject({ ...editingProject, image_url: url });
        setSaving(false);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
            {/* Sidebar */}
            <div style={{
                width: '260px',
                background: '#111',
                borderRight: '1px solid #222',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px'
            }}>
                <div style={{ marginBottom: '40px', padding: '10px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', letterSpacing: '2px', color: 'var(--accent-color)' }}>
                        DASHBOARD
                    </h1>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { id: 'content', label: 'Conteúdo', icon: LayoutDashboard },
                        { id: 'projects', label: 'Projetos', icon: FolderKanban },
                        { id: 'cv', label: 'Currículo', icon: FileText },
                        { id: 'settings', label: 'Configurações', icon: Settings },
                    ].map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px 16px',
                                background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                border: 'none',
                                borderRadius: '10px',
                                color: activeTab === item.id ? 'var(--accent-color)' : '#888',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                textAlign: 'left',
                                fontWeight: activeTab === item.id ? 'bold' : 'normal'
                            }}
                        >
                            <item.icon size={20} />
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {activeTab === item.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </nav>

                <button
                    onClick={handleLogout}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        borderRadius: '10px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        marginTop: 'auto'
                    }}
                >
                    <LogOut size={20} />
                    <span>Sair</span>
                </button>
            </div>

            {/* Main Content */}
            <div style={{ flex: 1, padding: '40px', overflowY: 'auto', position: 'relative' }}>
                {message && (
                    <div style={{
                        position: 'fixed', top: '40px', right: '40px',
                        padding: '16px 24px', background: message.includes('✅') ? '#065f46' : '#991b1b',
                        color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        zIndex: 10000, fontFamily: 'var(--font-body)'
                    }}>
                        {message}
                    </div>
                )}

                {/* CONTENT TAB */}
                {activeTab === 'content' && (
                    <div style={{ maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '40px', fontFamily: 'var(--font-display)' }}>CONTEÚDO DO SITE</h2>
                        <div style={{ display: 'grid', gap: '30px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#888' }}>Título do Hero</label>
                                <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} style={{ width: '100%', padding: '15px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#888' }}>Descrição do Hero</label>
                                <textarea value={heroDesc} onChange={e => setHeroDesc(e.target.value)} rows={4} style={{ width: '100%', padding: '15px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', resize: 'vertical' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#888' }}>Texto da História</label>
                                <textarea value={storyText} onChange={e => setStoryText(e.target.value)} rows={3} style={{ width: '100%', padding: '15px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '10px', color: '#888' }}>Link do CV (PDF)</label>
                                <input value={cvUrl} onChange={e => setCvUrl(e.target.value)} style={{ width: '100%', padding: '15px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                            </div>
                            <button onClick={saveContent} disabled={saving} style={{ padding: '15px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                <Save size={18} /> {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                            </button>
                        </div>
                    </div>
                )}

                {/* PROJECTS TAB */}
                {activeTab === 'projects' && (
                    <div style={{ maxWidth: '1000px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '32px', margin: 0, fontFamily: 'var(--font-display)' }}>MEUS PROJETOS</h2>
                            <button
                                onClick={() => setEditingProject({ id: '', title: '', description: '', image_url: '', tags: [], year: '2024', order_index: projects.length, visible: true, gallery_images: [] } as any)}
                                style={{ padding: '12px 24px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Plus size={18} /> NOVO PROJETO
                            </button>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                            {projects.map(p => (
                                <div key={p.id} style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', overflow: 'hidden' }}>
                                    <div style={{ height: '180px', background: `url(${p.image_url}) center/cover no-repeat` }} />
                                    <div style={{ padding: '20px' }}>
                                        <h3 style={{ margin: '0 0 10px', fontSize: '18px' }}>{p.title}</h3>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                                            {p.tags.map(t => <span key={t} style={{ fontSize: '10px', padding: '4px 8px', background: '#222', borderRadius: '4px' }}>{t}</span>)}
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => setEditingProject(p)} style={{ flex: 1, padding: '8px', background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>Editar</button>
                                            <button onClick={() => deleteProject(p.id)} style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* CV TAB */}
                {activeTab === 'cv' && (
                    <div style={{ maxWidth: '800px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <h2 style={{ fontSize: '32px', margin: 0, fontFamily: 'var(--font-display)' }}>CURRÍCULO</h2>
                            <button
                                onClick={() => setEditingCV({ id: '', section_type: 'experience', title: '', subtitle: '', description: '', date_range: '', order_index: cvSections.length, visible: true } as any)}
                                style={{ padding: '12px 24px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                            >
                                <Plus size={18} /> NOVA SEÇÃO
                            </button>
                        </div>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {cvSections.map(s => (
                                <div key={s.id} style={{ padding: '20px', background: '#111', border: '1px solid #222', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <span style={{ fontSize: '10px', padding: '2px 8px', background: 'var(--accent-color)', color: '#000', borderRadius: '4px', textTransform: 'uppercase', marginRight: '10px' }}>{s.section_type}</span>
                                        <span style={{ fontWeight: 'bold' }}>{s.title}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => setEditingCV(s)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#fff', cursor: 'pointer' }}>Editar</button>
                                        <button onClick={() => deleteCV(s.id)} style={{ padding: '6px 12px', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* SETTINGS TAB */}
                {activeTab === 'settings' && (
                    <div style={{ maxWidth: '800px' }}>
                        <h2 style={{ fontSize: '32px', marginBottom: '40px', fontFamily: 'var(--font-display)' }}>CONFIGURAÇÕES GERAIS</h2>

                        <div style={{ display: 'grid', gap: '30px' }}>
                            {/* Branding Section */}
                            <div style={{ background: '#111', padding: '30px', borderRadius: '16px', border: '1px solid #222' }}>
                                <h3 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Palette size={20} /> Identidade Visual
                                </h3>
                                <div style={{ display: 'grid', gap: '20px' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#888' }}>Logo Linha 1</label>
                                            <input value={branding.logoText1} onChange={e => setBranding({ ...branding, logoText1: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#888' }}>Logo Linha 2</label>
                                            <input value={branding.logoText2} onChange={e => setBranding({ ...branding, logoText2: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#888' }}>Cor de Destaque</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input type="color" value={branding.accentColor} onChange={e => setBranding({ ...branding, accentColor: e.target.value })} style={{ width: '50px', height: '44px', padding: '4px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                                                <input value={branding.accentColor} onChange={e => setBranding({ ...branding, accentColor: e.target.value })} style={{ flex: 1, padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                            </div>
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '14px', marginBottom: '8px', color: '#888' }}>Cor de Fundo</label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input type="color" value={branding.bgColor} onChange={e => setBranding({ ...branding, bgColor: e.target.value })} style={{ width: '50px', height: '44px', padding: '4px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                                                <input value={branding.bgColor} onChange={e => setBranding({ ...branding, bgColor: e.target.value })} style={{ flex: 1, padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={saveSettings} disabled={saving} style={{ padding: '15px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                {saving ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* PROJECT MODAL */}
            {editingProject && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }} onClick={() => setEditingProject(null)}>
                    <div className="hide-scrollbar" style={{ background: '#111', width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '24px', padding: '40px', border: '1px solid #222' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h3 style={{ fontSize: '24px', margin: 0 }}>{editingProject.id ? 'EDITAR PROJETO' : 'NOVO PROJETO'}</h3>
                            <button onClick={() => setEditingProject(null)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><X size={24} /></button>
                        </div>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Título</label>
                                <input value={editingProject.title} onChange={e => setEditingProject({ ...editingProject, title: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Ano</label>
                                    <input value={editingProject.year || ''} onChange={e => setEditingProject({ ...editingProject, year: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Ordem</label>
                                    <input type="number" value={editingProject.order_index} onChange={e => setEditingProject({ ...editingProject, order_index: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Tags</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', padding: '10px', background: '#0a0a0a', borderRadius: '8px', border: '1px solid #333' }}>
                                    {editingProject.tags?.map(t => (
                                        <span key={t} onClick={() => toggleTag(t)} style={{ padding: '4px 10px', background: 'var(--accent-color)', color: '#000', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            {t} <X size={10} />
                                        </span>
                                    ))}
                                    <input
                                        placeholder="Add tag..."
                                        onKeyDown={e => {
                                            if (e.key === 'Enter') {
                                                const val = (e.target as HTMLInputElement).value.trim();
                                                if (val && !editingProject.tags.includes(val)) toggleTag(val);
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', padding: '4px', flex: 1 }}
                                    />
                                </div>
                                {/* Tag Memory */}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    <span style={{ fontSize: '12px', color: '#555', marginRight: '5px' }}>Sugeridas:</span>
                                    {availableTags.filter(t => !editingProject.tags.includes(t)).map(t => (
                                        <button key={t} onClick={() => toggleTag(t)} style={{ padding: '2px 8px', background: 'transparent', border: '1px solid #333', borderRadius: '4px', color: '#888', fontSize: '11px', cursor: 'pointer' }}>+ {t}</button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Imagem de Capa</label>
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <div style={{ width: '100px', height: '60px', background: `url(${editingProject.image_url}) center/cover no-repeat`, borderRadius: '8px', border: '1px solid #333' }} />
                                    <input type="file" onChange={handleCoverUpload} id="project-cover" style={{ display: 'none' }} />
                                    <label htmlFor="project-cover" style={{ padding: '8px 16px', background: '#333', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}>Trocar Imagem</label>
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Descrição</label>
                                <textarea value={editingProject.description || ''} onChange={e => setEditingProject({ ...editingProject, description: e.target.value })} rows={3} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                            </div>

                            <button onClick={saveProject} style={{ padding: '15px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                                SALVAR PROJETO
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CV MODAL */}
            {editingCV && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setEditingCV(null)}>
                    <div style={{ background: '#111', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: '40px', border: '1px solid #222' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '24px', marginBottom: '30px' }}>{editingCV.id ? 'EDITAR SEÇÃO' : 'NOVA SEÇÃO'}</h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Tipo</label>
                                <select value={editingCV.section_type} onChange={e => setEditingCV({ ...editingCV, section_type: e.target.value as any })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}>
                                    <option value="experience">Experiência</option>
                                    <option value="education">Educação</option>
                                    <option value="skills">Habilidade (Skill)</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Título</label>
                                <input value={editingCV.title} onChange={e => setEditingCV({ ...editingCV, title: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                            </div>

                            {editingCV.section_type !== 'skills' && (
                                <>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Subtítulo</label>
                                        <input value={editingCV.subtitle || ''} onChange={e => setEditingCV({ ...editingCV, subtitle: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Período</label>
                                        <input value={editingCV.date_range || ''} onChange={e => setEditingCV({ ...editingCV, date_range: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Descrição</label>
                                        <textarea value={editingCV.description || ''} onChange={e => setEditingCV({ ...editingCV, description: e.target.value })} rows={3} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                    </div>
                                </>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#888' }}>Ordem</label>
                                    <input type="number" value={editingCV.order_index} onChange={e => setEditingCV({ ...editingCV, order_index: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '30px' }}>
                                    <input type="checkbox" checked={editingCV.visible} onChange={e => setEditingCV({ ...editingCV, visible: e.target.checked })} />
                                    <label>Visível</label>
                                </div>
                            </div>
                            <button onClick={saveCV} style={{ padding: '15px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                                SALVAR SEÇÃO
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
