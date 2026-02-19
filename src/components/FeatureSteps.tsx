import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface Feature {
    step: string
    title?: string
    content: string
    image: string
}

interface FeatureStepsProps {
    features: Feature[]
    className?: string
    title?: string
    autoPlayInterval?: number
    imageHeight?: string
    titleAlign?: 'center' | 'left'
}

export function FeatureSteps({
    features,
    className,
    title = "How to get Started",
    autoPlayInterval = 3000,
    imageHeight = "500px",
    titleAlign = 'center'
}: FeatureStepsProps) {
    const [currentFeature, setCurrentFeature] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            if (progress < 100) {
                setProgress((prev) => prev + 100 / (autoPlayInterval / 100))
            } else {
                setCurrentFeature((prev) => (prev + 1) % features.length)
                setProgress(0)
            }
        }, 100)
        return () => clearInterval(timer)
    }, [progress, features.length, autoPlayInterval])

    return (
        <div className={className} style={{ padding: '80px 5%', width: '100%' }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
                <h2 style={{
                    fontSize: 'clamp(32px, 5vw, 64px)',
                    fontWeight: 900,
                    marginBottom: '60px',
                    textAlign: titleAlign,
                    textTransform: 'uppercase',
                    letterSpacing: '-2px',
                    fontFamily: 'var(--font-display)'
                }}>
                    {title}
                </h2>

                <div style={{
                    display: 'flex',
                    flexDirection: window.innerWidth < 768 ? 'column' : 'row',
                    gap: '60px',
                    alignItems: 'center'
                }}>
                    {/* Steps List */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="clickable"
                                onClick={() => { setCurrentFeature(index); setProgress(0); }}
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: index === currentFeature ? 1 : 0.3 }}
                                transition={{ duration: 0.5 }}
                                style={{ display: 'flex', alignItems: 'flex-start', gap: '24px', cursor: 'pointer' }}
                            >
                                <motion.div
                                    style={{
                                        minWidth: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: `2px solid ${index === currentFeature ? 'var(--accent-color)' : 'var(--border-color)'}`,
                                        background: index === currentFeature ? 'var(--accent-color)' : 'transparent',
                                        color: index === currentFeature ? 'var(--accent-contrast)' : 'var(--text-color)',
                                        fontWeight: 'bold',
                                        fontSize: '18px',
                                        scale: index === currentFeature ? 1.1 : 1
                                    }}
                                >
                                    {index < currentFeature ? '✓' : index + 1}
                                </motion.div>
                                <div style={{ flex: 1 }}>
                                    <h3 style={{
                                        fontSize: 'clamp(20px, 2vw, 24px)',
                                        fontWeight: 800,
                                        marginBottom: '8px',
                                        color: index === currentFeature ? 'var(--accent-color)' : 'var(--text-color)',
                                        textTransform: 'uppercase',
                                        fontFamily: 'var(--font-display)'
                                    }}>
                                        {feature.title || feature.step}
                                    </h3>
                                    <p style={{
                                        fontSize: '16px',
                                        lineHeight: 1.6,
                                        color: 'var(--text-muted)'
                                    }}>
                                        {feature.content}
                                    </p>

                                    {/* Progress Bar for active item */}
                                    {index === currentFeature && (
                                        <div style={{ width: '100%', height: '2px', background: 'var(--border-color)', marginTop: '16px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progress}%` }}
                                                style={{ height: '100%', background: 'var(--accent-color)' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Image Placeholder/Display */}
                    <div style={{
                        flex: 1,
                        position: 'relative',
                        height: imageHeight,
                        width: '100%',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        background: 'var(--surface-color)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentFeature}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                transition={{ duration: 0.5, ease: "easeInOut" }}
                                style={{ position: 'absolute', inset: 0 }}
                            >
                                <img
                                    src={features[currentFeature].image}
                                    alt={features[currentFeature].step}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to top, var(--bg-color), transparent)'
                                }} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
