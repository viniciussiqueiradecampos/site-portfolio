import { useState } from 'react';
import { Search, Globe, AlertTriangle, MapPin } from 'lucide-react';
import { crmAPI } from '../lib/supabase';

export default function LeadDiscovery() {
    const [region, setRegion] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState<any[]>([]);

    const handleSearch = () => {
        if (!region) return;
        setIsSearching(true);
        // Mocking discovery process
        setTimeout(() => {
            const mockLeads = [
                {
                    company_name: 'Pastelaria Central',
                    website_url: 'http://pastelariacentral.pt',
                    region: region,
                    detected_issues: ['Não responsivo', 'Design desatualizado', 'Certificado SSL expirado'],
                    severity: 'high'
                },
                {
                    company_name: 'Oficina do João',
                    website_url: 'http://oficinajoao.com',
                    region: region,
                    detected_issues: ['Carga lenta', 'Links quebrados'],
                    severity: 'medium'
                },
                {
                    company_name: 'Clínica Sorriso',
                    website_url: 'http://clinicasorriso.net',
                    region: region,
                    detected_issues: ['Não otimizado para mobile', 'Design antigo (2015)'],
                    severity: 'high'
                }
            ];
            setResults(mockLeads);
            setIsSearching(false);
        }, 2000);
    };

    const addToCRM = async (lead: any) => {
        const ok = await crmAPI.create({
            company_name: lead.company_name,
            website_url: lead.website_url,
            region: lead.region,
            detected_issues: lead.detected_issues,
            status: 'novo'
        });
        if (ok) {
            alert(`${lead.company_name} adicionado ao CRM!`);
            setResults(prev => prev.filter(r => r.company_name !== lead.company_name));
        }
    };

    return (
        <div style={{ background: 'var(--surface-color)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', marginBottom: '20px' }}>WEBSITE DISCOVERER</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Encontre sites que precisam de melhorias na sua região.</p>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Adicionar região (ex: Lisboa, Porto, Braga...)"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '12px 12px 12px 40px',
                            background: 'var(--bg-color)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-color)',
                            fontFamily: 'var(--font-body)'
                        }}
                    />
                </div>
                <button
                    onClick={handleSearch}
                    disabled={isSearching || !region}
                    style={{
                        padding: '12px 24px',
                        background: 'var(--accent-color)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-display)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: isSearching ? 0.6 : 1
                    }}
                >
                    <Search size={18} /> {isSearching ? 'PESQUISANDO...' : 'PESQUISAR'}
                </button>
            </div>

            {isSearching && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Globe className="spin" size={48} style={{ color: 'var(--accent-color)', marginBottom: '20px' }} />
                    <p>Analisando domínios na região: {region}...</p>
                </div>
            )}

            {!isSearching && results.length > 0 && (
                <div style={{ display: 'grid', gap: '20px' }}>
                    {results.map((lead, i) => (
                        <div key={i} style={{ padding: '20px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '18px' }}>{lead.company_name}</h3>
                                <a href={lead.website_url} target="_blank" rel="noreferrer" style={{ color: 'var(--accent-color)', fontSize: '14px' }}>{lead.website_url}</a>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                                    {lead.detected_issues.map((issue: string, idx: number) => (
                                        <span key={idx} style={{ padding: '4px 8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '4px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <AlertTriangle size={10} /> {issue}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <button
                                onClick={() => addToCRM(lead)}
                                style={{
                                    padding: '10px 20px',
                                    background: 'transparent',
                                    border: '1px solid var(--accent-color)',
                                    color: 'var(--accent-color)',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    fontWeight: 'bold'
                                }}
                            >
                                ADICIONAR AO CRM
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
