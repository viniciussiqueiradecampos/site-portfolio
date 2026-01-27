-- ========================================
-- 1. TABLE DEFINITIONS (Create these FIRST)
-- ========================================

-- Portfolio Content Tables
CREATE TABLE IF NOT EXISTS content (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    category TEXT NOT NULL, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    gallery_images TEXT[] DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cv_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    section_type TEXT NOT NULL, -- 'experience', 'education', 'skills', 'certification'
    title TEXT NOT NULL,
    subtitle TEXT,
    description TEXT,
    date_range TEXT,
    order_index INTEGER DEFAULT 0,
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- CRM & Discovery Tables
CREATE TABLE IF NOT EXISTS crm_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_name TEXT NOT NULL,
    website_url TEXT,
    region TEXT,
    status TEXT DEFAULT 'novo', -- 'novo', 'contatado', 'negociacao', 'fechado', 'perdido'
    detected_issues TEXT[], -- e.g. ['mobile_broken', 'outdated_design', 'slow']
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    notes TEXT,
    last_contact_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career Architect Tables (Existing)
CREATE TABLE IF NOT EXISTS career_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    current_job_title TEXT,
    target_role TEXT,
    cv_url TEXT,
    cv_skills TEXT[],
    linkedin_url TEXT,
    linkedin_ssi_score INTEGER DEFAULT 0,
    daily_application_goal INTEGER DEFAULT 5,
    preferred_locations TEXT[],
    preferred_salary_min DECIMAL,
    preferred_salary_max DECIMAL,
    preferred_currency TEXT DEFAULT 'USD',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_listings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    external_id TEXT,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    salary_min DECIMAL,
    salary_max DECIMAL,
    currency TEXT DEFAULT 'USD',
    description TEXT,
    requirements TEXT,
    url TEXT,
    posted_date TIMESTAMP WITH TIME ZONE,
    is_low_competition BOOLEAN DEFAULT false,
    competition_score INTEGER,
    tags TEXT[],
    visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES career_profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES job_listings(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'nova',
    match_score INTEGER,
    applied_date TIMESTAMP WITH TIME ZONE,
    interview_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    recruiter_contact TEXT,
    cover_letter TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, job_id)
);

CREATE TABLE IF NOT EXISTS linkedin_ssi_metrics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES career_profiles(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    establish_brand INTEGER DEFAULT 0,
    find_right_people INTEGER DEFAULT 0,
    engage_insights INTEGER DEFAULT 0,
    build_relationships INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(profile_id, date)
);

CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    profile_id UUID REFERENCES career_profiles(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    description TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS api_configurations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    service_name TEXT UNIQUE NOT NULL,
    api_key TEXT,
    is_active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. SECURITY POLICIES (RLS)
-- ========================================

-- Enable RLS
ALTER TABLE content ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cv_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE linkedin_ssi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_configurations ENABLE ROW LEVEL SECURITY;

-- Ensure columns exist in case tables were created previously
ALTER TABLE content ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS gallery_images TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS download_url TEXT;
ALTER TABLE projects ALTER COLUMN image_url DROP NOT NULL; -- Make it optional during transition

-- Permissive Policies (FOR DEV)
-- Content
DROP POLICY IF EXISTS "Permissive Policy" ON content;
CREATE POLICY "Permissive Policy" ON content FOR ALL USING (true) WITH CHECK (true);

-- Projects
DROP POLICY IF EXISTS "Permissive Policy" ON projects;
CREATE POLICY "Permissive Policy" ON projects FOR ALL USING (true) WITH CHECK (true);

-- CV Sections
DROP POLICY IF EXISTS "Permissive Policy" ON cv_sections;
CREATE POLICY "Permissive Policy" ON cv_sections FOR ALL USING (true) WITH CHECK (true);

-- CRM Leads
DROP POLICY IF EXISTS "Permissive Policy" ON crm_leads;
CREATE POLICY "Permissive Policy" ON crm_leads FOR ALL USING (true) WITH CHECK (true);

-- Career Profile
DROP POLICY IF EXISTS "Permissive Policy" ON career_profiles;
CREATE POLICY "Permissive Policy" ON career_profiles FOR ALL USING (true) WITH CHECK (true);

-- Job Listings
DROP POLICY IF EXISTS "Permissive Policy" ON job_listings;
CREATE POLICY "Permissive Policy" ON job_listings FOR ALL USING (true) WITH CHECK (true);

-- Job Applications
DROP POLICY IF EXISTS "Permissive Policy" ON job_applications;
CREATE POLICY "Permissive Policy" ON job_applications FOR ALL USING (true) WITH CHECK (true);

-- Metrics
DROP POLICY IF EXISTS "Permissive Policy" ON linkedin_ssi_metrics;
CREATE POLICY "Permissive Policy" ON linkedin_ssi_metrics FOR ALL USING (true) WITH CHECK (true);

-- Tasks
DROP POLICY IF EXISTS "Permissive Policy" ON daily_tasks;
CREATE POLICY "Permissive Policy" ON daily_tasks FOR ALL USING (true) WITH CHECK (true);

-- API Config
DROP POLICY IF EXISTS "Permissive Policy" ON api_configurations;
CREATE POLICY "Permissive Policy" ON api_configurations FOR ALL USING (true) WITH CHECK (true);


-- ========================================
-- 3. TRIGGERS
-- ========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_content_updated_at ON content;
CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cv_sections_updated_at ON cv_sections;
CREATE TRIGGER update_cv_sections_updated_at BEFORE UPDATE ON cv_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crm_leads_updated_at ON crm_leads;
CREATE TRIGGER update_crm_leads_updated_at BEFORE UPDATE ON crm_leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_career_profiles_updated_at ON career_profiles;
CREATE TRIGGER update_career_profiles_updated_at BEFORE UPDATE ON career_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_listings_updated_at ON job_listings;
CREATE TRIGGER update_job_listings_updated_at BEFORE UPDATE ON job_listings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON job_applications;
CREATE TRIGGER update_job_applications_updated_at BEFORE UPDATE ON job_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_api_configurations_updated_at ON api_configurations;
CREATE TRIGGER update_api_configurations_updated_at BEFORE UPDATE ON api_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- 4. STORAGE SETUP (PROJECT BUCKET)
-- ========================================
-- Try to create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-images', 'project-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for public access to images
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'project-images');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'All Access for Auth' AND tablename = 'objects' AND schemaname = 'storage'
    ) THEN
        CREATE POLICY "All Access for Auth" ON storage.objects FOR ALL USING (bucket_id = 'project-images') WITH CHECK (bucket_id = 'project-images');
    END IF;
END $$;


-- ========================================
-- 5. COMPREHENSIVE SEED DATA
-- ========================================
-- Hero & Storytelling
INSERT INTO content (key, value, category) VALUES
    ('hero.title', 'figma • UI DESIGN • AI • BRANDING', 'hero'),
    ('hero.description', 'Especialista em criar experiências digitais de alto impacto, unindo design estratégico e tecnologias de ponta como IA.', 'hero'),
    ('storytelling.main', 'Transformando conceitos complexos em interfaces humanas e intuitivas para empresas que querem liderar o futuro.', 'storytelling'),
    ('contact.email', 'seu-email@exemplo.com', 'general'),
    ('contact.linkedin', 'https://linkedin.com/in/seu-perfil', 'general')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Real Demo Projects
INSERT INTO projects (title, description, image_url, tags, order_index, gallery_images) VALUES
    (
        'Alpha Banking App', 
        'Um ecossistema bancário completo focado na Geração Z, com micro-interações fluidas e uma linguagem visual disruptiva.',
        'https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070',
        ARRAY['UI/UX', 'Fintech', 'Mobile'],
        1,
        ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070', 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2072']
    ),
    (
        'EcoFlow Dashboard', 
        'Plataforma de monitoramento em tempo real para redes de energia renovável. Otimizado para visualização de grandes volumes de dados.',
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2072',
        ARRAY['Web App', 'Analytics', 'Energy'],
        2,
        ARRAY['https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070']
    ),
    (
        'Vision Brand Identity', 
        'Rebranding completo para uma agência de inteligência artificial pioneira na Europa.',
        'https://images.unsplash.com/photo-1557262590-f2824da57e51?q=80&w=2070',
        ARRAY['Branding', 'AI', 'Graphic Design'],
        3,
        ARRAY['https://images.unsplash.com/photo-1557262569-83935391624c?q=80&w=2070']
    )
ON CONFLICT DO NOTHING;

-- CV Sections
DELETE FROM cv_sections; -- Reset to ensure clean order
INSERT INTO cv_sections (section_type, title, subtitle, description, date_range, order_index) VALUES
    ('skills', 'Design System', 'Arquitetura e Escala', 'Criação de bibliotecas escaláveis no Figma.', NULL, 1),
    ('skills', 'Prototype', 'Framer & Protopie', 'Interações de alta fidelidade.', NULL, 2),
    ('skills', 'Advanced AI', 'Midjourney & ChatGPT', 'Workflow otimizado com IA.', NULL, 3),
    ('experience', 'Senior Product Designer', 'Freelancer / Global', 'Liderei design de interfaces para 10+ startups internacionais.', '2023 - Presente', 10),
    ('experience', 'UI Designer', 'Agência Digital X', 'Responsável pela criação de portais corporativos e apps mobile.', '2021 - 2023', 11),
    ('education', 'Design Gráfico', 'Escola Superior de Tecnologia', 'Especialização em Digital Design.', '2017 - 2021', 20),
    ('certification', 'Google UX Certificate', 'Google / Coursera', NULL, '2022', 30);

