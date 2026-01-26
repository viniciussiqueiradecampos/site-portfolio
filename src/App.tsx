import { useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import './i18n';
import './App.css'; // Global Styles
import './index.css';

import Layout from './components/Layout';
import Home from './routes/Home';
import CV from './routes/CV';
import Projects from './routes/Projects';
import AdminLogin from './routes/AdminLogin';
import AdminDashboard from './routes/AdminDashboard';
import TestSupabase from './routes/TestSupabase';
import Blog from './routes/Blog';
import Article from './routes/Article';
import ScrollToTop from './ScrollToTop';

// Custom Cursor Component
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/admin/dashboard');

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || isDashboard) return;

    const moveCursor = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
    };

    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.clickable')) {
        cursor.classList.add('hovering');
      } else {
        cursor.classList.remove('hovering');
      }
    };

    window.addEventListener('mousemove', moveCursor);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [isDashboard]);

  if (isDashboard) return null;

  return <div ref={cursorRef} className="custom-cursor" style={{ position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 99999, marginLeft: '-6px', marginTop: '-6px' }} />;
};

// Auth Guard Component
import { Navigate } from 'react-router-dom';
import { supabase as supabaseClient } from './lib/supabase';
import { useState, useEffect as useAuthEffect } from 'react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useAuthEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
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
      <Routes>
        <Route path="/test-supabase" element={<TestSupabase />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/cv" element={<Layout><CV /></Layout>} />
        <Route path="/projects" element={<Layout><Projects /></Layout>} />
        <Route path="/blog" element={<Layout><Blog /></Layout>} />
        <Route path="/blog/:slug" element={<Layout><Article /></Layout>} />
      </Routes>
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
