import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogAPI, type BlogPost } from '../lib/supabase';
import { trackPageView } from '../lib/analytics';

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
        trackPageView(`/blog/${slug}`);
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

                <Link
                    to="/blog"
                    aria-label="Back to Stories"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', textDecoration: 'none', marginBottom: '40px', fontSize: '14px', fontWeight: 'bold' }}
                >
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
                            loading="lazy"
                            decoding="async"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                objectPosition: post.cover_position || 'center'
                            }}
                        />
                    </div>
                )}

                <div
                    className="article-content"
                    style={{ fontSize: '19px', lineHeight: 1.8, color: 'var(--text-color)' }}
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />

                <footer style={{ marginTop: '100px', paddingTop: '60px', borderTop: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                        {post.tags?.map(tag => (
                            <span key={tag} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 'bold' }}>#{tag}</span>
                        ))}
                    </div>
                </footer>
            </div>

            <style>{`
                    .article-content h2 { font-size: 36px; margin-top: 60px; margin-bottom: 25px; font-weight: 800; color: var(--text-color); }
                    .article-content h3 { font-size: 28px; margin-top: 50px; margin-bottom: 20px; font-weight: 700; color: var(--text-color); }
                    .article-content p { margin-bottom: 30px; color: var(--text-color); opacity: 0.8; }
                    .article-content img { max-width: 100%; border-radius: 24px; margin: 60px 0; border: 1px solid var(--border-color); }
                    .article-content pre { background: var(--surface-color); padding: 30px; border-radius: 16px; overflow-x: auto; border: 1px solid var(--border-color); margin: 40px 0; }
                    .article-content blockquote { border-left: 4px solid var(--accent-color); padding: 10px 0 10px 30px; font-style: italic; font-size: 24px; color: var(--text-muted); margin: 50px 0; background: var(--surface-color); border-radius: 0 16px 16px 0; }
                    .article-content strong { color: var(--accent-color); }
                    .article-content a { color: var(--accent-color); text-decoration: underline; }
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>
        </motion.div>
    );
}
