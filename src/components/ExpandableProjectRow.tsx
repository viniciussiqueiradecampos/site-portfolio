import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ExpandableProjectRowProps {
    title: string;
    description: string;
    imageUrl: string;
    imageAlt?: string;
}

export default function ExpandableProjectRow({ title, description, imageUrl, imageAlt }: ExpandableProjectRowProps) {
    const { t } = useTranslation();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    // Check if line clamping is needed
    const [needsClamping, setNeedsClamping] = useState(false);
    const textRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);

        // Simple logic to decide if we need the toggle:
        // In this specific layout, we'll show it if it exceeds a certain height or length
        if (description.length > 280) {
            setNeedsClamping(true);
        }

        return () => window.removeEventListener('resize', handleResize);
    }, [description]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '24px' : '60px',
            alignItems: 'flex-start',
            marginBottom: '100px',
            width: '100%'
        }}>
            {/* Image Container */}
            <div style={{
                flex: isMobile ? 'none' : '0 0 55%',
                width: '100%',
                borderRadius: 'var(--radius-lg)',
                overflow: 'hidden',
                background: 'var(--surface-color)',
                lineHeight: 0
            }}>
                <img
                    src={imageUrl}
                    alt={imageAlt || title}
                    style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        objectFit: 'cover'
                    }}
                />
            </div>

            {/* Content Container */}
            <div style={{
                flex: 1,
                paddingTop: isMobile ? '0' : '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <h3 style={{
                    fontSize: isMobile ? '24px' : '32px',
                    fontFamily: 'var(--font-display)',
                    margin: 0,
                    textTransform: 'uppercase',
                    color: 'var(--text-color)'
                }}>
                    {title}
                </h3>

                <div style={{ position: 'relative' }}>
                    <motion.p
                        ref={textRef}
                        initial={false}
                        animate={{
                            height: isExpanded ? 'auto' : (isMobile ? 'auto' : '180px'),
                        }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        style={{
                            fontSize: '16px',
                            lineHeight: '1.6',
                            color: 'var(--text-muted)',
                            margin: 0,
                            overflow: 'hidden',
                            display: isExpanded ? 'block' : '-webkit-box',
                            WebkitLineClamp: isExpanded ? 'none' : (isMobile ? 'none' : 6),
                            WebkitBoxOrient: 'vertical',
                        }}
                    >
                        {description}
                    </motion.p>

                    {!isExpanded && !isMobile && needsClamping && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '60px',
                            background: 'linear-gradient(to top, var(--bg-color), transparent)',
                            pointerEvents: 'none'
                        }} />
                    )}
                </div>

                {needsClamping && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="clickable"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: 'none',
                            border: 'none',
                            color: 'var(--accent-color)',
                            fontSize: '12px',
                            fontWeight: '800',
                            fontFamily: 'var(--font-display)',
                            textTransform: 'uppercase',
                            letterSpacing: '2px',
                            padding: '10px 0',
                            cursor: 'pointer',
                            width: 'fit-content',
                            marginTop: '10px'
                        }}
                    >
                        {isExpanded ? t('common.read_less', 'READ LESS') : t('common.read_all', 'READ ALL')}
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
}
