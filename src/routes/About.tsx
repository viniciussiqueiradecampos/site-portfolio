// Last updated: 2026-02-19 16:20
import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import Matter from 'matter-js';
import { motion } from 'framer-motion';
import {
    ChevronLeft, ChevronRight,
    Layers, Layout, Palette, PenTool,
    Code2, Monitor, Brush
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { aboutAPI, contentAPI, type AboutTestimonial, type AboutMemory } from '../lib/supabase';
import { trackPageView } from '../lib/analytics';
import { useTranslation } from 'react-i18next';
import { parseTranslatable } from '../lib/i18n-utils';

gsap.registerPlugin(ScrollTrigger);

// Physics Tags Component (Com Matter.js para Simulacao Real 2D)
const PhysicsTags = ({ isMobile, tags }: { isMobile: boolean; tags: string[] }) => {

    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef(Matter.Engine.create());
    const containersRef = useRef<(HTMLDivElement | null)[]>([]);
    const bodiesRef = useRef<{ body: Matter.Body, type: string, label?: string, icon?: any }[]>([]);
    const requestRef = useRef<number>(null);
    const [renderItems, setRenderItems] = useState<{ type: string, label?: string, icon?: any }[]>([]);

    console.log('🏗️ PhysicsTags Data:', { isMobile, tags });

    useEffect(() => {
        if (!sceneRef.current) return;

        const engine = engineRef.current;
        const world = engine.world;

        Matter.World.clear(world, false);
        Matter.Engine.clear(engine);

        engine.gravity.y = 1.8;
        engine.positionIterations = 30;
        engine.velocityIterations = 30;
        engine.enableSleeping = false;

        let ground: Matter.Body;
        let leftWall: Matter.Body;
        let rightWall: Matter.Body;
        let ceiling: Matter.Body;

        const updateBoundaries = () => {
            if (!sceneRef.current) return;
            const width = sceneRef.current.clientWidth;
            const height = sceneRef.current.clientHeight;

            if (ground) Matter.World.remove(world, [ground, leftWall, rightWall, ceiling]);

            ground = Matter.Bodies.rectangle(width / 2, height + 250, width, 500, {
                isStatic: true,
                friction: 1,
                restitution: 0.2,
                label: 'Ground'
            });

            leftWall = Matter.Bodies.rectangle(-500, height / 2, 1000, height * 2, { isStatic: true, friction: 0, restitution: 0.5, label: 'LeftWall' });
            rightWall = Matter.Bodies.rectangle(width + 500, height / 2, 1000, height * 2, { isStatic: true, friction: 0, restitution: 0.5, label: 'RightWall' });
            ceiling = Matter.Bodies.rectangle(width / 2, -500, width, 100, { isStatic: true });

            Matter.World.add(world, [ground, leftWall, rightWall, ceiling]);
        };

        updateBoundaries();

        const handleResize = () => {
            updateBoundaries();
            bodiesRef.current.forEach(b => Matter.Body.setStatic(b.body as Matter.Body, false));
        };
        window.addEventListener('resize', handleResize);

        const width = sceneRef.current.getBoundingClientRect().width;
        const items: { body: Matter.Body, type: string, label?: string, icon?: any }[] = [];

        const activeTags = tags.length > 0 ? tags : ["Digital Designer", "UI Designer", "Design", "São Paulo", "Brazil", "Portugal"];

        activeTags.forEach((tag, i) => {
            const tagHeight = isMobile ? 50 : 70;
            const charWidth = isMobile ? 10 : 16;
            const extraPadding = isMobile ? 60 : 100;
            const tagWidth = (tag.length * charWidth) + extraPadding;
            const col = i % 3;
            const row = Math.floor(i / 3);
            const startX = (width / 4) * (col + 1);
            const startY = -50 - (row * 80);

            const body = Matter.Bodies.rectangle(
                startX + (Math.random() * 20),
                startY,
                tagWidth,
                tagHeight,
                {
                    chamfer: { radius: isMobile ? 25 : 35 },
                    restitution: 0.2,
                    friction: 0.5,
                    frictionAir: 0.001,
                    density: 0.01,
                    slop: 0,
                    angle: (Math.random() - 0.5) * 0.1
                }
            );
            items.push({ body, type: 'tag', label: tag });
        });

        const designIcons = [
            { icon: <Layers size={isMobile ? 24 : 36} />, type: 'design-icon' },
            { icon: <Layout size={isMobile ? 24 : 36} />, type: 'design-icon' },
            { icon: <Palette size={isMobile ? 24 : 36} />, type: 'design-icon' },
            { icon: <PenTool size={isMobile ? 24 : 36} />, type: 'design-icon' },
            { icon: <Code2 size={isMobile ? 24 : 36} />, type: 'design-icon' },
            { icon: <Monitor size={isMobile ? 24 : 36} />, type: 'design-icon' },
            { icon: <Brush size={isMobile ? 24 : 36} />, type: 'design-icon' }
        ];

        designIcons.forEach((di, i) => {
            const radius = isMobile ? 25 : 35;
            const startX = (width / (designIcons.length + 1)) * (i + 1);
            const startY = -200 - (i * 80);

            const body = Matter.Bodies.circle(startX, startY, radius, {
                restitution: 0.2,
                friction: 0.5,
                frictionAir: 0.001,
                density: 0.01,
                slop: 0
            });
            items.push({ body, type: 'icon', icon: di.icon });
        });

        bodiesRef.current = items;
        Matter.World.add(world, items.map(i => i.body));

        // Trigger re-render so JSX picks up the new items
        setRenderItems(items.map(({ body: _body, ...rest }) => rest));

        const mouse = Matter.Mouse.create(sceneRef.current);
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: mouse,
            constraint: {
                stiffness: 0.2,
                render: { visible: false }
            }
        });
        Matter.World.add(world, mouseConstraint);

        mouseConstraint.mouse.element.removeEventListener("mousewheel", (mouseConstraint.mouse as any).mousewheel);
        mouseConstraint.mouse.element.removeEventListener("DOMMouseScroll", (mouseConstraint.mouse as any).mousewheel);

        const update = () => {
            Matter.Engine.update(engine, 1000 / 60);

            bodiesRef.current.forEach((b: any, idx: number) => {
                const el = containersRef.current[idx];
                if (el && b.body) {
                    const { x, y } = b.body.position;
                    const angle = b.body.angle;
                    el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) rotate(${angle}rad)`;
                }
            });
            requestRef.current = requestAnimationFrame(update);
        };
        requestRef.current = requestAnimationFrame(update);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            Matter.World.clear(world, false);
            Matter.Engine.clear(engine);
        };
    }, [isMobile, tags]);

    return (
        <div ref={sceneRef} style={{
            height: '100%',
            width: '100%',
            position: 'relative',
            cursor: 'grab',
            touchAction: 'none',
            overflow: 'visible',
            zIndex: 100
        }}>
            {renderItems.map((item: any, i: number) => {
                const isTag = item.type === 'tag';
                const isIcon = item.type === 'icon';
                const isDark = i % 2 === 0;

                return (
                    <div
                        key={i}
                        ref={el => { containersRef.current[i] = el; }}
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            transform: 'translate(-50%, -50%)',
                            background: isTag ? (isDark ? 'var(--surface-color)' : 'var(--bg-color)') : 'var(--accent-color)',
                            border: isTag ? '1px solid var(--border-color)' : 'none',
                            borderRadius: isTag ? (isMobile ? '25px' : '35px') : '50%',
                            padding: isTag ? (isMobile ? '10px 24px' : '20px 40px') : '0',
                            width: isTag ? 'auto' : (isMobile ? '50px' : '70px'),
                            height: isTag ? 'auto' : (isMobile ? '50px' : '70px'),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: isMobile ? '16px' : '24px',
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            color: isTag ? 'var(--text-color)' : 'var(--accent-contrast)',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                            zIndex: 110,
                            pointerEvents: 'none'
                        }}
                    >
                        {isTag && item.label}
                        {isIcon && (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {item.icon}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};


export default function About() {
    const { t, i18n } = useTranslation();
    const [isMobile, setIsMobile] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const [nameTitle, setNameTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [bioText, setBioText] = useState<string[]>([]);
    const [testimonials, setTestimonials] = useState<AboutTestimonial[]>([]);
    const [memories, setMemories] = useState<AboutMemory[]>([]);
    // Build Fix: Ensure line 246 is not problematic
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [pageVisible, setPageVisible] = useState(true);

    const heroRef = useRef<HTMLDivElement>(null);
    const memoriesPinRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        trackPageView('/about');
        document.title = `${t('nav.about')} | Vinicius Campos`;
        window.scrollTo(0, 0);
        return () => window.removeEventListener('resize', checkMobile);
    }, [i18n.language]);

    useEffect(() => {
        const loadData = async () => {
            const lang = i18n.language;
            try {
                const [, , pTitle, pSub, pBio, pVisible, testimonialsData, memoriesData, pSpotify] = await Promise.all([
                    contentAPI.getByKey('about.profile_photo'),
                    contentAPI.getByKey('about.reveal_image'),
                    contentAPI.getByKey('about.name_title'),
                    contentAPI.getByKey('about.subtitle'),
                    contentAPI.getByKey('about.bio_text'),
                    contentAPI.getByKey('about.visible'),
                    aboutAPI.getTestimonials(),
                    aboutAPI.getMemories(),
                    contentAPI.getByKey('about.spotify_embed_url')
                ]);

                if (pTitle) setNameTitle(parseTranslatable(pTitle.value, lang));
                if (pSub) setSubtitle(parseTranslatable(pSub.value, lang));
                if (pBio) setBioText([parseTranslatable(pBio.value, lang)]);
                if (pVisible) setPageVisible(pVisible.value === 'true');
                if (pSpotify) setSpotifyUrl(pSpotify.value);

                setTestimonials(testimonialsData.map(t => ({
                    ...t,
                    author_name: parseTranslatable(t.author_name, lang),
                    author_role: parseTranslatable(t.author_role, lang),
                    quote: parseTranslatable(t.quote, lang)
                })));
                setMemories(memoriesData);
            } catch (e) { console.error(e); } finally { setIsLoading(false); }
        };
        loadData();
    }, [i18n.language]);

    useLayoutEffect(() => {
        if (isLoading || isMobile) return;
        const lenis = new Lenis();
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);

        return () => {
            lenis.destroy();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [isLoading, isMobile]);

    if (!pageVisible) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Page is hidden</div>;
    if (isLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

    return (
        <div ref={containerRef} style={{ background: 'var(--bg-color)', minHeight: '100vh', overflowX: 'hidden' }}>

            {/* 1. HERO SECTION WITH PHYSICS TAGS & LARGE NAME */}
            <section
                ref={heroRef}
                style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    position: 'relative',
                    overflow: 'hidden',
                    background: 'var(--bg-color)',
                    paddingBottom: 0
                }}
            >
                <div style={{
                    position: 'absolute',
                    top: 'var(--header-height, 80px)',
                    left: 0,
                    right: 0,
                    bottom: isMobile ? '52vw' : '12.8vw', // Precise floor for the 2-line large title
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'visible'
                }}>
                    <PhysicsTags isMobile={isMobile} tags={["Digital Designer", "UI Designer", "Design", "São Paulo", "Brazil", "Portugal"]} />
                </div>

                <div style={{
                    position: 'relative',
                    zIndex: 1,
                    width: '100%',
                    pointerEvents: 'none',
                    lineHeight: 0.9,
                    overflow: 'visible',
                    paddingBottom: 0
                }}>
                    <h1
                        style={{
                            fontWeight: 950,
                            fontFamily: 'var(--font-display)',
                            margin: 0,
                            padding: isMobile ? '0' : '0 25px',
                            color: 'var(--text-color)',
                            textTransform: 'uppercase',
                            letterSpacing: '-0.06em',
                            width: isMobile ? '100vw' : '100%',
                            textAlign: 'center',
                            whiteSpace: isMobile ? 'normal' : 'nowrap',
                            lineHeight: 0.8,
                            userSelect: 'none',
                            WebkitUserSelect: 'none',
                            MozUserSelect: 'none',
                            msUserSelect: 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            fontSize: isMobile ? '1px' : '15vw'
                        }}
                    >
                        {isMobile ? (
                            <>
                                <span style={{ fontSize: '29vw', display: 'block', width: '100%', lineHeight: 0.7 }}>VINNY</span>
                                <span style={{ fontSize: '24vw', display: 'block', width: '100%', lineHeight: 0.7 }}>CAMPOS</span>
                            </>
                        ) : (
                            nameTitle || 'VINNY CAMPOS'
                        )}
                    </h1>
                </div>
            </section>

            {/* 2. PINNED BIO */}
            <div id="about-bio-section" ref={memoriesPinRef} style={{
                background: 'var(--bg-color)',
                minHeight: isMobile ? 'auto' : 'calc(100vh - var(--header-height))',
                position: 'relative',
                overflowX: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                scrollMarginTop: 'var(--header-height)',
                paddingBottom: '150px'
            }}>
                <div className="container" style={{
                    maxWidth: '1214px',
                    margin: '0 auto',
                    padding: isMobile ? '60px 5% 40px' : '0 5%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: isMobile ? '30px' : '60px',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                    width: '100%',
                    minHeight: isMobile ? 'auto' : '100vh',
                    position: 'relative',
                    zIndex: 5
                }}>
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: isMobile ? '30px' : '60px', textAlign: 'left', position: 'relative', zIndex: 20 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ height: '40px' }} />
                            <p style={{
                                fontSize: 'clamp(22px, 3.5vw, 32px)',
                                color: 'var(--text-color)',
                                fontWeight: 600,
                                lineHeight: 1.3,
                                margin: 0,
                                maxWidth: '900px'
                            }}>
                                {subtitle || t('about.bio_intro', "I am a Brazilian Designer based in Portugal, with international experience in Ireland.")}
                            </p>
                        </div>

                        <div style={{
                            fontSize: 'clamp(16px, 1.8vw, 20px)',
                            lineHeight: 1.6,
                            fontWeight: 450,
                            color: 'var(--text-muted)',
                            textAlign: 'left',
                            maxWidth: '100%',
                            columnCount: isMobile ? 1 : 2,
                            columnGap: isMobile ? '80px' : '80px',
                            columnFill: 'balance',
                            display: 'block'
                        }}>
                            {bioText.length > 0 ? (
                                bioText[0].split('\n\n').map((p, idx) => (
                                    <p key={idx} style={{
                                        marginBottom: '20px',
                                        display: 'block'
                                    }}>
                                        {p}
                                    </p>
                                ))
                            ) : (
                                <p>{t('about.loading_bio', 'Carregando biografia...')}</p>
                            )}
                        </div>

                        <div style={{ marginTop: '40px' }}>
                            <a
                                href="/cv"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="clickable"
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '16px 36px',
                                    background: 'var(--accent-color)',
                                    color: 'var(--accent-contrast)',
                                    borderRadius: '100px',
                                    fontSize: '14px',
                                    fontWeight: 900,
                                    textDecoration: 'none',
                                    letterSpacing: '2px',
                                    textTransform: 'uppercase',
                                    transition: 'all 0.3s ease',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                                }}
                            >
                                {t('about.view_cv', 'VIEW FULL CV')}
                                <span style={{ fontSize: '18px' }}>→</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>


            {/* 5. TESTIMONIALS */}
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', marginBottom: '150px', position: 'relative' }}>
                <motion.div
                    style={{ marginBottom: '60px', position: 'relative', zIndex: 20 }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px 200px 0px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                            <span style={{ fontSize: '12px', letterSpacing: '4px', color: 'var(--accent-color)', fontWeight: 900, textTransform: 'uppercase' }}>
                                {t('about.collaboration_label', 'Collaboration')}
                            </span>
                            <h3 style={{
                                fontSize: isMobile ? '24px' : 'clamp(28px, 3.5vw, 48px)',
                                fontWeight: 900,
                                textTransform: 'none',
                                letterSpacing: '-1px',
                                margin: '10px 0',
                                maxWidth: isMobile ? '100%' : '900px',
                                lineHeight: 1.1
                            }} dangerouslySetInnerHTML={{ __html: t('about.colleagues_title', 'Colleagues who<br />worked with me') }}></h3>
                        </div>
                        {testimonials.length > (isMobile ? 1 : 2) && (
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                                <button
                                    onClick={() => setTestimonialIndex(prev => Math.max(0, prev - 1))}
                                    style={{
                                        width: '44px', height: '44px', borderRadius: '50%', background: 'var(--surface-color)',
                                        border: '1px solid var(--border-color)', color: 'var(--text-color)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        opacity: testimonialIndex === 0 ? 0.3 : 1
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setTestimonialIndex(prev => Math.min(testimonials.length - (isMobile ? 1 : 2), prev + 1))}
                                    style={{
                                        width: '44px', height: '44px', borderRadius: '50%', background: 'var(--surface-color)',
                                        border: '1px solid var(--border-color)', color: 'var(--text-color)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                        opacity: testimonialIndex >= testimonials.length - (isMobile ? 1 : 2) ? 0.3 : 1
                                    }}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="testimonials-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '30px'
                }}>
                    {(testimonials && testimonials.length > 0) ? (
                        testimonials.slice(testimonialIndex, testimonialIndex + (isMobile ? 1 : 2)).map((item, idx) => (
                            <motion.div
                                key={item.id || idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: idx * 0.1 }}
                                className="testimonial-card"
                                style={{
                                    padding: isMobile ? '30px' : '40px',
                                    background: 'var(--surface-color)',
                                    borderRadius: '32px',
                                    border: '1px solid var(--border-color)',
                                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    minHeight: isMobile ? 'auto' : '350px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        overflow: 'hidden',
                                        border: '1px solid var(--border-color)',
                                        background: 'var(--bg-color)'
                                    }}>
                                        {item.author_image && (
                                            <img src={item.author_image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={item.author_name} />
                                        )}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: '800', fontSize: '16px', color: 'var(--text-color)' }}>{item.author_name}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>{item.author_role}</div>
                                    </div>
                                </div>

                                <p style={{
                                    fontSize: isMobile ? '15px' : '17px',
                                    lineHeight: 1.6,
                                    color: 'var(--text-color)',
                                    margin: '0',
                                    background: 'rgba(255,255,255,0.02)',
                                    padding: isMobile ? '20px' : '30px',
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)',
                                    fontWeight: 400,
                                    flex: 1,
                                    overflowWrap: 'break-word',
                                    wordBreak: 'break-word',
                                    width: '100%'
                                }}>
                                    "{item.quote}"
                                </p>
                            </motion.div>
                        ))
                    ) : null}
                </div>
            </div>

            {/* 6. CURRENT INSPIRATION & MEMORIES */}
            <section style={{
                padding: isMobile ? '80px 0' : '150px 0',
                background: 'var(--bg-color)',
                position: 'relative',
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', position: 'relative', zIndex: 10 }}>
                    <div style={{ textAlign: 'center', marginBottom: '100px' }}>
                        <h2 style={{
                            fontSize: 'clamp(40px, 8vw, 100px)',
                            fontWeight: 900,
                            letterSpacing: '-4px',
                            textTransform: 'uppercase',
                            fontFamily: 'var(--font-display)',
                            margin: 0,
                            lineHeight: 0.9,
                            color: 'var(--text-color)'
                        }}>
                            {t('about.inspiration_title', 'Current Inspiration')}
                        </h2>
                    </div>

                    {/* Spotify Embed Centered */}
                    {spotifyUrl && (
                        <div style={{
                            maxWidth: '700px',
                            margin: '0 auto',
                            position: 'relative',
                            zIndex: 20
                        }}>
                            <div style={{ borderRadius: '24px', overflow: 'hidden', border: 'none', background: 'transparent' }}>
                                <iframe
                                    src={spotifyUrl}
                                    width="100%"
                                    height="152"
                                    frameBorder="0"
                                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                                    loading="lazy"
                                    style={{ border: 'none' }}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating Memories (Parallax Background) */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                    {memories.map((mem, idx) => {
                        const delay = idx * 0.2;
                        return (
                            <motion.div
                                key={mem.id || idx}
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 0.4, scale: 1 }}
                                viewport={{ once: false }}
                                animate={{
                                    y: [0, -20, 0],
                                }}
                                transition={{
                                    y: {
                                        duration: 5 + Math.random() * 5,
                                        repeat: Infinity,
                                        ease: "linear"
                                    },
                                    opacity: { duration: 1, delay },
                                    scale: { duration: 1, delay },
                                    default: { duration: 1, delay }
                                }}
                                style={{
                                    position: 'absolute',
                                    left: mem.position_x || `${Math.random() * 80 + 10}%`,
                                    top: mem.position_y || `${Math.random() * 80 + 10}%`,
                                    width: mem.width || '250px',
                                    zIndex: 5,
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    aspectRatio: mem.aspect_ratio || '4/3',
                                    filter: 'grayscale(100%) contrast(1.1)',
                                }}
                            >
                                <img
                                    src={mem.image_url}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
