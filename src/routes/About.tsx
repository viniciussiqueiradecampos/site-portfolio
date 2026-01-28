import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
    ChevronLeft, ChevronRight, ArrowDown,
    Search, Rocket, Lightbulb, Code, Target, Heart, Star, Coffee,
    Palette, Music, Camera, Gamepad2, Brain, Globe, Laptop, Zap,
    Terminal, Layout, Cpu, Database, Smartphone, Map, PenTool, MessageCircle,
    Activity, Wifi, Wrench, Brush, Cloud, Book, Mail, Phone, MapPin,
    Users, Check, Layers, Monitor, Tablet, Watch, Headphones, Video,
    ShoppingBag, CreditCard, Wallet, Calendar, Bell, Lock, Unlock, Key,
    Eye, EyeOff, Filter, Sliders, Navigation, ExternalLink, Share,
    Play, Pause, Square, Triangle, Smile, Flame, Sun, Moon, Wind,
    Trophy, Medal, Box, Anchor, Compass, Feather, Pen, Pencil,
    Columns, Grid, List
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import { aboutAPI, contentAPI, type AboutHobby, type AboutTestimonial, type AboutMemory } from '../lib/supabase';
import { trackPageView } from '../lib/analytics';

gsap.registerPlugin(ScrollTrigger);

const SELECTABLE_ICONS: Record<string, any> = {
    'Search': Search, 'Rocket': Rocket, 'Lightbulb': Lightbulb, 'Code': Code,
    'Target': Target, 'Heart': Heart, 'Star': Star, 'Coffee': Coffee,
    'Palette': Palette, 'Music': Music, 'Camera': Camera, 'Gamepad2': Gamepad2,
    'Brain': Brain, 'Globe': Globe, 'Laptop': Laptop, 'Zap': Zap,
    'Terminal': Terminal, 'Layout': Layout, 'Cpu': Cpu, 'Database': Database,
    'Smartphone': Smartphone, 'Map': Map, 'PenTool': PenTool, 'MessageCircle': MessageCircle,
    'Activity': Activity, 'Wifi': Wifi, 'Wrench': Wrench, 'Brush': Brush, 'Cloud': Cloud, 'Book': Book,
    'Mail': Mail, 'Phone': Phone, 'MapPin': MapPin, 'Users': Users, 'Check': Check, 'Layers': Layers,
    'Monitor': Monitor, 'Tablet': Tablet, 'Watch': Watch, 'Headphones': Headphones, 'Video': Video,
    'ShoppingBag': ShoppingBag, 'CreditCard': CreditCard, 'Wallet': Wallet, 'Calendar': Calendar,
    'Bell': Bell, 'Lock': Lock, 'Unlock': Unlock, 'Key': Key, 'Eye': Eye, 'EyeOff': EyeOff,
    'Filter': Filter, 'Sliders': Sliders, 'Navigation': Navigation, 'ExternalLink': ExternalLink,
    'Share': Share, 'Play': Play, 'Pause': Pause, 'Square': Square, 'Triangle': Triangle,
    'Smile': Smile, 'Flame': Flame, 'Sun': Sun, 'Moon': Moon, 'Wind': Wind, 'Trophy': Trophy,
    'Medal': Medal, 'Box': Box, 'Anchor': Anchor, 'Compass': Compass, 'Feather': Feather,
    'Pen': Pen, 'Pencil': Pencil, 'Columns': Columns, 'Grid': Grid, 'List': List
};

// Helper component for Scrollytelling text effect
const ScrollyWord = ({ word, progress, start, end, style }: { word: string, progress: any, start: number, end: number, style?: any }) => {
    const opacity = useTransform(progress, [start, end], [0.1, 1]); // Starts semi-transparent, becomes fully opaque
    const y = useTransform(progress, [start, end], [5, 0]); // Slight slide-up effect
    return <motion.span style={{ ...style, opacity, y, marginRight: '6px', display: 'inline-block' }}>{word}</motion.span>;
};

const ScrollyMemory = ({ m, i, progress, start, end, isMobile }: { m: AboutMemory, i: number, progress: any, start: number, end: number, isMobile: boolean }) => {
    const x = useTransform(progress, [start, end], ["120%", "-120%"]);
    const opacity = useTransform(progress, [start, start + 0.1, end - 0.1, end], [0, 1, 1, 0]);
    const rotate = i % 2 === 0 ? -3 : 3;

    return (
        <motion.div
            style={{
                position: 'absolute',
                left: x,
                top: `${15 + (i % 3) * 25}%`,
                zIndex: 100,
                opacity,
                flexShrink: 0,
                width: isMobile ? '280px' : (m.width || '450px'),
                aspectRatio: m.aspect_ratio || '1/1',
                background: '#000',
                borderRadius: '32px',
                border: '1px solid rgba(255,255,255,0.1)',
                overflow: 'hidden',
                rotate,
                boxShadow: '0 50px 100px rgba(0,0,0,0.5)',
                pointerEvents: 'none'
            }}
        >
            <img src={m.image_url} alt="Memory" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </motion.div>
    );
};

// Typewriter Component for the Hero
const TypewriterGreeting = ({ languages }: { languages: string[] }) => {
    const [index, setIndex] = useState(0);
    const [subIndex, setSubIndex] = useState(0);
    const [reverse, setReverse] = useState(false);
    const [blink, setBlink] = useState(true);

    // Typewriter effect
    useEffect(() => {
        if (subIndex === languages[index].length + 1 && !reverse) {
            setTimeout(() => setReverse(true), 2000); // Wait before erasing
            return;
        }

        if (subIndex === 0 && reverse) {
            setReverse(false);
            setIndex((prev) => (prev + 1) % languages.length);
            return;
        }

        const timeout = setTimeout(() => {
            setSubIndex((prev) => prev + (reverse ? -1 : 1));
        }, reverse ? 40 : 100);

        return () => clearTimeout(timeout);
    }, [subIndex, index, reverse, languages]);

    // Cursor blink
    useEffect(() => {
        const timeout2 = setTimeout(() => {
            setBlink((prev) => !prev);
        }, 500);
        return () => clearTimeout(timeout2);
    }, [blink]);

    return (
        <span style={{ position: 'relative' }}>
            {`${languages[index].substring(0, subIndex)}`}
            <span style={{ opacity: blink ? 1 : 0, color: 'var(--accent-color)' }}>|</span>
        </span>
    );
};

export default function About() {
    const languages = ["Hello", "Olá", "Hola", "Dia dhuit", "Ciao", "Bonjour", "Konnichiwa", "Namaste", "Salaam", "Guten Tag", "Nǐ hǎo", "Aloha"];
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [isLoading, setIsLoading] = useState(true);

    const [profilePhoto, setProfilePhoto] = useState("");
    const [revealImage, setRevealImage] = useState("");
    const [nameTitle, setNameTitle] = useState("");
    const [subtitle, setSubtitle] = useState("");
    const [bioText, setBioText] = useState<string[]>([]);
    const [memories, setMemories] = useState<AboutMemory[]>([]);
    const [hobbies, setHobbies] = useState<AboutHobby[]>([]);
    const [testimonials, setTestimonials] = useState<AboutTestimonial[]>([]);
    const [spotifyUrl, setSpotifyUrl] = useState("");
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [pageVisible, setPageVisible] = useState(true);

    const heroRef = useRef<HTMLDivElement>(null);
    const memoriesPinRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [pPhoto, pReveal, pTitle, pSub, pBio, pSpotify, pVisible, hobbiesData, testimonialsData, memoriesData] = await Promise.all([
                    contentAPI.getByKey('about.profile_photo'),
                    contentAPI.getByKey('about.reveal_image'),
                    contentAPI.getByKey('about.name_title'),
                    contentAPI.getByKey('about.subtitle'),
                    contentAPI.getByKey('about.bio_text'),
                    contentAPI.getByKey('about.spotify_embed_url'),
                    contentAPI.getByKey('about.visible'),
                    aboutAPI.getHobbies(),
                    aboutAPI.getTestimonials(),
                    aboutAPI.getMemories()
                ]);

                if (pPhoto) setProfilePhoto(pPhoto.value);
                if (pReveal) setRevealImage(pReveal.value);
                if (pTitle) setNameTitle(pTitle.value);
                if (pSub) setSubtitle(pSub.value);
                if (pBio) setBioText(pBio.value.split(" "));
                if (pSpotify) setSpotifyUrl(pSpotify.value);
                if (pVisible) setPageVisible(pVisible.value === 'true');

                setHobbies(hobbiesData);
                setTestimonials(testimonialsData);
                setMemories(memoriesData);
            } catch (e) { console.error(e); } finally { setIsLoading(false); }
        };
        loadData();
    }, []);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        trackPageView('/about');
        window.scrollTo(0, 0);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useLayoutEffect(() => {
        if (isLoading || isMobile) return;
        const lenis = new Lenis();
        function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);

        const ctx = gsap.context(() => {
            gsap.from(".step-card", {
                y: 100, opacity: 0, stagger: 0.2, duration: 1, ease: "power4.out",
                scrollTrigger: { trigger: ".steps-grid", start: "top 80%" }
            });
        }, containerRef);

        const memoriesPin = memoriesPinRef.current;
        if (memoriesPin) {
            ScrollTrigger.create({
                trigger: memoriesPin,
                start: "top top",
                end: () => `+=${Math.max(2500, memories.length * 600)}`,
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                invalidateOnRefresh: true,
                pinSpacing: true
            });
        }

        return () => {
            lenis.destroy();
            ctx.revert();
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, [isLoading, isMobile, memories.length]);

    const { scrollYProgress: bioProgress } = useScroll({
        target: memoriesPinRef,
        offset: ["start start", "end end"]
    });

    if (!pageVisible) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Page is hidden</div>;
    if (isLoading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

    return (
        <div ref={containerRef} style={{ background: 'var(--bg-color)', minHeight: '100vh', overflowX: 'hidden' }}>

            {/* 1. HERO SECTION WITH CLEAN REVEAL */}
            <section
                ref={heroRef}
                style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                    backgroundImage: revealImage ? `url(${revealImage})` : `url(${profilePhoto})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1 }} />

                <div style={{ position: 'relative', zIndex: 2, pointerEvents: 'none', width: '100%', padding: '0 5%', textAlign: 'center' }}>
                    <h1
                        style={{
                            fontSize: 'clamp(50px, 12vw, 120px)',
                            fontWeight: 950,
                            fontFamily: 'var(--font-display)',
                            margin: 0,
                            lineHeight: 1,
                            color: '#fff',
                            textTransform: 'uppercase',
                            letterSpacing: '-2px'
                        }}
                    >
                        <TypewriterGreeting languages={languages} />
                    </h1>
                    {/* Clean Reveal (Full quality, no opacity filter) */}


                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        style={{ marginTop: '30px' }}
                    >
                        <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 700 }}>
                            Learn a bit more about me!
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    style={{ position: 'absolute', bottom: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}
                >
                    <ArrowDown size={32} color="var(--accent-color)" />
                </motion.div>
            </section>

            {/* 2. PINNED BIO + MEMORIES OVERLAY */}
            <div ref={memoriesPinRef} style={{ background: 'var(--bg-color)', minHeight: isMobile ? 'auto' : '100vh', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="container" style={{
                    maxWidth: '1214px',
                    margin: '0 auto',
                    padding: isMobile ? '60px 5% 40px' : '0 5%',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '30px' : '40px', // Reduced gap significantly
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '100%',
                    minHeight: isMobile ? 'auto' : '100vh',
                    position: 'relative',
                    zIndex: 5
                }}>
                    {/* Portrait Photo (Smaller - max 450px) */}
                    <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '400px', flexShrink: 0 }}>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 1 }}
                            style={{
                                width: '100%',
                                maxHeight: isMobile ? '50vh' : '65vh', // Reduced height
                                aspectRatio: '545/699',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                                border: '1px solid rgba(255,255,255,0.05)',
                                margin: '0 auto'
                            }}
                        >
                            <img src={profilePhoto} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Profile" />
                        </motion.div>
                    </div>

                    {/* Content Column (Right - 580px) */}
                    <div style={{ width: '100%', maxWidth: isMobile ? '100%' : '580px', display: 'flex', flexDirection: 'column', gap: isMobile ? '30px' : '40px', textAlign: 'left' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <h2 style={{
                                fontSize: 'clamp(40px, 5vw, 60px)', // More responsive font size
                                fontWeight: 900,
                                lineHeight: 1,
                                margin: 0,
                                color: 'var(--accent-color)',
                                letterSpacing: '-2px',
                                textTransform: 'uppercase',
                                fontFamily: 'var(--font-display)'
                            }}>
                                {nameTitle.split(' ').map((n, i) => <div key={i}>{n}</div>)}
                            </h2>
                            <p style={{
                                fontSize: '19.5px',
                                color: 'var(--text-color)',
                                fontWeight: 700,
                                letterSpacing: '-1.17px',
                                margin: 0
                            }}>
                                {subtitle}
                            </p>
                        </div>

                        <div style={{
                            fontSize: '19.5px',
                            lineHeight: 1.43,
                            fontWeight: 400,
                            color: 'var(--text-color)',
                            textAlign: 'left',
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            maxWidth: '100%',
                            paddingRight: '20px' // Margem extra para não tocar o final
                        }}>
                            {isMobile ? bioText.join(' ') : bioText.map((word, i) => {
                                // Dynamic calculation for each word's animation start/end based on scroll progress
                                // We want the text to finish revealing before the section engaging ends
                                const step = 0.8 / bioText.length;
                                const start = 0.05 + (i * step);
                                const end = start + step;
                                return (
                                    <ScrollyWord
                                        key={`bio-${i}`}
                                        word={word}
                                        progress={bioProgress}
                                        start={start}
                                        end={end}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Memories Overlay (Desktop) */}
                {memories.length > 0 && !isMobile && (
                    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10 }}>
                        {memories.map((m, i) => {
                            const startM = (i * (1 / memories.length)) * 0.8;
                            const endM = startM + 0.5;
                            return <ScrollyMemory key={m.id || i} m={m} i={i} progress={bioProgress} start={startM} end={endM} isMobile={false} />;
                        })}
                    </div>
                )}
            </div>

            {/* Mobile Memories List */}
            {
                memories.length > 0 && isMobile && (
                    <div className="container" style={{ padding: '0 5% 60px', overflowX: 'auto' }}>
                        <div style={{ display: 'flex', gap: '20px' }} className="hide-scrollbar">
                            {memories.map((m, i) => (
                                <div key={m.id || i} style={{ flexShrink: 0, width: '280px', background: '#000', padding: '0', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                                    <img src={m.image_url} alt="Memory" style={{ width: '100%', display: 'block' }} />
                                </div>
                            ))}
                        </div>
                    </div>
                )
            }


            {/* 4. HOBBIES & INTERESTS - BENTO DESIGN */}
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', marginTop: '200px', marginBottom: '150px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px 200px 0px" }}
                    transition={{ duration: 0.6 }}
                >
                    <span style={{ fontSize: '12px', letterSpacing: '4px', color: 'var(--accent-color)', fontWeight: 900, textTransform: 'uppercase', display: 'block', marginBottom: '15px' }}>Personal</span>
                    <h3 style={{ fontSize: 'clamp(30px, 4vw, 50px)', fontWeight: 950, marginBottom: '60px', textTransform: 'uppercase', letterSpacing: '-2px' }}>Hobbies &<br />Interests</h3>
                </motion.div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '20px'
                }}>
                    {hobbies.map((hobby, i) => {
                        const Icon = SELECTABLE_ICONS[hobby.icon_name as keyof typeof SELECTABLE_ICONS] || MessageCircle;
                        return (
                            <motion.div
                                key={hobby.id}
                                whileHover={{ scale: 1.02 }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    background: 'var(--surface-color)',
                                    borderRadius: '24px',
                                    padding: '30px',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: hobby.color || 'var(--accent-color)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#000',
                                    boxShadow: `0 10px 20px ${(hobby.color || 'var(--accent-color)')}33`
                                }}>
                                    <Icon size={18} />
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-color)', margin: '0 0 8px' }}>{hobby.text}</h4>
                                    <div style={{ width: '40px', height: '2px', background: hobby.color || 'var(--accent-color)', borderRadius: '2px' }} />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* 5. TESTIMONIALS - FIGMA STACKED GRID */}
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', marginBottom: '150px', position: 'relative' }}>
                <motion.div
                    style={{ marginBottom: '60px' }}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "0px 0px 200px 0px" }}
                    transition={{ duration: 0.6 }}
                >
                    <span style={{ fontSize: '12px', letterSpacing: '4px', color: 'var(--accent-color)', fontWeight: 900, textTransform: 'uppercase' }}>Collaboration</span>
                    <h3 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '-2px', margin: '10px 0' }}>Client<br />Feedback</h3>
                </motion.div>

                <div style={{ position: 'relative', minHeight: '400px' }}>
                    {testimonials.length > 2 && (
                        <div style={{ position: 'absolute', top: '-80px', right: 0, display: 'flex', gap: '10px' }}>
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
                                onClick={() => setTestimonialIndex(prev => Math.min(testimonials.length - 2, prev + 1))}
                                style={{
                                    width: '44px', height: '44px', borderRadius: '50%', background: 'var(--surface-color)',
                                    border: '1px solid var(--border-color)', color: 'var(--text-color)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                    opacity: testimonialIndex >= testimonials.length - 2 ? 0.3 : 1
                                }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    )}

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
                                        padding: '40px',
                                        background: 'var(--surface-color)',
                                        borderRadius: '32px',
                                        border: `1px solid var(--border-color)`,
                                        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        minHeight: '350px'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                                        <div style={{
                                            width: '44px',
                                            height: '44px',
                                            borderRadius: '50%',
                                            overflow: 'hidden',
                                            border: `1px solid var(--border-color)`,
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
                                        fontSize: '17px',
                                        lineHeight: 1.6,
                                        color: 'var(--text-color)',
                                        margin: '0',
                                        background: 'var(--bg-color)',
                                        padding: '24px',
                                        borderRadius: '16px',
                                        border: `1px solid var(--border-color)`,
                                        fontWeight: 500,
                                        flex: 1
                                    }}>
                                        "{item.quote}"
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div style={{ color: 'var(--text-muted)' }}>No testimonials yet.</div>
                        )}
                    </div>
                </div>
            </div>

            {/* 6. SPOTIFY */}
            {
                spotifyUrl && (
                    <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%', marginBottom: '120px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: 'clamp(24px, 3vw, 40px)', fontWeight: 900, marginBottom: '40px', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Inspiration</h3>
                        <div style={{ maxWidth: '700px', margin: '0 auto', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 30px 60px rgba(0,0,0,0.5)', border: '1px solid #111', background: '#050505' }}>
                            <iframe style={{ borderRadius: '12px' }} src={spotifyUrl} width="100%" height="152" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
                        </div>
                    </div>
                )
            }

            <div style={{ textAlign: 'center', paddingBottom: '100px', opacity: 0.3 }}>
                <p style={{ fontSize: '12px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 700 }}>End of transmission</p>
            </div>
        </div >
    );
}
