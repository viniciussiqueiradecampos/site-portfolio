

import { useState, useEffect } from 'react';
import { cvAPI, type CVSection } from '../lib/supabase';

export default function CV() {
    const [sections, setSections] = useState<CVSection[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const data = await cvAPI.getAll();
        setSections(data);
        setLoading(false);
    };

    const skills = sections.filter(s => s.section_type === 'skills').sort((a, b) => a.order_index - b.order_index);
    const experience = sections.filter(s => s.section_type === 'experience').sort((a, b) => b.order_index - a.order_index); // Descending for exp
    const education = sections.filter(s => s.section_type === 'education').sort((a, b) => b.order_index - a.order_index);

    if (loading) {
        return <div style={{ paddingTop: '150px', paddingBottom: '100px', textAlign: 'center' }}>Loading CV...</div>;
    }

    return (
        <div style={{ paddingTop: '150px', paddingBottom: '100px' }}>
            <div className="container">
                <h1 style={{ fontSize: '120px', lineHeight: 0.8, marginBottom: '100px', color: 'var(--accent-color)' }}>CURRICULUM<br />VITAE</h1>

                <div className="cv-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '80px', borderTop: '1px solid var(--border-color)', paddingTop: '60px' }}>

                    {/* LEFT COLUMN: Profile & Skills */}
                    <div>
                        <div style={{ marginBottom: '60px' }}>
                            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>PROFILE</h3>
                            <p style={{ lineHeight: 1.6, color: 'var(--text-muted)' }}>
                                Senior Product Designer combining aesthetic precision with technical robustness. Obsessed with Design Systems and AI integration.
                            </p>
                        </div>

                        <div>
                            <h3 style={{ fontSize: '24px', marginBottom: '20px' }}>SKILLS</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                {skills.map(skill => (
                                    <span key={skill.id} style={{
                                        padding: '8px 16px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        color: 'var(--text-muted)'
                                    }}>
                                        {skill.title}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Experience, Education */}
                    <div>
                        {/* EXPERIENCE */}
                        {experience.length > 0 && (
                            <div style={{ marginBottom: '60px' }}>
                                <h3 style={{ fontSize: '24px', marginBottom: '40px' }}>EXPERIENCE</h3>
                                {experience.map(job => (
                                    <div key={job.id} className="timeline-item" style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '40px', marginBottom: '50px', position: 'relative' }}>
                                        <div className="timeline-dot"></div>
                                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '18px' }}>{job.date_range}</span>
                                        <div>
                                            <h4 style={{ fontSize: '22px', marginBottom: '5px' }}>{job.title} @ {job.subtitle}</h4>
                                            {job.description && (
                                                <div style={{ marginTop: '15px' }}>
                                                    {job.description.split('\n').map((line, idx) => (
                                                        <div key={idx} style={{
                                                            marginBottom: '10px',
                                                            color: 'var(--text-muted)',
                                                            fontSize: '15px',
                                                            position: 'relative',
                                                            paddingLeft: '15px'
                                                        }}>
                                                            {line.startsWith('•') ? (
                                                                <>
                                                                    <span style={{ position: 'absolute', left: 0, color: 'var(--accent-color)' }}>•</span>
                                                                    {line.substring(1).trim()}
                                                                </>
                                                            ) : line}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* EDUCATION & CERTIFICATIONS (Grouped in DB as education or separated? I used 'education' for both in seed) */}
                        {education.length > 0 && (
                            <div style={{ marginBottom: '60px' }}>
                                <h3 style={{ fontSize: '24px', marginBottom: '40px' }}>EDUCATION & CERTIFICATIONS</h3>
                                {education.map(edu => (
                                    <div key={edu.id} className="timeline-item" style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '40px', marginBottom: '40px', position: 'relative' }}>
                                        <div className="timeline-dot"></div>
                                        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '18px' }}>{edu.date_range}</span>
                                        <div>
                                            <h4 style={{ fontSize: '22px', marginBottom: '5px' }}>{edu.title}</h4>
                                            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>{edu.subtitle}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
