import { useState, useEffect } from 'react';
import {
    supabase,
    contentAPI,
    projectsAPI,
    cvAPI,
    analyticsAPI,
    type Project,
    type CVSection
} from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Trash2, Settings,
    LayoutDashboard, FolderKanban,
    FileText,
    BarChart3, User, Globe,
    Download,
    Target, Activity, Plus, X, Image as ImageIcon, Video,
    Briefcase, GraduationCap, Award, Star, Heart
} from 'lucide-react';
import { storageAPI } from '../lib/storage';
import ProjectModal from '../components/ProjectModal';

const modalInputStyle = { width: '100%', padding: '12px', background: '#111', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontSize: '14px', marginBottom: '10px' };
const labelStyle = { display: 'block', fontSize: '13px', color: '#666', marginBottom: '8px', fontWeight: '500' };

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'analytics' | 'content' | 'projects' | 'cv' | 'settings'>('analytics');
    const [cvSubTab, setCvSubTab] = useState<'profile' | 'experience' | 'education' | 'skills' | 'certification' | 'hobbies'>('profile');

    // Analytics State
    const [stats, setStats] = useState({
        pageViews: 0,
        cvDownloads: 0,
        projectClicks: 0,
        pages: [] as { name: string, count: number }[],
        sources: [] as { name: string, count: number }[]
    });

    // Content State
    const [heroTitle, setHeroTitle] = useState('');
    const [heroDesc, setHeroDesc] = useState('');
    const [storyText, setStoryText] = useState('');
    const [pitchDesc, setPitchDesc] = useState('');
    const [pitchBtnText, setPitchBtnText] = useState('');
    const [pitchBtnLink, setPitchBtnLink] = useState('');

    // Projects State
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [allUsedTags, setAllUsedTags] = useState<string[]>([]);

    // CV State
    const [cvProfile, setCvProfile] = useState({ name: '', bio: '' });
    const [cvSections, setCvSections] = useState<CVSection[]>([]);
    const [editingCV, setEditingCV] = useState<CVSection | null>(null);

    // Settings State
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
        phone: '',
        footerText: '',
        navHome: true,
        navCV: true,
        navPortfolio: true,
        navContact: true,
        navGetInTouch: true
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        setSaving(true);
        await Promise.all([
            loadContent(),
            loadProjects(),
            loadCV(),
            loadSettings(),
            loadStats()
        ]);
        setSaving(false);
    };

    const loadStats = async () => {
        const data = await analyticsAPI.getStats();
        if (data) setStats(data);
    };

    const loadContent = async () => {
        const title = await contentAPI.getByKey('hero.title');
        const desc = await contentAPI.getByKey('hero.description');
        const story = await contentAPI.getByKey('storytelling.main');
        const pDesc = await contentAPI.getByKey('storytelling.description');
        const pBtnT = await contentAPI.getByKey('storytelling.button_text');
        const pBtnL = await contentAPI.getByKey('storytelling.button_link');

        if (title) setHeroTitle(title.value);
        if (desc) setHeroDesc(desc.value);
        if (story) setStoryText(story.value);
        if (pDesc) setPitchDesc(pDesc.value);
        if (pBtnT) setPitchBtnText(pBtnT.value);
        if (pBtnL) setPitchBtnLink(pBtnL.value);
    };

    const loadProjects = async () => {
        const { data, error } = await supabase.from('projects').select('*').order('order_index', { ascending: true });
        if (!error && data) {
            setProjects(data);

            // Extract all unique tags used across projects
            const tags = new Set<string>();
            data.forEach(p => p.tags?.forEach((t: string) => tags.add(t.toUpperCase())));
            setAllUsedTags(Array.from(tags).sort());
        }
    };

    const loadCV = async () => {
        const { data, error } = await supabase.from('cv_sections').select('*').order('order_index', { ascending: true });
        if (!error && data) setCvSections(data);

        const name = await contentAPI.getByKey('cv.name');
        const bio = await contentAPI.getByKey('cv.bio');
        setCvProfile({
            name: name?.value || '',
            bio: bio?.value || ''
        });
    };

    const loadSettings = async () => {
        setBranding({
            logoText1: (await contentAPI.getByKey('general.logo_text1'))?.value || 'VINICIUS',
            logoText2: (await contentAPI.getByKey('general.logo_text2'))?.value || 'CAMPOS',
            accentColor: (await contentAPI.getByKey('general.accent_color'))?.value || '#F2A73D',
            bgColor: (await contentAPI.getByKey('general.bg_color'))?.value || '#050505',
            lightAccentColor: (await contentAPI.getByKey('general.light_accent_color'))?.value || '#C87A1A',
            lightBgColor: (await contentAPI.getByKey('general.light_bg_color'))?.value || '#FFFFFF',
            linkedin: (await contentAPI.getByKey('social.linkedin'))?.value || '',
            instagram: (await contentAPI.getByKey('social.instagram'))?.value || '',
            footerEmail: (await contentAPI.getByKey('social.footer_email'))?.value || '',
            phone: (await contentAPI.getByKey('social.phone'))?.value || '',
            footerText: (await contentAPI.getByKey('general.footer_text'))?.value || '',
            navHome: (await contentAPI.getByKey('nav.home'))?.value !== 'false',
            navCV: (await contentAPI.getByKey('nav.cv'))?.value !== 'false',
            navPortfolio: (await contentAPI.getByKey('nav.portfolio'))?.value !== 'false',
            navContact: (await contentAPI.getByKey('nav.contact'))?.value !== 'false',
            navGetInTouch: (await contentAPI.getByKey('nav.get_in_touch'))?.value !== 'false'
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
                contentAPI.update('storytelling.description', pitchDesc, 'storytelling'),
                contentAPI.update('storytelling.button_text', pitchBtnText, 'storytelling'),
                contentAPI.update('storytelling.button_link', pitchBtnLink, 'storytelling')
            ]);
            setMessage('✅ Home updated!');
        } catch (err) { setMessage('❌ Error.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const saveProject = async () => {
        if (!editingProject) return;
        setSaving(true);
        try {
            // EXTREMELY MINIMAL PAYLOAD TO PREVENT SCHEMA ERRORS
            const dataToSave: any = {
                title: editingProject.title || '',
                description: editingProject.description || '',
                image_url: editingProject.image_url || '',
                tags: editingProject.tags || [],
                gallery_images: [
                    ...(editingProject.gallery_images || []),
                    ...(editingProject.gallery_videos || [])
                ],
                order_index: editingProject.order_index || 0
            };

            const id = editingProject.id;
            let result;

            if (id && id !== '' && id !== 'new') {
                result = await supabase.from('projects').update(dataToSave).eq('id', id);
            } else {
                result = await supabase.from('projects').insert([dataToSave]).select();
            }

            if (result.error) {
                console.error('Supabase Error:', result.error);
                alert(`Supabase Error: ${result.error.message}\n${result.error.details}\nColumn likely missing: check browser console for payload.`);
                setMessage('❌ Failed.');
            } else {
                await loadProjects();
                setEditingProject(null);
                setMessage('✅ Saved!');
            }
        } catch (err: any) {
            console.error('Save Error:', err);
            alert('CRITICAL ERROR: ' + err.message);
            setMessage('❌ Error.');
        } finally {
            setSaving(false);
            setTimeout(() => setMessage(''), 3000);
        }
    };

    const saveCVProfile = async () => {
        setSaving(true);
        try {
            await Promise.all([
                contentAPI.update('cv.name', cvProfile.name, 'cv'),
                contentAPI.update('cv.bio', cvProfile.bio, 'cv')
            ]);
            setMessage('✅ Profile updated!');
        } catch (err) { setMessage('❌ Error.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const saveCVSection = async () => {
        if (!editingCV) return;
        setSaving(true);
        try {
            const { id, created_at, updated_at, ...sectionData } = editingCV as any;
            let result;
            if (id && id !== '' && id !== 'new') {
                result = await supabase.from('cv_sections').update(sectionData).eq('id', id);
            } else {
                result = await supabase.from('cv_sections').insert([sectionData]).select();
            }

            if (result.error) {
                console.error('CV Save Error:', result.error);
                alert('DB Error: ' + result.error.message);
            } else {
                loadCV();
                setEditingCV(null);
                setMessage('✅ CV Saved!');
            }
        } catch (err) { setMessage('❌ Error.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const addTag = (tag?: string) => {
        const value = tag || tagInput.trim();
        if (value && editingProject) {
            const newTags = [...(editingProject.tags || [])];
            if (!newTags.includes(value.toUpperCase())) {
                newTags.push(value.toUpperCase());
                setEditingProject({ ...editingProject, tags: newTags });
            }
            if (!tag) setTagInput('');
        }
    };

    const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && editingProject) {
            const url = await storageAPI.uploadImage(e.target.files[0], 'projects');
            if (url) {
                setEditingProject({ ...editingProject, image_url: url });
            }
        }
    };

    const addGalleryItem = async (type: 'image' | 'video', file: File) => {
        const url = await storageAPI.uploadImage(file, 'projects');
        if (url && editingProject) {
            if (type === 'image') {
                const gallery = [...(editingProject.gallery_images || []), url];
                setEditingProject({ ...editingProject, gallery_images: gallery });
            } else {
                const gallery = [...(editingProject.gallery_videos || []), url];
                setEditingProject({ ...editingProject, gallery_videos: gallery });
            }
        }
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            await Promise.all([
                contentAPI.update('general.logo_text1', branding.logoText1, 'general'),
                contentAPI.update('general.logo_text2', branding.logoText2, 'general'),
                contentAPI.update('general.accent_color', branding.accentColor, 'general'),
                contentAPI.update('general.bg_color', branding.bgColor, 'general'),
                contentAPI.update('general.light_accent_color', branding.lightAccentColor, 'general'),
                contentAPI.update('general.light_bg_color', branding.lightBgColor, 'general'),
                contentAPI.update('social.linkedin', branding.linkedin, 'social'),
                contentAPI.update('social.instagram', branding.instagram, 'social'),
                contentAPI.update('social.footer_email', branding.footerEmail, 'social'),
                contentAPI.update('social.phone', branding.phone, 'social'),
                contentAPI.update('general.footer_text', branding.footerText, 'general'),
                contentAPI.update('nav.home', String(branding.navHome), 'nav'),
                contentAPI.update('nav.cv', String(branding.navCV), 'nav'),
                contentAPI.update('nav.portfolio', String(branding.navPortfolio), 'nav'),
                contentAPI.update('nav.contact', String(branding.navContact), 'nav'),
                contentAPI.update('nav.get_in_touch', String(branding.navGetInTouch), 'nav')
            ]);
            setMessage('✅ Settings saved!');
        } catch (err) { setMessage('❌ Error.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const filteredCV = cvSections.filter(s => s.section_type === cvSubTab);

    return (
        <div className="admin-dashboard" style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#fff' }}>
            {/* Sidebar */}
            <div style={{ width: '260px', background: '#0a0a0a', borderRight: '1px solid #1a1a1a', display: 'flex', flexDirection: 'column', padding: '24px 12px', position: 'sticky', top: 0, height: '100vh', zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 12px', marginBottom: '40px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--accent-color)', borderRadius: '10px', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                        <Target size={20} />
                    </div>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>{branding.logoText1} {branding.logoText2}</span>
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { id: 'content', label: 'Home Page', icon: LayoutDashboard },
                        { id: 'projects', label: 'Portfolio', icon: FolderKanban },
                        { id: 'cv', label: 'Curriculum', icon: FileText },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id as any)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', borderRadius: '10px', color: activeTab === item.id ? '#fff' : '#666', cursor: 'pointer', textAlign: 'left' }}>
                            <item.icon size={20} />
                            <span style={{ fontSize: '14px', fontWeight: activeTab === item.id ? '600' : '400' }}>{item.label}</span>
                        </button>
                    ))}
                </div>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}><LogOut size={20} /> Sign Out</button>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <header style={{ height: '72px', background: '#0a0a0a', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', padding: '0 32px', position: 'sticky', top: 0, zIndex: 50 }}>
                    <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#444', letterSpacing: '1px' }}>{activeTab} Workspace</h2>
                </header>

                <main style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
                    {message && <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '16px 24px', background: '#fff', color: '#000', borderRadius: '12px', zIndex: 10000, fontWeight: '700' }}>{message}</div>}

                    {activeTab === 'analytics' && (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                            <div style={{ background: '#111', padding: '32px', borderRadius: '24px', border: '1px solid #222' }}>
                                <Globe size={20} color="var(--accent-color)" />
                                <div style={{ fontSize: '40px', fontWeight: '800', margin: '15px 0' }}>{stats.pageViews}</div>
                                <div style={{ color: '#666', fontSize: '12px' }}>Total Page Views</div>
                            </div>
                            <div style={{ background: '#111', padding: '32px', borderRadius: '24px', border: '1px solid #222' }}>
                                <Download size={20} color="var(--accent-color)" />
                                <div style={{ fontSize: '40px', fontWeight: '800', margin: '15px 0' }}>{stats.cvDownloads}</div>
                                <div style={{ color: '#666', fontSize: '12px' }}>CV Downloads</div>
                            </div>
                            <div style={{ background: '#111', padding: '32px', borderRadius: '24px', border: '1px solid #222' }}>
                                <Activity size={20} color="var(--accent-color)" />
                                <div style={{ fontSize: '40px', fontWeight: '800', margin: '15px 0' }}>{stats.projectClicks}</div>
                                <div style={{ color: '#666', fontSize: '12px' }}>Project Interactions</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'cv' && (
                        <div>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', background: '#0a0a0a', padding: '10px', borderRadius: '16px', border: '1px solid #1a1a1a', overflowX: 'auto' }} className="hide-scrollbar">
                                {[
                                    { id: 'profile', label: 'Summary', icon: User },
                                    { id: 'experience', label: 'Experience', icon: Briefcase },
                                    { id: 'education', label: 'Education', icon: GraduationCap },
                                    { id: 'skills', label: 'Skills', icon: Star },
                                    { id: 'certification', label: 'Certifications', icon: Award },
                                    { id: 'hobbies', label: 'Hobbies', icon: Heart },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setCvSubTab(tab.id as any)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px',
                                            background: cvSubTab === tab.id ? 'var(--accent-color)' : 'transparent',
                                            color: cvSubTab === tab.id ? '#000' : '#666', border: 'none', borderRadius: '10px',
                                            fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <tab.icon size={16} /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {cvSubTab === 'profile' ? (
                                <div style={{ background: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
                                    <h3 style={{ marginBottom: '24px' }}>Public Identity</h3>
                                    <input placeholder="Name" value={cvProfile.name} onChange={e => setCvProfile({ ...cvProfile, name: e.target.value })} style={modalInputStyle} />
                                    <textarea placeholder="Bio Summary" value={cvProfile.bio} onChange={e => setCvProfile({ ...cvProfile, bio: e.target.value })} rows={8} style={modalInputStyle} />
                                    <button onClick={saveCVProfile} style={{ padding: '16px 32px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '10px', fontWeight: 'bold', width: '100%' }}>UPDATE PROFILE</button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                        <h3 style={{ textTransform: 'capitalize' }}>{cvSubTab} List</h3>
                                        <button onClick={() => setEditingCV({ id: 'new', section_type: cvSubTab, title: '', subtitle: '', date_range: '', description: '', order_index: cvSections.length, visible: true } as any)} style={{ background: '#fff', color: '#000', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>+ ADD {cvSubTab.toUpperCase()}</button>
                                    </div>
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        {filteredCV.map(s => (
                                            <div key={s.id} style={{ background: '#111', padding: '24px', borderRadius: '16px', border: '1px solid #222', display: 'flex', justifyContent: 'space-between' }}>
                                                <div>
                                                    <h4 style={{ margin: '0 0 5px 0' }}>{s.title}</h4>
                                                    <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>{s.subtitle} • {s.date_range}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => setEditingCV(s)} style={{ background: 'transparent', border: 'none', color: '#fff' }}><Settings size={18} /></button>
                                                    <button onClick={() => { if (confirm('Delete?')) cvAPI.delete(s.id).then(loadCV) }} style={{ background: 'transparent', border: 'none', color: '#ff4444' }}><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {filteredCV.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#444' }}>No items yet.</div>}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                                <h3>Portfolio Projects</h3>
                                <button onClick={() => setEditingProject({ id: 'new', title: '', description: '', image_url: '', tags: [], year: '2026', order_index: projects.length, is_published: false, visible: true, gallery_images: [], gallery_videos: [] } as any)} style={{ background: 'var(--accent-color)', color: '#000', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>+ NEW PROJECT</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {projects.map(p => (
                                    <div key={p.id} style={{ background: '#0a0a0a', borderRadius: '16px', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                                        <div style={{ height: '180px', background: `url(${p.image_url}) center/cover` }} />
                                        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
                                            <span>{p.title}</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => setEditingProject(p)} style={{ background: 'transparent', border: 'none', color: '#fff' }}><Settings size={18} /></button>
                                                <button onClick={() => { if (confirm('Delete?')) projectsAPI.delete(p.id).then(loadProjects) }} style={{ background: 'transparent', border: 'none', color: '#ff4444' }}><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div style={{ display: 'grid', gap: '32px' }}>
                            <div style={{ background: '#0a0a0a', padding: '40px', borderRadius: '32px', border: '1px solid #1a1a1a' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '32px', color: 'var(--accent-color)' }}>Hero Experience</h3>
                                <div style={{ display: 'grid', gap: '24px' }}>
                                    <input placeholder="Marquee Title" value={heroTitle} onChange={e => setHeroTitle(e.target.value)} style={modalInputStyle} />
                                    <textarea placeholder="Small Description" value={heroDesc} onChange={e => setHeroDesc(e.target.value)} rows={2} style={modalInputStyle} />
                                </div>
                            </div>
                            <button onClick={saveContent} disabled={saving} style={{ padding: '20px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: '800' }}>PUBLISH CHANGES</button>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ display: 'grid', gap: '32px' }}>
                            <div style={{ background: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
                                <h3 style={{ marginBottom: '32px', color: 'var(--accent-color)' }}>Visual Identity</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <div>
                                        <label style={labelStyle}>Logo First Word</label>
                                        <input value={branding.logoText1} onChange={e => setBranding({ ...branding, logoText1: e.target.value })} style={modalInputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Logo Second Word</label>
                                        <input value={branding.logoText2} onChange={e => setBranding({ ...branding, logoText2: e.target.value })} style={modalInputStyle} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                                    <div>
                                        <label style={labelStyle}>Dark Theme: Background</label>
                                        <input type="color" value={branding.bgColor} onChange={e => setBranding({ ...branding, bgColor: e.target.value })} style={{ ...modalInputStyle, height: '50px' }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Dark Theme: Accent</label>
                                        <input type="color" value={branding.accentColor} onChange={e => setBranding({ ...branding, accentColor: e.target.value })} style={{ ...modalInputStyle, height: '50px' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
                                    <div>
                                        <label style={labelStyle}>Light Theme: Background</label>
                                        <input type="color" value={branding.lightBgColor} onChange={e => setBranding({ ...branding, lightBgColor: e.target.value })} style={{ ...modalInputStyle, height: '50px', background: '#fff' }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Light Theme: Accent</label>
                                        <input type="color" value={branding.lightAccentColor} onChange={e => setBranding({ ...branding, lightAccentColor: e.target.value })} style={{ ...modalInputStyle, height: '50px' }} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
                                <h3 style={{ marginBottom: '32px', color: 'var(--accent-color)' }}>Social & Contact</h3>
                                <div style={{ display: 'grid', gap: '24px' }}>
                                    <input placeholder="LinkedIn URL" value={branding.linkedin} onChange={e => setBranding({ ...branding, linkedin: e.target.value })} style={modalInputStyle} />
                                    <input placeholder="Instagram URL" value={branding.instagram} onChange={e => setBranding({ ...branding, instagram: e.target.value })} style={modalInputStyle} />
                                    <input placeholder="Public Email" value={branding.footerEmail} onChange={e => setBranding({ ...branding, footerEmail: e.target.value })} style={modalInputStyle} />
                                    <input placeholder="Phone Number" value={branding.phone} onChange={e => setBranding({ ...branding, phone: e.target.value })} style={modalInputStyle} />
                                    <textarea placeholder="Footer Copyright Text" value={branding.footerText} onChange={e => setBranding({ ...branding, footerText: e.target.value })} rows={2} style={modalInputStyle} />
                                </div>
                            </div>

                            <div style={{ background: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
                                <h3 style={{ marginBottom: '32px', color: 'var(--accent-color)' }}>Navigation Toggles</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '24px' }}>
                                    {[
                                        { id: 'navHome', label: 'Home Page' },
                                        { id: 'navCV', label: 'CV / History' },
                                        { id: 'navPortfolio', label: 'Portfolio Tab' },
                                        { id: 'navContact', label: 'Contact Section' },
                                        { id: 'navGetInTouch', label: 'Get In Touch' },
                                    ].map(toggle => (
                                        <label key={toggle.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                            <input
                                                type="checkbox"
                                                checked={(branding as any)[toggle.id]}
                                                onChange={e => setBranding({ ...branding, [toggle.id]: e.target.checked })}
                                                style={{ width: '20px', height: '20px' }}
                                            />
                                            <span style={{ fontSize: '14px' }}>{toggle.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <button onClick={saveSettings} style={{ padding: '24px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '16px' }}>SAVE GLOBAL CONFIGURATION</button>
                        </div>
                    )}
                </main>
            </div>

            {/* PROJECT MODAL */}
            {editingProject && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#0a0a0a', width: '100%', maxWidth: '900px', borderRadius: '24px', border: '1px solid #222', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }} className="hide-scrollbar">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.5px' }}>EDITAR PROJETO</h3>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <button onClick={() => setIsPreviewOpen(true)} style={{ background: 'transparent', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>PREVIEW MODAL</button>
                                <button onClick={() => setEditingProject(null)} style={{ background: 'transparent', border: 'none', color: '#666' }}><X size={24} /></button>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '24px' }}>
                            <div>
                                <label style={labelStyle}>Título</label>
                                <input value={editingProject.title} onChange={e => setEditingProject({ ...editingProject, title: e.target.value })} style={modalInputStyle} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Ordem</label>
                                    <input type="number" value={editingProject.order_index} onChange={e => setEditingProject({ ...editingProject, order_index: parseInt(e.target.value) })} style={modalInputStyle} />
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Tags</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', background: '#111', padding: '12px', borderRadius: '8px', border: '1px solid #222' }}>
                                    {editingProject.tags?.map(t => (
                                        <span key={t} style={{ background: 'var(--accent-color)', color: '#000', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {t} <X size={12} onClick={() => setEditingProject({ ...editingProject, tags: (editingProject.tags || []).filter(tag => tag !== t) })} style={{ cursor: 'pointer' }} />
                                        </span>
                                    ))}
                                    <input
                                        placeholder="Add tag..."
                                        value={tagInput}
                                        onChange={e => setTagInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addTag()}
                                        style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '14px', outline: 'none', flex: 1, minWidth: '100px' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {(allUsedTags.length > 0 ? allUsedTags : ['ELEMENTOR', 'FIGMA', 'AGROTECH', 'DESIGN SYSTEM', 'WIREFRAMES']).map(suggestion => (
                                        <button
                                            key={suggestion}
                                            onClick={() => addTag(suggestion)}
                                            style={{ background: '#1a1a1a', border: '1px solid #222', color: '#888', padding: '6px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                        >
                                            + {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Capa do Projeto</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                    <div style={{ width: '120px', aspectRatio: '16/10', background: '#111', borderRadius: '12px', overflow: 'hidden', border: '1px solid #222' }}>
                                        {editingProject.image_url ? <img src={editingProject.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#333' }}><ImageIcon size={24} /></div>}
                                    </div>
                                    <label className="clickable" style={{ padding: '10px 20px', background: '#222', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', border: '1px solid #333' }}>
                                        Upload Capa
                                        <input type="file" onChange={handleCoverChange} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>

                            <div style={{ background: '#0d0d0d', padding: '24px', borderRadius: '16px', border: '1px solid #1a1a1a' }}>
                                <label style={{ ...labelStyle, fontSize: '15px', color: '#fff' }}>Galeria Adicional (Fotos & Vídeos)</label>
                                <p style={{ fontSize: '12px', color: '#555', marginBottom: '20px' }}>Itens que aparecerão no carrossel do projeto.</p>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                                    {editingProject.gallery_images?.map((url, idx) => (
                                        <div key={`img-${idx}`} style={{ position: 'relative', aspectRatio: '1/1', background: '#111', borderRadius: '10px', overflow: 'hidden', border: '1px solid #222' }}>
                                            <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button onClick={() => setEditingProject({ ...editingProject, gallery_images: (editingProject.gallery_images || []).filter((_, i) => i !== idx) })} style={{ position: 'absolute', top: '5px', right: '5px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
                                        </div>
                                    ))}
                                    {editingProject.gallery_videos?.map((url, idx) => (
                                        <div key={`v-${idx}`} style={{ position: 'relative', aspectRatio: '1/1', background: '#111', borderRadius: '10px', overflow: 'hidden', border: '1px solid #222', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Video color="var(--accent-color)" size={32} />
                                            <button onClick={() => setEditingProject({ ...editingProject, gallery_videos: (editingProject.gallery_videos || []).filter((_, i) => i !== idx) })} style={{ position: 'absolute', top: '5px', right: '5px', width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(0,0,0,0.8)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={14} /></button>
                                        </div>
                                    ))}

                                    <label className="clickable" style={{ aspectRatio: '1/1', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '2px dashed #222', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <Plus size={20} color="#444" />
                                        <span style={{ fontSize: '10px', color: '#444', fontWeight: 'bold' }}>ADD FOTO</span>
                                        <input type="file" onChange={(e) => e.target.files && addGalleryItem('image', e.target.files[0])} style={{ display: 'none' }} />
                                    </label>

                                    <label className="clickable" style={{ aspectRatio: '1/1', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '2px dashed #222', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                                        <Video size={20} color="#444" />
                                        <span style={{ fontSize: '10px', color: '#444', fontWeight: 'bold' }}>ADD VÍDEO</span>
                                        <input type="file" onChange={(e) => e.target.files && addGalleryItem('video', e.target.files[0])} style={{ display: 'none' }} />
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label style={labelStyle}>Descrição</label>
                                <textarea
                                    value={editingProject.description || ''}
                                    onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                                    rows={6}
                                    style={{ ...modalInputStyle, resize: 'vertical' }}
                                />
                            </div>

                            <button
                                onClick={saveProject}
                                disabled={saving}
                                style={{
                                    width: '100%',
                                    padding: '20px',
                                    background: 'var(--accent-color)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontWeight: '900',
                                    fontSize: '16px',
                                    marginTop: '20px',
                                    cursor: 'pointer',
                                    transition: '0.3s'
                                }}
                            >
                                {saving ? 'SALVANDO...' : 'SALVAR PROJETO'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* PREVIEW MODALS */}
            {isPreviewOpen && editingProject && (
                <ProjectModal project={editingProject} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
            )}

            {editingCV && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#0a0a0a', width: '100%', maxWidth: '600px', borderRadius: '24px', border: '1px solid #222', padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <h3 style={{ textTransform: 'capitalize' }}>Edit {editingCV.section_type}</h3>
                            <button onClick={() => setEditingCV(null)} style={{ background: 'transparent', border: 'none', color: '#fff' }}><X size={20} /></button>
                        </div>
                        <input placeholder="Title" value={editingCV.title} onChange={e => setEditingCV({ ...editingCV, title: e.target.value })} style={modalInputStyle} />
                        <input placeholder="Subtitle / Org" value={editingCV.subtitle || ''} onChange={e => setEditingCV({ ...editingCV, subtitle: e.target.value })} style={modalInputStyle} />
                        <input placeholder="Dates" value={editingCV.date_range || ''} onChange={e => setEditingCV({ ...editingCV, date_range: e.target.value })} style={modalInputStyle} />
                        <textarea placeholder="Details" value={editingCV.description || ''} onChange={e => setEditingCV({ ...editingCV, description: e.target.value })} rows={4} style={modalInputStyle} />
                        <button onClick={saveCVSection} disabled={saving} style={{ padding: '16px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: 'bold', width: '100%' }}>SAVE {editingCV.section_type.toUpperCase()}</button>
                    </div>
                </div>
            )}
        </div>
    );
}
