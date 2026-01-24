import { useState, useEffect } from 'react';
import {
    supabase,
    contentAPI,
    projectsAPI,
    cvAPI,
    jobListingsAPI,
    apiConfigAPI,
    type Project,
    type CVSection,
    type JobListing,
    type APIConfiguration
} from '../lib/supabase';
import { jobSyncService } from '../lib/job-sync';
import { useNavigate } from 'react-router-dom';
import { LogOut, Save, Plus, Trash2, Briefcase, Settings, RefreshCw } from 'lucide-react';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'projects' | 'cv' | 'career'>('content');

    // Content State
    const [heroTitle, setHeroTitle] = useState('');
    const [heroDesc, setHeroDesc] = useState('');
    const [storyText, setStoryText] = useState('');

    // Projects State
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // CV State
    const [cvSections, setCvSections] = useState<CVSection[]>([]);
    const [editingCV, setEditingCV] = useState<CVSection | null>(null);

    // Career State
    const [jobs, setJobs] = useState<JobListing[]>([]);
    const [editingJob, setEditingJob] = useState<JobListing | null>(null);
    const [apiConfigs, setApiConfigs] = useState<APIConfiguration[]>([]);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Authentication disabled for direct access
        // checkUser();
        loadContent();
        loadProjects();
        loadCV();
        loadCareerData();
    }, []);

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            // navigate('/admin'); // Disabled - allow direct access
            console.log('No user logged in, but allowing access anyway');
        } else {
            setUser(user);
        }
    };

    const loadContent = async () => {
        const title = await contentAPI.getByKey('hero.title');
        const desc = await contentAPI.getByKey('hero.description');
        const story = await contentAPI.getByKey('storytelling.main');

        if (title) setHeroTitle(title.value);
        if (desc) setHeroDesc(desc.value);
        if (story) setStoryText(story.value);
    };

    const loadProjects = async () => {
        const data = await projectsAPI.getAll();
        setProjects(data);
    };

    const loadCV = async () => {
        const data = await cvAPI.getAll();
        setCvSections(data);
    };

    const loadCareerData = async () => {
        const jobsData = await jobListingsAPI.getAll();
        setJobs(jobsData);

        const configsData = await apiConfigAPI.getAll();
        setApiConfigs(configsData);
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/admin');
    };

    const saveContent = async () => {
        setSaving(true);
        await contentAPI.update('hero.title', heroTitle);
        await contentAPI.update('hero.description', heroDesc);
        await contentAPI.update('storytelling.main', storyText);
        setSaving(false);
        setMessage('Content saved successfully!');
        setTimeout(() => setMessage(''), 3000);
    };

    const saveProject = async () => {
        if (!editingProject) return;

        setSaving(true);
        if (editingProject.id) {
            await projectsAPI.update(editingProject.id, editingProject);
        } else {
            await projectsAPI.create(editingProject);
        }
        await loadProjects();
        setEditingProject(null);
        setSaving(false);
        setMessage('Project saved!');
        setTimeout(() => setMessage(''), 3000);
    };

    const deleteProject = async (id: string) => {
        if (confirm('Delete this project?')) {
            await projectsAPI.delete(id);
            await loadProjects();
        }
    };

    const saveCV = async () => {
        if (!editingCV) return;

        setSaving(true);
        if (editingCV.id) {
            await cvAPI.update(editingCV.id, editingCV);
        } else {
            await cvAPI.create(editingCV);
        }
        await loadCV();
        setEditingCV(null);
        setSaving(false);
        setMessage('CV section saved!');
        setTimeout(() => setMessage(''), 3000);
    };

    const deleteCV = async (id: string) => {
        if (confirm('Delete this CV section?')) {
            await cvAPI.delete(id);
            await loadCV();
        }
    };

    const saveJob = async () => {
        if (!editingJob) return;

        setSaving(true);
        if (editingJob.id) {
            await jobListingsAPI.update(editingJob.id, editingJob);
        } else {
            await jobListingsAPI.create(editingJob);
        }
        await loadCareerData();
        setEditingJob(null);
        setSaving(false);
        setMessage('Job saved!');
        setTimeout(() => setMessage(''), 3000);
    };

    const deleteJob = async (id: string) => {
        if (confirm('Delete this job?')) {
            await jobListingsAPI.delete(id);
            await loadCareerData();
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-color)', padding: '20px' }}>
            {/* Header */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto 40px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '20px',
                background: 'var(--surface-color)',
                borderRadius: '16px',
                border: '1px solid var(--border-color)'
            }}>
                <div>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', margin: 0, color: 'var(--accent-color)' }}>
                        ADMIN DASHBOARD
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: '5px 0 0', fontFamily: 'var(--font-body)' }}>
                        {user?.email || 'Direct Access Mode'}
                    </p>
                </div>
                <button onClick={handleLogout} className="clickable" style={{
                    padding: '12px 24px',
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: 'var(--text-color)',
                    fontFamily: 'var(--font-body)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer'
                }}>
                    <LogOut size={18} /> Logout
                </button>
            </div>

            {/* Success Message */}
            {message && (
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto 20px',
                    padding: '12px 20px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.3)',
                    borderRadius: '8px',
                    color: '#22c55e',
                    fontFamily: 'var(--font-body)'
                }}>
                    {message}
                </div>
            )}

            {/* Tabs */}
            <div style={{
                maxWidth: '1400px',
                margin: '0 auto 20px',
                display: 'flex',
                gap: '10px'
            }}>
                {(['content', 'projects', 'cv', 'career'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="clickable"
                        style={{
                            padding: '12px 24px',
                            background: activeTab === tab ? 'var(--accent-color)' : 'var(--surface-color)',
                            color: activeTab === tab ? '#000' : 'var(--text-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-display)',
                            fontSize: '14px',
                            cursor: 'pointer',
                            textTransform: 'uppercase'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Tab */}
            {activeTab === 'content' && (
                <div style={{
                    maxWidth: '1400px',
                    margin: '0 auto',
                    background: 'var(--surface-color)',
                    padding: '30px',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)'
                }}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '30px' }}>
                        SITE CONTENT
                    </h2>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontFamily: 'var(--font-body)', color: 'var(--text-color)' }}>
                            Hero Title
                        </label>
                        <input
                            type="text"
                            value={heroTitle}
                            onChange={(e) => setHeroTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--bg-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-color)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '16px'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontFamily: 'var(--font-body)', color: 'var(--text-color)' }}>
                            Hero Description
                        </label>
                        <textarea
                            value={heroDesc}
                            onChange={(e) => setHeroDesc(e.target.value)}
                            rows={5}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--bg-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-color)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '16px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <label style={{ display: 'block', marginBottom: '10px', fontFamily: 'var(--font-body)', color: 'var(--text-color)' }}>
                            Storytelling Text
                        </label>
                        <textarea
                            value={storyText}
                            onChange={(e) => setStoryText(e.target.value)}
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'var(--bg-color)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                color: 'var(--text-color)',
                                fontFamily: 'var(--font-body)',
                                fontSize: '16px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    <button
                        onClick={saveContent}
                        disabled={saving}
                        className="clickable"
                        style={{
                            padding: '14px 28px',
                            background: 'var(--accent-color)',
                            color: '#000',
                            border: 'none',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-display)',
                            fontSize: '16px',
                            cursor: saving ? 'not-allowed' : 'pointer',
                            opacity: saving ? 0.6 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Save size={18} /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                </div>
            )}

            {/* Projects Tab */}
            {activeTab === 'projects' && (
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{
                        background: 'var(--surface-color)',
                        padding: '30px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: 0 }}>
                                PORTFOLIO PROJECTS
                            </h2>
                            <button
                                onClick={() => setEditingProject({
                                    id: '',
                                    title: '',
                                    description: '',
                                    image_url: '',
                                    tags: [],
                                    order_index: projects.length,
                                    visible: true,
                                    created_at: '',
                                    updated_at: ''
                                })}
                                className="clickable"
                                style={{
                                    padding: '12px 24px',
                                    background: 'var(--accent-color)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Plus size={18} /> NEW PROJECT
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {projects.map(project => (
                                <div key={project.id} style={{
                                    padding: '20px',
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '18px', margin: '0 0 5px', color: 'var(--accent-color)' }}>
                                            {project.title}
                                        </h3>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                                            {project.tags.join(', ')}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => setEditingProject(project)}
                                            className="clickable"
                                            style={{
                                                padding: '8px 16px',
                                                background: 'transparent',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '6px',
                                                color: 'var(--text-color)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteProject(project.id)}
                                            className="clickable"
                                            style={{
                                                padding: '8px 16px',
                                                background: 'transparent',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '6px',
                                                color: '#ef4444',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Project Edit Modal */}
                    {editingProject && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}>
                            <div style={{
                                background: 'var(--surface-color)',
                                padding: '30px',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                maxWidth: '600px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflow: 'auto'
                            }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '20px' }}>
                                    {editingProject.id ? 'EDIT PROJECT' : 'NEW PROJECT'}
                                </h3>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Title</label>
                                    <input
                                        type="text"
                                        value={editingProject.title}
                                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Image URL</label>
                                    <input
                                        type="text"
                                        value={editingProject.image_url}
                                        onChange={(e) => setEditingProject({ ...editingProject, image_url: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        value={editingProject.tags.join(', ')}
                                        onChange={(e) => setEditingProject({ ...editingProject, tags: e.target.value.split(',').map(t => t.trim()) })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={saveProject}
                                        disabled={saving}
                                        className="clickable"
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: 'var(--accent-color)',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontFamily: 'var(--font-display)',
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            opacity: saving ? 0.6 : 1
                                        }}
                                    >
                                        {saving ? 'SAVING...' : 'SAVE'}
                                    </button>
                                    <button
                                        onClick={() => setEditingProject(null)}
                                        className="clickable"
                                        style={{
                                            padding: '12px 24px',
                                            background: 'transparent',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* CV Tab */}
            {activeTab === 'cv' && (
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    <div style={{
                        background: 'var(--surface-color)',
                        padding: '30px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: 0 }}>
                                CV SECTIONS
                            </h2>
                            <button
                                onClick={() => setEditingCV({
                                    id: '',
                                    section_type: 'experience',
                                    title: '',
                                    subtitle: '',
                                    description: '',
                                    date_range: '',
                                    order_index: cvSections.length,
                                    visible: true,
                                    created_at: '',
                                    updated_at: ''
                                })}
                                className="clickable"
                                style={{
                                    padding: '12px 24px',
                                    background: 'var(--accent-color)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Plus size={18} /> NEW SECTION
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {cvSections.map(section => (
                                <div key={section.id} style={{
                                    padding: '20px',
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                                            <span style={{
                                                padding: '4px 12px',
                                                background: 'var(--accent-color)',
                                                color: '#000',
                                                borderRadius: '4px',
                                                fontSize: '12px',
                                                fontFamily: 'var(--font-display)'
                                            }}>
                                                {section.section_type.toUpperCase()}
                                            </span>
                                            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '18px', margin: 0, color: 'var(--text-color)' }}>
                                                {section.title}
                                            </h3>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                                            {section.subtitle} {section.date_range && `• ${section.date_range}`}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => setEditingCV(section)}
                                            className="clickable"
                                            style={{
                                                padding: '8px 16px',
                                                background: 'transparent',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '6px',
                                                color: 'var(--text-color)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteCV(section.id)}
                                            className="clickable"
                                            style={{
                                                padding: '8px 16px',
                                                background: 'transparent',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '6px',
                                                color: '#ef4444',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CV Edit Modal */}
                    {editingCV && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}>
                            <div style={{
                                background: 'var(--surface-color)',
                                padding: '30px',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                maxWidth: '600px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflow: 'auto'
                            }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '20px' }}>
                                    {editingCV.id ? 'EDIT CV SECTION' : 'NEW CV SECTION'}
                                </h3>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Type</label>
                                    <select
                                        value={editingCV.section_type}
                                        onChange={(e) => setEditingCV({ ...editingCV, section_type: e.target.value as any })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    >
                                        <option value="experience">Experience</option>
                                        <option value="education">Education</option>
                                        <option value="skills">Skills</option>
                                    </select>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Title</label>
                                    <input
                                        type="text"
                                        value={editingCV.title}
                                        onChange={(e) => setEditingCV({ ...editingCV, title: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Subtitle</label>
                                    <input
                                        type="text"
                                        value={editingCV.subtitle || ''}
                                        onChange={(e) => setEditingCV({ ...editingCV, subtitle: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Date Range</label>
                                    <input
                                        type="text"
                                        value={editingCV.date_range || ''}
                                        onChange={(e) => setEditingCV({ ...editingCV, date_range: e.target.value })}
                                        placeholder="e.g. 2020-2023"
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Description</label>
                                    <textarea
                                        value={editingCV.description || ''}
                                        onChange={(e) => setEditingCV({ ...editingCV, description: e.target.value })}
                                        rows={4}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={saveCV}
                                        disabled={saving}
                                        className="clickable"
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: 'var(--accent-color)',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontFamily: 'var(--font-display)',
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            opacity: saving ? 0.6 : 1
                                        }}
                                    >
                                        {saving ? 'SAVING...' : 'SAVE'}
                                    </button>
                                    <button
                                        onClick={() => setEditingCV(null)}
                                        className="clickable"
                                        style={{
                                            padding: '12px 24px',
                                            background: 'transparent',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Career Tab */}
            {activeTab === 'career' && (
                <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                    {/* Quick Link to Career Dashboard */}
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        padding: '24px',
                        borderRadius: '16px',
                        marginBottom: '24px',
                        color: 'white'
                    }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: '0 0 12px' }}>
                            GLOBAL CAREER ARCHITECT
                        </h2>
                        <p style={{ margin: '0 0 16px', fontFamily: 'var(--font-body)', opacity: 0.9 }}>
                            Manage job listings, track applications, and configure API integrations
                        </p>
                        <button
                            onClick={() => navigate('/career-dashboard')}
                            className="clickable"
                            style={{
                                padding: '12px 24px',
                                background: 'white',
                                color: '#667eea',
                                border: 'none',
                                borderRadius: '8px',
                                fontFamily: 'var(--font-display)',
                                fontSize: '14px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            <Briefcase size={18} /> Open Career Dashboard
                        </button>
                    </div>

                    {/* Job Listings Management */}
                    <div style={{
                        background: 'var(--surface-color)',
                        padding: '30px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)',
                        marginBottom: '20px'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: 0 }}>
                                JOB LISTINGS
                            </h2>
                            <button
                                onClick={async () => {
                                    setSaving(true); // Reuse saving state for loading
                                    const result = await jobSyncService.syncJobs();
                                    await loadCareerData();
                                    setSaving(false);
                                    setMessage(`Synced! Added: ${result.added}, Errors: ${result.errors.length}`);
                                    setTimeout(() => setMessage(''), 3000);
                                }}
                                className="clickable"
                                style={{
                                    padding: '12px 24px',
                                    background: 'var(--surface-color)',
                                    color: 'var(--text-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    marginRight: '10px'
                                }}
                            >
                                <RefreshCw size={18} className={saving ? 'spin' : ''} /> SYNC JOBS
                            </button>
                            <button
                                onClick={() => setEditingJob({
                                    id: '',
                                    source: 'manual',
                                    title: '',
                                    company: '',
                                    location: '',
                                    currency: 'USD',
                                    is_low_competition: false,
                                    visible: true,
                                    created_at: '',
                                    updated_at: ''
                                })}
                                className="clickable"
                                style={{
                                    padding: '12px 24px',
                                    background: 'var(--accent-color)',
                                    color: '#000',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontFamily: 'var(--font-display)',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                <Plus size={18} /> NEW JOB
                            </button>
                        </div>

                        <div style={{ display: 'grid', gap: '15px' }}>
                            {jobs.map(job => (
                                <div key={job.id} style={{
                                    padding: '20px',
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                                            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '18px', margin: 0, color: 'var(--accent-color)' }}>
                                                {job.title}
                                            </h3>
                                            {job.is_low_competition && (
                                                <span style={{
                                                    padding: '4px 8px',
                                                    background: 'rgba(34, 197, 94, 0.1)',
                                                    color: '#22c55e',
                                                    borderRadius: '4px',
                                                    fontSize: '11px',
                                                    fontFamily: 'var(--font-display)'
                                                }}>
                                                    LOW COMPETITION
                                                </span>
                                            )}
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: '0 0 5px' }}>
                                            {job.company} • {job.location}
                                        </p>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '12px', margin: 0 }}>
                                            Source: {job.source.toUpperCase()}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => setEditingJob(job)}
                                            className="clickable"
                                            style={{
                                                padding: '8px 16px',
                                                background: 'transparent',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '6px',
                                                color: 'var(--text-color)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteJob(job.id)}
                                            className="clickable"
                                            style={{
                                                padding: '8px 16px',
                                                background: 'transparent',
                                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                                borderRadius: '6px',
                                                color: '#ef4444',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* API Configuration */}
                    <div style={{
                        background: 'var(--surface-color)',
                        padding: '30px',
                        borderRadius: '16px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '20px' }}>
                            API CONFIGURATIONS
                        </h2>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {apiConfigs.map(config => (
                                <div key={config.id} style={{
                                    padding: '20px',
                                    background: 'var(--bg-color)',
                                    border: '1px solid var(--border-color)',
                                    borderRadius: '8px'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <Settings size={20} color="var(--accent-color)" />
                                            <h3 style={{ fontFamily: 'var(--font-body)', fontSize: '18px', margin: 0, color: 'var(--text-color)', textTransform: 'uppercase' }}>
                                                {config.service_name}
                                            </h3>
                                        </div>
                                        <span style={{
                                            padding: '4px 12px',
                                            background: config.is_active ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                            color: config.is_active ? '#22c55e' : '#ef4444',
                                            borderRadius: '6px',
                                            fontSize: '12px',
                                            fontFamily: 'var(--font-display)'
                                        }}>
                                            {config.is_active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </div>
                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--text-muted)' }}>
                                            API Key
                                        </label>
                                        <input
                                            type="password"
                                            value={config.api_key || ''}
                                            onChange={(e) => {
                                                const updated = apiConfigs.map(c =>
                                                    c.id === config.id ? { ...c, api_key: e.target.value } : c
                                                );
                                                setApiConfigs(updated);
                                            }}
                                            placeholder="Enter API key..."
                                            style={{
                                                width: '100%',
                                                padding: '10px',
                                                background: 'var(--surface-color)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '6px',
                                                color: 'var(--text-color)',
                                                fontFamily: 'var(--font-body)',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            const config_to_update = apiConfigs.find(c => c.id === config.id);
                                            if (config_to_update) {
                                                await apiConfigAPI.update(config.id, {
                                                    api_key: config_to_update.api_key,
                                                    is_active: !config.is_active
                                                });
                                                await loadCareerData();
                                                setMessage(`${config.service_name} ${!config.is_active ? 'activated' : 'deactivated'}!`);
                                                setTimeout(() => setMessage(''), 3000);
                                            }
                                        }}
                                        className="clickable"
                                        style={{
                                            padding: '10px 20px',
                                            background: config.is_active ? 'transparent' : 'var(--accent-color)',
                                            color: config.is_active ? '#ef4444' : '#000',
                                            border: config.is_active ? '1px solid rgba(239, 68, 68, 0.3)' : 'none',
                                            borderRadius: '6px',
                                            fontFamily: 'var(--font-body)',
                                            fontSize: '14px',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        {config.is_active ? 'Deactivate' : 'Activate'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Job Edit Modal */}
                    {editingJob && (
                        <div style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 1000,
                            padding: '20px'
                        }}>
                            <div style={{
                                background: 'var(--surface-color)',
                                padding: '30px',
                                borderRadius: '16px',
                                border: '1px solid var(--border-color)',
                                maxWidth: '600px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflow: 'auto'
                            }}>
                                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '20px' }}>
                                    {editingJob.id ? 'EDIT JOB' : 'NEW JOB'}
                                </h3>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Title</label>
                                    <input
                                        type="text"
                                        value={editingJob.title}
                                        onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Company</label>
                                    <input
                                        type="text"
                                        value={editingJob.company}
                                        onChange={(e) => setEditingJob({ ...editingJob, company: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    />
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Location</label>
                                    <input
                                        type="text"
                                        value={editingJob.location || ''}
                                        onChange={(e) => setEditingJob({ ...editingJob, location: e.target.value })}
                                        style={{
                                            width: '100%',
                                            padding: '12px',
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)'
                                        }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Min Salary</label>
                                        <input
                                            type="number"
                                            value={editingJob.salary_min || ''}
                                            onChange={(e) => setEditingJob({ ...editingJob, salary_min: parseFloat(e.target.value) })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: 'var(--bg-color)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                color: 'var(--text-color)',
                                                fontFamily: 'var(--font-body)'
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontFamily: 'var(--font-body)' }}>Max Salary</label>
                                        <input
                                            type="number"
                                            value={editingJob.salary_max || ''}
                                            onChange={(e) => setEditingJob({ ...editingJob, salary_max: parseFloat(e.target.value) })}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                background: 'var(--bg-color)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                color: 'var(--text-color)',
                                                fontFamily: 'var(--font-body)'
                                            }}
                                        />
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={editingJob.is_low_competition}
                                            onChange={(e) => setEditingJob({ ...editingJob, is_low_competition: e.target.checked })}
                                            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                        />
                                        <span style={{ fontFamily: 'var(--font-body)', color: 'var(--text-color)' }}>
                                            Mark as Low Competition
                                        </span>
                                    </label>
                                </div>

                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={saveJob}
                                        disabled={saving}
                                        className="clickable"
                                        style={{
                                            flex: 1,
                                            padding: '12px',
                                            background: 'var(--accent-color)',
                                            color: '#000',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontFamily: 'var(--font-display)',
                                            cursor: saving ? 'not-allowed' : 'pointer',
                                            opacity: saving ? 0.6 : 1
                                        }}
                                    >
                                        {saving ? 'SAVING...' : 'SAVE'}
                                    </button>
                                    <button
                                        onClick={() => setEditingJob(null)}
                                        className="clickable"
                                        style={{
                                            padding: '12px 24px',
                                            background: 'transparent',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '8px',
                                            color: 'var(--text-color)',
                                            fontFamily: 'var(--font-body)',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
