import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Pipette, Ruler, MessageSquare, Circle, X, Trash2 } from 'lucide-react';

const TOOLS = [
    { id: 'cursor', icon: MousePointer2, label: 'Move' },
    { id: 'pipette', icon: Pipette, label: 'Color Picker' },
    { id: 'ruler', icon: Ruler, label: 'Measure' },
    { id: 'comment', icon: MessageSquare, label: 'Comment' },
    { id: 'shape', icon: Circle, label: 'Shape' },
];

interface Element {
    id: string;
    type: 'shape' | 'comment' | 'ruler';
    x: number;
    y: number;
    width?: number;
    height?: number;
    endX?: number; // For ruler
    endY?: number; // For ruler
    content?: string;
    color?: string;
    createdAt?: number; // Added to track birth for auto-disappearing
}

export default function CreativeToolbar() {
    const [activeTool, setActiveTool] = useState('cursor');
    const [elements, setElements] = useState<Element[]>([]);
    const [currentAction, setCurrentAction] = useState<{ type: string; startX: number; startY: number; id: string } | null>(null);

    // Auto-remove shapes after 1s
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            setElements(prev => prev.filter(el => {
                if (el.type === 'shape' && el.createdAt && now - el.createdAt > 1000) {
                    return false;
                }
                return true;
            }));
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // EyeDropper API Support
    const handlePipette = async () => {
        if ('EyeDropper' in window) {
            try {
                // @ts-ignore
                const eyeDropper = new window.EyeDropper();
                // @ts-ignore
                const result = await eyeDropper.open();
                // Copy to clipboard
                navigator.clipboard.writeText(result.sRGBHex);
                alert(`Color copied: ${result.sRGBHex}`);
                setActiveTool('cursor');
            } catch (e) {
                console.log('User canceled or failed');
            }
        } else {
            alert('Your browser does not support the EyeDropper API');
        }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (activeTool === 'cursor') return;
        if (activeTool === 'pipette') {
            handlePipette();
            return;
        }

        const id = Math.random().toString(36).substr(2, 9);
        const startX = e.clientX;
        const startY = e.clientY;

        if (activeTool === 'comment') {
            // Just click to place
            const newEl: Element = {
                id, type: 'comment', x: startX, y: startY,
                content: 'Add your comment...'
            };
            setElements(prev => [...prev, newEl]);
            // Reset to cursor or keep placing? strict "add comment" tool usually keeps placing.
        } else if (activeTool === 'shape' || activeTool === 'ruler') {
            // Start dragging
            setCurrentAction({ type: activeTool, startX, startY, id });

            const newEl: Element = {
                id,
                type: activeTool as 'shape' | 'ruler',
                x: startX,
                y: startY,
                width: 0,
                height: 0,
                endX: startX,
                endY: startY,
                createdAt: Date.now()
            };
            setElements(prev => [...prev, newEl]);
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!currentAction) return;

        const currentX = e.clientX;
        const currentY = e.clientY;

        setElements(prev => prev.map(el => {
            if (el.id === currentAction.id) {
                if (el.type === 'shape') {
                    // Calculate radius/size
                    const w = Math.abs(currentX - currentAction.startX) * 2;
                    const h = Math.abs(currentX - currentAction.startX) * 2; // Keep it circle
                    return { ...el, width: w, height: h };
                } else if (el.type === 'ruler') {
                    return { ...el, endX: currentX, endY: currentY };
                }
            }
            return el;
        }));
    };

    const handleMouseUp = () => {
        setCurrentAction(null);
    };

    const deleteElement = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setElements(prev => prev.filter(el => el.id !== id));
    };

    const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
        return Math.round(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
    };

    return (
        <>
            {/* Interaction Layer */}
            {activeTool !== 'cursor' && (
                <div
                    className="creative-overlay"
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    style={{
                        position: 'fixed', inset: 0, zIndex: 9000,
                        cursor: activeTool === 'comment' ? 'text' : activeTool === 'pipette' ? 'crosshair' : 'crosshair'
                    }}
                />
            )}

            {/* Elements Layer */}
            {elements.map(el => (
                <div key={el.id} style={{ position: 'fixed', top: 0, left: 0, zIndex: 9001, pointerEvents: activeTool === 'cursor' ? 'auto' : 'none' }}>

                    {/* COMMENT */}
                    {el.type === 'comment' && (
                        <motion.div
                            initial={{ scale: 0 }} animate={{ scale: 1 }}
                            drag={activeTool === 'cursor'}
                            style={{ position: 'absolute', left: el.x, top: el.y, x: '-50%', y: '-100%' }}
                        >
                            <div style={{
                                background: '#fff', color: '#000', padding: '10px',
                                borderRadius: '10px 10px 10px 0', minWidth: '150px',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                                display: 'flex', flexDirection: 'column', gap: '5px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#888' }}>COMMENT</span>
                                    <button onClick={(e) => deleteElement(el.id, e)} style={{ border: 'none', background: 'transparent', color: 'red', cursor: 'pointer' }}><X size={12} /></button>
                                </div>
                                <textarea
                                    placeholder="Write a comment..."
                                    style={{ border: 'none', outline: 'none', resize: 'none', fontSize: '14px', fontFamily: 'inherit' }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* SHAPE (Circle - any size) */}
                    {el.type === 'shape' && (
                        <motion.div
                            drag={activeTool === 'cursor'}
                            style={{
                                position: 'absolute',
                                left: el.x, top: el.y,
                                width: Math.max(20, el.width || 20),
                                height: Math.max(20, el.height || 20),
                                borderRadius: '50%',
                                border: '2px solid var(--accent-color)',
                                background: 'rgba(242, 167, 61, 0.1)',
                                x: '-50%', y: '-50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                        >
                            {activeTool === 'cursor' && (
                                <button onClick={(e) => deleteElement(el.id, e)} style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: '20px', height: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <X size={12} />
                                </button>
                            )}
                        </motion.div>
                    )}

                    {/* RULER (Measure things) */}
                    {el.type === 'ruler' && el.endX !== undefined && el.endY !== undefined && (
                        <div style={{ position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                            <svg width="100%" height="100%" style={{ overflow: 'visible' }}>
                                <line
                                    x1={el.x} y1={el.y}
                                    x2={el.endX} y2={el.endY}
                                    stroke="var(--accent-color)"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                />
                                <circle cx={el.x} cy={el.y} r="4" fill="var(--accent-color)" />
                                <circle cx={el.endX} cy={el.endY} r="4" fill="var(--accent-color)" />
                            </svg>
                            <div style={{
                                position: 'absolute',
                                left: (el.x + el.endX) / 2,
                                top: (el.y + el.endY) / 2,
                                background: 'var(--accent-color)',
                                color: 'black',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                transform: 'translate(-50%, -50%)',
                                zIndex: 9002
                            }}>
                                {getDistance(el.x, el.y, el.endX, el.endY)}px
                            </div>
                            {activeTool === 'cursor' && (
                                <div
                                    className="clickable"
                                    onClick={(e) => deleteElement(el.id, e)}
                                    style={{
                                        position: 'absolute',
                                        left: el.endX + 10,
                                        top: el.endY,
                                        background: 'red',
                                        color: 'white',
                                        padding: '4px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        pointerEvents: 'auto'
                                    }}
                                >
                                    <Trash2 size={12} />
                                </div>
                            )}
                        </div>
                    )}

                </div>
            ))}

            {/* Toolbar UI */}
            <motion.div
                className="creative-toolbar"
                initial={{ y: 200 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.5, type: 'spring' }}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    left: '50%',
                    x: '-50%',
                    background: 'var(--surface-color)',
                    border: '1px solid var(--border-color)',
                    padding: '8px',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10000,
                    boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {TOOLS.map(tool => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        title={tool.label}
                        className="clickable"
                        style={{
                            background: activeTool === tool.id ? 'var(--accent-color)' : 'transparent',
                            borderRadius: '8px',
                            border: 'none',
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: activeTool === tool.id ? '#000' : 'var(--text-color)',
                            transition: 'all 0.2s',
                            cursor: 'pointer'
                        }}
                    >
                        <tool.icon size={20} strokeWidth={2} />
                    </button>
                ))}
            </motion.div>
        </>
    );
}
