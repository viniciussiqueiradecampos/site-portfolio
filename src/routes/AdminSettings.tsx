import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { apiConfigAPI, type APIConfiguration } from '../lib/supabase';
import { Save } from 'lucide-react';

export default function AdminSettings() {
    const [configs, setConfigs] = useState<APIConfiguration[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        const data = await apiConfigAPI.getAll();
        setConfigs(data);
        setLoading(false);
    };

    const handleUpdate = (id: string, updates: Partial<APIConfiguration>) => {
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const saveConfigs = async () => {
        setSaving(true);
        for (const config of configs) {
            await apiConfigAPI.update(config.id, {
                api_key: config.api_key,
                is_active: config.is_active
            });
        }
        setSaving(false);
        alert('Configurations saved!');
    };

    return (
        <AdminLayout>
            <div style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>System Settings</h1>
                    <button
                        onClick={saveConfigs}
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
                        <Save size={18} /> {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

                <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>API Configurations</h2>
                    <div style={{ display: 'grid', gap: '20px' }}>
                        {configs.map(config => (
                            <div key={config.id} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 100px', gap: '20px', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                                <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '14px' }}>{config.service_name}</div>
                                <input
                                    type="password"
                                    placeholder="API Key"
                                    value={config.api_key || ''}
                                    onChange={e => handleUpdate(config.id, { api_key: e.target.value })}
                                    style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={config.is_active}
                                        onChange={e => handleUpdate(config.id, { is_active: e.target.checked })}
                                    />
                                    Active
                                </label>
                            </div>
                        ))}
                        {configs.length === 0 && !loading && <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>No configurations found. Run setup triggers?</div>}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
