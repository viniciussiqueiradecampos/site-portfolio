import { useState, useEffect } from 'react';
import {
    supabase,
    contentAPI,
    projectsAPI,
    cvAPI,
    analyticsAPI,
    blogAPI,
    type Project,
    type CVSection,
    type BlogPost
} from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Trash2, Settings,
    LayoutDashboard, FolderKanban,
    FileText,
    BarChart3, User, Globe,
    Download,
    Target, Activity, X, Image as ImageIcon,
    Briefcase, GraduationCap, Award, Star, Heart, Menu,
    ArrowUp, ArrowDown,
    BookOpen
} from 'lucide-react';
import { storageAPI } from '../lib/storage';
import ProjectModal from '../components/ProjectModal';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';

const modalInputStyle = { width: '100%', padding: '12px', background: '#111', border: '1px solid #222', borderRadius: '8px', color: '#fff', fontSize: '14px', marginBottom: '10px', whiteSpace: 'pre-wrap' as any };
const labelStyle = { display: 'block', fontSize: '13px', color: '#A0A0A0', marginBottom: '8px', fontWeight: '500' };

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [activeTab, setActiveTab] = useState<'analytics' | 'content' | 'projects' | 'cv' | 'blog' | 'settings'>('analytics');
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

    // CV State
    const [cvProfile, setCvProfile] = useState({ name: '', bio: '', pdf_url: '' });
    const [cvSections, setCvSections] = useState<CVSection[]>([]);
    const [editingCV, setEditingCV] = useState<CVSection | null>(null);

    // Blog State
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [allBlogTags, setAllBlogTags] = useState<string[]>([]);

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
        navGetInTouch: true,
        navBlog: false,
        navNewsletter: false,
        logoImageUrl: ''
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
            loadStats(),
            loadBlog(),
            loadAllBlogTags()
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
            const tags = new Set<string>();
            data.forEach(p => p.tags?.forEach((t: string) => tags.add(t.toUpperCase())));
        }
    };

    const loadCV = async () => {
        const { data, error } = await supabase.from('cv_sections').select('*').order('order_index', { ascending: true });
        if (!error && data) setCvSections(data);

        const name = await contentAPI.getByKey('cv.name');
        const bio = await contentAPI.getByKey('cv.bio');
        const pdf = await contentAPI.getByKey('cv.pdf_url');
        setCvProfile({
            name: name?.value || '',
            bio: bio?.value || '',
            pdf_url: pdf?.value || ''
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
            navGetInTouch: (await contentAPI.getByKey('nav.get_in_touch'))?.value !== 'false',
            navBlog: (await contentAPI.getByKey('nav.blog'))?.value === 'true',
            navNewsletter: (await contentAPI.getByKey('nav.newsletter'))?.value === 'true',
            logoImageUrl: (await contentAPI.getByKey('general.logo_image_url'))?.value || ''
        });
    };

    const loadBlog = async () => {
        const data = await blogAPI.getAll();
        setPosts(data);
    };

    const loadAllBlogTags = async () => {
        const data = await blogAPI.getAll();
        const tags = new Set<string>();
        data.forEach(p => p.tags?.forEach((t: string) => tags.add(t.toUpperCase())));
        setAllBlogTags(Array.from(tags).sort());
    };

    const addBlogTag = (tag?: string) => {
        const value = tag || tagInput.trim();
        if (value && editingPost) {
            const newTags = [...(editingPost.tags || [])];
            if (!newTags.includes(value.toUpperCase())) {
                newTags.push(value.toUpperCase());
                setEditingPost({ ...editingPost, tags: newTags });
            }
            if (!tag) setTagInput('');
        }
    };

    const savePost = async () => {
        if (!editingPost) return;
        setSaving(true);
        try {
            const { id, created_at, updated_at, slug, ...postData } = editingPost as any;
            if (id && id !== 'new') {
                await blogAPI.update(id, postData);
            } else {
                await blogAPI.create(postData);
            }
            await loadBlog();
            await loadAllBlogTags();
            setEditingPost(null);
            setMessage('✅ Post saved!');
        } catch (err: any) {
            console.error('Save error:', err);
            alert('Error saving post: ' + err.message);
            setMessage('❌ Error.');
        }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const insertMarkdown = (tag: string) => {
        if (!editingPost) return;
        const textarea = document.getElementById('post-content-area') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = editingPost.content;
        const selection = text.substring(start, end) || 'text';

        let before = '';
        let after = '';
        if (tag === 'bold') { before = '**'; after = '**'; }
        if (tag === 'italic') { before = '*'; after = '*'; }
        if (tag === 'link') { before = '['; after = '](url)'; }
        if (tag === 'quote') { before = '> '; after = ''; }

        const newContent = text.substring(0, start) + before + selection + after + text.substring(end);
        setEditingPost({ ...editingPost, content: newContent });

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, start + before.length + selection.length);
        }, 10);
    };

    const handleBlogImageUpload = async (file: File) => {
        if (!editingPost) return;
        const url = await storageAPI.uploadImage(file, 'blog');
        if (url) {
            const markdown = `\n![Image Description](${url})\n`;
            setEditingPost({ ...editingPost, content: editingPost.content + markdown });
        }
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
            const dataToSave: any = {
                title: editingProject.title || '',
                description: editingProject.description || '',
                image_url: editingProject.image_url || '',
                tags: editingProject.tags || [],
                gallery_images: editingProject.gallery_images || [],
                gallery_videos: editingProject.gallery_videos || [],
                live_url: editingProject.live_url || '',
                button_text: editingProject.button_text || '',
                order_index: editingProject.order_index || 0
            };

            const id = editingProject.id;
            if (id && id !== '' && id !== 'new') {
                await supabase.from('projects').update(dataToSave).eq('id', id);
            } else {
                await supabase.from('projects').insert([dataToSave]);
            }
            await loadProjects();
            setEditingProject(null);
            setMessage('✅ Saved!');
        } catch (err: any) {
            alert('Save Error: ' + err.message);
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
                contentAPI.update('cv.bio', cvProfile.bio, 'cv'),
                contentAPI.update('cv.pdf_url', cvProfile.pdf_url, 'cv')
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
            if (id && id !== '' && id !== 'new') {
                await supabase.from('cv_sections').update(sectionData).eq('id', id);
            } else {
                await supabase.from('cv_sections').insert([sectionData]);
            }
            loadCV();
            setEditingCV(null);
            setMessage('✅ CV Saved!');
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
        if (e.target.files?.[0] && editingProject) {
            const url = await storageAPI.uploadImage(e.target.files[0], 'projects');
            if (url) setEditingProject({ ...editingProject, image_url: url });
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
                contentAPI.update('nav.get_in_touch', String(branding.navGetInTouch), 'nav'),
                contentAPI.update('nav.blog', String(branding.navBlog), 'nav'),
                contentAPI.update('nav.newsletter', String(branding.navNewsletter), 'nav'),
                contentAPI.update('general.logo_image_url', branding.logoImageUrl, 'general')
            ]);
            setMessage('✅ Settings saved!');
        } catch (err) { setMessage('❌ Error.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const filteredCV = cvSections.filter(s => s.section_type === cvSubTab).sort((a, b) => a.order_index - b.order_index);

    const reorderProject = async (index: number, direction: 'up' | 'down') => {
        const newProjects = [...projects];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newProjects.length) return;
        const temp = newProjects[index].order_index;
        newProjects[index].order_index = newProjects[targetIndex].order_index;
        newProjects[targetIndex].order_index = temp;
        setSaving(true);
        try {
            await Promise.all([
                supabase.from('projects').update({ order_index: newProjects[index].order_index }).eq('id', newProjects[index].id),
                supabase.from('projects').update({ order_index: newProjects[targetIndex].order_index }).eq('id', newProjects[targetIndex].id)
            ]);
            await loadProjects();
        } catch (err) { setMessage('❌ Error reordering'); }
        finally { setSaving(false); }
    };

    const reorderCV = async (index: number, direction: 'up' | 'down') => {
        const subSections = cvSections.filter(s => s.section_type === cvSubTab).sort((a, b) => a.order_index - b.order_index);
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= subSections.length) return;
        setSaving(true);
        try {
            await Promise.all([
                supabase.from('cv_sections').update({ order_index: subSections[targetIndex].order_index }).eq('id', subSections[index].id),
                supabase.from('cv_sections').update({ order_index: subSections[index].order_index }).eq('id', subSections[targetIndex].id)
            ]);
            await loadCV();
        } catch (err) { setMessage('❌ Error reordering'); }
        finally { setSaving(false); }
    };

    return (
        <div className="admin-dashboard" style={{ display: 'flex', minHeight: '100vh', background: '#050505', color: '#fff' }}>
            <div style={{
                width: '260px',
                background: '#0a0a0a',
                borderRight: '1px solid #1a1a1a',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 12px',
                position: 'fixed',
                left: isDesktop || isMobileNavOpen ? 0 : '-260px',
                top: 0,
                bottom: 0,
                height: '100vh',
                zIndex: 1000,
                transition: 'left 0.3s ease'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', padding: '0 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', background: branding.logoImageUrl ? 'transparent' : 'var(--accent-color)', borderRadius: '10px', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: branding.logoImageUrl ? '1px solid #1a1a1a' : 'none' }}>
                            {branding.logoImageUrl ? (
                                <img src={branding.logoImageUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <Target size={20} />
                            )}
                        </div>
                        <div>
                            <div style={{ fontWeight: '700', fontSize: '15px' }}>{branding.logoText1}</div>
                            <div style={{ fontWeight: '700', fontSize: '15px', marginTop: '-4px' }}>{branding.logoText2}</div>
                        </div>
                    </div>
                    {!isDesktop && (
                        <button onClick={() => setIsMobileNavOpen(false)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {[
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { id: 'content', label: 'Home Page', icon: LayoutDashboard },
                        { id: 'projects', label: 'Portfolio', icon: FolderKanban },
                        { id: 'cv', label: 'Curriculum', icon: FileText },
                        { id: 'blog', label: 'Blog', icon: BookOpen },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map(item => (
                        <button key={item.id} onClick={() => setActiveTab(item.id as any)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 12px', background: activeTab === item.id ? 'rgba(255,255,255,0.05)' : 'transparent', border: 'none', borderRadius: '10px', color: activeTab === item.id ? '#fff' : '#A0A0A0', cursor: 'pointer', textAlign: 'left', transition: '0.2s' }}>
                            <item.icon size={18} />
                            <span style={{ fontSize: '10px', fontWeight: '900', fontFamily: 'var(--font-display)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>{item.label}</span>
                        </button>
                    ))}
                </div>
                <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}><LogOut size={20} /> Sign Out</button>
            </div>

            <div style={{ flex: 1, minWidth: 0, marginLeft: isDesktop ? '260px' : 0 }}>
                <header style={{ height: '72px', background: '#0a0a0a', borderBottom: '1px solid #1a1a1a', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {!isDesktop && (
                            <button onClick={() => setIsMobileNavOpen(true)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Menu size={24} />
                            </button>
                        )}
                        <h2 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: '#999', letterSpacing: '1px' }}>{activeTab} Workspace</h2>
                    </div>
                </header>

                <main style={{ padding: isDesktop ? '40px' : '20px', maxWidth: '1200px', margin: '0 auto' }}>
                    {message && <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '16px 24px', background: '#fff', color: '#000', borderRadius: '12px', zIndex: 10000, fontWeight: '700' }}>{message}</div>}
                    {isMobileNavOpen && !isDesktop && (
                        <div onClick={() => setIsMobileNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
                    )}

                    {activeTab === 'analytics' && (
                        <div style={{ display: 'grid', gap: '32px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                <div style={{ background: '#111', padding: '32px', borderRadius: '24px', border: '1px solid #222' }}>
                                    <Globe size={20} color="var(--accent-color)" />
                                    <div style={{ fontSize: '40px', fontWeight: '800', margin: '15px 0' }}>{stats.pageViews}</div>
                                    <div style={{ color: '#A0A0A0', fontSize: '12px' }}>Total Page Views</div>
                                </div>
                                <div style={{ background: '#111', padding: '32px', borderRadius: '24px', border: '1px solid #222' }}>
                                    <Download size={20} color="var(--accent-color)" />
                                    <div style={{ fontSize: '40px', fontWeight: '800', margin: '15px 0' }}>{stats.cvDownloads}</div>
                                    <div style={{ color: '#A0A0A0', fontSize: '12px' }}>CV Downloads</div>
                                </div>
                                <div style={{ background: '#111', padding: '32px', borderRadius: '24px', border: '1px solid #222' }}>
                                    <Activity size={20} color="var(--accent-color)" />
                                    <div style={{ fontSize: '40px', fontWeight: '800', margin: '15px 0' }}>{stats.projectClicks}</div>
                                    <div style={{ color: '#A0A0A0', fontSize: '12px' }}>Project Interactions</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                                <div style={{ background: '#0a0a0a', padding: '32px', borderRadius: '24px', border: '1px solid #1a1a1a' }}>
                                    <h4 style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase' }}>Popular Pages</h4>
                                    <div style={{ height: '300px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.pages.slice(0, 6)}>
                                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                                                <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                                <Tooltip
                                                    contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px' }}
                                                    itemStyle={{ color: 'var(--accent-color)' }}
                                                />
                                                <Bar dataKey="count" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div style={{ background: '#0a0a0a', padding: '32px', borderRadius: '24px', border: '1px solid #1a1a1a' }}>
                                    <h4 style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase' }}>Traffic Sources</h4>
                                    <div style={{ height: '300px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={stats.sources.length > 0 ? stats.sources : [{ name: 'None', count: 1 }]}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    paddingAngle={5}
                                                    dataKey="count"
                                                >
                                                    {[...Array(6)].map((_, index) => (
                                                        <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--accent-color)' : `rgba(255,255,255,${0.1 + index * 0.1})`} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: '#0a0a0a', padding: '32px', borderRadius: '24px', border: '1px solid #1a1a1a' }}>
                                <h4 style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase' }}>Traffic Trends (Last Days)</h4>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={(stats as any).history || []}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                                            <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} />
                                            <YAxis fontSize={10} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                contentStyle={{ background: '#111', border: '1px solid #222', borderRadius: '8px' }}
                                                itemStyle={{ color: 'var(--accent-color)' }}
                                            />
                                            <Line type="monotone" dataKey="count" stroke="var(--accent-color)" strokeWidth={3} dot={{ fill: 'var(--accent-color)', r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
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
                                            color: cvSubTab === tab.id ? '#000' : '#A0A0A0', border: 'none', borderRadius: '10px',
                                            fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <tab.icon size={16} /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {cvSubTab === 'profile' ? (
                                <div style={{ background: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
                                    <h3 style={{ marginBottom: '24px', fontFamily: 'var(--font-display)', fontSize: '16px' }}>Public Identity</h3>
                                    <div style={{ marginBottom: '32px', padding: '24px', background: '#0a0a0a', borderRadius: '16px', border: '1px solid #1a1a1a' }}>
                                        <label style={labelStyle}>CV DOCUMENT (PDF)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ padding: '15px 25px', background: '#111', borderRadius: '12px', border: '1px solid #333', fontSize: '12px', color: cvProfile.pdf_url ? 'var(--accent-color)' : '#999', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {cvProfile.pdf_url ? cvProfile.pdf_url.split('/').pop() : 'No PDF uploaded'}
                                            </div>
                                            <label className="clickable" style={{ padding: '15px 25px', background: '#fff', color: '#000', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
                                                UPLOAD PDF
                                                <input type="file" accept=".pdf" style={{ display: 'none' }} onChange={async (e) => {
                                                    if (e.target.files?.[0]) {
                                                        const url = await storageAPI.uploadImage(e.target.files[0], 'general');
                                                        if (url) setCvProfile({ ...cvProfile, pdf_url: url });
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                    </div>
                                    <div style={{ marginBottom: '20px' }}>
                                        <label style={labelStyle}>Full Name</label>
                                        <input placeholder="Name" value={cvProfile.name} onChange={e => setCvProfile({ ...cvProfile, name: e.target.value })} style={modalInputStyle} />
                                    </div>
                                    <div style={{ marginBottom: '30px' }}>
                                        <label style={labelStyle}>Professional Summary (Profile Bio)</label>
                                        <textarea
                                            placeholder="Write your bio here..."
                                            value={cvProfile.bio}
                                            onChange={e => setCvProfile({ ...cvProfile, bio: e.target.value })}
                                            rows={8}
                                            style={{ ...modalInputStyle, height: 'auto', minHeight: '150px' }}
                                        />
                                    </div>
                                    <button onClick={saveCVProfile} disabled={saving} style={{ padding: '20px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: '900', width: '100%', fontSize: '14px', fontFamily: 'var(--font-display)', letterSpacing: '1px' }}>
                                        {saving ? 'SAVING...' : 'UPDATE CV IDENTITY'}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                        <h3 style={{ textTransform: 'capitalize' }}>{cvSubTab} List</h3>
                                        <button onClick={() => setEditingCV({ id: 'new', section_type: cvSubTab, title: '', subtitle: '', date_range: '', description: '', order_index: cvSections.length, visible: true } as any)} style={{ background: '#fff', color: '#000', padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>+ ADD {cvSubTab.toUpperCase()}</button>
                                    </div>
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        {filteredCV.map((s, idx) => (
                                            <div key={s.id} style={{ background: '#111', padding: '24px', borderRadius: '16px', border: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <button disabled={idx === 0 || saving} onClick={() => reorderCV(idx, 'up')} style={{ background: 'transparent', border: 'none', color: idx === 0 ? '#333' : '#A0A0A0', cursor: 'pointer' }}><ArrowUp size={14} /></button>
                                                        <button disabled={idx === filteredCV.length - 1 || saving} onClick={() => reorderCV(idx, 'down')} style={{ background: 'transparent', border: 'none', color: idx === filteredCV.length - 1 ? '#333' : '#A0A0A0', cursor: 'pointer' }}><ArrowDown size={14} /></button>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 5px 0' }}>{s.title}</h4>
                                                        <p style={{ margin: 0, fontSize: '13px', color: '#C0C0C0' }}>{s.subtitle} • {s.date_range}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => setEditingCV(s)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Settings size={18} /></button>
                                                    <button onClick={() => { if (confirm('Delete?')) cvAPI.delete(s.id).then(loadCV) }} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                                <h3>Portfolio Projects</h3>
                                <button onClick={() => setEditingProject({ id: 'new', title: '', description: '', image_url: '', tags: [], order_index: projects.length, visible: true, gallery_images: [], gallery_videos: [] } as any)} style={{ background: 'var(--accent-color)', color: '#000', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>+ NEW PROJECT</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {projects.map((p, idx) => (
                                    <div key={p.id} style={{ background: '#0a0a0a', borderRadius: '16px', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                                        <div style={{ height: '180px', background: `url(${p.image_url}) center/cover`, position: 'relative' }}>
                                            <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
                                                <button disabled={idx === 0 || saving} onClick={() => reorderProject(idx, 'up')} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}><ArrowUp size={14} /></button>
                                                <button disabled={idx === projects.length - 1 || saving} onClick={() => reorderProject(idx, 'down')} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}><ArrowDown size={14} /></button>
                                            </div>
                                        </div>
                                        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <span style={{ fontSize: '14px', fontWeight: '600' }}>{p.title}</span>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => setEditingProject(p)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Settings size={18} /></button>
                                                <button onClick={() => { if (confirm('Delete?')) projectsAPI.delete(p.id).then(loadProjects) }} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
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
                            <div style={{ background: '#0a0a0a', padding: '40px', borderRadius: '32px', border: '1px solid #1a1a1a' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '32px', color: 'var(--accent-color)' }}>Storytelling</h3>
                                <div style={{ display: 'grid', gap: '24px' }}>
                                    <textarea placeholder="Main Big Text" value={storyText} onChange={e => setStoryText(e.target.value)} rows={4} style={modalInputStyle} />
                                    <textarea placeholder="Pitch Description" value={pitchDesc} onChange={e => setPitchDesc(e.target.value)} rows={4} style={modalInputStyle} />
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <input placeholder="CTA Button Text" value={pitchBtnText} onChange={e => setPitchBtnText(e.target.value)} style={modalInputStyle} />
                                        <input placeholder="CTA Button Link" value={pitchBtnLink} onChange={e => setPitchBtnLink(e.target.value)} style={modalInputStyle} />
                                    </div>
                                </div>
                            </div>
                            <button onClick={saveContent} disabled={saving} style={{ padding: '20px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: '800' }}>PUBLISH CHANGES</button>
                        </div>
                    )}

                    {activeTab === 'blog' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                                <h3>Blog Posts</h3>
                                <button onClick={() => setEditingPost({ id: 'new', title: '', content: '', category: 'Design', tags: [], visible: true } as any)} style={{ background: 'var(--accent-color)', color: '#000', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>+ NEW POST</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {posts.map(post => (
                                    <div key={post.id} style={{ background: '#0a0a0a', borderRadius: '16px', border: '1px solid #1a1a1a', overflow: 'hidden' }}>
                                        <div style={{ height: '180px', background: post.image_url ? `url(${post.image_url}) center/cover` : '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {!post.image_url && <BookOpen size={40} color="#222" />}
                                        </div>
                                        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>{post.title}</span>
                                                <span style={{ fontSize: '11px', color: '#A0A0A0' }}>{post.category} • {new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => setEditingPost(post)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><Settings size={18} /></button>
                                                <button onClick={() => { if (confirm('Delete?')) blogAPI.delete(post.id).then(loadBlog) }} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ display: 'grid', gap: '32px' }}>
                            <div style={{ background: '#0a0a0a', padding: '40px', borderRadius: '32px', border: '1px solid #1a1a1a' }}>
                                <h3 style={{ marginBottom: '32px', color: 'var(--accent-color)' }}>Visual Identity</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                                    <div style={{ width: '80px', height: '80px', background: branding.logoImageUrl ? 'transparent' : 'var(--accent-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #333' }}>
                                        {branding.logoImageUrl ? <img src={branding.logoImageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Target size={32} />}
                                    </div>
                                    <label className="clickable" style={{ padding: '12px 24px', background: '#222', borderRadius: '8px', cursor: 'pointer', border: '1px solid #333' }}>
                                        CHANGE LOGO
                                        <input type="file" style={{ display: 'none' }} onChange={async (e) => { if (e.target.files?.[0]) { const url = await storageAPI.uploadImage(e.target.files[0], 'general'); if (url) setBranding({ ...branding, logoImageUrl: url }); } }} />
                                    </label>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <input value={branding.logoText1} onChange={e => setBranding({ ...branding, logoText1: e.target.value })} style={modalInputStyle} />
                                    <input value={branding.logoText2} onChange={e => setBranding({ ...branding, logoText2: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginTop: '32px' }}>
                                    <div>
                                        <label style={labelStyle}>BG Color</label>
                                        <input type="color" value={branding.bgColor} onChange={e => setBranding({ ...branding, bgColor: e.target.value })} style={{ width: '100%', height: '40px' }} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Accent Color</label>
                                        <input type="color" value={branding.accentColor} onChange={e => setBranding({ ...branding, accentColor: e.target.value })} style={{ width: '100%', height: '40px' }} />
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
                                <h3 style={{ marginBottom: '32px', color: 'var(--accent-color)' }}>Socials</h3>
                                <input placeholder="LinkedIn" value={branding.linkedin} onChange={e => setBranding({ ...branding, linkedin: e.target.value })} style={modalInputStyle} />
                                <input placeholder="Instagram" value={branding.instagram} onChange={e => setBranding({ ...branding, instagram: e.target.value })} style={modalInputStyle} />
                                <input placeholder="Email" value={branding.footerEmail} onChange={e => setBranding({ ...branding, footerEmail: e.target.value })} style={modalInputStyle} />
                                <input placeholder="Phone" value={branding.phone} onChange={e => setBranding({ ...branding, phone: e.target.value })} style={modalInputStyle} />
                            </div>
                            <div style={{ background: '#111', padding: '40px', borderRadius: '24px', border: '1px solid #222' }}>
                                <h3 style={{ marginBottom: '32px', color: 'var(--accent-color)' }}>Navigation Toggles</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                                    {[
                                        { id: 'navHome', label: 'Home' },
                                        { id: 'navCV', label: 'CV' },
                                        { id: 'navPortfolio', label: 'Portfolio' },
                                        { id: 'navBlog', label: 'Blog' },
                                        { id: 'navNewsletter', label: 'Newsletter' },
                                    ].map(toggle => (
                                        <label key={toggle.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                            <input type="checkbox" checked={(branding as any)[toggle.id]} onChange={e => setBranding({ ...branding, [toggle.id]: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                                            {toggle.label}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <button onClick={saveSettings} style={{ padding: '24px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '16px', fontWeight: '900' }}>SAVE CONFIGURATION</button>
                        </div>
                    )}
                </main>
            </div>

            {/* BLOG MODAL (Detailed with Toolbar) */}
            {editingPost && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#0a0a0a', width: '100%', maxWidth: '800px', borderRadius: '24px', border: '1px solid #222', padding: '40px', maxHeight: '95vh', overflowY: 'auto' }} className="hide-scrollbar">
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                            <h3>{editingPost.id === 'new' ? 'NEW POST' : 'EDIT POST'}</h3>
                            <button onClick={() => setEditingPost(null)} style={{ background: 'transparent', border: 'none', color: '#fff' }}><X size={24} /></button>
                        </div>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div>
                                <label style={labelStyle}>Image</label>
                                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                    <div style={{ width: '120px', aspectRatio: '16/9', background: '#111', borderRadius: '8px', overflow: 'hidden' }}>
                                        {editingPost.image_url ? <img src={editingPost.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={20} color="#333" /></div>}
                                    </div>
                                    <label className="clickable" style={{ padding: '8px 16px', background: '#222', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>
                                        UPLOAD
                                        <input type="file" style={{ display: 'none' }} onChange={async (e) => { if (e.target.files?.[0]) { const url = await storageAPI.uploadImage(e.target.files[0], 'blog'); if (url) setEditingPost({ ...editingPost, image_url: url }); } }} />
                                    </label>
                                </div>
                                {editingPost.image_url && (
                                    <div style={{ marginTop: '15px' }}>
                                        <label style={labelStyle}>Image Focus / Position (e.g. center, 50% 20%, right top)</label>
                                        <input
                                            placeholder="center"
                                            value={editingPost.cover_position || ''}
                                            onChange={e => setEditingPost({ ...editingPost, cover_position: e.target.value })}
                                            style={modalInputStyle}
                                        />
                                    </div>
                                )}
                            </div>
                            <input placeholder="Title" value={editingPost.title} onChange={e => setEditingPost({ ...editingPost, title: e.target.value })} style={modalInputStyle} />
                            <div>
                                <label style={labelStyle}>Tags</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', background: '#111', padding: '10px', borderRadius: '8px' }}>
                                    {editingPost.tags?.map(t => (
                                        <span key={t} style={{ background: 'var(--accent-color)', color: '#000', padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold' }}>{t} <X size={10} onClick={() => setEditingPost({ ...editingPost, tags: editingPost.tags.filter(tag => tag !== t) })} style={{ cursor: 'pointer' }} /></span>
                                    ))}
                                    <input placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBlogTag()} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {allBlogTags.slice(0, 5).map(tag => <button key={tag} onClick={() => addBlogTag(tag)} style={{ fontSize: '10px', background: '#1a1a1a', border: '1px solid #333', color: '#C0C0C0', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>+ {tag}</button>)}
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <input placeholder="Category" value={editingPost.category} onChange={e => setEditingPost({ ...editingPost, category: e.target.value })} style={modalInputStyle} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <input type="checkbox" checked={editingPost.visible} onChange={e => setEditingPost({ ...editingPost, visible: e.target.checked })} />
                                    Visible
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>Content (Markdown Toolbar)</label>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px', background: '#1a1a1a', padding: '8px', borderRadius: '8px' }}>
                                    <button onClick={() => insertMarkdown('bold')} style={{ background: '#333', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>B</button>
                                    <button onClick={() => insertMarkdown('italic')} style={{ background: '#333', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>I</button>
                                    <button onClick={() => insertMarkdown('link')} style={{ background: '#333', border: 'none', color: '#fff', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>Link</button>
                                    <label className="clickable" style={{ background: 'var(--accent-color)', color: '#000', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>
                                        + PHOTO
                                        <input type="file" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) handleBlogImageUpload(e.target.files[0]) }} />
                                    </label>
                                </div>
                                <textarea id="post-content-area" rows={12} value={editingPost.content} onChange={e => setEditingPost({ ...editingPost, content: e.target.value })} style={modalInputStyle} />
                            </div>
                            <button onClick={savePost} disabled={saving} style={{ padding: '20px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900' }}>{saving ? 'SAVING...' : 'PUBLISH POST'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* PROJECT EDIT MODAL (Existing logic) */}
            {editingProject && !editingPost && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div style={{ background: '#0a0a0a', width: '100%', maxWidth: '900px', borderRadius: '24px', border: '1px solid #222', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }} className="hide-scrollbar">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                            <h3 style={{ fontSize: '28px', fontWeight: '900' }}>EDIT PROJECT</h3>
                            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                <button onClick={() => setIsPreviewOpen(true)} style={{ background: 'transparent', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>PREVIEW MODAL</button>
                                <button onClick={() => setEditingProject(null)} style={{ background: 'transparent', border: 'none', color: '#A0A0A0' }}><X size={24} /></button>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gap: '24px' }}>
                            <input placeholder="Title" value={editingProject.title} onChange={e => setEditingProject({ ...editingProject, title: e.target.value })} style={modalInputStyle} />
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px', background: '#111', padding: '12px', borderRadius: '8px' }}>
                                {editingProject.tags?.map(t => <span key={t} style={{ background: 'var(--accent-color)', color: '#000', padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold' }}>{t} <X size={12} onClick={() => setEditingProject({ ...editingProject, tags: editingProject.tags.filter(tag => tag !== t) })} style={{ cursor: 'pointer' }} /></span>)}
                                <input placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} style={{ background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '120px', aspectRatio: '16/10', background: '#111', borderRadius: '12px', overflow: 'hidden' }}>
                                    {editingProject.image_url ? <img src={editingProject.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={24} color="#333" />}
                                </div>
                                <label className="clickable" style={{ padding: '10px 20px', background: '#222', borderRadius: '8px', cursor: 'pointer', border: '1px solid #333' }}>
                                    UPLOAD CAPA
                                    <input type="file" onChange={handleCoverChange} style={{ display: 'none' }} />
                                </label>
                            </div>

                            {/* GALLERY SECTION */}
                            <div style={{ border: '1px solid #222', padding: '24px', borderRadius: '16px', background: '#0a0a0a' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h4 style={{ fontSize: '14px', fontWeight: 'bold' }}>PROJECT GALLERY (IMAGES & VIDEOS)</h4>
                                    <label className="clickable" style={{ padding: '8px 16px', background: 'var(--accent-color)', color: '#000', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                                        + ADD MEDIA
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*,video/*"
                                            style={{ display: 'none' }}
                                            onChange={async (e) => {
                                                if (e.target.files?.length) {
                                                    const files = Array.from(e.target.files);
                                                    const newImages = [...(editingProject.gallery_images || [])];
                                                    const newVideos = [...(editingProject.gallery_videos || [])];

                                                    for (const file of files) {
                                                        const url = await storageAPI.uploadImage(file, 'projects');
                                                        if (url) {
                                                            if (file.type.startsWith('video')) newVideos.push(url);
                                                            else newImages.push(url);
                                                        }
                                                    }
                                                    setEditingProject({ ...editingProject, gallery_images: newImages, gallery_videos: newVideos });
                                                }
                                            }}
                                        />
                                    </label>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                    {/* Gallery Images */}
                                    {editingProject.gallery_images?.map((url, i) => (
                                        <div key={`img-${i}`} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #222' }}>
                                            <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <button
                                                onClick={() => {
                                                    const news = [...editingProject.gallery_images!];
                                                    news.splice(i, 1);
                                                    setEditingProject({ ...editingProject, gallery_images: news });
                                                }}
                                                style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.8)', border: 'none', borderRadius: '50%', color: '#fff', padding: '4px', cursor: 'pointer' }}
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Gallery Videos */}
                                    {editingProject.gallery_videos?.map((url, i) => (
                                        <div key={`vid-${i}`} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #222', background: '#000' }}>
                                            <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                                                <Activity size={16} color="var(--accent-color)" />
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const news = [...editingProject.gallery_videos!];
                                                    news.splice(i, 1);
                                                    setEditingProject({ ...editingProject, gallery_videos: news });
                                                }}
                                                style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.8)', border: 'none', borderRadius: '50%', color: '#fff', padding: '4px', cursor: 'pointer' }}
                                            >
                                                <X size={10} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <textarea value={editingProject.description || ''} onChange={e => setEditingProject({ ...editingProject, description: e.target.value })} rows={6} style={modalInputStyle} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <input placeholder="Live Link (URL)" value={editingProject.live_url || ''} onChange={e => setEditingProject({ ...editingProject, live_url: e.target.value })} style={modalInputStyle} />
                                <input placeholder="Button Text (e.g. VIEW SITE)" value={editingProject.button_text || ''} onChange={e => setEditingProject({ ...editingProject, button_text: e.target.value })} style={modalInputStyle} />
                            </div>
                            <button onClick={saveProject} disabled={saving} style={{ width: '100%', padding: '20px', background: 'var(--accent-color)', color: '#000', border: 'none', borderRadius: '12px', fontWeight: '900' }}>{saving ? 'SAVING...' : 'SAVE PROJECT'}</button>
                        </div>
                    </div>
                </div>
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

            {/* PREVIEW MODAL */}
            {isPreviewOpen && editingProject && (
                <ProjectModal project={editingProject} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
            )}
        </div>
    );
}
