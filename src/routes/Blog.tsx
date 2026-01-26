import { useState, useEffect } from 'react';
import { blogAPI, contentAPI, analyticsAPI, type BlogPost } from '../lib/supabase';
import { motion } from 'framer-motion';
import RevealText from '../components/RevealText';
import { BookOpen, ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Blog() {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const [showNewsletter, setShowNewsletter] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        loadPosts();
        analyticsAPI.logEvent({ event_type: 'page_view', page_path: '/blog' });
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const loadPosts = async () => {
        const [data, newsletterSetting] = await Promise.all([
            blogAPI.getAll(),
            contentAPI.getByKey('nav.newsletter')
        ]);
        setPosts(data.filter(p => p.visible));
        setShowNewsletter(newsletterSetting?.value === 'true');
        setLoading(false);
    };

    const categories = Array.from(new Set(posts.map(p => p.category))).sort();
    const allTags = Array.from(new Set(posts.flatMap(p => p.tags || []))).sort();

    const filteredPosts = posts.filter(post => {
        const matchesCategory = !selectedCategory || post.category === selectedCategory;
        const matchesTag = !selectedTag || (post.tags && post.tags.includes(selectedTag));
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.content.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesTag && matchesSearch;
    });

    if (loading) return (
        <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="loader" style={{ width: '40px', height: '40px', border: '3px solid var(--border-color)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );

    return (
        <div className="blog-page" style={{ padding: '120px 0', background: 'var(--bg-color)', minHeight: '100vh' }}>
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 5%' }}>

                {/* Header */}
                <header style={{ marginBottom: '80px' }}>
                    <RevealText>
                        <h1 style={{ fontSize: 'clamp(40px, 8vw, 100px)', fontWeight: 900, marginBottom: '20px', textTransform: 'uppercase' }}>INSIGHTS AND<br />TIPS</h1>
                    </RevealText>
                    <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '600px', lineHeight: 1.6 }}>
                        Sharing my thoughts on design, technology, and the process behind building digital products.
                    </p>
                </header>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
                    gap: '60px',
                    alignItems: 'flex-start'
                }}>

                    {/* Posts Grid (3 Columns internally) */}
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(350px, 1fr))', gap: '40px' }}>
                        {filteredPosts.map((post, i) => (
                            <motion.article
                                key={post.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="blog-card clickable"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    background: 'rgba(255,255,255,0.02)',
                                    padding: '20px',
                                    borderRadius: '24px',
                                    border: '1px solid var(--border-color)',
                                    height: '100%',
                                    textDecoration: 'none'
                                }}
                            >
                                <div style={{
                                    width: '100%',
                                    aspectRatio: '16/10',
                                    borderRadius: '16px',
                                    overflow: 'hidden',
                                    background: '#111'
                                }}>
                                    {post.image_url ? (
                                        <img src={post.image_url} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <BookOpen size={48} color="var(--border-color)" />
                                        </div>
                                    )}
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                                        <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                            {post.category}
                                        </span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>•</span>
                                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                                            {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </span>
                                    </div>

                                    <h3 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '15px', color: 'var(--text-color)', lineHeight: 1.2 }}>
                                        {post.title}
                                    </h3>

                                    <p style={{ fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '25px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {post.content.replace(/[#*`]/g, '')}
                                    </p>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                                        {post.tags?.slice(0, 3).map(tag => (
                                            <span key={tag} style={{ fontSize: '10px', background: 'rgba(255,255,255,0.05)', color: 'var(--accent-color)', padding: '4px 10px', borderRadius: '4px', fontWeight: 'bold' }}>
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <Link to={`/blog/${post.slug}`} style={{
                                    marginTop: 'auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '12px',
                                    fontWeight: '900',
                                    fontFamily: 'var(--font-display)',
                                    color: 'var(--text-color)',
                                    textDecoration: 'none'
                                }}>
                                    READ ARTICLE <ArrowRight size={14} color="var(--accent-color)" />
                                </Link>
                            </motion.article>
                        ))}

                        {filteredPosts.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '100px 0', gridColumn: '1/-1' }}>
                                <Search size={48} color="var(--border-color)" style={{ marginBottom: '20px' }} />
                                <h3 style={{ fontSize: '20px', color: 'var(--text-muted)' }}>No articles found.</h3>
                                <button onClick={() => { setSelectedCategory(null); setSelectedTag(null); setSearchQuery(''); }} style={{ marginTop: '20px', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', padding: '10px 20px', borderRadius: '100px', cursor: 'pointer' }}>Clear all filters</button>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <aside style={{ position: isMobile ? 'static' : 'sticky', top: '120px' }}>
                        <div style={{ marginBottom: '40px' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    placeholder="Search stories..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '15px 20px 15px 50px',
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        fontSize: '14px',
                                        outline: 'none'
                                    }}
                                />
                                <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)' }} />
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: '900', fontFamily: 'var(--font-display)', marginBottom: '20px', letterSpacing: '1px' }}>CATEGORIES</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    style={{
                                        padding: '12px 15px',
                                        background: selectedCategory === null ? 'var(--accent-color)' : 'transparent',
                                        color: selectedCategory === null ? '#000' : 'var(--text-muted)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        fontWeight: selectedCategory === null ? 'bold' : 'normal',
                                        transition: '0.2s'
                                    }}
                                >
                                    All Stories
                                </button>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        style={{
                                            padding: '12px 15px',
                                            background: selectedCategory === cat ? 'var(--accent-color)' : 'transparent',
                                            color: selectedCategory === cat ? '#000' : 'var(--text-muted)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                                            transition: '0.2s'
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: '40px' }}>
                            <h4 style={{ fontSize: '12px', fontWeight: '900', fontFamily: 'var(--font-display)', marginBottom: '20px', letterSpacing: '1px' }}>POPULAR TAGS</h4>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <button
                                    onClick={() => setSelectedTag(null)}
                                    style={{
                                        padding: '6px 12px',
                                        background: selectedTag === null ? 'var(--accent-color)' : 'rgba(255,255,255,0.03)',
                                        color: selectedTag === null ? '#000' : 'var(--text-muted)',
                                        border: '1px solid var(--border-color)',
                                        borderRadius: '6px',
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    #ALL
                                </button>
                                {allTags.map(tag => (
                                    <button
                                        key={tag}
                                        onClick={() => setSelectedTag(tag)}
                                        style={{
                                            padding: '6px 12px',
                                            background: selectedTag === tag ? 'var(--accent-color)' : 'rgba(255,255,255,0.03)',
                                            color: selectedTag === tag ? '#000' : 'var(--text-muted)',
                                            border: '1px solid var(--border-color)',
                                            borderRadius: '6px',
                                            fontSize: '11px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {showNewsletter && (
                            <div style={{ padding: '30px', background: 'var(--accent-color)', borderRadius: '24px', color: '#000' }}>
                                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', marginBottom: '15px' }}>Newsletter</h4>
                                <p style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '20px' }}>Get the latest design insights directly in your inbox.</p>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <input placeholder="Your email" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontSize: '14px' }} />
                                    <button style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: '#000', color: '#fff', fontWeight: 'bold' }}>Subscribe</button>
                                </div>
                            </div>
                        )}
                    </aside>
                </div>
            </div>
        </div>
    );
}
