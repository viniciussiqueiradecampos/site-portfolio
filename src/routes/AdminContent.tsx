import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { contentAPI, type Content } from '../lib/supabase';
import { Save, RefreshCw } from 'lucide-react';

export default function AdminContent() {
    const [contents, setContents] = useState<Content[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        setLoading(true);
        // Load known keys
        const keys = ['hero.title', 'hero.description', 'storytelling.main'];
        const loaded: Content[] = [];
        for (const key of keys) {
            const data = await contentAPI.getByKey(key);
            if (data) loaded.push(data);
        }
        setContents(loaded);
        setLoading(false);
    };

    const handleUpdate = (key: string, value: string) => {
        setContents(prev => prev.map(c => c.key === key ? { ...c, value } : c));
    };

    const saveOrder = async () => {
        setSaving(true);
        for (const item of contents) {
            await contentAPI.update(item.key, item.value);
        }
        setSaving(false);
        alert('Content updated successfully!');
    };

    const sections = [
        { title: 'Hero Section', keys: ['hero.title', 'hero.description'] },
        { title: 'Storytelling Section', keys: ['storytelling.main'] }
    ];

    if (loading) return <AdminLayout><div>Loading content...</div></AdminLayout>;

    return (
        <AdminLayout>
            <div style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>Content Management</h1>
                    <button
                        onClick={saveOrder}
                        className="clickable"
                        disabled={saving}
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
                            gap: '8px',
                            opacity: saving ? 0.7 : 1
                        }}
                    >
                        <Save size={18} /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>

                {sections.map(section => (
                    <div key={section.title} style={{
                        background: 'white',
                        padding: '30px',
                        borderRadius: '16px',
                        marginBottom: '30px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', marginBottom: '20px' }}>{section.title}</h2>
                        {section.keys.map(key => {
                            const item = contents.find(c => c.key === key);
                            if (!item) return null;
                            const isLong = item.value.length > 50;
                            return (
                                <div key={key} style={{ marginBottom: '20px' }}>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px', color: '#64748b' }}>
                                        {key.toUpperCase()}
                                    </label>
                                    {isLong ? (
                                        <textarea
                                            value={item.value}
                                            onChange={e => handleUpdate(key, e.target.value)}
                                            rows={6}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                fontFamily: 'var(--font-body)',
                                                fontSize: '14px',
                                                resize: 'vertical'
                                            }}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={item.value}
                                            onChange={e => handleUpdate(key, e.target.value)}
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                fontFamily: 'var(--font-body)',
                                                fontSize: '14px'
                                            }}
                                        />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
