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
import ScrollToTop from './ScrollToTop';

// Custom Cursor Component
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isSettingsPage = location.pathname.startsWith('/admin');

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor || isSettingsPage) return;

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
  }, [isSettingsPage]);

  if (isSettingsPage) return null;

  return <div ref={cursorRef} className="custom-cursor" style={{ position: 'fixed', left: 0, top: 0, pointerEvents: 'none', zIndex: 99999, marginLeft: '-6px', marginTop: '-6px' }} />;
};

function AppContent() {
  return (
    <>
      <ScrollToTop />
      <CustomCursor />
      <Routes>
        <Route path="/test-supabase" element={<TestSupabase />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/cv" element={<Layout><CV /></Layout>} />
        <Route path="/projects" element={<Layout><Projects /></Layout>} />
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
