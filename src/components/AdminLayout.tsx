import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    FileText,
    Briefcase,
    GraduationCap,
    Settings,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!isSidebarOpen);

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', path: '/admin/dashboard' },
        { icon: FileText, label: 'Content & Hero', path: '/admin/content' },
        { icon: Briefcase, label: 'Projects', path: '/admin/projects' },
        { icon: GraduationCap, label: 'CV & Experience', path: '/admin/cv' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
            {/* Sidebar */}
            <aside style={{
                width: isSidebarOpen ? '260px' : '80px',
                background: '#0f172a',
                color: 'white',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                transition: 'width 0.3s ease',
                position: 'fixed',
                height: '100vh',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 10px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', flexShrink: 0 }} />
                    {isSidebarOpen && (
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 700 }}>
                            ADMIN
                        </span>
                    )}
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => isActive ? 'admin-nav-item active' : 'admin-nav-item'}
                            style={({ isActive }) => ({
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '12px',
                                borderRadius: '8px',
                                color: isActive ? 'white' : '#94a3b8',
                                background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                                textDecoration: 'none',
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                justifyContent: isSidebarOpen ? 'flex-start' : 'center'
                            })}
                        >
                            <item.icon size={20} />
                            {isSidebarOpen && <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>{item.label}</span>}
                        </NavLink>
                    ))}
                </nav>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                    <button
                        onClick={toggleSidebar}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94a3b8',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            padding: '10px'
                        }}
                    >
                        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                marginLeft: isSidebarOpen ? '260px' : '80px',
                padding: '30px',
                transition: 'margin-left 0.3s ease'
            }}>
                {children}
            </main>
        </div>
    );
}
