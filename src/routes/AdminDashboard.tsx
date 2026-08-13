import { useState, useEffect } from 'react';
import {
    supabase,
    contentAPI,
    projectsAPI,
    cvAPI,
    analyticsAPI,
    blogAPI,
    aboutAPI,
    type Project,
    type CVSection,
    type BlogPost,
    type AboutStep,
    type AboutHobby,
    type AboutTestimonial,
    type AboutMemory
} from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    LogOut, Trash2, Settings, BarChart3, User, Globe, Download,
    Target, Activity, X, Image as ImageIcon, Briefcase, GraduationCap, Award, Star, Heart, Menu, ArrowUp, ArrowDown, BookOpen,
    Lightbulb, Rocket, Coffee, Palette, Music, Camera, Gamepad2, Brain, Zap,
    Terminal, Layout, Cpu, Database, Smartphone, Search, Map, PenTool, MessageCircle, FileCode,
    Wifi, Wrench, Brush, Cloud, Book, Mail, Phone, MapPin,
    Users, Check, Layers, Monitor, Tablet, Watch, Headphones, Video, ShoppingBag, CreditCard,
    Wallet, Calendar, Bell, Lock, Unlock, Key, Eye, EyeOff, Filter, Sliders, Navigation,
    ExternalLink, Share, Play, Pause, ChevronLeft, ChevronRight,
    Square, Triangle, Smile, Flame, Sun, Moon, Wind, Trophy, Medal, Box, Anchor, Compass,
    Feather, Pen, Pencil, Columns, Grid, List, Plus, House, ImageMinus, IdCard, Languages
} from 'lucide-react';

const ICON_COMPONENTS: Record<string, any> = {
    Search, Rocket, Lightbulb, FileCode, Target, Heart, Star, Coffee,
    Palette, Music, Camera, Gamepad2, Brain, Globe, Zap,
    Terminal, Layout, Cpu, Database, Smartphone, Map, PenTool, MessageCircle,
    Activity, Wifi, Wrench, Brush, Cloud, Book, Mail, Phone, MapPin,
    Users, Check, Layers, Monitor, Tablet, Watch, Headphones, Video, ShoppingBag, CreditCard,
    Wallet, Calendar, Bell, Lock, Unlock, Key, Eye, EyeOff, Filter, Sliders, Navigation,
    ExternalLink, Share, Play, Pause,
    Square, Triangle, Smile, Flame, Sun, Moon, Wind, Trophy, Medal, Box, Anchor, Compass,
    Feather, Pen, Pencil, Columns, Grid, List, Plus
};

const SELECTABLE_ICONS = Object.keys(ICON_COMPONENTS).sort();
import { storageAPI } from '../lib/storage';
import { motion } from 'framer-motion';
import ProjectForm from '../components/ProjectForm';
import ProjectModal from '../components/ProjectModal';
import RichTextEditor from '../components/RichTextEditor';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';
import { formatTranslatable, getTranslationParts } from '../lib/i18n-utils';

const modalInputStyle = { width: '100%', padding: '12px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-color)', fontSize: '14px', marginBottom: '10px', whiteSpace: 'pre-wrap' as any, fontFamily: 'var(--font-body)' };
const labelStyle = { display: 'block', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '700', fontFamily: 'var(--font-body)', textTransform: 'uppercase' as any, letterSpacing: '1px' };

const getContrastColor = (hex: string) => {
    if (!hex || hex === 'transparent') return '#fff';
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 160 ? '#000' : '#fff';
};

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDesktop, setIsDesktop] = useState(window.innerWidth > 1024);

    useEffect(() => {
        const handleResize = () => setIsDesktop(window.innerWidth > 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [activeTab, setActiveTab] = useState<'analytics' | 'content' | 'projects' | 'cv' | 'blog' | 'settings' | 'about'>('analytics');
    const [cvSubTab, setCvSubTab] = useState<'profile' | 'experience' | 'education' | 'skills' | 'certification' | 'hobbies'>('profile');

    // Analytics State
    const [stats, setStats] = useState({
        pageViews: 0,
        cvDownloads: 0,
        projectClicks: 0,
        pages: [] as { name: string, count: number }[],
        sources: [] as { name: string, count: number }[],
        history: [] as { date: string, count: number }[]
    });
    const [dateFilter, setDateFilter] = useState<'7d' | '30d' | 'all'>('7d');

    // Content State
    const [heroTitle, setHeroTitle] = useState('');
    const [heroDesc, setHeroDesc] = useState('');
    const [storyText, setStoryText] = useState('');
    const [storytellingVisible, setStorytellingVisible] = useState(true);
    const [pitchDesc, setPitchDesc] = useState('');
    const [pitchBtnText, setPitchBtnText] = useState('');
    const [pitchBtnLink, setPitchBtnLink] = useState('');

    // Projects State
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [tagInput, setTagInput] = useState('');
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [allProjectTags, setAllProjectTags] = useState<string[]>([]);

    // CV State
    const [cvProfile, setCvProfile] = useState({ name: '', bio: '', pdf_url: '' });
    const [cvSections, setCvSections] = useState<CVSection[]>([]);
    const [editingCV, setEditingCV] = useState<CVSection | null>(null);

    // Blog State
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
    const [allBlogTags, setAllBlogTags] = useState<string[]>([]);

    // About Page State
    const [aboutProfile, setAboutProfile] = useState({ photo: '', reveal_image: '', title: '', subtitle: '', bio: '', spotify: '', visible: true });
    const [aboutTestimonials, setAboutTestimonials] = useState<AboutTestimonial[]>([]);
    const [editingStep, setEditingStep] = useState<AboutStep | null>(null);
    const [editingHobby, setEditingHobby] = useState<AboutHobby | null>(null);
    const [editingTestimonial, setEditingTestimonial] = useState<AboutTestimonial | null>(null);
    const [editingMemory, setEditingMemory] = useState<AboutMemory | null>(null);
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
        navGetInTouch: true,
        navBlog: false,
        navNewsletter: false,
        navAbout: false,
        logoImageUrl: '',
        navOrder: [] as string[]
    });

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [editLang, setEditLang] = useState<'en' | 'pt'>('en');

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        loadStats();
    }, [dateFilter]);

    const loadAllData = async () => {
        setSaving(true);
        const allContent = await contentAPI.getAll();

        await Promise.all([
            loadContent(allContent),
            loadProjects(),
            loadCV(allContent),
            loadSettings(allContent),
            loadStats(),
            loadBlog(true), // Now also loads blog tags
            loadAbout(allContent)
        ]);
        setSaving(false);
    };

    const loadStats = async () => {
        const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : undefined;
        const data = await analyticsAPI.getStats(days);
        if (data) setStats(data);
    };

    const loadContent = async (providedContent?: any[]) => {
        const allContent = providedContent || await contentAPI.getAll();
        const getV = (key: string) => allContent.find(c => c.key === key)?.value;

        setHeroTitle(getV('hero.title') || '');
        setHeroDesc(getV('hero.description') || '');
        setStoryText(getV('storytelling.main') || '');
        setStorytellingVisible(getV('storytelling.visible') !== 'false');
        setPitchDesc(getV('storytelling.description') || '');
        setPitchBtnText(getV('storytelling.button_text') || '');
        setPitchBtnLink(getV('storytelling.button_link') || '');
    };

    const loadProjects = async () => {
        console.log('🔄 [v4.5] Carregando projetos do banco...');
        const { data, error } = await supabase.from('projects').select('*').order('order_index', { ascending: true }).limit(1000);
        if (!error && data) {
            console.log('📊 [v4.5] Projetos recebidos:', data.length);
            // Log details for the Bem Agro project specifically if it exists
            const bemAgro = data.find(p => p.title?.toLowerCase().includes('bem agro'));
            if (bemAgro) {
                console.log('🧐 [v4.5] Dados atuais do Bem Agro:', {
                    id: bemAgro.id,
                    highlights_count: bemAgro.highlights?.length,
                    first_highlight_media: bemAgro.highlights?.[0]?.image
                });
            }
            setProjects(data);
            const tags = new Set<string>();
            data.forEach(p => p.tags?.forEach((t: string) => tags.add(t.toUpperCase())));
            setAllProjectTags(Array.from(tags).sort());
        } else if (error) {
            console.error('❌ [v4.5] Erro ao carregar projetos:', error);
        }
    };

    const loadCV = async (providedContent?: any[]) => {
        const allContent = providedContent || await contentAPI.getAll();
        const getV = (key: string) => allContent.find(c => c.key === key)?.value;

        const { data, error } = await supabase.from('cv_sections').select('*').order('order_index', { ascending: true });
        if (!error && data) setCvSections(data);

        setCvProfile({
            name: getV('cv.name') || '',
            bio: getV('cv.bio') || '',
            pdf_url: getV('cv.pdf_url') || ''
        });
    };

    const loadSettings = async (providedContent?: any[]) => {
        const allContent = providedContent || await contentAPI.getAll();
        const getV = (key: string) => allContent.find(c => c.key === key)?.value;

        setBranding({
            logoText1: getV('general.logo_text1') || 'VINICIUS',
            logoText2: getV('general.logo_text2') || 'CAMPOS',
            accentColor: getV('general.accent_color') || '#F2A73D',
            bgColor: getV('general.bg_color') || '#050505',
            lightAccentColor: getV('general.light_accent_color') || '#C87A1A',
            lightBgColor: getV('general.light_bg_color') || '#FFFFFF',
            linkedin: getV('social.linkedin') || '',
            instagram: getV('social.instagram') || '',
            footerEmail: getV('social.footer_email') || '',
            phone: getV('social.phone') || '',
            footerText: getV('general.footer_text') || '',
            navHome: getV('nav.home') !== 'false',
            navCV: getV('nav.cv') !== 'false',
            navPortfolio: getV('nav.portfolio') !== 'false',
            navGetInTouch: getV('nav.get_in_touch') !== 'false',
            navBlog: getV('nav.blog') === 'true',
            navNewsletter: getV('nav.newsletter') === 'true',
            navAbout: getV('nav.about') === 'true',
            logoImageUrl: getV('general.logo_image_url') || '',
            navOrder: (getV('nav.order') || 'navHome,navCV,navPortfolio,navAbout,navBlog,navGetInTouch').split(',')
        });
    };

    const loadBlog = async (includeTags = false) => {
        const data = await blogAPI.getAll();
        setPosts(data);
        if (includeTags) {
            const tags = new Set<string>();
            data.forEach(p => p.tags?.forEach((t: string) => tags.add(t.toUpperCase())));
            setAllBlogTags(Array.from(tags).sort());
        }
    };

    const loadAbout = async (providedContent?: any[]) => {
        const allContent = providedContent || await contentAPI.getAll();
        const getV = (key: string) => allContent.find(c => c.key === key)?.value;

        setAboutProfile({
            photo: getV('about.profile_photo') || '',
            reveal_image: getV('about.reveal_image') || '',
            title: getV('about.name_title') || '',
            subtitle: getV('about.subtitle') || '',
            bio: getV('about.bio_text') || '',
            spotify: getV('about.spotify_embed_url') || '',
            visible: getV('about.visible') === 'true'
        });

        const [testimonials] = await Promise.all([
            aboutAPI.getTestimonials()
        ]);

        setAboutTestimonials(testimonials);
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
                contentAPI.update('storytelling.visible', storytellingVisible ? 'true' : 'false', 'storytelling'),
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
            const dataToSave = {
                title: editingProject.title || '',
                slug: editingProject.slug || undefined,
                short_description: editingProject.short_description || '',
                summary: editingProject.summary || '',
                description: editingProject.description || '',
                page_title: editingProject.page_title || '',
                client_name: editingProject.client_name || '',
                client_subtitle: editingProject.client_subtitle || '',
                location: editingProject.location || '',
                duration: editingProject.duration || '',
                image_url: editingProject.image_url || '',
                tags: editingProject.tags || [],
                project_steps: editingProject.project_steps || [],
                highlights: editingProject.highlights || [],
                gallery_images: editingProject.gallery_images || [],
                gallery_videos: editingProject.gallery_videos || [],
                live_url: editingProject.live_url || '',
                live_url_label: editingProject.live_url_label || '',
                download_url: editingProject.download_url || '',
                download_url_label: editingProject.download_url_label || '',
                year: editingProject.year || '',
                my_role: editingProject.my_role || '',
                order_index: editingProject.order_index || 0,
                visible: editingProject.visible !== false
            };

            const pid = editingProject.id;
            console.log('💾 [v4.5] SALVANDO PROJETO:', { id: pid, title: editingProject.title });
            console.log('📽️ Highlights:', JSON.stringify(editingProject.highlights, null, 2));
            console.log('🎞️ Gallery Videos:', editingProject.gallery_videos);
            console.log('📦 Objeto Final:', JSON.stringify(dataToSave, null, 2));

            let result;
            if (pid && pid !== '' && pid !== 'new') {
                result = await supabase.from('projects').update(dataToSave).eq('id', pid).select();
            } else {
                result = await supabase.from('projects').insert([dataToSave]).select();
            }

            if (result.error) {
                console.error('❌ Supabase Save Error:', result.error);
                let errorMsg = `ERRO SUPABASE: ${result.error.message}`;

                if (result.error.message.includes('gallery_videos') || result.error.message.includes('column')) {
                    errorMsg += "\n\nDICA: A coluna 'gallery_videos' pode estar faltando. Certifique-se de rodar o script SQL 'fix_gallery_videos_column.sql' no SQL Editor do Supabase.";
                }

                alert(errorMsg);
                setMessage('❌ Falha ao salvar');
            } else {
                console.log('✅ Projeto salvo com sucesso! Retorno:', result.data);
                alert('[v4.5] Projeto salvo com sucesso no banco de dados!');
                await loadProjects();
                setEditingProject(null);
                setMessage('✅ Salvo com sucesso!');
            }
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
                contentAPI.update('nav.get_in_touch', String(branding.navGetInTouch), 'nav'),
                contentAPI.update('nav.blog', String(branding.navBlog), 'nav'),
                contentAPI.update('nav.newsletter', String(branding.navNewsletter), 'nav'),
                contentAPI.update('nav.about', String(branding.navAbout), 'nav'),
                contentAPI.update('about.visible', String(branding.navAbout), 'about'), // Sync visible
                contentAPI.update('general.logo_image_url', branding.logoImageUrl, 'general'),
                contentAPI.update('nav.order', branding.navOrder.join(','), 'nav')
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

    const saveAboutProfile = async () => {
        setSaving(true);
        try {
            // Helper to format spotify URL
            let spotifyUrl = aboutProfile.spotify;
            if (spotifyUrl && !spotifyUrl.includes('/embed/')) {
                const matches = spotifyUrl.match(/(playlist|album|track|artist)\/([a-zA-Z0-9]+)/);
                if (matches) {
                    spotifyUrl = `https://open.spotify.com/embed/${matches[1]}/${matches[2]}?utm_source=generator&theme=0`;
                }
            }

            await Promise.all([
                contentAPI.update('about.profile_photo', aboutProfile.photo, 'about'),
                contentAPI.update('about.reveal_image', aboutProfile.reveal_image, 'about'),
                contentAPI.update('about.name_title', aboutProfile.title, 'about'),
                contentAPI.update('about.subtitle', aboutProfile.subtitle, 'about'),
                contentAPI.update('about.bio_text', aboutProfile.bio, 'about'),
                contentAPI.update('about.spotify_embed_url', spotifyUrl, 'about'),
                contentAPI.update('about.visible', String(aboutProfile.visible), 'about')
            ]);
            setAboutProfile(prev => ({ ...prev, spotify: spotifyUrl }));
            setMessage('✅ About profile updated!');
        } catch (err) { setMessage('❌ Error.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const saveAboutStep = async (step: Partial<AboutStep>) => {
        setSaving(true);
        const res = await aboutAPI.saveStep(step);
        if (res) {
            setMessage('✅ Step saved!');
            loadAbout();
            setEditingStep(null);
        } else setMessage('❌ Error.');
        setSaving(false); setTimeout(() => setMessage(''), 3000);
    };



    const saveAboutHobby = async (hobby: Partial<AboutHobby>) => {
        setSaving(true);
        const res = await aboutAPI.saveHobby(hobby);
        if (res) {
            setMessage('✅ Hobby saved!');
            loadAbout();
            setEditingHobby(null);
        } else setMessage('❌ Error.');
        setSaving(false); setTimeout(() => setMessage(''), 3000);
    };



    const saveAboutTestimonial = async (test: Partial<AboutTestimonial>) => {
        setSaving(true);
        const res = await aboutAPI.saveTestimonial(test);
        if (res) {
            setMessage('✅ Testimonial saved!');
            loadAbout();
            setEditingTestimonial(null);
        } else setMessage('❌ Error.');
        setSaving(false); setTimeout(() => setMessage(''), 3000);
    };

    const deleteAboutTestimonial = async (id: string) => {
        if (!confirm('Delete testimonial?')) return;
        setSaving(true);
        if (await aboutAPI.deleteTestimonial(id)) {
            setMessage('✅ Deleted');
            loadAbout();
        }
        setSaving(false); setTimeout(() => setMessage(''), 3000);
    };

    const savePost = async () => {
        if (!editingPost) return;
        setSaving(true);
        try {
            let ok = false;
            if (editingPost.id === 'new') {
                const { id, created_at, updated_at, ...postData } = editingPost as any;
                const res = await blogAPI.create(postData);
                ok = !!res;
            } else {
                const { id, created_at, updated_at, ...postData } = editingPost as any;
                ok = await blogAPI.update(id, postData);
            }
            if (ok) {
                setMessage('✅ Post saved!');
                loadBlog();
                setEditingPost(null);
            } else setMessage('❌ Error.');
        } catch (err) { setMessage('❌ Error.'); }
        finally { setSaving(false); setTimeout(() => setMessage(''), 3000); }
    };

    const saveAboutMemory = async (mem: Partial<AboutMemory>) => {
        setSaving(true);
        const res = await aboutAPI.saveMemory(mem);
        if (res) {
            setMessage('✅ Memory saved!');
            loadAbout();
            setEditingMemory(null);
        } else setMessage('❌ Error.');
        setSaving(false); setTimeout(() => setMessage(''), 3000);
    };



    const handleAboutImageUpload = async (file: File, type: 'profile' | 'memory' | 'testimonial') => {
        const url = await storageAPI.uploadImage(file, 'about');
        if (!url) return;
        if (type === 'profile') setAboutProfile({ ...aboutProfile, photo: url });
        if (type === 'memory' && editingMemory) setEditingMemory({ ...editingMemory, image_url: url });
        if (type === 'testimonial' && editingTestimonial) setEditingTestimonial({ ...editingTestimonial, author_image: url });
        if ((type as any) === 'reveal') setAboutProfile({ ...aboutProfile, reveal_image: url });
    };

    return (
        <div className="admin-dashboard" data-theme="light" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-color)', color: 'var(--text-color)', fontFamily: 'var(--font-body)' }}>
            <div style={{
                width: isSidebarCollapsed ? '80px' : '260px',
                background: 'var(--surface-color)',
                borderRight: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                padding: '24px 12px',
                position: 'fixed',
                left: isDesktop || isMobileNavOpen ? 0 : (isSidebarCollapsed ? '-80px' : '-260px'),
                top: 0,
                bottom: 0,
                height: '100vh',
                zIndex: 1000,
                transition: 'width 0.3s ease, left 0.3s ease',
                overflow: 'visible'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', marginBottom: '40px', padding: isSidebarCollapsed ? '0' : '0 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                        <div style={{
                            minWidth: isSidebarCollapsed ? '32px' : '44px',
                            height: isSidebarCollapsed ? '32px' : '44px',
                            background: 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            {branding.logoImageUrl ? (
                                <img src={branding.logoImageUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            ) : (
                                <Target size={20} color="var(--accent-color)" />
                            )}
                        </div>
                    </div>
                    {!isDesktop && (
                        <button onClick={() => setIsMobileNavOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {[
                        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
                        { id: 'content', label: 'HOME', icon: House },
                        { id: 'about', label: 'About', icon: User },
                        { id: 'cv', label: 'Curriculum', icon: IdCard },
                        { id: 'projects', label: 'Portfolio', icon: ImageMinus },
                        { id: 'blog', label: 'Blog', icon: BookOpen },
                    ].map(item => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                title={isSidebarCollapsed ? item.label : ''}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: isSidebarCollapsed ? 'center' : 'flex-start',
                                    gap: isSidebarCollapsed ? '0' : '12px',
                                    padding: '14px 12px',
                                    background: isActive ? branding.accentColor : 'transparent',
                                    border: 'none',
                                    borderRadius: '12px',
                                    color: isActive ? getContrastColor(branding.accentColor) : '#A0A0A0',
                                    cursor: 'pointer',
                                    textAlign: 'left',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    width: '100%'
                                }}
                            >
                                <item.icon size={20} />
                                {!isSidebarCollapsed && (
                                    <span style={{
                                        fontSize: '11px',
                                        fontWeight: '800',
                                        fontFamily: 'var(--font-body)',
                                        letterSpacing: '0.1em',
                                        textTransform: 'uppercase'
                                    }}>
                                        {item.label}
                                    </span>
                                )}
                                {isActive && !isSidebarCollapsed && (
                                    <motion.div
                                        layoutId="activeTab"
                                        style={{ position: 'absolute', right: '12px', width: '6px', height: '6px', borderRadius: '50%', background: getContrastColor(branding.accentColor) }}
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>


                {/* Collapse toggle — floats at the edge between sidebar and content */}
                {isDesktop && (
                    <button
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                        title={isSidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
                        style={{
                            position: 'absolute',
                            top: '50%',
                            right: '-14px',
                            transform: 'translateY(-50%)',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'var(--surface-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '50%',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            zIndex: 1001,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            transition: 'all 0.2s'
                        }}
                    >
                        {isSidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>
                )}
            </div>

            <div style={{
                flex: 1,
                minWidth: 0,
                marginLeft: isDesktop ? (isSidebarCollapsed ? '80px' : '260px') : 0,
                transition: 'margin-left 0.3s ease',
                background: 'var(--bg-color)'
            }}>
                <header style={{ height: '72px', background: 'var(--surface-color)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', padding: '0 24px', position: 'sticky', top: 0, zIndex: 50, justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {!isDesktop && (
                            <button onClick={() => setIsMobileNavOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                <Menu size={24} />
                            </button>
                        )}
                        <h2 style={{ fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '2px', fontFamily: 'var(--font-body)' }}>{activeTab} Workspace</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            onClick={() => setActiveTab('settings' as any)}
                            title="Settings"
                            style={{
                                width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: activeTab === 'settings' ? 'var(--accent-color)' : 'var(--bg-color)',
                                border: '1px solid var(--border-color)', borderRadius: '10px',
                                color: activeTab === 'settings' ? '#fff' : 'var(--text-muted)',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <Settings size={18} />
                        </button>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            style={{
                                width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(255,68,68,0.08)',
                                border: '1px solid rgba(255,68,68,0.2)', borderRadius: '10px',
                                color: '#ff4444',
                                cursor: 'pointer', transition: 'all 0.2s'
                            }}
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </header>

                <main style={{ padding: isDesktop ? '40px' : '20px', maxWidth: '1200px', margin: '0 auto' }}>
                    {message && <div style={{ position: 'fixed', bottom: '24px', right: '24px', padding: '16px 24px', background: '#fff', color: '#000', borderRadius: '12px', zIndex: 10000, fontWeight: '700' }}>{message}</div>}
                    {isMobileNavOpen && !isDesktop && (
                        <div onClick={() => setIsMobileNavOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }} />
                    )}

                    {activeTab === 'analytics' && (
                        <div style={{ display: 'grid', gap: '32px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', textTransform: 'uppercase', fontFamily: 'var(--font-body)', letterSpacing: '2px' }}>Dashboard Overview</h3>
                                <div style={{ display: 'flex', gap: '10px', background: 'var(--surface-color)', padding: '6px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                                    {(['7d', '30d', 'all'] as const).map(f => (
                                        <button
                                            key={f}
                                            onClick={() => setDateFilter(f)}
                                            style={{
                                                padding: '8px 16px',
                                                background: dateFilter === f ? 'var(--accent-color)' : 'var(--bg-color)',
                                                color: dateFilter === f ? getContrastColor(branding.accentColor) : 'var(--text-color)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            {f === 'all' ? 'ALL TIME' : f.toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                                <div style={{ background: 'var(--surface-color)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)', transition: 'transform 0.3s ease' }}>
                                    <Globe size={20} color="var(--accent-color)" />
                                    <div style={{ fontSize: '40px', fontWeight: '900', margin: '15px 0', fontFamily: 'var(--font-body)' }}>{stats.pageViews}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Page Views</div>
                                </div>
                                <div style={{ background: 'var(--surface-color)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                    <Download size={20} color="var(--accent-color)" />
                                    <div style={{ fontSize: '40px', fontWeight: '900', margin: '15px 0', fontFamily: 'var(--font-body)' }}>{stats.cvDownloads}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>CV Downloads</div>
                                </div>
                                <div style={{ background: 'var(--surface-color)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                    <Activity size={20} color="var(--accent-color)" />
                                    <div style={{ fontSize: '40px', fontWeight: '900', margin: '15px 0', fontFamily: 'var(--font-body)' }}>{stats.projectClicks}</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' }}>Project Interactions</div>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px' }}>
                                <div style={{ background: 'var(--surface-color)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                    <h4 style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', fontFamily: 'var(--font-body)', letterSpacing: '1px' }}>Popular Pages</h4>
                                    <div style={{ height: '300px' }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart data={stats.pages.slice(0, 6)}>
                                                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                                <Tooltip
                                                    contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                                    itemStyle={{ color: 'var(--accent-color)' }}
                                                    labelStyle={{ color: 'var(--text-color)' }}
                                                />
                                                <Bar dataKey="count" fill="var(--accent-color)" radius={[4, 4, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                                <div style={{ background: 'var(--surface-color)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                    <h4 style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', fontFamily: 'var(--font-body)', letterSpacing: '1px' }}>Traffic Sources</h4>
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
                                                    {[...Array(6)].map((_, index) => {
                                                        const colors = ['var(--accent-color)', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                                                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                                                    })}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                                    itemStyle={{ color: 'var(--accent-color)' }}
                                                    labelStyle={{ color: 'var(--text-color)' }}
                                                />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--surface-color)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                <h4 style={{ marginBottom: '24px', fontSize: '14px', textTransform: 'uppercase', fontFamily: 'var(--font-body)', letterSpacing: '1px' }}>
                                    Traffic Trends {dateFilter === 'all' ? '(All Time)' : `(Last ${dateFilter === '7d' ? '7' : '30'} Days)`}
                                </h4>
                                <div style={{ height: '300px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats.history}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                            <XAxis dataKey="date" fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                            <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                                            <Tooltip
                                                contentStyle={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                                                itemStyle={{ color: 'var(--accent-color)' }}
                                                labelStyle={{ color: 'var(--text-color)' }}
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
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px', background: 'var(--surface-color)', padding: '10px', borderRadius: '16px', border: '1px solid var(--border-color)', overflowX: 'auto' }} className="hide-scrollbar">
                                {[
                                    { id: 'profile', label: 'Summary', icon: User },
                                    { id: 'experience', label: 'Experience', icon: Briefcase },
                                    { id: 'education', label: 'Education', icon: GraduationCap },
                                    { id: 'skills', label: 'Skills', icon: Star },
                                    { id: 'certification', label: 'Certifications', icon: Award },
                                    { id: 'hobbies', label: 'Languages', icon: Languages },
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setCvSubTab(tab.id as any)}
                                        style={{
                                            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 20px',
                                            background: cvSubTab === tab.id ? 'var(--accent-color)' : 'transparent',
                                            color: cvSubTab === tab.id ? getContrastColor(branding.accentColor) : 'var(--text-color)', border: 'none', borderRadius: '10px',
                                            fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', whiteSpace: 'nowrap'
                                        }}
                                    >
                                        <tab.icon size={16} /> {tab.label}
                                    </button>
                                ))}
                            </div>

                            {cvSubTab === 'profile' ? (
                                <div style={{ background: 'var(--surface-color)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                    <h3 style={{ marginBottom: '24px', fontFamily: 'var(--font-body)', fontSize: '16px' }}>Public Identity</h3>
                                    <div style={{ marginBottom: '32px', padding: '24px', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        <label style={labelStyle}>CV DOCUMENT (PDF)</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                            <div style={{ padding: '15px 25px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--border-color)', fontSize: '12px', color: cvProfile.pdf_url ? 'var(--accent-color)' : 'var(--text-muted)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {cvProfile.pdf_url ? cvProfile.pdf_url.split('/').pop() : 'No PDF uploaded'}
                                            </div>
                                            <label className="clickable" style={{ padding: '15px 25px', background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
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
                                    <button onClick={saveCVProfile} disabled={saving} style={{ padding: '20px', background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), border: 'none', borderRadius: '16px', fontWeight: '900', width: '100%', fontSize: '14px', fontFamily: 'var(--font-body)', letterSpacing: '1px' }}>
                                        {saving ? 'SAVING...' : 'UPDATE CV IDENTITY'}
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                        <h3 style={{ textTransform: 'capitalize' }}>{cvSubTab === 'hobbies' ? 'Languages' : cvSubTab} List</h3>
                                        <button onClick={() => setEditingCV({ id: 'new', section_type: cvSubTab, title: '', subtitle: '', date_range: '', description: '', order_index: cvSections.length, visible: true } as any)} style={{ background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), padding: '10px 20px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>+ ADD {cvSubTab === 'hobbies' ? 'LANGUAGES' : cvSubTab.toUpperCase()}</button>
                                    </div>
                                    <div style={{ display: 'grid', gap: '15px' }}>
                                        {filteredCV.map((s, idx) => (
                                            <div key={s.id} style={{ background: 'var(--surface-color)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                        <button disabled={idx === 0 || saving} onClick={() => reorderCV(idx, 'up')} style={{ background: 'transparent', border: 'none', color: idx === 0 ? 'var(--text-muted)' : 'var(--text-color)', cursor: 'pointer' }}><ArrowUp size={14} /></button>
                                                        <button disabled={idx === filteredCV.length - 1 || saving} onClick={() => reorderCV(idx, 'down')} style={{ background: 'transparent', border: 'none', color: idx === filteredCV.length - 1 ? 'var(--text-muted)' : 'var(--text-color)', cursor: 'pointer' }}><ArrowDown size={14} /></button>
                                                    </div>
                                                    <div>
                                                        <h4 style={{ margin: '0 0 5px 0' }}>{s.title}</h4>
                                                        <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)' }}>{s.subtitle} • {s.date_range}</p>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => setEditingCV(s)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><Settings size={18} /></button>
                                                    <button onClick={() => { if (confirm('Delete?')) cvAPI.delete(s.id).then(() => loadCV()) }} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Portfolio Projects</h3>
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>{projects.length} ITEMS TOTAL</span>
                                </div>
                                <button onClick={() => setEditingProject({ id: 'new', title: '', description: '', image_url: '', tags: [], order_index: projects.length, visible: true, gallery_images: [], gallery_videos: [], live_url: '', live_url_label: '', download_url: '', download_url_label: '', project_steps: [], highlights: [] } as any)} style={{ background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>+ NEW PROJECT</button>
                            </div>
                            <div style={{ display: 'grid', gap: '40px' }}>
                                {/* PUBLISHED SECTION */}
                                <div>
                                    <h4 style={{ ...labelStyle, color: 'var(--accent-color)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#44ff44' }}></div>
                                        PUBLISHED PROJECTS ({projects.filter(p => p.visible !== false).length})
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                        {projects.map((p, idx) => p.visible !== false && (
                                            <div key={p.id} style={{ background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', opacity: 1 }}>
                                                <div style={{ height: '180px', background: `url(${p.image_url}) center/cover`, position: 'relative' }}>
                                                    <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
                                                        <button disabled={idx === 0 || saving} onClick={() => reorderProject(idx, 'up')} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}><ArrowUp size={14} /></button>
                                                        <button disabled={idx === projects.length - 1 || saving} onClick={() => reorderProject(idx, 'down')} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}><ArrowDown size={14} /></button>
                                                    </div>
                                                </div>
                                                <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{p.title}</span>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button onClick={() => setEditingProject(p)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><Settings size={18} /></button>
                                                        <button onClick={() => { if (confirm('Delete?')) projectsAPI.delete(p.id).then(() => loadProjects()) }} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* DRAFTS SECTION */}
                                {projects.some(p => p.visible === false) && (
                                    <div>
                                        <h4 style={{ ...labelStyle, color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffaa00' }}></div>
                                            DRAFTS / HIDDEN ({projects.filter(p => p.visible === false).length})
                                        </h4>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                            {projects.map((p, idx) => p.visible === false && (
                                                <div key={p.id} style={{ background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden', opacity: 0.7 }}>
                                                    <div style={{ height: '180px', background: `url(${p.image_url}) center/cover`, position: 'relative' }}>
                                                        <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '5px' }}>
                                                            <button disabled={idx === 0 || saving} onClick={() => reorderProject(idx, 'up')} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}><ArrowUp size={14} /></button>
                                                            <button disabled={idx === projects.length - 1 || saving} onClick={() => reorderProject(idx, 'down')} style={{ background: 'rgba(0,0,0,0.7)', border: 'none', color: '#fff', padding: '5px', borderRadius: '5px', cursor: 'pointer' }}><ArrowDown size={14} /></button>
                                                        </div>
                                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                            <span style={{ color: '#fff', fontSize: '10px', fontWeight: '900', background: 'rgba(0,0,0,0.8)', padding: '4px 8px', borderRadius: '4px', letterSpacing: '1px' }}>HIDDEN</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-muted)' }}>{p.title}</span>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <button onClick={() => setEditingProject(p)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><Settings size={18} /></button>
                                                            <button onClick={() => { if (confirm('Delete?')) projectsAPI.delete(p.id).then(() => loadProjects()) }} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'content' && (
                        <div style={{ display: 'grid', gap: '32px' }}>
                            {/* Language Switcher Bar */}
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface-color)', padding: '20px 30px', borderRadius: '24px', border: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '16px' }}>
                                <div>
                                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>Editing Language / Idioma de Edição</h4>
                                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                        Current Editing Mode: <strong style={{ color: 'var(--accent-color)' }}>{editLang === 'en' ? 'English (en)' : 'Português PT-BR (pt)'}</strong>
                                    </p>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '6px', borderRadius: '100px' }}>
                                    <button
                                        type="button"
                                        onClick={() => setEditLang('en')}
                                        style={{
                                            padding: '8px 20px',
                                            borderRadius: '100px',
                                            border: 'none',
                                            background: editLang === 'en' ? 'var(--accent-color)' : 'transparent',
                                            color: editLang === 'en' ? '#000' : 'var(--text-color)',
                                            fontWeight: 800,
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        🇬🇧 English
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditLang('pt')}
                                        style={{
                                            padding: '8px 20px',
                                            borderRadius: '100px',
                                            border: 'none',
                                            background: editLang === 'pt' ? 'var(--accent-color)' : 'transparent',
                                            color: editLang === 'pt' ? '#000' : 'var(--text-color)',
                                            fontWeight: 800,
                                            fontSize: '12px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        🇧🇷 PT-BR
                                    </button>
                                </div>
                            </div>
                            <div style={{ background: 'var(--surface-color)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '32px', color: 'var(--accent-color)', display: 'flex', justifyContent: 'space-between' }}>
                                    Hero Experience
                                </h3>
                                <div style={{ display: 'grid', gap: '24px' }}>
                                    <div>
                                        <label style={labelStyle}>Marquee Main Title</label>
                                        <input placeholder="Marquee Title" value={getTranslationParts(heroTitle)[editLang]} onChange={e => {
                                            const p = getTranslationParts(heroTitle); p[editLang] = e.target.value; setHeroTitle(formatTranslatable(p.en, p.pt));
                                        }} style={modalInputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Intro Description</label>
                                        <textarea placeholder="Small Description" value={getTranslationParts(heroDesc)[editLang]} onChange={e => {
                                            const p = getTranslationParts(heroDesc); p[editLang] = e.target.value; setHeroDesc(formatTranslatable(p.en, p.pt));
                                        }} rows={2} style={modalInputStyle} />
                                    </div>
                                </div>
                            </div>

                            <div style={{ background: 'var(--surface-color)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '32px', color: 'var(--accent-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    Storytelling
                                    <button
                                        onClick={() => setStorytellingVisible(!storytellingVisible)}
                                        style={{
                                            padding: '8px 20px',
                                            borderRadius: '100px',
                                            border: 'none',
                                            fontSize: '12px',
                                            fontWeight: 800,
                                            cursor: 'pointer',
                                            background: storytellingVisible ? '#22c55e' : '#ef4444',
                                            color: '#fff',
                                            transition: 'all 0.3s ease'
                                        }}
                                    >
                                        {storytellingVisible ? '● Visible' : '○ Hidden'}
                                    </button>
                                </h3>
                                <div style={{ display: 'grid', gap: '24px' }}>
                                    <div>
                                        <label style={labelStyle}>Main Storytelling Text (Big Headlines)</label>
                                        <textarea placeholder="Main Big Text" value={getTranslationParts(storyText)[editLang]} onChange={e => {
                                            const p = getTranslationParts(storyText); p[editLang] = e.target.value; setStoryText(formatTranslatable(p.en, p.pt));
                                        }} rows={4} style={modalInputStyle} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Pitch Description (Detailed paragraph)</label>
                                        <textarea placeholder="Pitch Description" value={getTranslationParts(pitchDesc)[editLang]} onChange={e => {
                                            const p = getTranslationParts(pitchDesc); p[editLang] = e.target.value; setPitchDesc(formatTranslatable(p.en, p.pt));
                                        }} rows={4} style={modalInputStyle} />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={labelStyle}>CTA Button Text</label>
                                            <input placeholder="CTA Button Text" value={getTranslationParts(pitchBtnText)[editLang]} onChange={e => {
                                                const p = getTranslationParts(pitchBtnText); p[editLang] = e.target.value; setPitchBtnText(formatTranslatable(p.en, p.pt));
                                            }} style={modalInputStyle} />
                                        </div>
                                        <div>
                                            <label style={labelStyle}>CTA Button Link</label>
                                            <input placeholder="CTA Button Link" value={pitchBtnLink} onChange={e => setPitchBtnLink(e.target.value)} style={modalInputStyle} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button onClick={saveContent} disabled={saving} style={{ padding: '20px', background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), border: 'none', borderRadius: '16px', fontWeight: '800' }}>PUBLISH CHANGES</button>
                        </div>
                    )}

                    {activeTab === 'blog' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                                <h3>Blog Posts</h3>
                                <button onClick={() => setEditingPost({ id: 'new', title: '', content: '', category: 'Design', tags: [], visible: true } as any)} style={{ background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>+ NEW POST</button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                {posts.map(post => (
                                    <div key={post.id} style={{ background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                                        <div style={{ height: '180px', background: post.image_url ? `url(${post.image_url}) center/cover` : 'var(--bg-color)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {!post.image_url && <BookOpen size={40} color="var(--text-muted)" />}
                                        </div>
                                        <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span style={{ fontSize: '14px', fontWeight: '600', display: 'block' }}>{post.title}</span>
                                                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{post.category} • {new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => setEditingPost(post)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><Settings size={18} /></button>
                                                <button onClick={() => { if (confirm('Delete?')) blogAPI.delete(post.id).then(loadBlog) }} style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div style={{ display: 'grid', gap: '40px' }}>
                            {/* SQL Help Message if something goes wrong */}
                            <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '20px', borderRadius: '16px', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '10px' }}>
                                <div style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 'bold', marginBottom: '5px' }}>💡 Pro Tip: Database Setup</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>If saving fails, ensure the tables <code>about_steps</code>, <code>about_hobbies</code>, <code>about_testimonials</code>, and <code>about_memories</code> exist in your Supabase project.</div>
                            </div>

                            {/* Profile Section */}
                            <div style={{ background: 'var(--surface-color)', padding: '32px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ marginBottom: '24px', fontSize: '18px', color: 'var(--accent-color)' }}>About Identity</h3>
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div>
                                        <label style={labelStyle}>Main Title (Full Name)</label>
                                        <input style={modalInputStyle} value={aboutProfile.title} onChange={e => setAboutProfile({ ...aboutProfile, title: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Subtitle (e.g. or just vinny...)</label>
                                        <input style={modalInputStyle} value={aboutProfile.subtitle} onChange={e => setAboutProfile({ ...aboutProfile, subtitle: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Bio Text (Scrollytelling)</label>
                                        <textarea style={{ ...modalInputStyle, height: '140px' }} value={aboutProfile.bio} onChange={e => setAboutProfile({ ...aboutProfile, bio: e.target.value })} />
                                    </div>
                                    <div>
                                        <label style={labelStyle}>Spotify Playlist URL</label>
                                        <input placeholder="https://open.spotify.com/playlist/..." style={modalInputStyle} value={aboutProfile.spotify} onChange={e => setAboutProfile({ ...aboutProfile, spotify: e.target.value })} />
                                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Automatically converts to embed format.</span>
                                    </div>
                                    <button onClick={saveAboutProfile} disabled={saving} style={{ padding: '20px', background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), border: 'none', borderRadius: '16px', fontWeight: '900', cursor: 'pointer', marginTop: '10px' }}>{saving ? 'SAVING...' : 'SAVE ALL IDENTITY CHANGES'}</button>
                                </div>
                            </div>

                            {/* Testimonials Section */}
                            <div style={{ background: 'var(--surface-color)', padding: '32px', borderRadius: '24px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                    <h3 style={{ fontSize: '18px' }}>Testimonials</h3>
                                    <button onClick={() => setEditingTestimonial({ id: '', author_name: '', author_role: '', quote: '', author_image: '' } as any)} style={{ padding: '12px 24px', background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), border: 'none', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '12px' }}>ADD TESTIMONIAL</button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                                    {aboutTestimonials.map(t => (
                                        <div key={t.id} style={{ background: 'var(--surface-color)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                            <p style={{ fontSize: '14px', fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '20px' }}>"{t.quote}"</p>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-color)', overflow: 'hidden' }}>
                                                    {t.author_image && <img src={t.author_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontWeight: '700', fontSize: '13px' }}>{t.author_name}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{t.author_role}</div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button onClick={() => setEditingTestimonial(t)} style={{ padding: '8px 16px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', cursor: 'pointer', fontWeight: '700', fontSize: '11px' }}>EDIT</button>
                                                    <button onClick={() => deleteAboutTestimonial(t.id)} style={{ color: '#ff4444', background: 'transparent', border: 'none', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div style={{ display: 'grid', gap: '32px' }}>
                            <div style={{ background: 'var(--surface-color)', padding: '40px', borderRadius: '32px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ marginBottom: '32px', color: 'var(--accent-color)' }}>Visual Identity</h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '32px' }}>
                                    <div style={{ width: '80px', height: '80px', background: branding.logoImageUrl ? 'transparent' : 'var(--accent-color)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {branding.logoImageUrl ? <img src={branding.logoImageUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Target size={32} />}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        <label className="clickable" style={{ padding: '12px 24px', background: 'var(--bg-color)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', fontSize: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                                            UPLOAD SVG LOGO
                                            <input type="file" accept=".svg" style={{ display: 'none' }} onChange={async (e) => {
                                                if (e.target.files?.[0]) {
                                                    setMessage('⌛ Uploading SVG...');
                                                    const url = await storageAPI.uploadImage(e.target.files[0], 'general');
                                                    if (url) {
                                                        setBranding({ ...branding, logoImageUrl: url });
                                                        setMessage('✅ SVG Uploaded!');
                                                    } else {
                                                        setMessage('❌ Upload failed.');
                                                    }
                                                }
                                            }} />
                                        </label>
                                        {branding.logoImageUrl && (
                                            <button
                                                onClick={() => setBranding({ ...branding, logoImageUrl: '' })}
                                                style={{ padding: '8px 16px', background: 'rgba(255,0,0,0.1)', color: '#ff4444', border: 'none', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}
                                            >
                                                REMOVE LOGO
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                                    <input value={branding.logoText1} onChange={e => setBranding({ ...branding, logoText1: e.target.value })} style={modalInputStyle} />
                                    <input value={branding.logoText2} onChange={e => setBranding({ ...branding, logoText2: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '32px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        <label style={{ ...labelStyle, marginBottom: 0 }}>BG COLOR</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{branding.bgColor.toUpperCase()}</span>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: branding.bgColor, border: '2px solid var(--border-color)', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                <input type="color" value={branding.bgColor} onChange={e => setBranding({ ...branding, bgColor: e.target.value })} style={{ position: 'absolute', inset: -5, width: '150%', height: '150%', opacity: 0, cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        <label style={{ ...labelStyle, marginBottom: 0 }}>ACCENT COLOR</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{branding.accentColor.toUpperCase()}</span>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: branding.accentColor, border: '2px solid var(--border-color)', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                <input type="color" value={branding.accentColor} onChange={e => setBranding({ ...branding, accentColor: e.target.value })} style={{ position: 'absolute', inset: -5, width: '150%', height: '150%', opacity: 0, cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        <label style={{ ...labelStyle, marginBottom: 0 }}>LIGHT BG COLOR</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{branding.lightBgColor.toUpperCase()}</span>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: branding.lightBgColor, border: '2px solid var(--border-color)', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                <input type="color" value={branding.lightBgColor} onChange={e => setBranding({ ...branding, lightBgColor: e.target.value })} style={{ position: 'absolute', inset: -5, width: '150%', height: '150%', opacity: 0, cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg-color)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                                        <label style={{ ...labelStyle, marginBottom: 0 }}>LIGHT ACCENT COLOR</label>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{branding.lightAccentColor.toUpperCase()}</span>
                                            <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: branding.lightAccentColor, border: '2px solid var(--border-color)', position: 'relative', overflow: 'hidden', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                                <input type="color" value={branding.lightAccentColor} onChange={e => setBranding({ ...branding, lightAccentColor: e.target.value })} style={{ position: 'absolute', inset: -5, width: '150%', height: '150%', opacity: 0, cursor: 'pointer' }} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div style={{ background: 'var(--surface-color)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                <h3 style={{ marginBottom: '32px', color: 'var(--accent-color)' }}>Socials</h3>
                                <input placeholder="LinkedIn" value={branding.linkedin} onChange={e => setBranding({ ...branding, linkedin: e.target.value })} style={modalInputStyle} />
                                <input placeholder="Instagram" value={branding.instagram} onChange={e => setBranding({ ...branding, instagram: e.target.value })} style={modalInputStyle} />
                                <input placeholder="Email" value={branding.footerEmail} onChange={e => setBranding({ ...branding, footerEmail: e.target.value })} style={modalInputStyle} />
                                <input placeholder="Phone" value={branding.phone} onChange={e => setBranding({ ...branding, phone: e.target.value })} style={modalInputStyle} />
                            </div>
                            <div style={{ background: 'var(--surface-color)', padding: '40px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>

                                <button onClick={saveSettings} style={{ padding: '24px', background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), border: 'none', borderRadius: '16px', fontWeight: '900' }}>SAVE CONFIGURATION</button>
                            </div>
                        </div>
                    )}
                </main>
            </div >

            {/* BLOG MODAL (Detailed with Toolbar) */}
            {
                editingPost && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'var(--surface-color)', width: '100%', maxWidth: '800px', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '40px', maxHeight: '95vh', overflowY: 'auto' }} className="hide-scrollbar">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                <h3>{editingPost.id === 'new' ? 'NEW POST' : 'EDIT POST'}</h3>
                                <button onClick={() => setEditingPost(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)' }}><X size={24} /></button>
                            </div>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Image</label>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '120px', aspectRatio: '16/9', background: 'var(--surface-color)', borderRadius: '8px', overflow: 'hidden' }}>
                                            {editingPost.image_url ? <img src={editingPost.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={20} color="var(--text-muted)" /></div>}
                                        </div>
                                        <label className="clickable" style={{ padding: '8px 16px', background: 'var(--bg-color)', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-color)', border: '1px solid var(--border-color)' }}>
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
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', background: 'var(--bg-color)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                                        {editingPost.tags?.map(t => (
                                            <span key={t} style={{ background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), padding: '4px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 'bold' }}>{t} <X size={10} onClick={() => setEditingPost({ ...editingPost, tags: editingPost.tags.filter(tag => tag !== t) })} style={{ cursor: 'pointer' }} /></span>
                                        ))}
                                        <input placeholder="Add tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addBlogTag()} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', outline: 'none' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        {allBlogTags.slice(0, 5).map(tag => <button key={tag} onClick={() => addBlogTag(tag)} style={{ fontSize: '10px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>+ {tag}</button>)}
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
                                    <label style={labelStyle}>Content (Rich Text)</label>
                                    <RichTextEditor
                                        value={editingPost.content}
                                        onChange={(val) => setEditingPost({ ...editingPost, content: val })}
                                        style={{ height: '400px' }}
                                    />
                                </div>
                                <button onClick={savePost} disabled={saving} style={{ padding: '20px', background: 'var(--accent-color)', color: getContrastColor(branding.accentColor), border: 'none', borderRadius: '12px', fontWeight: '900' }}>{saving ? 'SAVING...' : 'PUBLISH POST'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* PROJECT EDIT MODAL (New Component) */}
            {
                editingProject && !editingPost && (
                    <ProjectForm
                        project={editingProject}
                        onChange={setEditingProject}
                        onSave={saveProject}
                        onCancel={() => setEditingProject(null)}
                        allTags={allProjectTags}
                        saving={saving}
                    />
                )
            }

            {
                editingCV && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 10001, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: '#000', width: '100%', maxWidth: '600px', borderRadius: '24px', border: '1px solid #333', padding: '40px', maxHeight: '95vh', overflowY: 'auto' }} className="hide-scrollbar">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                                <h3 style={{ textTransform: 'uppercase', margin: 0, color: 'var(--accent-color)', fontSize: '20px', fontWeight: '900', letterSpacing: '1px' }}>Edit {editingCV.section_type}</h3>
                                <button onClick={() => setEditingCV(null)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><X size={24} /></button>
                            </div>

                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={{ ...labelStyle, color: '#fff' }}>Title</label>
                                    <input placeholder="Ex: Senior UI Designer" value={editingCV.title} onChange={e => setEditingCV({ ...editingCV, title: e.target.value })} style={{ ...modalInputStyle, color: '#fff', background: '#111' }} />
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: '#fff' }}>Subtitle / Organization</label>
                                    <input placeholder="Ex: Google" value={editingCV.subtitle || ''} onChange={e => setEditingCV({ ...editingCV, subtitle: e.target.value })} style={{ ...modalInputStyle, color: '#fff', background: '#111' }} />
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: '#fff' }}>Date Range</label>
                                    <input placeholder="Ex: Jan 2020 - Present" value={editingCV.date_range || ''} onChange={e => setEditingCV({ ...editingCV, date_range: e.target.value })} style={{ ...modalInputStyle, color: '#fff', background: '#111' }} />
                                </div>
                                <div>
                                    <label style={{ ...labelStyle, color: '#fff' }}>Description / Details</label>
                                    <textarea placeholder="List your key achievements..." value={editingCV.description || ''} onChange={e => setEditingCV({ ...editingCV, description: e.target.value })} rows={6} style={{ ...modalInputStyle, color: '#fff', background: '#111', height: 'auto' }} />
                                </div>

                                <button onClick={saveCVSection} disabled={saving} style={{
                                    padding: '20px',
                                    background: 'var(--accent-color)',
                                    color: getContrastColor(branding.accentColor),
                                    border: 'none',
                                    borderRadius: '16px',
                                    fontWeight: '900',
                                    width: '100%',
                                    marginTop: '10px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    letterSpacing: '1px'
                                }}>
                                    {saving ? 'SAVING...' : `SAVE ${editingCV.section_type.toUpperCase()}`}
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* MEMORY MODAL */}
            {
                editingMemory && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'var(--surface-color)', width: '100%', maxWidth: '600px', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '40px', maxHeight: '95vh', overflowY: 'auto' }} className="hide-scrollbar">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                <h3>{editingMemory.id ? 'EDIT MEMORY' : 'NEW MEMORY'}</h3>
                                <button onClick={() => setEditingMemory(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Image</label>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '120px', height: '120px', background: '#111', borderRadius: '8px', overflow: 'hidden' }}>
                                            {editingMemory.image_url ? <img src={editingMemory.image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ImageIcon size={20} color="#333" /></div>}
                                        </div>
                                        <label style={{ padding: '12px 24px', background: '#222', borderRadius: '8px', cursor: 'pointer', border: '1px solid #333', fontWeight: '700', fontSize: '12px' }}>
                                            UPLOAD IMAGE
                                            <input type="file" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleAboutImageUpload(e.target.files[0], 'memory')} />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Horizontal Position (e.g. 20%, 50%, 80%)</label>
                                    <input placeholder="50%" value={editingMemory.position_x} onChange={e => setEditingMemory({ ...editingMemory, position_x: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Vertical Position (e.g. 10%, 40%, 70%)</label>
                                    <input placeholder="30%" value={editingMemory.position_y || ''} onChange={e => setEditingMemory({ ...editingMemory, position_y: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Width (e.g. 200px, 300px)</label>
                                    <input placeholder="250px" value={editingMemory.width} onChange={e => setEditingMemory({ ...editingMemory, width: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Aspect Ratio (e.g. 1/1, 3/4, 16/9)</label>
                                    <input placeholder="1/1" value={editingMemory.aspect_ratio} onChange={e => setEditingMemory({ ...editingMemory, aspect_ratio: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Parallax Speed (0.5 = slow, 1.0 = normal, 1.5 = fast)</label>
                                    <input type="number" step="0.1" placeholder="1.0" value={editingMemory.speed} onChange={e => setEditingMemory({ ...editingMemory, speed: parseFloat(e.target.value) })} style={modalInputStyle} />
                                </div>
                                <button onClick={() => saveAboutMemory(editingMemory)} disabled={saving} style={{ padding: '16px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>{saving ? 'SAVING...' : 'SAVE MEMORY'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* STEP MODAL */}
            {
                editingStep && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'var(--surface-color)', width: '100%', maxWidth: '600px', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '40px', maxHeight: '95vh', overflowY: 'auto' }} className="hide-scrollbar">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                <h3>{editingStep.id ? 'EDIT STEP' : 'NEW STEP'}</h3>
                                <button onClick={() => setEditingStep(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Step Number (e.g. 01, 02, 03)</label>
                                    <input placeholder="01" value={editingStep.step_number} onChange={e => setEditingStep({ ...editingStep, step_number: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Title</label>
                                    <input placeholder="Research & Discovery" value={editingStep.title} onChange={e => setEditingStep({ ...editingStep, title: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Description</label>
                                    <textarea placeholder="Understanding your needs..." value={editingStep.description} onChange={e => setEditingStep({ ...editingStep, description: e.target.value })} rows={3} style={modalInputStyle} />
                                </div>
                                <div>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                        gap: '12px',
                                        maxHeight: '350px',
                                        overflowY: 'auto',
                                        background: '#111',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid #222',
                                        scrollbarWidth: 'thin'
                                    }}>
                                        {SELECTABLE_ICONS.map(icon => {
                                            const IconComp = ICON_COMPONENTS[icon];
                                            return (
                                                <button
                                                    key={icon}
                                                    onClick={() => setEditingStep({ ...editingStep, icon_name: icon })}
                                                    title={icon}
                                                    style={{
                                                        aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                                        background: editingStep.icon_name === icon ? 'var(--accent-color)' : '#0a0a0a',
                                                        color: editingStep.icon_name === icon ? '#000' : '#fff',
                                                        border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {IconComp ? <IconComp size={16} /> : <span>?</span>}
                                                    <span style={{ fontSize: '8px', opacity: 0.6 }}>{icon}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div style={{ marginTop: '5px', fontSize: '11px', color: '#666' }}>Selected: {editingStep.icon_name}</div>
                                </div>
                                <button onClick={() => saveAboutStep(editingStep)} disabled={saving} style={{ padding: '16px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>{saving ? 'SAVING...' : 'SAVE STEP'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* HOBBY MODAL */}
            {
                editingHobby && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'var(--surface-color)', width: '100%', maxWidth: '600px', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '40px', maxHeight: '95vh', overflowY: 'auto' }} className="hide-scrollbar">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                <h3>{editingHobby.id ? 'EDIT HOBBY' : 'NEW HOBBY'}</h3>
                                <button onClick={() => setEditingHobby(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Hobby Text</label>
                                    <input placeholder="Photography" value={editingHobby.text} onChange={e => setEditingHobby({ ...editingHobby, text: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Accent Color</label>
                                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                        <input type="color" value={editingHobby.color} onChange={e => setEditingHobby({ ...editingHobby, color: e.target.value })} style={{ width: '60px', height: '40px', border: '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }} />
                                        <input value={editingHobby.color} onChange={e => setEditingHobby({ ...editingHobby, color: e.target.value })} style={{ ...modalInputStyle, marginBottom: 0 }} />
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Horizontal Position (e.g. 20%, 50%, 80%)</label>
                                    <input placeholder="50%" value={editingHobby.position_x} onChange={e => setEditingHobby({ ...editingHobby, position_x: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Vertical Position (e.g. 20%, 50%, 80%)</label>
                                    <input placeholder="50%" value={editingHobby.position_y} onChange={e => setEditingHobby({ ...editingHobby, position_y: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                        <label style={labelStyle}>Custom SVG Code (Optional)</label>
                                        <label style={{ fontSize: '11px', color: 'var(--accent-color)', cursor: 'pointer', fontWeight: '900', background: 'rgba(242, 167, 61, 0.1)', padding: '4px 8px', borderRadius: '4px' }}>
                                            UPLOAD SVG FILE
                                            <input
                                                type="file"
                                                accept=".svg"
                                                style={{ display: 'none' }}
                                                onChange={e => {
                                                    const file = e.target.files?.[0];
                                                    if (file && editingHobby) {
                                                        const reader = new FileReader();
                                                        reader.onload = (re) => {
                                                            const content = re.target?.result as string;
                                                            if (content.includes('<svg')) {
                                                                setEditingHobby({ ...editingHobby, icon_svg: content, icon_name: '' });
                                                            } else {
                                                                alert('Invalid SVG file. Please select a valid .svg file.');
                                                            }
                                                        };
                                                        reader.readAsText(file);
                                                    }
                                                }}
                                            />
                                        </label>
                                    </div>
                                    <textarea
                                        placeholder='<svg ...>...</svg>'
                                        value={editingHobby.icon_svg || ''}
                                        onChange={e => setEditingHobby({ ...editingHobby, icon_svg: e.target.value })}
                                        style={{ ...modalInputStyle, height: '80px', fontFamily: 'monospace', fontSize: '11px' }}
                                    />
                                    <div style={{ fontSize: '10px', color: '#666', marginBottom: '15px' }}>Tip: Use fill="currentColor" or stroke="currentColor" to inherit theme colors.</div>
                                    <label style={labelStyle}>Or Select Library Icon</label>
                                    <div style={{
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                                        gap: '12px',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        background: '#111',
                                        padding: '20px',
                                        borderRadius: '16px',
                                        border: '1px solid #222',
                                        scrollbarWidth: 'thin'
                                    }}>
                                        {SELECTABLE_ICONS.map(icon => {
                                            const IconComp = ICON_COMPONENTS[icon];
                                            return (
                                                <button
                                                    key={icon}
                                                    onClick={() => setEditingHobby({ ...editingHobby, icon_name: icon, icon_svg: '' })}
                                                    title={icon}
                                                    style={{
                                                        aspectRatio: '1/1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px',
                                                        background: (editingHobby.icon_name === icon && !editingHobby.icon_svg) ? 'var(--accent-color)' : '#0a0a0a',
                                                        color: (editingHobby.icon_name === icon && !editingHobby.icon_svg) ? '#000' : '#fff',
                                                        border: '1px solid #333', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s'
                                                    }}
                                                >
                                                    {IconComp ? <IconComp size={16} /> : <span>?</span>}
                                                    <span style={{ fontSize: '8px', opacity: 0.6 }}>{icon}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                    <div style={{ marginTop: '5px', fontSize: '11px', color: '#666' }}>Selected Library Icon: {editingHobby.icon_name}</div>
                                </div>
                                <div style={{ padding: '20px', background: '#111', borderRadius: '12px', border: '1px solid #222' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>Preview:</div>
                                    <div style={{ height: '150px', background: '#0a0a0a', borderRadius: '8px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', left: editingHobby.position_x, top: editingHobby.position_y, transform: 'translate(-50%, -50%)', background: '#fff', color: '#000', padding: '8px 16px', borderRadius: '20px 20px 20px 2px', borderLeft: `4px solid ${editingHobby.color}`, fontSize: '12px', fontWeight: 'bold' }}>
                                            {editingHobby.text || 'Hobby'}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => saveAboutHobby(editingHobby)} disabled={saving} style={{ padding: '16px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>{saving ? 'SAVING...' : 'SAVE HOBBY'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* TESTIMONIAL MODAL */}
            {
                editingTestimonial && (
                    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 10002, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                        <div style={{ background: 'var(--surface-color)', width: '100%', maxWidth: '600px', borderRadius: '24px', border: '1px solid var(--border-color)', padding: '40px', maxHeight: '90vh', overflowY: 'auto' }} className="hide-scrollbar">
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                                <h3>{editingTestimonial.id ? 'EDIT TESTIMONIAL' : 'NEW TESTIMONIAL'}</h3>
                                <button onClick={() => setEditingTestimonial(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-color)', cursor: 'pointer' }}><X size={24} /></button>
                            </div>
                            <div style={{ display: 'grid', gap: '20px' }}>
                                <div>
                                    <label style={labelStyle}>Author Photo</label>
                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                        <div style={{ width: '80px', height: '80px', background: '#111', borderRadius: '50%', overflow: 'hidden' }}>
                                            {editingTestimonial.author_image ? <img src={editingTestimonial.author_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={20} color="#333" /></div>}
                                        </div>
                                        <label style={{ padding: '12px 24px', background: 'var(--bg-color)', borderRadius: '8px', cursor: 'pointer', border: '1px solid var(--border-color)', fontWeight: '700', fontSize: '12px', color: 'var(--text-color)' }}>
                                            UPLOAD PHOTO
                                            <input type="file" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleAboutImageUpload(e.target.files[0], 'testimonial')} />
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label style={labelStyle}>Author Name</label>
                                    <input placeholder="John Doe" value={editingTestimonial.author_name} onChange={e => setEditingTestimonial({ ...editingTestimonial, author_name: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Author Role / Company</label>
                                    <input placeholder="CEO at Company" value={editingTestimonial.author_role} onChange={e => setEditingTestimonial({ ...editingTestimonial, author_role: e.target.value })} style={modalInputStyle} />
                                </div>
                                <div>
                                    <label style={labelStyle}>Testimonial Quote</label>
                                    <textarea placeholder="Working with this professional was amazing..." value={editingTestimonial.quote} onChange={e => setEditingTestimonial({ ...editingTestimonial, quote: e.target.value })} rows={4} style={modalInputStyle} />
                                </div>
                                <button onClick={() => saveAboutTestimonial(editingTestimonial)} disabled={saving} style={{ padding: '16px', background: 'var(--accent-color)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>{saving ? 'SAVING...' : 'SAVE TESTIMONIAL'}</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* PREVIEW MODAL */}
            {
                isPreviewOpen && editingProject && (
                    <ProjectModal project={editingProject} isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />
                )
            }
        </div >
    );
}
