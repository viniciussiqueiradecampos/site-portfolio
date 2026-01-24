import { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { apiConfigAPI, contentAPI, type APIConfiguration } from '../lib/supabase';
import { Save, Palette, Type } from 'lucide-react';

export default function AdminSettings() {
    const [configs, setConfigs] = useState<APIConfiguration[]>([]);
    const [branding, setBranding] = useState({
        logoText1: 'VINICIUS',
        logoText2: 'CAMPOS',
        accentColor: '#F2A73D',
        bgColor: '#050505'
    });
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Load API Configs
        const apiData = await apiConfigAPI.getAll();
        setConfigs(apiData);

        // Load Branding
        const l1 = await contentAPI.getByKey('general.logo_text1');
        const l2 = await contentAPI.getByKey('general.logo_text2');
        const ac = await contentAPI.getByKey('general.accent_color');
        const bg = await contentAPI.getByKey('general.bg_color');

        setBranding({
            logoText1: l1?.value || 'VINICIUS',
            logoText2: l2?.value || 'CAMPOS',
            accentColor: ac?.value || '#F2A73D',
            bgColor: bg?.value || '#050505'
        });
    };

    const handleConfigUpdate = (id: string, updates: Partial<APIConfiguration>) => {
        setConfigs(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            // Save API Configs
            for (const config of configs) {
                await apiConfigAPI.update(config.id, {
                    api_key: config.api_key,
                    is_active: config.is_active
                });
            }

            // Save Branding
            await contentAPI.update('general.logo_text1', branding.logoText1, 'general');
            await contentAPI.update('general.logo_text2', branding.logoText2, 'general');
            await contentAPI.update('general.accent_color', branding.accentColor, 'general');
            await contentAPI.update('general.bg_color', branding.bgColor, 'general');

            alert('Settings saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AdminLayout>
            <div style={{ maxWidth: '800px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', margin: 0 }}>System Settings</h1>
                    <button
                        onClick={saveSettings}
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

                <div style={{ display: 'grid', gap: '30px' }}>
                    {/* Branding Section */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Palette size={20} /> Branding & Identity
                        </h2>

                        <div style={{ display: 'grid', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Logo Line 1</label>
                                    <input
                                        type="text"
                                        value={branding.logoText1}
                                        onChange={e => setBranding({ ...branding, logoText1: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Logo Line 2</label>
                                    <input
                                        type="text"
                                        value={branding.logoText2}
                                        onChange={e => setBranding({ ...branding, logoText2: e.target.value })}
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Accent Color</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="color"
                                            value={branding.accentColor}
                                            onChange={e => setBranding({ ...branding, accentColor: e.target.value })}
                                            style={{ width: '50px', height: '40px', padding: '2px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                        />
                                        <input
                                            type="text"
                                            value={branding.accentColor}
                                            onChange={e => setBranding({ ...branding, accentColor: e.target.value })}
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Background Color</label>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <input
                                            type="color"
                                            value={branding.bgColor}
                                            onChange={e => setBranding({ ...branding, bgColor: e.target.value })}
                                            style={{ width: '50px', height: '40px', padding: '2px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                        />
                                        <input
                                            type="text"
                                            value={branding.bgColor}
                                            onChange={e => setBranding({ ...branding, bgColor: e.target.value })}
                                            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* API Config Section */}
                    <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                        <h2 style={{ fontSize: '20px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Type size={20} /> API Configurations
                        </h2>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            {configs.map(config => (
                                <div key={config.id} style={{ display: 'grid', gridTemplateColumns: '150px 1fr 100px', gap: '20px', alignItems: 'center', padding: '15px', background: '#f8fafc', borderRadius: '8px' }}>
                                    <div style={{ fontWeight: 600, textTransform: 'uppercase', fontSize: '14px' }}>{config.service_name}</div>
                                    <input
                                        type="password"
                                        placeholder="API Key"
                                        value={config.api_key || ''}
                                        onChange={e => handleConfigUpdate(config.id, { api_key: e.target.value })}
                                        style={{ padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                                    />
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', cursor: 'pointer' }}>
                                        <input
                                            type="checkbox"
                                            checked={config.is_active}
                                            onChange={e => handleConfigUpdate(config.id, { is_active: e.target.checked })}
                                        />
                                        Active
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
