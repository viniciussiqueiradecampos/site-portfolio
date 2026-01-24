import { useRef, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './i18n';
import './App.css'; // Global Styles
import './index.css';

import Layout from './components/Layout';
import Home from './routes/Home';
import CV from './routes/CV';
import Projects from './routes/Projects';
import AdminLogin from './routes/AdminLogin';
import AdminDashboard from './routes/AdminDashboard';
import AdminContent from './routes/AdminContent';
import AdminProjects from './routes/AdminProjects';
import AdminCV from './routes/AdminCV';
import AdminSettings from './routes/AdminSettings';
import TestSupabase from './routes/TestSupabase';
import ScrollToTop from './ScrollToTop';
import CareerDashboard from './routes/CareerDashboard';

// Custom Cursor Component (Local)
const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const moveCursor = (e: MouseEvent) => {
      cursor.style.transform = `translate(${e.clientX - 6}px, ${e.clientY - 6}px)`;
    };

    const hoverStart = () => cursor.classList.add('hovering');
    const hoverEnd = () => cursor.classList.remove('hovering');

    window.addEventListener('mousemove', moveCursor);

    // Delegation for performance
    const handleMouseOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('.clickable')) {
        hoverStart();
      } else {
        hoverEnd();
      }
    };
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <CustomCursor />
      <Routes>
        {/* Test Route */}
        <Route path="/test-supabase" element={<TestSupabase />} />

        {/* Admin Routes (No Layout) */}
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        <Route path="/admin/cv" element={<AdminCV />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
        <Route path="/career-dashboard" element={<Layout><CareerDashboard /></Layout>} />

        {/* Public Routes (With Layout) */}
        <Route path="/" element={<Layout><Home /></Layout>} />
        <Route path="/cv" element={<Layout><CV /></Layout>} />
        <Route path="/projects" element={<Layout><Projects /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;
