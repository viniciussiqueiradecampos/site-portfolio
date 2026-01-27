import React, { useEffect, useRef } from 'react';
import { Bold, Italic, List, Link as LinkIcon, Heading1, Heading2 } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    style?: React.CSSProperties;
}

export default function RichTextEditor({ value, onChange, style }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);

    // Initial value sync
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            // Only update if content is significantly different to avoid cursor jumps
            // A simple check is usually enough for this basic editor
            if (editorRef.current.innerHTML === '<br>' && !value) return;
            // This is a naive implementation; proper sync handles cursor position. 
            // For this task, we'll accept that external updates might reset cursor if we're not careful.
            // But usually 'value' only changes from outside on init.
            if (document.activeElement !== editorRef.current) {
                editorRef.current.innerHTML = value || '';
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };

    const execCommand = (command: string, value: string | undefined = undefined) => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            editorRef.current.focus();
            onChange(editorRef.current.innerHTML);
        }
    };

    const ToolbarButton = ({ icon: Icon, command, arg, label, onClick }: { icon: any, command?: string, arg?: string, label?: string, onClick?: () => void }) => (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault();
                if (onClick) {
                    onClick();
                } else if (command) {
                    execCommand(command, arg);
                }
            }}
            style={{
                background: 'transparent',
                border: 'none',
                color: '#fff',
                padding: '6px',
                cursor: 'pointer',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
            title={label}
            onMouseDown={(e) => e.preventDefault()} // Prevent focus loss
        >
            <Icon size={16} />
        </button>
    );

    return (
        <div style={{
            border: '1px solid #333',
            borderRadius: '8px',
            overflow: 'hidden',
            background: '#0a0a0a',
            ...style
        }}>
            <div style={{
                display: 'flex',
                gap: '4px',
                padding: '8px',
                background: '#151515',
                borderBottom: '1px solid #333',
                flexWrap: 'wrap'
            }}>
                <ToolbarButton icon={Bold} command="bold" label="Bold" />
                <ToolbarButton icon={Italic} command="italic" label="Italic" />
                <ToolbarButton icon={Heading1} command="formatBlock" arg="H2" label="Heading" />
                <ToolbarButton icon={Heading2} command="formatBlock" arg="H3" label="Subheading" />
                <ToolbarButton icon={List} command="insertUnorderedList" label="List" />
                <ToolbarButton
                    icon={LinkIcon}
                    label="Link"
                    onClick={() => {
                        const url = prompt('Enter Link URL:');
                        if (url) execCommand('createLink', url);
                    }}
                />
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => { }}
                onBlur={() => { }}
                style={{
                    minHeight: '150px',
                    padding: '12px',
                    color: '#fff',
                    outline: 'none',
                    fontSize: '14px',
                    lineHeight: '1.6'
                }}
                className="rich-editor-content"
                dangerouslySetInnerHTML={{ __html: value || '' }}
            />
            {/* We use dangerouslySetInnerHTML for initial render, but effective updates happen via ref manipulation to avoid React re-render cursor jumps */}
            <style>{`
                .rich-editor-content a { color: var(--accent-color); text-decoration: underline; }
                .rich-editor-content ul { padding-left: 20px; }
                .rich-editor-content h2 { font-size: 1.5em; margin: 0.5em 0; border-bottom: 1px solid #333; padding-bottom: 4px; }
                .rich-editor-content h3 { font-size: 1.2em; margin: 0.5em 0; }
            `}</style>
        </div>
    );
}
