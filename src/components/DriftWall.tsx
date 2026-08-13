import React, { useMemo } from 'react';
import type { Project } from '../lib/supabase';

interface DriftWallProps {
    projects: Project[];
    columns?: number;
    speed?: number; // seconds per cycle
    onProjectClick?: (project: Project) => void;
    className?: string;
    style?: React.CSSProperties;
}

export const DriftWall: React.FC<DriftWallProps> = ({
    projects,
    columns = 3,
    speed = 25,
    onProjectClick,
    style
}) => {
    // If no projects loaded yet, use placeholder project images
    const displayProjects = useMemo(() => {
        if (projects && projects.length > 0) return projects;
        // Fallbacks
        return [
            { id: '1', title: 'Project One', image_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80' },
            { id: '2', title: 'Project Two', image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80' },
            { id: '3', title: 'Project Three', image_url: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80' },
            { id: '4', title: 'Project Four', image_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80' },
            { id: '5', title: 'Project Five', image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80' },
            { id: '6', title: 'Project Six', image_url: 'https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=600&q=80' }
        ] as Project[];
    }, [projects]);

    // Distribute projects evenly into specified number of columns
    const columnData = useMemo(() => {
        const cols: Project[][] = Array.from({ length: columns }, () => []);
        displayProjects.forEach((proj, i) => {
            cols[i % columns].push(proj);
        });

        // Ensure each column has enough items by repeating if necessary
        return cols.map(col => {
            if (col.length === 0) return displayProjects;
            let filled = [...col];
            while (filled.length < 4) {
                filled = [...filled, ...col];
            }
            return filled;
        });
    }, [displayProjects, columns]);

    return (
        <div
            className="drift-wall-container"
            style={{
                position: 'relative',
                width: '100%',
                height: '100%',
                maxHeight: '100vh',
                overflow: 'hidden',
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, 1fr)`,
                gap: '16px',
                padding: '10px',
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)',
                ...style
            }}
        >
            {columnData.map((colProjects, colIndex) => {
                // Alternate direction for odd vs even columns
                const isReverse = colIndex % 2 === 1;
                const duration = speed + colIndex * 3; // slight variation in speed for natural drift
                // Quadruple items to ensure 100% seamless infinite looping
                const duplicatedProjects = [...colProjects, ...colProjects, ...colProjects, ...colProjects];

                return (
                    <div
                        key={`drift-col-${colIndex}`}
                        style={{
                            overflow: 'hidden',
                            height: '100%',
                            position: 'relative'
                        }}
                    >
                        <div
                            className="drift-col-inner"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px',
                                animationName: isReverse ? 'driftDown' : 'driftUp',
                                animationDuration: `${duration}s`,
                                animationTimingFunction: 'linear',
                                animationIterationCount: 'infinite',
                                willChange: 'transform'
                            }}
                        >
                            {duplicatedProjects.map((proj, itemIdx) => (
                                <div
                                    key={`col-${colIndex}-item-${itemIdx}`}
                                    onClick={() => onProjectClick && onProjectClick(proj)}
                                    style={{
                                        position: 'relative',
                                        width: '100%',
                                        borderRadius: '16px',
                                        overflow: 'hidden',
                                        cursor: onProjectClick ? 'pointer' : 'default',
                                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                        aspectRatio: (itemIdx + colIndex) % 2 === 0 ? '4/5' : '3/4',
                                        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), boxShadow 0.4s ease'
                                    }}
                                    className="drift-card-hover"
                                >
                                    {proj.image_url ? (
                                        <img
                                            src={proj.image_url}
                                            alt={proj.title || 'Project preview'}
                                            loading="lazy"
                                            style={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                                transition: 'transform 0.5s ease'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: 'var(--surface-color)',
                                            color: 'var(--text-muted)',
                                            fontSize: '12px',
                                            fontWeight: 600
                                        }}>
                                            {proj.title}
                                        </div>
                                    )}

                                    {/* Hover overlay with title */}
                                    <div
                                        className="drift-card-overlay"
                                        style={{
                                            position: 'absolute',
                                            inset: 0,
                                            background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 60%)',
                                            opacity: 0,
                                            display: 'flex',
                                            alignItems: 'flex-end',
                                            padding: '16px',
                                            transition: 'opacity 0.3s ease'
                                        }}
                                    >
                                        <span style={{
                                            color: '#ffffff',
                                            fontSize: '13px',
                                            fontWeight: 700,
                                            letterSpacing: '-0.01em',
                                            fontFamily: 'var(--font-display)',
                                            lineHeight: 1.2
                                        }}>
                                            {proj.title}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DriftWall;
