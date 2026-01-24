import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { projectsAPI, type Project } from '../lib/supabase';
import { Plus, Trash2, Edit2, Image as ImageIcon } from 'lucide-react';

export default function AdminProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<Project> | null>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        setLoading(true);
        const data = await projectsAPI.getAll();
        setProjects(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!editing) return;
        if (editing.id) {
            await projectsAPI.update(editing.id, editing);
        } else {
            await projectsAPI.create(editing as any);
        }
        setEditing(null);
        loadProjects();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this project?')) {
            await projectsAPI.delete(id);
            loadProjects();
        }
    };

    return (
        <AdminLayout>
            <div style={{ maxWidth: '1000px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Portfolio Projects</h1>
                    <button
                        onClick={() => setEditing({ title: '', description: '', image_url: '', tags: [], visible: true, order_index: 0 })}
                        className="clickable"
                        style={{
                            padding: '12px 24px',
                            background: '#0f172a',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontFamily: 'var(--font-display)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        <Plus size={18} /> Add Project
                    </button>
                </div>

                {editing && (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
                        <h3 style={{ marginBottom: '20px' }}>{editing.id ? 'Edit Project' : 'New Project'}</h3>
                        <div style={{ display: 'grid', gap: '20px' }}>
                            <input
                                placeholder="Title"
                                value={editing.title}
                                onChange={e => setEditing({ ...editing, title: e.target.value })}
                                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <input
                                placeholder="Image URL (e.g., /src/assets/... or https://...)"
                                value={editing.image_url}
                                onChange={e => setEditing({ ...editing, image_url: e.target.value })}
                                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <textarea
                                placeholder="Description (optional)"
                                value={editing.description || ''}
                                onChange={e => setEditing({ ...editing, description: e.target.value })}
                                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '100px' }}
                            />
                            <input
                                placeholder="Tags (comma separated)"
                                value={editing.tags?.join(', ')}
                                onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(s => s.trim()) })}
                                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleSave} style={{ padding: '10px 20px', background: 'var(--accent-color)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                                <button onClick={() => setEditing(null)} style={{ padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {projects.map(project => (
                        <div key={project.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <div style={{ height: '200px', background: '#f1f5f9', overflow: 'hidden' }}>
                                <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 10px' }}>{project.title}</h3>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginBottom: '15px' }}>
                                    {project.tags.map(tag => (
                                        <span key={tag} style={{ fontSize: '12px', padding: '4px 8px', background: '#f1f5f9', borderRadius: '4px' }}>{tag}</span>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => setEditing(project)} style={{ flex: 1, padding: '8px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                                    <button onClick={() => handleDelete(project.id)} style={{ padding: '8px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '6px', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
