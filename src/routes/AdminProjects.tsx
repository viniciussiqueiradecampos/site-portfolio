import { useState, useEffect, useRef } from 'react';
import AdminLayout from '../components/AdminLayout';
import { projectsAPI, type Project } from '../lib/supabase';
import { storageAPI } from '../lib/storage';
import { Plus, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';

export default function AdminProjects() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [editing, setEditing] = useState<Partial<Project> | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);
    const coverInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        const data = await projectsAPI.getAll();
        setProjects(data);
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !editing) return;

        setUploading(true);
        const url = await storageAPI.uploadImage(file, 'covers');
        if (url) {
            setEditing({ ...editing, image_url: url });
        }
        setUploading(false);
    };

    const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0 || !editing) return;

        setUploadingGallery(true);
        const currentGallery = editing.gallery_images || [];

        for (let i = 0; i < files.length; i++) {
            const url = await storageAPI.uploadImage(files[i], 'gallery');
            if (url) {
                currentGallery.push(url);
            }
        }

        setEditing({ ...editing, gallery_images: currentGallery });
        setUploadingGallery(false);
    };

    const removeGalleryImage = (index: number) => {
        if (!editing) return;
        const newGallery = [...(editing.gallery_images || [])];
        newGallery.splice(index, 1);
        setEditing({ ...editing, gallery_images: newGallery });
    };

    const handleSave = async () => {
        if (!editing || !editing.title || !editing.image_url) {
            alert('Please fill in at least Title and Cover Image');
            return;
        }

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
            <div style={{ maxWidth: '1200px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Portfolio Projects</h1>
                    <button
                        onClick={() => setEditing({ title: '', description: '', image_url: '', gallery_images: [], tags: [], visible: true, order_index: 0 })}
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
                            {/* Title */}
                            <input
                                placeholder="Project Title *"
                                value={editing.title}
                                onChange={e => setEditing({ ...editing, title: e.target.value })}
                                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px' }}
                            />

                            <input
                                placeholder="Project Year (e.g., 2024)"
                                value={editing.year || ''}
                                onChange={e => setEditing({ ...editing, year: e.target.value })}
                                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                            />

                            {/* Cover Image Upload */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                                    Cover Image *
                                </label>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <input
                                        ref={coverInputRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        onClick={() => coverInputRef.current?.click()}
                                        disabled={uploading}
                                        style={{
                                            padding: '10px 20px',
                                            background: uploading ? '#cbd5e1' : '#3b82f6',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: uploading ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <Upload size={16} />
                                        {uploading ? 'Uploading...' : 'Upload Cover'}
                                    </button>
                                    {editing.image_url && (
                                        <div style={{ position: 'relative', width: '100px', height: '100px', borderRadius: '8px', overflow: 'hidden', border: '2px solid #3b82f6' }}>
                                            <img src={editing.image_url} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Gallery Images Upload */}
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                                    Gallery Images (for carousel)
                                </label>
                                <div style={{ marginBottom: '10px' }}>
                                    <input
                                        ref={galleryInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleGalleryUpload}
                                        style={{ display: 'none' }}
                                    />
                                    <button
                                        onClick={() => galleryInputRef.current?.click()}
                                        disabled={uploadingGallery}
                                        style={{
                                            padding: '10px 20px',
                                            background: uploadingGallery ? '#cbd5e1' : '#10b981',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '8px',
                                            cursor: uploadingGallery ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}
                                    >
                                        <ImageIcon size={16} />
                                        {uploadingGallery ? 'Uploading...' : 'Add Gallery Images'}
                                    </button>
                                </div>
                                {editing.gallery_images && editing.gallery_images.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                                        {editing.gallery_images.map((url, index) => (
                                            <div key={index} style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                                                <img src={url} alt={`Gallery ${index + 1}`} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <button
                                                    onClick={() => removeGalleryImage(index)}
                                                    style={{
                                                        position: 'absolute',
                                                        top: '5px',
                                                        right: '5px',
                                                        background: 'rgba(239, 68, 68, 0.9)',
                                                        border: 'none',
                                                        borderRadius: '50%',
                                                        width: '24px',
                                                        height: '24px',
                                                        color: 'white',
                                                        cursor: 'pointer',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <textarea
                                placeholder="Description (optional)"
                                value={editing.description || ''}
                                onChange={e => setEditing({ ...editing, description: e.target.value })}
                                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '100px', fontSize: '14px' }}
                            />

                            {/* Tags */}
                            <input
                                placeholder="Tags (comma separated, e.g., UI Design, Figma, React)"
                                value={editing.tags?.join(', ')}
                                onChange={e => setEditing({ ...editing, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
                            />

                            {/* Action Buttons */}
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button
                                    onClick={handleSave}
                                    style={{
                                        padding: '12px 24px',
                                        background: 'var(--accent-color)',
                                        color: '#000',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    Save Project
                                </button>
                                <button
                                    onClick={() => setEditing(null)}
                                    style={{
                                        padding: '12px 24px',
                                        background: '#e2e8f0',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Projects Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                    {projects.map(project => (
                        <div key={project.id} style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                            <div style={{ height: '200px', background: '#f1f5f9', overflow: 'hidden', position: 'relative' }}>
                                <img src={project.image_url} alt={project.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {project.gallery_images && project.gallery_images.length > 0 && (
                                    <div style={{
                                        position: 'absolute',
                                        bottom: '10px',
                                        right: '10px',
                                        background: 'rgba(0,0,0,0.7)',
                                        color: 'white',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px'
                                    }}>
                                        +{project.gallery_images.length} images
                                    </div>
                                )}
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
