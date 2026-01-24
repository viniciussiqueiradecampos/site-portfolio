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
-- 4. INITIAL SEEDS
-- ========================================
INSERT INTO content (key, value, category) VALUES
    ('hero.title', 'figma • UI DESIGN • AI • WEB DESIGN', 'hero'),
    ('hero.description', 'Senior Designer focused on high-performance interfaces and scalable systems.', 'hero'),
    ('storytelling.main', 'Experience designing products for ambitious companies', 'storytelling')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

INSERT INTO cv_sections (section_type, title, subtitle, description, date_range, order_index) VALUES
    ('skills', 'Figma', NULL, 'Design Tool', NULL, 1),
    ('skills', 'React', NULL, 'Frontend', NULL, 2),
    ('experience', 'Senior Product Designer', 'Company X', 'Lead design efforts...', '2024', 10),
    ('education', 'BFA Design', 'University Y', NULL, '2018', 20)
ON CONFLICT DO NOTHING;

INSERT INTO api_configurations (service_name, is_active) VALUES
    ('adzuna', false),
    ('gemini', false),
    ('theirstack', false)
ON CONFLICT (service_name) DO NOTHING;

