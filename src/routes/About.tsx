import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import RevealText from '../components/RevealText';
import { analyticsAPI, contentAPI } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';

export default function About() {
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const [aboutData, setAboutData] = useState({
        title: 'ABOUT ME',
        description: '',
        photoUrl: '',
        interestsTitle: 'WHAT I LOVE DOING',
        interests: [] as { id: string, title: string, icon?: string }[],
        workflowTitle: 'HOW I WORK',
        workflow: [] as { id: string, title: string, description: string }[],
        testimonialsTitle: 'TESTIMONIALS',
        testimonials: [] as { id: string, name: string, role: string, content: string, photo?: string }[]
    });

    const [socials, setSocials] = useState({
        linkedin: '#',
        instagram: '#',
        footerEmail: 'vinisiqueiradecampos@gmail.com',
        phone: '+351 920 196 634'
    });
    const [footerText, setFooterText] = useState('VINICIUS CAMPOS &copy; 2026 • PORTUGAL');

    useEffect(() => {
        analyticsAPI.logEvent({ event_type: 'page_view', page_path: '/about' });
        loadData();
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadData = async () => {
        const t = await contentAPI.getByKey('about.title');
        const d = await contentAPI.getByKey('about.description');
        const p = await contentAPI.getByKey('about.photo_url');
        const it = await contentAPI.getByKey('about.interests_title');
        const i = await contentAPI.getByKey('about.interests');
        const wt = await contentAPI.getByKey('about.workflow_title');
        const wf = await contentAPI.getByKey('about.workflow');
        const tt = await contentAPI.getByKey('about.testimonials_title');
        const tm = await contentAPI.getByKey('about.testimonials');

        setAboutData({
            title: t?.value || 'ABOUT ME',
            description: d?.value || '',
            photoUrl: p?.value || '',
            interestsTitle: it?.value || 'WHAT I LOVE DOING',
            interests: i ? JSON.parse(i.value) : [],
            workflowTitle: wt?.value || 'HOW I WORK',
            workflow: wf ? JSON.parse(wf.value) : [],
            testimonialsTitle: tt?.value || 'TESTIMONIALS',
            testimonials: tm ? JSON.parse(tm.value) : []
        });

        const em = await contentAPI.getByKey('social.footer_email');
        const ln = await contentAPI.getByKey('social.linkedin');
        const ig = await contentAPI.getByKey('social.instagram');
        const ph = await contentAPI.getByKey('social.phone');
        const ft = await contentAPI.getByKey('general.footer_text');

        setSocials({
            footerEmail: em?.value || 'vinisiqueiradecampos@gmail.com',
            linkedin: ln?.value || '#',
            instagram: ig?.value || '#',
            phone: ph?.value || '+351 920 196 634'
        });
        if (ft) setFooterText(ft.value);
    };

    return (
        <div style={{ background: 'var(--bg-color)', color: 'var(--text-color)', minHeight: '100vh', paddingTop: '150px' }}>
            <div className="container">

                {/* HERO SECTION */}
                <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1.2fr', gap: isMobile ? '40px' : '80px', alignItems: 'flex-start', marginBottom: '150px' }}>
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        style={{ width: '100%' }}
                    >
                        <div style={{ width: '100%', aspectRatio: isMobile ? '1/1' : '1/1.2', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.02)' }}>
                            {aboutData.photoUrl ? (
                                <img src={aboutData.photoUrl} alt="Me" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#111' }} />
                            )}
                        </div>
                    </motion.div>

                    <div style={{ width: '100%' }}>
                        <RevealText>
                            <h1 style={{ fontSize: isMobile ? '42px' : '82px', fontFamily: 'var(--font-display)', lineHeight: 0.9, marginBottom: '40px' }}>
                                {aboutData.title}
                            </h1>
                        </RevealText>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            style={{ maxWidth: isMobile ? '100%' : '85%', fontSize: '18px', lineHeight: 1.8, color: 'var(--text-muted)' }}
                        >
                            <ReactMarkdown>{aboutData.description}</ReactMarkdown>
                        </motion.div>
                    </div>
                </section>

                {/* INTERESTS SECTION */}
                {aboutData.interests.length > 0 && (
                    <section style={{ marginBottom: '150px' }}>
                        <RevealText>
                            <h2 style={{ fontSize: '12px', letterSpacing: '3px', color: 'var(--accent-color)', marginBottom: '50px', fontFamily: 'var(--font-display)' }}>
                                {aboutData.interestsTitle}
                            </h2>
                        </RevealText>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '15px' }}>
                            {aboutData.interests.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--border-color)', textAlign: 'center' }}
                                >
                                    <div style={{ fontSize: '28px', marginBottom: '15px' }}>{item.icon || '✦'}</div>
                                    <h3 style={{ fontSize: '12px', fontFamily: 'var(--font-display)', margin: 0, letterSpacing: '1px' }}>{item.title}</h3>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* WORKFLOW SECTION */}
                {aboutData.workflow.length > 0 && (
                    <section style={{ marginBottom: '150px' }}>
                        <RevealText>
                            <h2 style={{ fontSize: '12px', letterSpacing: '3px', color: 'var(--accent-color)', marginBottom: '60px', fontFamily: 'var(--font-display)' }}>
                                {aboutData.workflowTitle}
                            </h2>
                        </RevealText>
                        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))', gap: '40px' }}>
                            {aboutData.workflow.map((step, idx) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, y: 15 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    style={{ position: 'relative', padding: '0 10px' }}
                                >
                                    <div style={{ fontSize: '40px', fontWeight: 900, color: 'rgba(255,255,255,0.03)', position: 'absolute', top: '-15px', left: '-5px', zIndex: 0, fontFamily: 'var(--font-display)' }}>
                                        0{idx + 1}
                                    </div>
                                    <div style={{ position: 'relative', zIndex: 1 }}>
                                        <h3 style={{ fontSize: '16px', fontFamily: 'var(--font-display)', marginBottom: '15px' }}>{step.title}</h3>
                                        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '14px' }}>{step.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </section>
                )}

                {/* TESTIMONIALS SECTION */}
                {aboutData.testimonials.length > 0 && (
                    <section style={{ padding: '100px 0', borderTop: '1px solid var(--border-color)', marginBottom: '100px' }}>
                        <RevealText>
                            <h2 style={{ fontSize: isMobile ? '36px' : '72px', fontFamily: 'var(--font-display)', marginBottom: '60px' }}>
                                {aboutData.testimonialsTitle}
                            </h2>
                        </RevealText>

                        <div
                            ref={scrollContainerRef}
                            style={{
                                display: 'flex',
                                gap: '20px',
                                overflowX: 'auto',
                                paddingBottom: '30px',
                                scrollSnapType: 'x mandatory',
                                scrollbarWidth: 'none', // Firefox
                                msOverflowStyle: 'none', // IE
                            }}
                            className="hide-scrollbar"
                        >
                            {aboutData.testimonials.map((t) => (
                                <div key={t.id} style={{
                                    minWidth: isMobile ? '280px' : '380px',
                                    maxWidth: '400px',
                                    background: 'var(--surface-color)',
                                    padding: '32px',
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    scrollSnapAlign: 'start'
                                }}>
                                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '24px', fontStyle: 'italic', flex: 1 }}>"{t.content}"</p>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: t.photo ? `url(${t.photo}) center/cover` : '#222', border: '1px solid var(--border-color)' }} />
                                        <div>
                                            <div style={{ fontWeight: '700', fontSize: '12px', fontFamily: 'var(--font-display)' }}>{t.name}</div>
                                            <div style={{ color: 'var(--accent-color)', fontSize: '10px', fontWeight: 'bold' }}>{t.role}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

            </div>

            {/* STANDARD FOOTER */}
            <section id="contact" className="footer-section" style={{ marginTop: '100px', paddingBottom: '100px', overflow: 'hidden' }}>
                <div className="ticker-wrapper" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '40px 0' }}>
                    <motion.div
                        animate={{ x: [0, -1000] }}
                        transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
                        style={{ display: 'flex', whiteSpace: 'nowrap', gap: '50px' }}
                    >
                        {[...Array(10)].map((_, i) => (
                            <span key={i} style={{ fontSize: '80px', fontWeight: 900, fontFamily: 'var(--font-display)', color: 'transparent', WebkitTextStroke: '1px var(--text-muted)' }}>
                                KEEP IN TOUCH •
                            </span>
                        ))}
                    </motion.div>
                </div>
                <div className="container" style={{ marginTop: '80px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <div className="contact-links" style={{ display: 'flex', flexDirection: 'column', gap: '40px', fontFamily: 'var(--font-body)' }}>
                        <RevealText>
                            <a href={`mailto:${socials.footerEmail}`} className="clickable footer-email-link" style={{
                                fontSize: 'clamp(18px, 3vw, 36px)',
                                fontWeight: 600,
                                color: 'var(--accent-color)',
                                textDecoration: 'none',
                                fontFamily: 'var(--font-display)',
                                lineBreak: 'anywhere'
                            }}>
                                {socials.footerEmail}
                            </a>
                        </RevealText>

                        <div style={{ display: 'flex', gap: '30px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '10px' }}>
                            <RevealText><a href={socials.linkedin} target="_blank" rel="noopener noreferrer" className="clickable footer-sub-link">LINKEDIN ↗</a></RevealText>
                            <RevealText><a href={socials.instagram} target="_blank" rel="noopener noreferrer" className="clickable footer-sub-link">INSTAGRAM ↗</a></RevealText>
                            <RevealText><a href={`tel:${socials.phone}`} className="clickable footer-sub-link">{socials.phone}</a></RevealText>
                        </div>
                    </div>
                </div>

                <div className="footer-credits" style={{ marginTop: '100px', opacity: 0.3, fontSize: '11px', letterSpacing: '2px', textAlign: 'center' }} dangerouslySetInnerHTML={{ __html: footerText }} />
            </section>
        </div>
    );
}
