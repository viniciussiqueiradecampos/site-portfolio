import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';

const Reveal = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
    <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
    >
        {children}
    </motion.div>
);



const ImageCarousel = ({ images }: { images: string[] }) => {
    const [index, setIndex] = useState(0);

    const next = () => setIndex((prev) => (prev + 1) % images.length);
    const prev = () => setIndex((prev) => (prev - 1 + images.length) % images.length);

    return (
        <div style={{ position: 'relative', width: '100%', height: '70vh', overflow: 'hidden', borderRadius: 'var(--radius-lg)' }}>
            <AnimatePresence mode="wait">
                <motion.img
                    key={index}
                    src={images[index]}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </AnimatePresence>

            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', pointerEvents: 'none' }}>
                <button
                    onClick={prev}
                    className="clickable"
                    style={{
                        pointerEvents: 'auto',
                        background: 'rgba(0,0,0,0.8)',
                        border: '1.5px solid rgba(255,255,255,0.4)',
                        color: '#fff',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={next}
                    className="clickable"
                    style={{
                        pointerEvents: 'auto',
                        background: 'rgba(0,0,0,0.8)',
                        border: '1.5px solid rgba(255,255,255,0.4)',
                        color: '#fff',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <ChevronRight size={24} />
                </button>
            </div>

            <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                {images.map((_, i) => (
                    <div
                        key={i}
                        style={{
                            width: i === index ? '28px' : '10px',
                            height: '10px',
                            borderRadius: '10px',
                            background: '#000',
                            border: '1.5px solid #fff',
                            opacity: i === index ? 1 : 0.6,
                            transition: 'all 0.3s ease'
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default function Teste2() {
    useTranslation();
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const checkTheme = () => {
            setIsDarkMode(document.documentElement.getAttribute('data-theme') === 'dark');
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const mutedColor = isDarkMode ? '#E5E5E5' : '#1F1F1F';
    const borderColor = isDarkMode ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)';



    const projectImages = [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2000",
        "https://images.unsplash.com/photo-1522542550221-31fd1920652e?auto=format&fit=crop&q=80&w=2000"
    ];

    const detailSections = [
        {
            title: "Navegação Intuitive",
            text: "Implementamos um sistema de filtros avançado que permite aos usuários encontrar produtos específicos em segundos. A estrutura foi pensada para reduzir o ruído visual e focar na conversão.",
            image: "https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?auto=format&fit=crop&q=80&w=1200"
        },
        {
            title: "Checkout em um Passo",
            text: "O processo de finalização de compra foi otimizado para ser o mais rápido possível. Minimalismo não é apenas estética, é eficiência operacional para o usuário final.",
            image: "https://images.unsplash.com/photo-1556742044-3c52d6e88c62?auto=format&fit=crop&q=80&w=1200"
        },
        {
            title: "Performance Extrema",
            text: "Utilizamos tecnologias de ponta para garantir carregamento instantâneo. Cada milissegundo conta quando o assunto é experiência premium.",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=1200"
        }
    ];

    return (
        <div style={{
            backgroundColor: 'var(--bg-color)',
            color: 'var(--text-color)',
            fontFamily: '"Inter", sans-serif',
            minHeight: '100vh',
            paddingTop: 'var(--header-height)',
            transition: 'background-color 0.5s ease, color 0.5s ease'
        }}>
            {/* Hero Section */}
            <section style={{ padding: '80px 5% 40px' }}>
                {/* Client Name */}
                <Reveal>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px' }}>
                        <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em' }}>ROCKETSEAT</span>
                        <span style={{ fontSize: '18px', fontWeight: 500, color: mutedColor }}>Para Empresas</span>
                    </div>
                </Reveal>

                <div style={{ display: 'flex', gap: '60px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                    {/* Value Proposition Title & Tags */}
                    <div style={{ flex: '2 1 600px' }}>
                        <Reveal delay={0.1}>
                            <h1 className="hero-title-inter" style={{
                                fontSize: 'clamp(20px, 3.5vw, 36px)',
                                margin: '0 0 40px 0',
                                color: 'var(--text-color)'
                            }}>
                                Aumentando a percepção de valor<br />através do novo design
                            </h1>
                        </Reveal>

                        {/* Portfolio Tags (Below Title) */}
                        <Reveal delay={0.2}>
                            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                {['UI DESIGN', 'LANDING PAGE', 'REDESIGN'].map((tag) => (
                                    <span key={tag} style={{
                                        padding: '8px 20px',
                                        backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                        borderRadius: '50px',
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        letterSpacing: '0.5px',
                                        color: 'var(--text-color)',
                                        textTransform: 'uppercase'
                                    }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </Reveal>
                    </div>

                    {/* Metadata Grid (Right Side) */}
                    <div style={{ flex: '1 1 300px', borderTop: `1.5px solid ${borderColor}` }}>
                        {[
                            { label: 'LOCAL', value: 'BRASIL BR' },
                            { label: 'DURAÇÃO', value: 'DOIS MESES' },
                            { label: 'ANO', value: '2025' }
                        ].map((item, i) => (
                            <Reveal key={i} delay={0.3 + i * 0.1}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '24px 0',
                                    borderBottom: `1.5px solid ${borderColor}`
                                }}>
                                    <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '2px', color: mutedColor }}>{item.label}</span>
                                    <span style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase' }}>{item.value}</span>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: '80px 5% 40px', maxWidth: '1000px' }}>
                <Reveal>
                    <p style={{
                        fontSize: 'clamp(18px, 3vw, 24px)',
                        lineHeight: 1.5,
                        fontWeight: 400,
                        letterSpacing: '-0.01em',
                        color: 'var(--text-color)',
                        fontFamily: '"Inter", sans-serif !important',
                        textTransform: 'none'
                    }}>
                        O Poodium é uma plataforma inovadora que redefine a experiência de compra online.
                        Nosso objetivo foi criar uma interface que fosse ao mesmo tempo funcional e
                        visualmente impactante, elevando a percepção de marca do cliente.
                    </p>
                </Reveal>
            </section>

            {/* Project Steps Section - Clean Grid */}
            <section style={{ padding: '120px 12%' }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '60px', flexWrap: 'wrap', gap: '20px' }}>
                        <Reveal>
                            <h2 className="hero-title-inter" style={{
                                fontSize: 'clamp(24px, 4vw, 32px)',
                                margin: 0,
                                color: 'var(--text-color)'
                            }}>Etapas do projeto</h2>
                        </Reveal>
                        <Reveal delay={0.1}>
                            <p style={{ fontSize: '11px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase', color: mutedColor, margin: 0 }}>O processo é a chave</p>
                        </Reveal>
                    </div>

                    <div className="steps-grid" style={{
                        display: 'grid',
                        gap: '40px'
                    }}>
                        {[
                            {
                                num: '01',
                                name: 'DESCOBERTA',
                                desc: 'Definição do escopo, objetivos e entendimento do problema.',
                                tags: 'BRIEFING / PESQUISAS / IMERSÃO'
                            },
                            {
                                num: '02',
                                name: 'IDEAÇÃO',
                                desc: 'Geração de ideais e soluções estratégicas para o projeto.',
                                tags: 'MOODBOARD / WIREFRAME / COPY'
                            },
                            {
                                num: '03',
                                name: 'PROTOTIPAÇÃO',
                                desc: 'Exploração detalhada nas cores, imagens, ilustrações e ícones.',
                                tags: 'VISUAL / PROTÓTIPO NAVEGÁVEL / TESTES'
                            },
                            {
                                num: '04',
                                name: 'ENTREGA',
                                desc: 'Organização, fechamento e apresentação do projeto.',
                                tags: 'DOCUMENTAÇÃO / STYLE GUIDE / HANDOFF'
                            }
                        ].map((step, i) => (
                            <div key={i} style={{
                                padding: 0,
                                backgroundColor: 'transparent',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '24px',
                                minHeight: 'auto'
                            }} className="step-item">
                                <Reveal delay={i * 0.1}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        backgroundColor: 'var(--text-color)',
                                        color: 'var(--bg-color)',
                                        padding: '6px 16px',
                                        borderRadius: '50px',
                                        alignSelf: 'flex-start'
                                    }}>
                                        <span style={{ fontSize: '10px', fontWeight: 900 }}>{step.num}</span>
                                        <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.5px' }}>{step.name}</span>
                                    </div>
                                    <p style={{
                                        fontSize: '15px',
                                        fontWeight: 400,
                                        lineHeight: 1.6,
                                        marginTop: '20px',
                                        color: 'var(--text-color)',
                                        fontFamily: '"Inter", sans-serif !important'
                                    }}>
                                        {step.desc}
                                    </p>
                                    <div style={{ marginTop: 'auto', paddingTop: '40px' }}>
                                        <p style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '1px', color: mutedColor, textTransform: 'uppercase' }}>
                                            {step.tags}
                                        </p>
                                    </div>
                                </Reveal>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Carousel Showcase (Centered with side margins) */}
            <section style={{ padding: '80px 5%' }}>
                <Reveal>
                    <ImageCarousel images={projectImages} />
                </Reveal>
            </section>

            {/* Detail Layout Sections (Alternating 70/30) */}
            <section style={{ padding: '120px 5%' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '160px' }}>
                    {detailSections.map((section, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            flexDirection: idx % 2 === 0 ? 'row' : 'row-reverse',
                            gap: '5vw',
                            alignItems: 'flex-start',
                            flexWrap: 'wrap'
                        }}>
                            {/* Image Part (70%) */}
                            <div style={{ flex: '1 1 65%', minWidth: '300px' }}>
                                <Reveal>
                                    <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', height: 'clamp(300px, 60vh, 800px)', border: `2px solid ${borderColor}` }}>
                                        <img src={section.image} alt={section.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                </Reveal>
                            </div>

                            {/* Text Part (30%) */}
                            <div style={{ flex: '1 1 25%', minWidth: '250px' }}>
                                <Reveal delay={0.2}>
                                    <div style={{ paddingTop: '20px' }}>
                                        <h3 style={{
                                            fontSize: '28px',
                                            fontWeight: 800,
                                            marginBottom: '20px',
                                            color: 'var(--text-color)',
                                            fontFamily: '"Inter", sans-serif !important',
                                            textTransform: 'none',
                                            letterSpacing: '-0.02em'
                                        }}>{section.title}</h3>
                                        <p style={{
                                            color: mutedColor,
                                            lineHeight: 1.6,
                                            fontSize: '18px',
                                            fontWeight: 400,
                                            fontFamily: '"Inter", sans-serif !important'
                                        }}>{section.text}</p>
                                    </div>
                                </Reveal>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Action Buttons Section */}
            <section style={{ padding: '80px 5%', display: 'flex', justifyContent: 'center' }}>
                <Reveal>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        <a
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="clickable"
                            style={{
                                padding: '18px 42px',
                                backgroundColor: 'var(--text-color)',
                                color: 'var(--bg-color)',
                                borderRadius: '50px',
                                fontSize: '16px',
                                fontWeight: 800,
                                textDecoration: 'none',
                                transition: 'transform 0.3s ease',
                                display: 'inline-block'
                            }}
                        >
                            Ver Site ao Vivo
                        </a>
                        <a
                            href="#"
                            className="clickable"
                            style={{
                                padding: '18px 42px',
                                backgroundColor: 'transparent',
                                color: 'var(--text-color)',
                                border: `2px solid var(--text-color)`,
                                borderRadius: '50px',
                                fontSize: '16px',
                                fontWeight: 800,
                                textDecoration: 'none',
                                transition: 'all 0.3s ease',
                                display: 'inline-block'
                            }}
                        >
                            Baixar Case Study
                        </a>
                    </div>
                </Reveal>
            </section>

            {/* Split CTA/Footer Section - Refactored into Two Rounded Cards */}
            <section style={{
                padding: '80px 5% 80px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px'
            }}>
                {/* Left Card: Contact */}
                <div style={{
                    padding: '100px 8%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    borderRadius: 'var(--radius-lg)',
                    border: `1.5px solid ${borderColor}`,
                    minHeight: '500px'
                }}>
                    <Reveal>
                        <h2 style={{
                            fontSize: 'clamp(32px, 4vw, 56px)',
                            fontWeight: 800,
                            lineHeight: 1,
                            marginBottom: '40px',
                            color: 'var(--text-color)'
                        }}>
                            Vamos criar algo<br />juntos?
                        </h2>
                        <Link
                            to="/#contact"
                            className="clickable"
                            style={{
                                fontSize: '20px',
                                fontWeight: 800,
                                color: 'var(--text-color)',
                                textDecoration: 'none',
                                borderBottom: '3px solid var(--text-color)',
                                paddingBottom: '8px',
                                display: 'inline-block'
                            }}
                        >
                            Fale comigo →
                        </Link>
                    </Reveal>
                </div>

                {/* Right Card: Next Project */}
                <div style={{
                    position: 'relative',
                    minHeight: '500px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-start',
                    padding: '100px 8%',
                    overflow: 'hidden',
                    borderRadius: 'var(--radius-lg)',
                    border: `1.5px solid ${borderColor}`
                }}
                    className="clickable"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <img
                        src="https://images.unsplash.com/photo-1541462608141-ad4d1f995502?q=80&w=2070&auto=format&fit=crop"
                        alt="Next Project Cover"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            zIndex: 1
                        }}
                    />
                    <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.85)',
                        zIndex: 2
                    }} />

                    <div style={{ position: 'relative', zIndex: 3 }}>
                        <Reveal delay={0.1}>
                            <p style={{
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '2px',
                                color: '#FFFFFF',
                                marginBottom: '24px',
                                fontWeight: 900
                            }}>
                                PRÓXIMO PROJETO
                            </p>
                            <h2 style={{
                                fontSize: 'clamp(32px, 4vw, 56px)',
                                fontWeight: 800,
                                lineHeight: 1,
                                marginBottom: '40px',
                                color: '#FFFFFF'
                            }}>
                                Abstract Vision<br />Rebranding
                            </h2>
                            <span style={{
                                fontSize: '20px',
                                fontWeight: 800,
                                color: '#FFFFFF',
                                borderBottom: '4px solid #FFFFFF',
                                paddingBottom: '8px',
                                display: 'inline-block'
                            }}>
                                Ver projeto →
                            </span>
                        </Reveal>
                    </div>
                </div>
            </section>

            {/* Custom Styles for this page */}
            <style dangerouslySetInnerHTML={{
                __html: `
                .hero-title-inter {
                    font-family: 'Inter', sans-serif !important;
                    font-weight: 800 !important;
                    text-transform: none !important;
                    letter-spacing: -0.02em !important;
                    line-height: 1.1 !important;
                }
                .steps-grid {
                    grid-template-columns: repeat(4, 1fr) !important;
                }
                @media (max-width: 1200px) {
                    .steps-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (max-width: 640px) {
                    .steps-grid { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 991px) {
                    .detail-row { flex-direction: column !important; }
                    .detail-column-img { flex: 1 1 100% !important; height: 400px !important; }
                    .detail-column-text { flex: 1 1 100% !important; }
                }
            `}} />
        </div>
    );
}
