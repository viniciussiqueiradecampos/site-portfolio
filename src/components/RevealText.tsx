import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface RevealTextProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    delay?: number;
}

export default function RevealText({ children, className, style, delay = 0 }: RevealTextProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-10% 0px -10% 0px" });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}
