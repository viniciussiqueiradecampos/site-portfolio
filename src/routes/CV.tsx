

export default function CV() {
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
                                {['Figma', 'React', 'Design Systems', 'Prototyping', 'UI/UX', 'AI Tools'].map(skill => (
                                    <span key={skill} style={{
                                        padding: '8px 16px',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        color: 'var(--text-muted)'
                                    }}>
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Experience, Education, Certifications */}
                    <div>
                        {/* EXPERIENCE */}
                        <div style={{ marginBottom: '60px' }}>
                            <h3 style={{ fontSize: '24px', marginBottom: '40px' }}>EXPERIENCE</h3>
                            {/* Mock Data for Experience with bullets */}
                            {[
                                {
                                    year: '2024',
                                    role: 'Senior Product Designer',
                                    company: 'Fintech Global',
                                    bullets: [
                                        'Led the redesign of the core banking dashboard.',
                                        'Established a new design system used by 40+ developers.',
                                        'Mentored 3 junior designers and improved team velocity by 20%.'
                                    ]
                                },
                                {
                                    year: '2022',
                                    role: 'UI Designer',
                                    company: 'Creative Agency',
                                    bullets: [
                                        'Designed award-winning marketing sites for tech startups.',
                                        'Collaborated directly with clients to define visual direction.',
                                    ]
                                }
                            ].map((job, i) => (
                                <div key={i} className="timeline-item" style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '40px', marginBottom: '50px', position: 'relative' }}>
                                    <div className="timeline-dot"></div> {/* Dot for timeline */}
                                    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '18px' }}>{job.year}</span>
                                    <div>
                                        <h4 style={{ fontSize: '22px', marginBottom: '5px' }}>{job.role} @ {job.company}</h4>
                                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '15px' }}>
                                            {job.bullets.map((bullet, idx) => (
                                                <li key={idx} style={{
                                                    marginBottom: '10px',
                                                    color: 'var(--text-muted)',
                                                    fontSize: '15px',
                                                    position: 'relative',
                                                    paddingLeft: '15px'
                                                }}>
                                                    <span style={{ position: 'absolute', left: 0, color: 'var(--accent-color)' }}>•</span>
                                                    {bullet}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* EDUCATION */}
                        <div style={{ marginBottom: '60px' }}>
                            <h3 style={{ fontSize: '24px', marginBottom: '40px' }}>EDUCATION</h3>
                            <div className="timeline-item" style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '40px', position: 'relative' }}>
                                <div className="timeline-dot"></div>
                                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '18px' }}>2018</span>
                                <div>
                                    <h4 style={{ fontSize: '22px', marginBottom: '5px' }}>BFA Design & Technology</h4>
                                    <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>University of Lisbon</p>
                                </div>
                            </div>
                        </div>

                        {/* CERTIFICATIONS (New Section) */}
                        <div>
                            <h3 style={{ fontSize: '24px', marginBottom: '40px' }}>CERTIFICATIONS</h3>
                            <div className="timeline-item" style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '40px', position: 'relative' }}>
                                <div className="timeline-dot"></div>
                                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '18px' }}>2023</span>
                                <div>
                                    <h4 style={{ fontSize: '22px', marginBottom: '5px' }}>Google UX Design Certificate</h4>
                                    <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Coursera / Google</p>
                                </div>
                            </div>
                            <div className="timeline-item" style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: '40px', marginTop: '40px', position: 'relative' }}>
                                <div className="timeline-dot"></div>
                                <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)', fontSize: '18px' }}>2021</span>
                                <div>
                                    <h4 style={{ fontSize: '22px', marginBottom: '5px' }}>Advanced React & Redux</h4>
                                    <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>Udemy</p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
