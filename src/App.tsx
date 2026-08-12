import { useRef, useEffect, useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ArrowUpRight, MousePointer2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import './i18n';
import './App.css'; // Global Styles
import './index.css';

import Layout from './components/Layout';
import ScrollToTop from './ScrollToTop';

// Lazy Loaded Routes
const Home = lazy(() => import('./routes/Home'));
const CV = lazy(() => import('./routes/CV'));
const About = lazy(() => import('./routes/About'));
const Projects = lazy(() => import('./routes/Projects'));
const ProjectPage = lazy(() => import('./routes/ProjectPage'));
const AdminLogin = lazy(() => import('./routes/AdminLogin'));
const AdminDashboard = lazy(() => import('./routes/AdminDashboard'));
const TestSupabase = lazy(() => import('./routes/TestSupabase'));
const Teste2 = lazy(() => import('./routes/Teste2'));
const Blog = lazy(() => import('./routes/Blog'));
const Article = lazy(() => import('./routes/Article'));
const NotFound = lazy(() => import('./routes/NotFound'));

// Smooth Loading Fallback for Suspense
const PageLoader = () => (
  <div style={{
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-color)',
    color: 'var(--accent-color)'
  }}>
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}
    >
      <Loader2 className="animate-spin" size={40} />
      <span style={{ fontSize: '11px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase' }}>Loading Experience</span>
    </motion.div>
  </div>
);

// Custom Cursor Component
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin/dashboard');
  const [isProjectHover, setIsProjectHover] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || isDashboard || isMobile) return;

    const moveCursor = (e: MouseEvent) => {
      if (!cursor) return;
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;

      // Project Hover Detection
      if (target.closest('.project-card') || target.closest('.home-project-card')) {
        setIsProjectHover(true);
        cursor.classList.add('project-hovering');
      } else {
        setIsProjectHover(false);
        cursor.classList.remove('project-hovering');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isDashboard, isMobile]);

  if (isDashboard || isMobile) return null;

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 2147483647, // Maximize Z-Index
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translate(-50%, -50%)',
        transition: 'width 0.3s cubic-bezier(0.16, 1, 0.3, 1), height 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s',
        background: isProjectHover ? 'var(--accent-color)' : 'transparent'
      }}
    >
      {isProjectHover ? (
        <ArrowUpRight size={32} color="var(--accent-contrast)" style={{ zIndex: 2147483647 }} />
      ) : (
        <div style={{ position: 'relative', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <MousePointer2
            size={24}
            color="#fff"
            fill="var(--accent-color)"
            strokeWidth={1.5}
            style={{
              transform: 'rotate(-5deg) translate(2px, 2px)'
            }}
          />
        </div>
      )}
    </div>
  );
};

// Auth Guard Component
import { Navigate } from 'react-router-dom';
import { supabase as supabaseClient } from './lib/supabase';
import { useEffect as useAuthEffect } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useAuthEffect(() => {
    supabaseClient.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error("Auth check failed:", error);
        setSession(null);
      } else {
        setSession(data.session);
      }
      setLoading(false);
    }).catch(err => {
      console.error("Auth check exception:", err);
      setSession(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!session) return <Navigate to="/admin" replace />;

  return <>{children}</>;
};

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <CustomCursor />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/test-supabase" element={<TestSupabase />} />
          <Route path="/teste-2" element={<Layout><Teste2 /></Layout>} />

          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/cv" element={<Layout><CV /></Layout>} />
          <Route path="/projects" element={<Layout><Projects /></Layout>} />
          <Route path="/project/:slug" element={<Layout><ProjectPage /></Layout>} />
          <Route path="/about" element={<Layout><About /></Layout>} />
          <Route path="/blog" element={<Layout><Blog /></Layout>} />
          <Route path="/blog/:slug" element={<Layout><Article /></Layout>} />
          <Route path="*" element={<Layout><NotFound /></Layout>} />
        </Routes>
      </Suspense>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
