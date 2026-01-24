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
    LogOut, Save, Plus, Trash2, Settings, X, Menu,
    LayoutDashboard, FolderKanban,
    FileText, Palette, ChevronRight, Award, GraduationCap, Briefcase, MousePointer2
} from 'lucide-react';
import { storageAPI } from '../lib/storage';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'content' | 'projects' | 'cv' | 'settings'>('content');
    const [cvSubTab, setCvSubTab] = useState<'experience' | 'education' | 'skills' | 'certification'>('experience');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
        bgColor: '#050505',
        lightAccentColor: '#C87A1A',
        lightBgColor: '#FFFFFF',
        linkedin: '',
        instagram: '',
        footerEmail: '',
        showToolbar: true
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        loadContent();
        loadProjects();
        loadCV();
        loadSettings();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
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
        const lac = await contentAPI.getByKey('general.light_accent_color');
        const lbg = await contentAPI.getByKey('general.light_bg_color');

        setBranding({
            logoText1: l1?.value || 'VINICIUS',
            logoText2: l2?.value || 'CAMPOS',
            accentColor: ac?.value || '#F2A73D',
            bgColor: bg?.value || '#050505',
            lightAccentColor: lac?.value || '#C87A1A',
            lightBgColor: lbg?.value || '#FFFFFF',
            linkedin: (await contentAPI.getByKey('social.linkedin'))?.value || '',
            instagram: (await contentAPI.getByKey('social.instagram'))?.value || '',
            footerEmail: (await contentAPI.getByKey('social.footer_email'))?.value || '',
            showToolbar: (await contentAPI.getByKey('general.show_toolbar'))?.value === 'true'
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
            setMessage('✅ Conteúdo salvo!');
        } catch (err) { setMessage('❌ Erro ao salvar.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const saveProject = async () => {
        if (!editingProject) return;
        setSaving(true);
        try {
            const { id, created_at, updated_at, ...projectData } = editingProject as any;
            if (id && id !== '') await projectsAPI.update(id, projectData);
            else await projectsAPI.create(projectData);
            await loadProjects();
            setEditingProject(null);
            setMessage('✅ Projeto salvo!');
        } catch (err) { setMessage('❌ Erro.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const deleteProject = async (id: string) => {
        if (confirm('Excluir?')) { await projectsAPI.delete(id); await loadProjects(); }
    };

    const saveCV = async () => {
        if (!editingCV) return;
        setSaving(true);
        try {
            const { id, created_at, updated_at, ...cvData } = editingCV as any;
            if (id && id !== '') await cvAPI.update(id, cvData);
            else await cvAPI.create(cvData);
            await loadCV();
            setEditingCV(null);
            setMessage('✅ Seção salva!');
        } catch (err) { setMessage('❌ Erro.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const deleteCV = async (id: string) => {
        if (confirm('Excluir?')) { await cvAPI.delete(id); await loadCV(); }
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
            await contentAPI.update('general.light_accent_color', branding.lightAccentColor, 'general');
            await contentAPI.update('general.light_bg_color', branding.lightBgColor, 'general');
            await contentAPI.update('social.linkedin', branding.linkedin, 'social');
            await contentAPI.update('social.instagram', branding.instagram, 'social');
            await contentAPI.update('social.footer_email', branding.footerEmail, 'social');
            await contentAPI.update('general.show_toolbar', branding.showToolbar.toString(), 'general');
            setMessage('✅ Configurações salvas!');
        } catch (err) { setMessage('❌ Erro.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const toggleTag = (tag: string) => {
        if (!editingProject) return;
        const currentTags = editingProject.tags || [];
        const newTags = currentTags.includes(tag) ? currentTags.filter(t => t !== tag) : [...currentTags, tag];
        setEditingProject({ ...editingProject, tags: newTags });
    };

    const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSaving(true);
        const url = await storageAPI.uploadImage(file, 'cv');
        if (url) {
            setCvUrl(url);
            setMessage('✅ PDF do CV carregado!');
        } else {
            setMessage('❌ Erro no upload.');
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editingProject) return;
        setSaving(true);
        const url = await storageAPI.uploadImage(file, 'covers');
        if (url) setEditingProject({ ...editingProject, image_url: url });
        setSaving(false);
    };

    const filteredCV = cvSections.filter(s => s.section_type === cvSubTab).sort((a, b) => a.order_index - b.order_index);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', position: 'relative' }}>
            {/* Sidebar Overlay for Mobile */}
            {isSidebarOpen && isMobile && (
                <div
                    onClick={() => setIsSidebarOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000 }}
                />
            )}

            {/* Sidebar */}
            <div style={{
                width: isMobile ? '280px' : '260px',
                background: '#111',
                borderRight: '1px solid #222',
                display: 'flex',
                flexDirection: 'column',
                padding: '20px',
                position: isMobile ? 'fixed' : 'sticky',
                top: 0,
                height: '100vh',
                zIndex: 1001,
                transition: 'transform 0.3s ease',
                transform: isMobile && !isSidebarOpen ? 'translateX(-100%)' : 'translateX(0)'
            }}>
                <div style={{ marginBottom: '40px', padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', letterSpacing: '2px', color: 'var(--accent-color)', margin: 0 }}>
                        DASHBOARD
                    </h1>
                    {isMobile && <button onClick={() => setIsSidebarOpen(false)} style={{ background: 'transparent', border: 'none', color: '#fff' }}><X /></button>}
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
                            onClick={() => { setActiveTab(item.id as any); if (isMobile) setIsSidebarOpen(false); }}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                                background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                border: 'none', borderRadius: '10px', color: activeTab === item.id ? 'var(--accent-color)' : '#888',
                                cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', fontWeight: activeTab === item.id ? '600' : '400'
                            }}
                        >
                            <item.icon size={20} />
                            <span style={{ flex: 1, fontSize: '14px' }}>{item.label}</span>
                            {activeTab === item.id && <ChevronRight size={16} />}
                        </button>
                    ))}
                </nav>

                <button onClick={handleLogout} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
                    background: 'rgba(239, 68, 68, 0.1)', border: 'none', borderRadius: '10px',
                    color: '#ef4444', cursor: 'pointer', marginTop: 'auto'
                }}>
                    <LogOut size={20} /> <span style={{ fontSize: '14px' }}>Sair</span>
                </button>
            </div>

            {/* Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                {/* Top MobileBar */}
                {isMobile && (
                    <div style={{ padding: '15px 20px', background: '#111', borderBottom: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <button onClick={() => setIsSidebarOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff' }}><Menu size={24} /></button>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '14px', color: 'var(--accent-color)' }}>{activeTab.toUpperCase()}</span>
                        <div style={{ width: '24px' }} /> {/* Spacer */}
                    </div>
                )}

                <div style={{ flex: 1, padding: isMobile ? '25px' : '40px', overflowY: 'auto' }}>
                    {message && (
                        <div style={{
                            position: 'fixed', top: '20px', right: '20px', padding: '16px 24px',
                            background: message.includes('✅') ? '#065f46' : '#991b1b',
                            color: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', zIndex: 10000
                        }}> {message} </div>
                    )}

                    {/* CONTENT TAB */}
                    {activeTab === 'content' && (
                        <div style={{ maxWidth: '800px', width: '100%' }}>
                            <h2 style={{ fontSize: isMobile ? '24px' : '32px', marginBottom: '30px', fontFamily: 'var(--font-display)' }}>CONTEÚDO DO SITE</h2>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div><label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '14px' }}>Título do Hero</label>
                                    <input value={heroTitle} onChange={e => setHeroTitle(e.target.value)} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                                <div><label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '14px' }}>Descrição do Hero</label>
                                    <textarea value={heroDesc} onChange={e => setHeroDesc(e.target.value)} rows={4} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', resize: 'vertical' }} /></div>
                                <div><label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '14px' }}>Texto da História</label>
                                    <textarea value={storyText} onChange={e => setStoryText(e.target.value)} rows={3} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: '#888', fontSize: '14px' }}>Arquivo do CV (PDF)</label>
                                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                        <div style={{ flex: 1, padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: cvUrl ? 'var(--accent-color)' : '#666', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {cvUrl ? '✓ PDF Carregado' : 'Nenhum arquivo selecionado'}
                                        </div>
                                        <input type="file" accept=".pdf" onChange={handleCVUpload} id="cv-file-upload" style={{ display: 'none' }} />
                                        <label htmlFor="cv-file-upload" style={{ padding: '12px 20px', background: '#333', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}>
                                            UPLOAD
                                        </label>
                                    </div>
                                </div>
                                <button onClick={saveContent} disabled={saving} style={{ padding: '15px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                    <Save size={18} /> {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* PROJECTS TAB */}
                    {activeTab === 'projects' && (
                        <div style={{ maxWidth: '1000px', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '30px', gap: '15px' }}>
                                <h2 style={{ fontSize: isMobile ? '24px' : '32px', margin: 0, fontFamily: 'var(--font-display)' }}>MEUS PROJETOS</h2>
                                <button onClick={() => setEditingProject({ id: '', title: '', description: '', image_url: '', tags: [], year: '2024', order_index: projects.length, visible: true, gallery_images: [] } as any)}
                                    style={{ padding: '10px 20px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                    <Plus size={16} /> NOVO PROJETO
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                                {projects.map(p => (
                                    <div key={p.id} style={{ background: '#111', border: '1px solid #222', borderRadius: '16px', overflow: 'hidden' }}>
                                        <div style={{ height: '160px', background: `url(${p.image_url}) center/cover no-repeat` }} />
                                        <div style={{ padding: '15px' }}>
                                            <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>{p.title}</h3>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
                                                {p.tags.map(t => <span key={t} style={{ fontSize: '9px', padding: '3px 6px', background: '#222', borderRadius: '4px' }}>{t}</span>)}
                                            </div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button onClick={() => setEditingProject(p)} style={{ flex: 1, padding: '7px', background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}>Editar</button>
                                                <button onClick={() => deleteProject(p.id)} style={{ padding: '7px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* CV TAB */}
                    {activeTab === 'cv' && (
                        <div style={{ maxWidth: '900px', width: '100%' }}>
                            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '30px', gap: '15px' }}>
                                <h2 style={{ fontSize: isMobile ? '24px' : '32px', margin: 0, fontFamily: 'var(--font-display)' }}>CURRÍCULO</h2>
                                <button onClick={() => setEditingCV({ id: '', section_type: cvSubTab, title: '', subtitle: '', description: '', date_range: '', order_index: cvSections.length, visible: true } as any)}
                                    style={{ padding: '10px 20px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                                    <Plus size={16} /> NOVA SEÇÃO
                                </button>
                            </div>

                            {/* CV Sub-Nav */}
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', overflowX: 'auto', paddingBottom: '5px' }} className="hide-scrollbar">
                                {[
                                    { id: 'experience', label: 'Experiência', icon: Briefcase },
                                    { id: 'education', label: 'Educação', icon: GraduationCap },
                                    { id: 'skills', label: 'Habilidades', icon: MousePointer2 },
                                    { id: 'certification', label: 'Certificados', icon: Award },
                                ].map(sub => (
                                    <button
                                        key={sub.id}
                                        onClick={() => setCvSubTab(sub.id as any)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px',
                                            background: cvSubTab === sub.id ? '#fff' : 'rgba(255,255,255,0.05)',
                                            color: cvSubTab === sub.id ? '#000' : '#888', border: 'none', borderRadius: '25px',
                                            cursor: 'pointer', fontSize: '12px', whiteSpace: 'nowrap', transition: '0.2s'
                                        }}
                                    >
                                        <sub.icon size={14} /> {sub.label}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'grid', gap: '12px' }}>
                                {filteredCV.map(s => (
                                    <div key={s.id} style={{ padding: '15px 20px', background: '#111', border: '1px solid #222', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: '600', fontSize: '14px' }}>{s.title}</span>
                                            {s.subtitle && <span style={{ color: '#666', fontSize: '12px', marginLeft: '10px' }}>| {s.subtitle}</span>}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => setEditingCV(s)} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #333', borderRadius: '6px', color: '#fff', cursor: 'pointer', fontSize: '11px' }}>Edit</button>
                                            <button onClick={() => deleteCV(s.id)} style={{ padding: '6px', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                ))}
                                {filteredCV.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#444', border: '1px dashed #222', borderRadius: '12px' }}>Nenhum item nesta categoria.</div>}
                            </div>
                        </div>
                    )}

                    {/* SETTINGS TAB */}
                    {activeTab === 'settings' && (
                        <div style={{ maxWidth: '800px', width: '100%' }}>
                            <h2 style={{ fontSize: isMobile ? '24px' : '32px', marginBottom: '30px', fontFamily: 'var(--font-display)' }}>CONFIGURAÇÕES</h2>
                            <div style={{ display: 'grid', gap: '25px' }}>
                                <div style={{ background: '#111', padding: isMobile ? '20px' : '30px', borderRadius: '16px', border: '1px solid #222' }}>
                                    <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)' }}><Palette size={18} /> Identidade Visual</h3>
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                                            <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '10px' }}>Logo Linha 1</label>
                                                <input value={branding.logoText1} onChange={e => setBranding({ ...branding, logoText1: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                                            <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '10px' }}>Logo Linha 2</label>
                                                <input value={branding.logoText2} onChange={e => setBranding({ ...branding, logoText2: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', background: '#1a1a1a', borderRadius: '12px', marginTop: '10px' }}>
                                            <input
                                                type="checkbox"
                                                id="show-toolbar"
                                                checked={branding.showToolbar}
                                                onChange={e => setBranding({ ...branding, showToolbar: e.target.checked })}
                                                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                                            />
                                            <label htmlFor="show-toolbar" style={{ fontSize: '14px', cursor: 'pointer' }}>Mostrar Toolbar de Edição (estilo Figma)</label>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                                            <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#888' }}>Destaque (DARK)</label>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input type="color" value={branding.accentColor} onChange={e => setBranding({ ...branding, accentColor: e.target.value })} style={{ width: '44px', height: '44px', padding: '4px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                                                    <input value={branding.accentColor} onChange={e => setBranding({ ...branding, accentColor: e.target.value })} style={{ flex: 1, padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                                </div></div>
                                            <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#888' }}>Fundo (DARK)</label>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input type="color" value={branding.bgColor} onChange={e => setBranding({ ...branding, bgColor: e.target.value })} style={{ width: '44px', height: '44px', padding: '4px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                                                    <input value={branding.bgColor} onChange={e => setBranding({ ...branding, bgColor: e.target.value })} style={{ flex: 1, padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                                </div></div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px', borderTop: '1px solid #222', paddingTop: '15px' }}>
                                            <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#888' }}>Destaque (LIGHT)</label>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input type="color" value={branding.lightAccentColor} onChange={e => setBranding({ ...branding, lightAccentColor: e.target.value })} style={{ width: '44px', height: '44px', padding: '4px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                                                    <input value={branding.lightAccentColor} onChange={e => setBranding({ ...branding, lightAccentColor: e.target.value })} style={{ flex: 1, padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                                </div></div>
                                            <div><label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#888' }}>Fundo (LIGHT)</label>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <input type="color" value={branding.lightBgColor} onChange={e => setBranding({ ...branding, lightBgColor: e.target.value })} style={{ width: '44px', height: '44px', padding: '4px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }} />
                                                    <input value={branding.lightBgColor} onChange={e => setBranding({ ...branding, lightBgColor: e.target.value })} style={{ flex: 1, padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                                </div></div>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ background: '#111', padding: isMobile ? '20px' : '30px', borderRadius: '16px', border: '1px solid #222' }}>
                                    <h3 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-color)' }}><MousePointer2 size={18} /> Links & Contato</h3>
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#888' }}>LinkedIn URL</label>
                                            <input value={branding.linkedin} onChange={e => setBranding({ ...branding, linkedin: e.target.value })} placeholder="https://linkedin.com/in/..." style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#888' }}>Instagram URL</label>
                                            <input value={branding.instagram} onChange={e => setBranding({ ...branding, instagram: e.target.value })} placeholder="https://instagram.com/..." style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', marginBottom: '6px', color: '#888' }}>Email do Rodapé</label>
                                            <input value={branding.footerEmail} onChange={e => setBranding({ ...branding, footerEmail: e.target.value })} placeholder="exemplo@email.com" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} />
                                        </div>
                                    </div>
                                </div>
                                <button onClick={saveSettings} disabled={saving} style={{ padding: '15px', background: '#fff', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}> {saving ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'} </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* PROJECT MODAL */}
            {editingProject && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '10px' : '40px' }} onClick={() => setEditingProject(null)}>
                    <div className="hide-scrollbar" style={{ background: '#111', width: '100%', maxWidth: '800px', maxHeight: '95vh', overflowY: 'auto', borderRadius: '24px', padding: isMobile ? '20px' : '40px', border: '1px solid #222' }} onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h3 style={{ fontSize: '20px', margin: 0, fontFamily: 'var(--font-display)' }}>{editingProject.id ? 'EDITAR PROJETO' : 'NOVO PROJETO'}</h3>
                            <button onClick={() => setEditingProject(null)} style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Título</label>
                                <input value={editingProject.title} onChange={e => setEditingProject({ ...editingProject, title: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Ano</label>
                                    <input value={editingProject.year || ''} onChange={e => setEditingProject({ ...editingProject, year: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                                <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Ordem</label>
                                    <input type="number" value={editingProject.order_index} onChange={e => setEditingProject({ ...editingProject, order_index: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Tags</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px', padding: '10px', background: '#0a0a0a', borderRadius: '8px', border: '1px solid #333' }}>
                                    {editingProject.tags?.map(t => (
                                        <span key={t} onClick={() => toggleTag(t)} style={{ padding: '3px 8px', background: 'var(--accent-color)', color: '#000', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}> {t} <X size={9} /> </span>
                                    ))}
                                    <input placeholder="Add tag..." onKeyDown={e => { if (e.key === 'Enter') { const val = (e.target as HTMLInputElement).value.trim(); if (val && !editingProject.tags.includes(val)) toggleTag(val); (e.target as HTMLInputElement).value = ''; } }} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none', padding: '4px', flex: 1, fontSize: '13px' }} />
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                    {availableTags.filter(t => !editingProject.tags.includes(t)).slice(0, 10).map(t => (
                                        <button key={t} onClick={() => toggleTag(t)} style={{ padding: '2px 8px', background: 'transparent', border: '1px solid #333', borderRadius: '4px', color: '#888', fontSize: '10px', cursor: 'pointer' }}>+ {t}</button>
                                    ))}
                                </div>
                            </div>
                            <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Capa</label>
                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                    <div style={{ width: '80px', height: '50px', background: `url(${editingProject.image_url}) center/cover no-repeat`, borderRadius: '8px', border: '1px solid #333' }} />
                                    <input type="file" onChange={handleCoverUpload} id="project-cover" style={{ display: 'none' }} />
                                    <label htmlFor="project-cover" style={{ padding: '8px 14px', background: '#333', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>Trocar</label>
                                </div></div>
                            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '15px' }}>
                                <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Link do Projeto (Live URL)</label>
                                    <input value={editingProject.live_url || ''} onChange={e => setEditingProject({ ...editingProject, live_url: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                                <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Texto do Botão</label>
                                    <input value={editingProject.button_text || ''} onChange={e => setEditingProject({ ...editingProject, button_text: e.target.value })} placeholder="VIEW LIVE PROJECT" style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                            </div>
                            <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Descrição</label>
                                <textarea value={editingProject.description || ''} onChange={e => setEditingProject({ ...editingProject, description: e.target.value })} rows={3} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px' }} /></div>
                            <button onClick={saveProject} style={{ padding: '14px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}> SALVAR PROJETO </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CV MODAL */}
            {editingCV && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '10px' : '40px' }} onClick={() => setEditingCV(null)}>
                    <div style={{ background: '#111', width: '100%', maxWidth: '600px', borderRadius: '24px', padding: isMobile ? '25px' : '40px', border: '1px solid #222' }} onClick={e => e.stopPropagation()}>
                        <h3 style={{ fontSize: '20px', marginBottom: '25px' }}>{editingCV.id ? 'EDITAR SEÇÃO' : 'NOVA SEÇÃO'}</h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Tipo</label>
                                <select value={editingCV.section_type} onChange={e => setEditingCV({ ...editingCV, section_type: e.target.value as any })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }}>
                                    <option value="experience">Experiência</option><option value="education">Educação</option><option value="skills">Skill</option><option value="certification">Certificado</option>
                                </select></div>
                            <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Título</label>
                                <input value={editingCV.title} onChange={e => setEditingCV({ ...editingCV, title: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                            {editingCV.section_type !== 'skills' && (
                                <><div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Subtítulo</label>
                                        <input value={editingCV.subtitle || ''} onChange={e => setEditingCV({ ...editingCV, subtitle: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                                    <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Período</label>
                                        <input value={editingCV.date_range || ''} onChange={e => setEditingCV({ ...editingCV, date_range: e.target.value })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                                </div>
                                    <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Descrição</label>
                                        <textarea value={editingCV.description || ''} onChange={e => setEditingCV({ ...editingCV, description: e.target.value })} rows={3} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontSize: '13px' }} /></div>
                                </>
                            )}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div><label style={{ display: 'block', marginBottom: '6px', color: '#888', fontSize: '13px' }}>Ordem</label>
                                    <input type="number" value={editingCV.order_index} onChange={e => setEditingCV({ ...editingCV, order_index: parseInt(e.target.value) })} style={{ width: '100%', padding: '12px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px', color: '#fff' }} /></div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingTop: '20px' }}><input type="checkbox" checked={editingCV.visible} onChange={e => setEditingCV({ ...editingCV, visible: e.target.checked })} /> <label style={{ fontSize: '13px' }}>Visível</label></div>
                            </div>
                            <button onClick={saveCV} style={{ padding: '14px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}> SALVAR SEÇÃO </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
