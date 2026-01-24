import { useState, useEffect } from 'react';
import { crmAPI, type CRMLead } from '../lib/supabase';
import { User, Mail, Edit2, Trash2 } from 'lucide-react';

export default function CRMSystem() {
    const [leads, setLeads] = useState<CRMLead[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<Partial<CRMLead> | null>(null);

    useEffect(() => {
        loadLeads();
    }, []);

    const loadLeads = async () => {
        setLoading(true);
        const data = await crmAPI.getAll();
        setLeads(data);
        setLoading(false);
    };

    const handleSave = async () => {
        if (!editing || !editing.company_name) return;

        if (editing.id) {
            await crmAPI.update(editing.id, editing);
        } else {
            await crmAPI.create(editing as any);
        }
        setEditing(null);
        loadLeads();
    };

    const handleDelete = async (id: string) => {
        if (confirm('Remover este lead?')) {
            await crmAPI.delete(id);
            loadLeads();
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'novo': return '#3b82f6';
            case 'contatado': return '#f59e0b';
            case 'negociacao': return '#a855f7';
            case 'fechado': return '#10b981';
            case 'perdido': return '#ef4444';
            default: return 'gray';
        }
    };

    return (
        <div style={{ background: 'var(--surface-color)', padding: '30px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', margin: 0 }}>CRM - GESTÃO DE CONTATOS</h2>
                <button
                    onClick={() => setEditing({ company_name: '', status: 'novo', region: '' })}
                    style={{
                        padding: '12px 24px',
                        background: 'var(--accent-color)',
                        color: '#000',
                        border: 'none',
                        borderRadius: '8px',
                        fontFamily: 'var(--font-display)',
                        cursor: 'pointer'
                    }}
                >
                    + NOVO CONTATO
                </button>
            </div>

            {editing && (
                <div style={{ background: 'var(--bg-color)', padding: '25px', borderRadius: '12px', border: '1px solid var(--accent-color)', marginBottom: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <input
                            placeholder="Nome da Empresa"
                            value={editing.company_name}
                            onChange={(e) => setEditing({ ...editing, company_name: e.target.value })}
                            style={{ padding: '10px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                        />
                        <select
                            value={editing.status}
                            onChange={(e) => setEditing({ ...editing, status: e.target.value as any })}
                            style={{ padding: '10px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                        >
                            <option value="novo">Novo</option>
                            <option value="contatado">Contatado</option>
                            <option value="negociacao">Negociação</option>
                            <option value="fechado">Fechado (Vendido)</option>
                            <option value="perdido">Perdido</option>
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                        <input
                            placeholder="Pessoa de Contato"
                            value={editing.contact_name || ''}
                            onChange={(e) => setEditing({ ...editing, contact_name: e.target.value })}
                            style={{ padding: '10px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                        />
                        <input
                            placeholder="Email"
                            value={editing.contact_email || ''}
                            onChange={(e) => setEditing({ ...editing, contact_email: e.target.value })}
                            style={{ padding: '10px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                        />
                        <input
                            placeholder="Telefone"
                            value={editing.contact_phone || ''}
                            onChange={(e) => setEditing({ ...editing, contact_phone: e.target.value })}
                            style={{ padding: '10px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff' }}
                        />
                    </div>
                    <textarea
                        placeholder="Notas / Histórico da conversa"
                        value={editing.notes || ''}
                        onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                        style={{ width: '100%', padding: '10px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '6px', color: '#fff', minHeight: '80px', marginBottom: '15px' }}
                    />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={handleSave} style={{ padding: '10px 20px', background: 'var(--accent-color)', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>SALVAR</button>
                        <button onClick={() => setEditing(null)} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #666', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>CANCELAR</button>
                    </div>
                </div>
            )}

            {loading ? (
                <p>Carregando leads...</p>
            ) : (
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-color)' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '15px', color: 'var(--text-muted)' }}>EMPRESA</th>
                                <th style={{ padding: '15px', color: 'var(--text-muted)' }}>STATUS</th>
                                <th style={{ padding: '15px', color: 'var(--text-muted)' }}>CONTATO</th>
                                <th style={{ padding: '15px', color: 'var(--text-muted)' }}>AÇÕES</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => (
                                <tr key={lead.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ fontWeight: 'bold' }}>{lead.company_name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{lead.website_url}</div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <span style={{
                                            padding: '4px 10px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            textTransform: 'uppercase',
                                            fontWeight: 'bold',
                                            background: `${getStatusColor(lead.status)}22`,
                                            color: getStatusColor(lead.status),
                                            border: `1px solid ${getStatusColor(lead.status)}44`
                                        }}>
                                            {lead.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
                                            {lead.contact_name && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><User size={12} /> {lead.contact_name}</div>}
                                            {lead.contact_email && <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><Mail size={12} /> {lead.contact_email}</div>}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px' }}>
                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            <button onClick={() => setEditing(lead)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><Edit2 size={16} /></button>
                                            <button onClick={() => handleDelete(lead.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
