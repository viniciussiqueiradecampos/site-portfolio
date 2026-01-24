import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { cvAPI, type CVSection } from '../lib/supabase';
import { Trash2, Edit2 } from 'lucide-react';

export default function AdminCV() {
    const [sections, setSections] = useState<CVSection[]>([]);
    const [editing, setEditing] = useState<Partial<CVSection> | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await cvAPI.getAll();
        setSections(data);
    };

    const handleSave = async () => {
        if (!editing) return;
        // Basic validation
        if (!editing.section_type || !editing.title) return;

        if (editing.id) {
            await cvAPI.update(editing.id, editing);
        } else {
            await cvAPI.create(editing as any);
        }
        setEditing(null);
        loadData();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Delete this item?')) {
            await cvAPI.delete(id);
            loadData();
        }
    };

    const sectionTypes = ['experience', 'education', 'certification', 'skills'];

    const renderList = (type: string) => {
        const items = sections.filter(s => s.section_type === type);
        return (
            <div style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h2 style={{ textTransform: 'capitalize' }}>{type}s</h2>
                    <button
                        onClick={() => setEditing({ section_type: type as any, title: '', subtitle: '', description: '', date_range: '', visible: true, order_index: 0 })}
                        style={{ padding: '8px 16px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                    >
                        + Add {type}
                    </button>
                </div>
                <div style={{ display: 'grid', gap: '15px' }}>
                    {items.map(item => (
                        <div key={item.id} style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h4 style={{ margin: 0 }}>{item.title}</h4>
                                {item.subtitle && <p style={{ margin: '4px 0', fontSize: '14px', color: '#64748b' }}>{item.subtitle} • {item.date_range}</p>}
                                {item.description && <p style={{ margin: '10px 0 0', fontSize: '13px', whiteSpace: 'pre-wrap' }}>{item.description}</p>}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => setEditing(item)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#64748b' }}><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} style={{ cursor: 'pointer', background: 'transparent', border: 'none', color: '#ef4444' }}><Trash2 size={16} /></button>
                            </div>
                        </div>
                    ))}
                    {items.length === 0 && <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No {type} items yet.</p>}
                </div>
            </div>
        );
    };

    return (
        <AdminLayout>
            <div style={{ maxWidth: '1000px' }}>
                <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: '30px' }}>CV Management</h1>

                {editing && (
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', position: 'sticky', top: '20px', zIndex: 10 }}>
                        <h3 style={{ marginBottom: '20px' }}>{editing.id ? 'Edit Item' : `New ${editing.section_type}`}</h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input
                                    placeholder="Title (Role, Degree, etc.)"
                                    value={editing.title}
                                    onChange={e => setEditing({ ...editing, title: e.target.value })}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                                <input
                                    placeholder="Subtitle (Company, School)"
                                    value={editing.subtitle || ''}
                                    onChange={e => setEditing({ ...editing, subtitle: e.target.value })}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input
                                    placeholder="Date Range (e.g. 2022 - Present)"
                                    value={editing.date_range || ''}
                                    onChange={e => setEditing({ ...editing, date_range: e.target.value })}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                                <input
                                    type="number"
                                    placeholder="Order Index"
                                    value={editing.order_index}
                                    onChange={e => setEditing({ ...editing, order_index: parseInt(e.target.value) || 0 })}
                                    style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                                />
                            </div>
                            <textarea
                                placeholder="Description (Bullet points, separate by new lines)"
                                value={editing.description || ''}
                                onChange={e => setEditing({ ...editing, description: e.target.value })}
                                style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '100px' }}
                            />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button onClick={handleSave} style={{ padding: '10px 20px', background: 'var(--accent-color)', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Save</button>
                                <button onClick={() => setEditing(null)} style={{ padding: '10px 20px', background: '#ccc', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                {sectionTypes.map(type => renderList(type))}
            </div>
        </AdminLayout>
    );
}
