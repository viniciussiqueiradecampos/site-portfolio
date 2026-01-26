import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, BookOpen, FolderKanban, FileText } from 'lucide-react';
import RevealText from '../components/RevealText';

export default function NotFound() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-color)',
            padding: '0 5%',
            textAlign: 'center'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                style={{ marginBottom: '40px' }}
            >
                <h1 style={{
                    fontSize: 'clamp(80px, 15vw, 200px)',
                    fontWeight: 900,
                    lineHeight: 1,
                    color: 'rgba(255, 255, 255, 0.03)',
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 0,
                    pointerEvents: 'none',
                    whiteSpace: 'nowrap'
                }}>
                    404
                </h1>

                <div style={{ position: 'relative', zIndex: 1 }}>
                    <RevealText>
                        <h2 style={{
                            fontSize: 'clamp(32px, 6vw, 64px)',
                            fontWeight: 900,
                            marginBottom: '20px',
                            color: 'var(--text-color)'
                        }}>
                            LOST IN<br />SPACE?
                        </h2>
                    </RevealText>

                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        style={{
                            fontSize: '18px',
                            color: 'var(--text-muted)',
                            maxWidth: '500px',
                            margin: '0 auto 40px',
                            lineHeight: 1.6
                        }}
                    >
                        The page you're looking for has either been moved, deleted, or never existed in this dimension.
                    </motion.p>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '20px',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1
                }}
            >
                <Link to="/" className="clickable" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: 'var(--accent-color)',
                    color: '#000',
                    padding: '16px 32px',
                    borderRadius: '100px',
                    textDecoration: 'none',
                    fontWeight: '900',
                    fontFamily: 'var(--font-display)',
                    fontSize: '12px',
                    letterSpacing: '1px'
                }}>
                    <Home size={18} /> BACK TO HOME
                </Link>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <Link to="/projects" className="clickable" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        padding: '16px 24px',
                        borderRadius: '100px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <FolderKanban size={16} /> PORTFOLIO
                    </Link>

                    <Link to="/cv" className="clickable" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        background: 'rgba(255,255,255,0.05)',
                        color: '#fff',
                        padding: '16px 24px',
                        borderRadius: '100px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        border: '1px solid var(--border-color)'
                    }}>
                        <FileText size={16} /> VIEW CV
                    </Link>
                </div>
            </motion.div>

            {/* Subtle background decoration */}
            <div style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                width: '600px',
                height: '600px',
                background: 'radial-gradient(circle, var(--accent-color) 0%, transparent 70%)',
                opacity: 0.03,
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
                filter: 'blur(80px)',
                zIndex: 0
            }} />
        </div>
    );
}
