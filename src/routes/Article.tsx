import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI, analyticsAPI, type BlogPost } from '../lib/supabase';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Article() {
    const { slug } = useParams<{ slug: string }>();
    const [post, setPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) loadPost(slug);
    }, [slug]);

    const loadPost = async (slug: string) => {
        const data = await blogAPI.getBySlug(slug);
        setPost(data);
        setLoading(false);
        window.scrollTo(0, 0);
        analyticsAPI.logEvent({ event_type: 'page_view', page_path: `/blog/${slug}` });
    };

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        </div>
    );

    if (!post) return (
        <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <h2>Article not found</h2>
            <Link to="/blog" style={{ color: 'var(--accent-color)', fontWeight: 'bold' }}>Back to Blog</Link>
        </div>
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="article-page"
            style={{ padding: '120px 0', background: 'var(--bg-color)', minHeight: '100vh' }}
        >
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>

                <Link to="/blog" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '40px', fontSize: '14px', fontWeight: 'bold' }}>
                    <ArrowLeft size={16} /> BACK TO STORIES
                </Link>

                <header style={{ marginBottom: '60px' }}>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>{post.category}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>•</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Calendar size={14} /> {new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                    </div>

                    <h1 style={{ fontSize: 'clamp(32px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: '40px' }}>
                        {post.title}
                    </h1>
                </header>

                {post.image_url && (
                    <div style={{
                        width: '100%',
                        height: '500px',
                        borderRadius: '32px',
                        overflow: 'hidden',
                        marginBottom: '60px',
                        border: '1px solid var(--border-color)',
                        background: '#111'
                    }}>
                        <img
                            src={post.image_url}
                            alt={post.title}
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: post.cover_position || 'center'
                            }}
                        />
                    </div>
                )}

                <div className="article-content" style={{ fontSize: '19px', lineHeight: 1.8, color: 'var(--text-color)' }}>
                    <ReactMarkdown
                        components={{
                            h2: ({ node, ...props }) => <h2 style={{ fontSize: '36px', marginTop: '60px', marginBottom: '25px', fontWeight: 800, color: '#fff' }} {...props} />,
                            h3: ({ node, ...props }) => <h3 style={{ fontSize: '28px', marginTop: '50px', marginBottom: '20px', fontWeight: 700, color: '#fff' }} {...props} />,
                            p: ({ node, ...props }) => <p style={{ marginBottom: '30px', color: 'rgba(255,255,255,0.8)' }} {...props} />,
                            img: ({ node, ...props }) => <img style={{ maxWidth: '100%', borderRadius: '24px', margin: '60px 0', border: '1px solid var(--border-color)' }} {...props} />,
                            code: ({ node, inline, ...props }: any) => (
                                inline
                                    ? <code style={{ background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '6px', fontSize: '0.9em', color: 'var(--accent-color)' }} {...props} />
                                    : <pre style={{ background: '#0a0a0a', padding: '30px', borderRadius: '16px', overflowX: 'auto', border: '1px solid var(--border-color)', margin: '40px 0' }}><code {...props} /></pre>
                            ),
                            blockquote: ({ node, ...props }) => (
                                <blockquote style={{ borderLeft: '4px solid var(--accent-color)', padding: '10px 0 10px 30px', fontStyle: 'italic', fontSize: '24px', color: 'var(--text-muted)', margin: '50px 0', background: 'rgba(255,255,255,0.02)', borderRadius: '0 16px 16px 0' }} {...props} />
                            )
                        }}
                    >
                        {post.content}
                    </ReactMarkdown>
                </div>

                <footer style={{ marginTop: '100px', paddingTop: '60px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {post.tags?.map(tag => (
                            <span key={tag} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>#{tag}</span>
                        ))}
                    </div>
                </footer>
            </div>

            <style>{`
                .article-content strong { color: var(--accent-color); }
                .article-content a { color: var(--accent-color); text-decoration: underline; }
                @keyframes spin { to { transform: rotate(360deg); } }
            `}</style>
        </motion.div>
    );
}
